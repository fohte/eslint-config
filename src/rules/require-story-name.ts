import type { Rule } from 'eslint'

import {
  asObjectExpression,
  type AstNode,
  findProperty,
  getArrayElements,
  getIdentifierName,
  isLiteralNode,
  isPropertyNode,
  type ObjectExpressionNode,
  unwrapTsWrapper,
} from '#rules/utils.js'

type StoryMatcher =
  { type: 'name'; value: string } | { type: 'pattern'; value: RegExp }

interface StoryFilters {
  include?: StoryMatcher[]
  exclude?: StoryMatcher[]
}

interface StoryExport {
  name: string
  node: AstNode
  storyObject: ObjectExpressionNode
}

function hasNameProperty(obj: ObjectExpressionNode): boolean {
  if (findProperty(obj, 'name')) return true

  return obj.properties.some(
    (property) =>
      isPropertyNode(property) &&
      property.computed &&
      property.key.type === 'Literal' &&
      property.key.value === 'name',
  )
}

function readStoryMatcher(node: AstNode): StoryMatcher | undefined {
  if (!isLiteralNode(node)) return undefined
  if (typeof node.value === 'string') {
    return { type: 'name', value: node.value }
  }
  if (node.value instanceof RegExp) {
    return { type: 'pattern', value: node.value }
  }
  return undefined
}

function readStoryMatchers(node: AstNode): StoryMatcher[] | undefined {
  const unwrapped = unwrapTsWrapper(node)
  const elements = getArrayElements(unwrapped)
  if (elements) {
    const matchers: StoryMatcher[] = []
    for (const element of elements) {
      if (!element) return undefined
      const matcher = readStoryMatcher(unwrapTsWrapper(element))
      if (!matcher) return undefined
      matchers.push(matcher)
    }
    return matchers
  }

  const matcher = readStoryMatcher(unwrapped)
  return matcher !== undefined && matcher.type === 'pattern'
    ? [matcher]
    : undefined
}

function readStoryFilters(
  metaObject: ObjectExpressionNode | undefined,
): StoryFilters | undefined {
  if (!metaObject) return {}

  const includeProperty = findProperty(metaObject, 'includeStories')
  const excludeProperty = findProperty(metaObject, 'excludeStories')
  const include = includeProperty
    ? readStoryMatchers(includeProperty.value)
    : undefined
  const exclude = excludeProperty
    ? readStoryMatchers(excludeProperty.value)
    : undefined

  if ((includeProperty && !include) || (excludeProperty && !exclude)) {
    return undefined
  }

  return {
    ...(include ? { include } : {}),
    ...(exclude ? { exclude } : {}),
  }
}

function matchesStoryMatcher(matcher: StoryMatcher, name: string): boolean {
  if (matcher.type === 'name') return matcher.value === name
  matcher.value.lastIndex = 0
  return matcher.value.test(name)
}

function isStoryExport(name: string, filters: StoryFilters): boolean {
  if (
    filters.include !== undefined &&
    !filters.include.some((matcher) => matchesStoryMatcher(matcher, name))
  ) {
    return false
  }

  return (
    filters.exclude === undefined ||
    !filters.exclude.some((matcher) => matchesStoryMatcher(matcher, name))
  )
}

export const requireStoryName: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require each exported Storybook story to define a name',
    },
    messages: {
      requireName:
        'Add a `name` property to this story so Storybook displays a readable name.',
    },
    schema: [],
  },
  create(context) {
    const storyExports: StoryExport[] = []
    let metaObject: ObjectExpressionNode | undefined
    let metaBindingName: string | undefined

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== 'VariableDeclaration') return

        for (const declarator of node.declaration.declarations) {
          if (declarator.id.type !== 'Identifier' || !declarator.init) continue

          const storyObject = asObjectExpression(
            unwrapTsWrapper(declarator.init),
          )
          if (!storyObject) continue

          storyExports.push({
            name: declarator.id.name,
            node: declarator.id,
            storyObject,
          })
        }
      },
      ExportDefaultDeclaration(node) {
        const declaration = unwrapTsWrapper(node.declaration)
        const object = asObjectExpression(declaration)
        if (object) {
          metaObject = object
          return
        }
        metaBindingName = getIdentifierName(declaration)
      },
      'Program:exit'(program) {
        const objectBindings = new Map<string, ObjectExpressionNode>()
        for (const statement of program.body) {
          const declaration =
            statement.type === 'VariableDeclaration'
              ? statement
              : statement.type === 'ExportNamedDeclaration' &&
                  statement.declaration?.type === 'VariableDeclaration'
                ? statement.declaration
                : undefined
          if (!declaration || declaration.kind !== 'const') continue

          for (const declarator of declaration.declarations) {
            if (declarator.id.type !== 'Identifier' || !declarator.init) {
              continue
            }
            const object = asObjectExpression(unwrapTsWrapper(declarator.init))
            if (object) objectBindings.set(declarator.id.name, object)
          }
        }

        const resolvedMetaObject =
          metaObject ??
          (metaBindingName !== undefined
            ? objectBindings.get(metaBindingName)
            : undefined)
        if (metaBindingName !== undefined && !resolvedMetaObject) return
        const filters = readStoryFilters(resolvedMetaObject)
        if (!filters) return

        for (const story of storyExports) {
          if (!isStoryExport(story.name, filters)) continue
          if (hasNameProperty(story.storyObject)) continue

          context.report({
            node: story.node,
            messageId: 'requireName',
          })
        }
      },
    }
  },
}
