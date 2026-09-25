import type { ESLint } from 'eslint'

import { noInlineObjectInExpect } from '#rules/no-inline-object-in-expect.js'
import { noPlayInStories } from '#rules/no-play-in-stories.js'
import { noRawFormElements } from '#rules/no-raw-form-elements.js'

export const fohtePlugin: ESLint.Plugin = {
  meta: {
    name: 'fohte',
  },
  rules: {
    'no-inline-object-in-expect': noInlineObjectInExpect,
    'no-raw-form-elements': noRawFormElements,
    'no-play-in-stories': noPlayInStories,
  },
}
