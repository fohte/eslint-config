interface TsWrapperNode {
  type: string
  expression: { type: string }
}

const TS_WRAPPER_TYPES = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
])

export function unwrapTsWrapper(node: { type: string }): { type: string } {
  let current = node
  while (TS_WRAPPER_TYPES.has(current.type)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- estree's Node union lacks TS-only wrappers (TSAsExpression etc.); their .expression field is documented in @typescript-eslint AST
    current = (current as unknown as TsWrapperNode).expression
  }
  return current
}
