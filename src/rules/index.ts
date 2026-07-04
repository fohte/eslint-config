import type { ESLint } from 'eslint'

import { noInlineObjectInExpect } from './no-inline-object-in-expect.js'

export const fohtePlugin: ESLint.Plugin = {
  meta: {
    name: 'fohte',
  },
  rules: {
    'no-inline-object-in-expect': noInlineObjectInExpect,
  },
}
