import type { Rule } from 'eslint'

import { unwrapTsWrapper } from '#rules/utils.js'

interface PropertyNode {
  type: string
  computed: boolean
  key: { type: string; name?: string; value?: unknown }
  value: { type: string }
}

interface ObjectExpressionNode {
  type: string
  properties: { type: string }[]
}

function asObjectExpression(node: {
  type: string
}): ObjectExpressionNode | undefined {
  if (node.type !== 'ObjectExpression') return undefined
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed to ObjectExpression by the check above
  return node as unknown as ObjectExpressionNode
}

function findProperty(
  obj: ObjectExpressionNode,
  name: string,
): PropertyNode | undefined {
  for (const raw of obj.properties) {
    if (raw.type !== 'Property') continue
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed to Property by the check above
    const prop = raw as unknown as PropertyNode
    if (prop.computed) continue
    const { key } = prop
    const keyName =
      key.type === 'Identifier'
        ? key.name
        : key.type === 'Literal' && typeof key.value === 'string'
          ? key.value
          : undefined
    if (keyName === name) return prop
  }
  return undefined
}

function hasSpread(obj: ObjectExpressionNode): boolean {
  return obj.properties.some((prop) => prop.type === 'SpreadElement')
}

function isTrueLiteral(node: { type: string }): boolean {
  if (node.type !== 'Literal') return false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed to Literal by the check above
  return (node as unknown as { value: unknown }).value === true
}

export const noScreenshotSkipWithoutPlay: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow parameters.screenshot.skip on a Storybook story that has no play() function',
    },
    messages: {
      skipWithoutPlay:
        "Don't add `screenshot.skip` to a story that has no `play` function. This story's only assertion is its rendered appearance, so skipping it can permanently hide a duplicate-screenshot finding from the VRT diff — which usually means an undetected visual bug (e.g. two states rendering identically). Add a `play` assertion instead of skipping, or fix the underlying visual duplication.",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== 'VariableDeclaration') return

        for (const declarator of node.declaration.declarations) {
          if (!declarator.init) continue

          const storyObject = asObjectExpression(
            unwrapTsWrapper(declarator.init),
          )
          if (!storyObject || hasSpread(storyObject)) continue

          const parameters = findProperty(storyObject, 'parameters')
          if (!parameters) continue
          const parametersObject = asObjectExpression(
            unwrapTsWrapper(parameters.value),
          )
          if (!parametersObject) continue

          const screenshot = findProperty(parametersObject, 'screenshot')
          if (!screenshot) continue
          const screenshotObject = asObjectExpression(
            unwrapTsWrapper(screenshot.value),
          )
          if (!screenshotObject) continue

          const skip = findProperty(screenshotObject, 'skip')
          if (!skip || !isTrueLiteral(unwrapTsWrapper(skip.value))) continue

          if (findProperty(storyObject, 'play')) continue

          context.report({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESLint's report node accepts the runtime AST node
            node: skip.value as unknown as Rule.Node,
            messageId: 'skipWithoutPlay',
          })
        }
      },
    }
  },
}
