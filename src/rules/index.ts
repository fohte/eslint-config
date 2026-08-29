import type { ESLint } from 'eslint'

import { noInlineObjectInExpect } from '#rules/no-inline-object-in-expect.js'
import { noScreenshotSkipWithoutPlay } from '#rules/no-screenshot-skip-without-play.js'

export const fohtePlugin: ESLint.Plugin = {
  meta: {
    name: 'fohte',
  },
  rules: {
    'no-inline-object-in-expect': noInlineObjectInExpect,
    'no-screenshot-skip-without-play': noScreenshotSkipWithoutPlay,
  },
}
