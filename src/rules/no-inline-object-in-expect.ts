import type { Rule } from 'eslint'
import type { Node } from 'estree'

interface TsWrapperNode {
  type: string
  expression: Node
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
        let actual: Node = firstArg
        while (TS_WRAPPER_TYPES.has(actual.type)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- estree's Node union lacks TS-only wrappers (TSAsExpression etc.); their .expression field is documented in @typescript-eslint AST
          actual = (actual as unknown as TsWrapperNode).expression
        }
        if (actual.type === 'ObjectExpression') {
          context.report({ node: actual, messageId: 'inlineObject' })
        } else if (actual.type === 'ArrayExpression') {
          context.report({ node: actual, messageId: 'inlineArray' })
        }
      },
    }
  },
}
