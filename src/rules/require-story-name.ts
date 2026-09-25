import type { Rule } from 'eslint'

import { unwrapTsWrapper } from '#rules/utils.js'

interface PropertyNode {
  type: string
  computed: boolean
  key: { type: string; name?: string; value?: unknown }
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

function hasNameProperty(obj: ObjectExpressionNode): boolean {
  return obj.properties.some((raw) => {
    if (raw.type !== 'Property') return false
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed to Property by the check above
    const prop = raw as unknown as PropertyNode
    const { key } = prop

    if (prop.computed) return key.type === 'Literal' && key.value === 'name'

    const keyName =
      key.type === 'Identifier'
        ? key.name
        : key.type === 'Literal' && typeof key.value === 'string'
          ? key.value
          : undefined

    return keyName === 'name'
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
