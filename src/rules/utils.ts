export interface AstNode {
  type: string
}

interface PropertyKeyNode extends AstNode {
  name?: unknown
  value?: unknown
}

export interface PropertyNode extends AstNode {
  type: 'Property'
  computed: boolean
  key: PropertyKeyNode
  value: AstNode
}

export interface ObjectExpressionNode extends AstNode {
  type: 'ObjectExpression'
  properties: AstNode[]
}

interface TsWrapperNode extends AstNode {
  expression: AstNode
}

export function isAstNode(value: unknown): value is AstNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  )
}

export function isPropertyNode(node: AstNode): node is PropertyNode {
  return (
    node.type === 'Property' &&
    'computed' in node &&
    typeof node.computed === 'boolean' &&
    'key' in node &&
    isAstNode(node.key) &&
    'value' in node &&
    isAstNode(node.value)
  )
}

function isObjectExpressionNode(node: AstNode): node is ObjectExpressionNode {
  return (
    node.type === 'ObjectExpression' &&
    'properties' in node &&
    Array.isArray(node.properties) &&
    node.properties.every(isAstNode)
  )
}

export function asObjectExpression(
  node: AstNode,
): ObjectExpressionNode | undefined {
  if (!isObjectExpressionNode(node)) return undefined
  return node
}

export function findProperty(
  obj: ObjectExpressionNode,
  name: string,
): PropertyNode | undefined {
  for (const property of obj.properties) {
    if (!isPropertyNode(property)) continue
    if (property.computed) continue
    const { key } = property
    const keyName =
      key.type === 'Identifier' && typeof key.name === 'string'
        ? key.name
        : key.type === 'Literal' && typeof key.value === 'string'
          ? key.value
          : undefined
    if (keyName === name) return property
  }
  return undefined
}

const TS_WRAPPER_TYPES = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
])

function isTsWrapperNode(node: AstNode): node is TsWrapperNode {
  return (
    TS_WRAPPER_TYPES.has(node.type) &&
    'expression' in node &&
    isAstNode(node.expression)
  )
}

export function unwrapTsWrapper(node: AstNode): AstNode {
  let current = node
  while (isTsWrapperNode(current)) {
    current = current.expression
  }
  return current
}
