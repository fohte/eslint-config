import type { Rule } from 'eslint'

import {
  asObjectExpression,
  findProperty,
  type ObjectExpressionNode,
  unwrapTsWrapper,
} from '#rules/utils.js'

function hasNameProperty(obj: ObjectExpressionNode): boolean {
  if (findProperty(obj, 'name')) return true

  return obj.properties.some((raw) => {
    if (raw.type !== 'Property') return false
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- PropertyNode is a duck-typed subset of the real AST shape
    const property = raw as unknown as {
      computed: boolean
      key: { type: string; value?: unknown }
    }
    return (
      property.computed &&
      property.key.type === 'Literal' &&
      property.key.value === 'name'
    )
  })
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
    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== 'VariableDeclaration') return

        for (const declarator of node.declaration.declarations) {
          if (!declarator.init) continue

          const storyObject = asObjectExpression(
            unwrapTsWrapper(declarator.init),
          )
          if (!storyObject || hasNameProperty(storyObject)) continue

          context.report({
            node: declarator.id,
            messageId: 'requireName',
          })
        }
      },
    }
  },
}
