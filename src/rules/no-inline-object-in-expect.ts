import type { Rule } from 'eslint'

interface TsWrapperNode {
  type: string
  expression: { type: string }
}

const TARGET_MATCHERS = new Set(['toEqual', 'toStrictEqual', 'toMatchObject'])
const MODIFIER_NAMES = new Set(['resolves', 'rejects', 'not'])
const TS_WRAPPER_TYPES = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
])

export const noInlineObjectInExpect: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow passing inline object or array literals to expect() with deep-equality matchers',
    },
    messages: {
      inlineObject:
        'Avoid passing an inline object literal to expect(). Pass the value under test directly, or split it into multiple expect() calls.',
      inlineArray:
        'Avoid passing an inline array literal to expect(). Pass the value under test directly, or split it into multiple expect() calls.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee.type !== 'MemberExpression' || callee.computed) return
        const prop = callee.property
        if (prop.type !== 'Identifier' || !TARGET_MATCHERS.has(prop.name))
          return

        let receiver = callee.object
        while (
          receiver.type === 'MemberExpression' &&
          !receiver.computed &&
          receiver.property.type === 'Identifier' &&
          MODIFIER_NAMES.has(receiver.property.name)
        ) {
          receiver = receiver.object
        }

        if (
          receiver.type !== 'CallExpression' ||
          receiver.callee.type !== 'Identifier' ||
          receiver.callee.name !== 'expect'
        ) {
          return
        }

        const firstArg = receiver.arguments[0]
        if (!firstArg) return
        let actual: { type: string } = firstArg
        while (TS_WRAPPER_TYPES.has(actual.type)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- estree's Node union lacks TS-only wrappers (TSAsExpression etc.); their .expression field is documented in @typescript-eslint AST
          actual = (actual as unknown as TsWrapperNode).expression
        }
        if (
          actual.type === 'ObjectExpression' ||
          actual.type === 'ArrayExpression'
        ) {
          context.report({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the unwrap loop narrows from estree Node only by string type tag; ESLint's report node accepts the runtime AST node
            node: actual as unknown as Rule.Node,
            messageId:
              actual.type === 'ObjectExpression'
                ? 'inlineObject'
                : 'inlineArray',
          })
        }
      },
    }
  },
}
