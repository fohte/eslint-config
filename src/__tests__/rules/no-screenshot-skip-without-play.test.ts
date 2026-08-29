import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'

import { noScreenshotSkipWithoutPlay } from '#rules/no-screenshot-skip-without-play.js'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
  },
})

ruleTester.run('no-screenshot-skip-without-play', noScreenshotSkipWithoutPlay, {
  valid: [
    {
      code: `export const Default = { play: async () => {}, parameters: { screenshot: { skip: true } } }`,
    },
    {
      code: `export const Default = { parameters: { screenshot: { skip: false } } }`,
    },
    { code: `export const Default = { parameters: {} }` },
    {
      code: `export const Default = { parameters: { screenshot: { skip: someVar } } }`,
    },
    {
      code: `export const Default = { ...base, parameters: { screenshot: { skip: true } } }`,
    },
    {
      code: `export default { parameters: { screenshot: { skip: true } } }`,
    },
    { code: `export const Default = () => null` },
  ],
  invalid: [
    {
      code: `export const Default = { parameters: { screenshot: { skip: true } } }`,
      errors: [
        {
          messageId: 'skipWithoutPlay',
          line: 1,
          column: 60,
          endLine: 1,
          endColumn: 64,
        },
      ],
    },
    {
      code: `export const Default = { parameters: { screenshot: { skip: true } } } satisfies Story`,
      errors: [
        {
          messageId: 'skipWithoutPlay',
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
          messageId: 'skipWithoutPlay',
          line: 1,
          column: 61,
          endLine: 1,
          endColumn: 65,
        },
      ],
    },
    {
      code: `export const A = { parameters: { screenshot: { skip: true } } }, B = { play: async () => {}, parameters: { screenshot: { skip: true } } }`,
      errors: [
        {
          messageId: 'skipWithoutPlay',
          line: 1,
          column: 54,
          endLine: 1,
          endColumn: 58,
        },
      ],
    },
  ],
})
