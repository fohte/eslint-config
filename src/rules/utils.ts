interface PropertyNode {
  type: string
  computed: boolean
  key: { type: string; name?: string; value?: unknown }
  value: { type: string }
}

export interface ObjectExpressionNode {
  type: string
  properties: { type: string }[]
}

interface TsWrapperNode {
  type: string
  expression: { type: string }
}

export function asObjectExpression(node: {
  type: string
}): ObjectExpressionNode | undefined {
  if (node.type !== 'ObjectExpression') return undefined
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed to ObjectExpression by the check above
  return node as unknown as ObjectExpressionNode
}

export function findProperty(
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
