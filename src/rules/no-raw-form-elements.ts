import type { Rule } from 'eslint'

const RAW_FORM_ELEMENTS = new Set(['button', 'input', 'select', 'textarea'])

interface JSXOpeningElementNode {
  name: {
    type: string
    name?: string
  }
}

export const noRawFormElements: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw button, input, select, and textarea JSX elements',
    },
    messages: {
      rawFormElement:
        'Use the shared UI component instead of a raw `<{{element}}>` element.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(rawNode: Rule.Node) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESLint's ESTree types omit JSX nodes supplied by the configured parser
        const node = rawNode as unknown as JSXOpeningElementNode
        if (node.name.type !== 'JSXIdentifier') return
        const element = node.name.name
        if (element === undefined || !RAW_FORM_ELEMENTS.has(element)) return

        context.report({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- JSXIdentifier is supplied by the configured parser but omitted from ESLint's ESTree node union
          node: node.name as unknown as Rule.Node,
          messageId: 'rawFormElement',
          data: { element },
        })
      },
    }
  },
}
