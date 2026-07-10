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

function unwrapTsWrapper(node: { type: string }): { type: string } {
  let current = node
  while (TS_WRAPPER_TYPES.has(current.type)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- estree's Node union lacks TS-only wrappers (TSAsExpression etc.); their .expression field is documented in @typescript-eslint AST
    current = (current as unknown as TsWrapperNode).expression
  }
  return current
}

// Only follows bindings referenced exactly twice (the initializing write and this expect() read), so no reassignment or mutating access (e.g. `x.a = 1`, `x.push(1)`) could have changed the value in between.
function resolveAliasedLiteral(
  context: Rule.RuleContext,
  node: { type: string },
): { type: string } | undefined {
  if (node.type !== 'Identifier') return undefined

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed to Identifier by the check above; getScope() requires the real AST node
  const identifierNode = node as unknown as Rule.Node
  const scope = context.sourceCode.getScope(identifierNode)
  const reference = scope.references.find(
    (ref) => ref.identifier === identifierNode,
  )
  const variable = reference?.resolved
  if (!variable) return undefined

  if (variable.references.length !== 2) return undefined

  for (const def of variable.defs) {
    if (def.type !== 'Variable') continue
    if (def.node.id.type !== 'Identifier' || !def.node.init) continue
    return unwrapTsWrapper(def.node.init)
  }
  return undefined
}

const MESSAGE_IDS = {
  ObjectExpression: { direct: 'inlineObject', alias: 'inlineObjectAlias' },
  ArrayExpression: { direct: 'inlineArray', alias: 'inlineArrayAlias' },
} as const

function reportInlineLiteral(
  context: Rule.RuleContext,
  reportNode: { type: string },
  literalType: keyof typeof MESSAGE_IDS,
  isAlias: boolean,
): void {
  context.report({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESLint's report node accepts the runtime AST node
    node: reportNode as unknown as Rule.Node,
    messageId: isAlias
      ? MESSAGE_IDS[literalType].alias
      : MESSAGE_IDS[literalType].direct,
  })
}

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
      inlineObjectAlias:
        'Avoid aliasing an inline object literal through a variable before passing it to expect(). Pass the value under test directly, or split it into multiple expect() calls.',
      inlineArrayAlias:
        'Avoid aliasing an inline array literal through a variable before passing it to expect(). Pass the value under test directly, or split it into multiple expect() calls.',
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

        if (receiver.type !== 'CallExpression') return
        const expectCallee = receiver.callee
        const isExpect =
          expectCallee.type === 'Identifier'
            ? expectCallee.name === 'expect'
            : expectCallee.type === 'MemberExpression' &&
              !expectCallee.computed &&
              expectCallee.object.type === 'Identifier' &&
              expectCallee.object.name === 'expect'
        if (!isExpect) return

        const firstArg = receiver.arguments[0]
        if (!firstArg) return
        const actual = unwrapTsWrapper(firstArg)

        if (
          actual.type === 'ObjectExpression' ||
          actual.type === 'ArrayExpression'
        ) {
          reportInlineLiteral(context, actual, actual.type, false)
          return
        }

        const aliasedLiteral = resolveAliasedLiteral(context, actual)
        if (
          aliasedLiteral?.type === 'ObjectExpression' ||
          aliasedLiteral?.type === 'ArrayExpression'
        ) {
          reportInlineLiteral(context, actual, aliasedLiteral.type, true)
        }
      },
    }
  },
}
