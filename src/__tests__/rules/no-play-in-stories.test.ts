import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'

import { noPlayInStories } from '#rules/no-play-in-stories.js'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
  },
})

ruleTester.run('no-play-in-stories', noPlayInStories, {
  valid: [
    { code: `export const Default = { args: { disabled: true } }` },
    {
      code: `export const Default = { parameters: { screenshot: { skip: false } } }`,
    },
    { code: `export const Default = { parameters: {} }` },
    {
      code: `export const Default = { parameters: { screenshot: { skip: someVar } } }`,
    },
    {
      code: `export default { component: Foo } satisfies Meta<typeof Foo>`,
    },
    { code: `export const Default = () => null` },
  ],
  invalid: [
    {
      name: 'flags a play function on a story',
      code: `export const Default = { args: {}, play: async () => {} }`,
      errors: [
        {
          messageId: 'noPlay',
          line: 1,
          column: 36,
          endLine: 1,
          endColumn: 56,
        },
      ],
    },
    {
      name: 'flags a play function on the meta (default export)',
      code: `export default { component: Foo, play: async () => {} } satisfies Meta<typeof Foo>`,
      errors: [
        {
          messageId: 'noPlay',
          line: 1,
          column: 34,
          endLine: 1,
          endColumn: 54,
        },
      ],
    },
    {
      name: 'flags screenshot.skip: true',
      code: `export const Default = { parameters: { screenshot: { skip: true } } }`,
      errors: [
        {
          messageId: 'noSkip',
          line: 1,
          column: 60,
          endLine: 1,
          endColumn: 64,
        },
      ],
    },
    {
      name: 'flags screenshot.skip: true through a satisfies-wrapped story',
      code: `export const Default = { parameters: { screenshot: { skip: true } } } satisfies Story`,
      errors: [
        {
          messageId: 'noSkip',
          line: 1,
          column: 60,
          endLine: 1,
          endColumn: 64,
        },
      ],
    },
    {
      code: `export const Default = { parameters: { screenshot: ({ skip: true } as const) } }`,
      errors: [
        {
          messageId: 'noSkip',
          line: 1,
          column: 61,
          endLine: 1,
          endColumn: 65,
        },
      ],
    },
    {
      name: 'flags both play and screenshot.skip on the same story',
      code: `export const Default = { play: async () => {}, parameters: { screenshot: { skip: true } } }`,
      errors: [
        { messageId: 'noPlay', line: 1, column: 26, endLine: 1, endColumn: 46 },
        {
          messageId: 'noSkip',
          line: 1,
          column: 82,
          endLine: 1,
          endColumn: 86,
        },
      ],
    },
    {
      name: 'flags each story in a multi-declarator export independently',
      code: `export const A = { play: async () => {} }, B = { parameters: { screenshot: { skip: true } } }`,
      errors: [
        { messageId: 'noPlay', line: 1, column: 20, endLine: 1, endColumn: 40 },
        {
          messageId: 'noSkip',
          line: 1,
          column: 84,
          endLine: 1,
          endColumn: 88,
        },
      ],
    },
    {
      name: 'flags screenshot.skip: true on the meta (default export)',
      code: `export default { component: Foo, parameters: { screenshot: { skip: true } } } satisfies Meta<typeof Foo>`,
      errors: [
        {
          messageId: 'noSkip',
          line: 1,
          column: 68,
          endLine: 1,
          endColumn: 72,
        },
      ],
    },
    {
      name: 'flags screenshot.skip: true even when the story is built via a spread',
      code: `export const Default = { ...base, parameters: { screenshot: { skip: true } } }`,
      errors: [
        {
          messageId: 'noSkip',
          line: 1,
          column: 69,
          endLine: 1,
          endColumn: 73,
        },
      ],
    },
  ],
})
