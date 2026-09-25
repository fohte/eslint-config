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
    {
      code: `const meta = { excludeStories: /.*Data$/ } satisfies Meta\nexport default meta\nexport const sampleData = { value: 1 }`,
    },
    {
      code: `export default { excludeStories: ['helper', /.*Data$/] }\nexport const helper = {}\nexport const sampleData = { value: 1 }`,
    },
    {
      code: `const excluded = /Data$/\nexport default { excludeStories: excluded }\nexport const Example = { args: {} }`,
    },
    {
      code: `export const sampleData = { value: 1 }\nexport default { excludeStories: /Data$/ }`,
    },
  ],
  invalid: [
    {
      name: 'flags a plain object story without its own name',
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
      name: 'flags a story wrapped in satisfies without its own name',
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
      name: 'flags the unnamed declarator in a multi-declarator export',
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
    {
      name: 'flags a story that relies on a spread for its name',
      code: `export const Secondary = { ...Primary, args: {} }`,
      errors: [
        {
          messageId: 'requireName',
          line: 1,
          column: 14,
          endLine: 1,
          endColumn: 23,
        },
      ],
    },
    {
      name: 'flags included stories without their own names',
      code: `export default { includeStories: ['Primary', /^Secondary$/] }\nexport const Hidden = {}\nexport const Primary = { args: {} }\nexport const Secondary = { args: {} }`,
      errors: [
        {
          messageId: 'requireName',
          line: 3,
          column: 14,
          endLine: 3,
          endColumn: 21,
        },
        {
          messageId: 'requireName',
          line: 4,
          column: 14,
          endLine: 4,
          endColumn: 23,
        },
      ],
    },
  ],
})
