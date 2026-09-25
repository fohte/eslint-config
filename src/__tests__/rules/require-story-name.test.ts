import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'

import { requireStoryName } from '#rules/require-story-name.js'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
  },
})

ruleTester.run('require-story-name', requireStoryName, {
  valid: [
    {
      code: `export const Default = { name: 'Readable title', args: {} }`,
    },
    { code: `export const Default = { 'name': 'Readable title' }` },
    { code: `export const Default = { ['name']: 'Readable title' }` },
    { code: `export default { component: Foo } satisfies Meta<typeof Foo>` },
    { code: `export const Template = () => null` },
  ],
  invalid: [
    {
      name: 'flags a story without a name',
      code: `export const Default = { args: {} }`,
      errors: [
        {
          messageId: 'requireName',
          line: 1,
          column: 14,
          endLine: 1,
          endColumn: 21,
        },
      ],
    },
    {
      name: 'flags a story without a name through a satisfies wrapper',
      code: `export const Default = { args: {} } satisfies Story`,
      errors: [
        {
          messageId: 'requireName',
          line: 1,
          column: 14,
          endLine: 1,
          endColumn: 21,
        },
      ],
    },
    {
      name: 'checks each story in a multi-declarator export independently',
      code: `export const Named = { name: 'Readable title' }, Missing = { args: {} }`,
      errors: [
        {
          messageId: 'requireName',
          line: 1,
          column: 50,
          endLine: 1,
          endColumn: 57,
        },
      ],
    },
  ],
})
