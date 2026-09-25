import type { Node as ESTreeNode } from 'estree'

export type ObjectExpressionNode = Extract<
  ESTreeNode,
  { type: 'ObjectExpression' }
>

type PropertyNode = Extract<
  ObjectExpressionNode['properties'][number],
  { type: 'Property' }
>

interface TsWrapperNode<T extends { type: string }> {
  type: string
  expression: T
}

function isObjectExpressionNode(node: {
  type: string
}): node is ObjectExpressionNode {
  return node.type === 'ObjectExpression'
}

export function asObjectExpression(node: {
  type: string
}): ObjectExpressionNode | undefined {
  if (!isObjectExpressionNode(node)) return undefined
  return node
}

export function findProperty(
  obj: ObjectExpressionNode,
  name: string,
): PropertyNode | undefined {
  for (const property of obj.properties) {
    if (property.type !== 'Property') continue
    if (property.computed) continue
    const { key } = property
    const keyName =
      key.type === 'Identifier'
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

export function unwrapTsWrapper<T extends { type: string }>(node: T): T {
  let current = node
  while (TS_WRAPPER_TYPES.has(current.type)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TypeScript wrapper nodes are parser extensions; their expression is still an ESTree node.
    current = (current as unknown as TsWrapperNode<T>).expression
  }
  return current
}
