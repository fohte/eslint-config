import type { Rule } from 'eslint'
import type { Node as ESTreeNode } from 'estree'

import {
  asObjectExpression,
  findProperty,
  type ObjectExpressionNode,
  unwrapTsWrapper,
} from '#rules/utils.js'

function getObjectProperty(
  obj: ObjectExpressionNode,
  name: string,
): ObjectExpressionNode | undefined {
  const prop = findProperty(obj, name)
  if (!prop) return undefined
  return asObjectExpression(unwrapTsWrapper(prop.value))
}

function isTrueLiteral(node: ESTreeNode): boolean {
  if (node.type !== 'Literal') return false
  return node.value === true
}

export const noPlayInStories: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow play() functions and parameters.screenshot.skip on Storybook stories and their meta',
    },
    messages: {
      noPlay:
        'A story (or its meta) must not define a `play` function. A story represents a visual state through `args`/`render` only; move behavioral assertions (clicks, input, `expect` calls) to a .test.tsx file, and render the state `play` used to set up (e.g. an open menu) through a prop instead (e.g. `defaultOpen`).',
      noSkip:
        "Don't add `screenshot.skip` to a story. Stories can't define a `play` function, so every story's only assertion is its rendered appearance — skipping it permanently hides a duplicate-screenshot finding from the VRT diff, which usually means an undetected visual bug (e.g. two states rendering identically). Fix the underlying visual duplication instead of skipping.",
    },
    schema: [],
  },
  create(context) {
    function check(storyObject: ObjectExpressionNode) {
      const play = findProperty(storyObject, 'play')
      if (play) {
        context.report({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- play is a PropertyNode, a duck-typed subset of the real AST shape that doesn't structurally satisfy Rule.Node, so the cast must go through unknown
          node: play as unknown as Rule.Node,
          messageId: 'noPlay',
        })
      }

      const parametersObject = getObjectProperty(storyObject, 'parameters')
      if (!parametersObject) return
      const screenshotObject = getObjectProperty(parametersObject, 'screenshot')
      if (!screenshotObject) return
      const skip = findProperty(screenshotObject, 'skip')
      if (!skip || !isTrueLiteral(unwrapTsWrapper(skip.value))) return

      context.report({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- skip.value is typed as { type: string }, a duck-typed subset of the real AST shape that doesn't structurally satisfy Rule.Node, so the cast must go through unknown
        node: skip.value as unknown as Rule.Node,
        messageId: 'noSkip',
      })
    }

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== 'VariableDeclaration') return

        for (const declarator of node.declaration.declarations) {
          if (!declarator.init) continue

          const storyObject = asObjectExpression(
            unwrapTsWrapper(declarator.init),
          )
          if (!storyObject) continue

          check(storyObject)
        }
      },
      ExportDefaultDeclaration(node) {
        const metaObject = asObjectExpression(unwrapTsWrapper(node.declaration))
        if (!metaObject) return

        check(metaObject)
      },
    }
  },
}
