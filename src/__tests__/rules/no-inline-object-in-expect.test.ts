import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'

import { noInlineObjectInExpect } from '../../rules/no-inline-object-in-expect.js'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
  },
})

ruleTester.run('no-inline-object-in-expect', noInlineObjectInExpect, {
  valid: [
    { code: `expect(result).toEqual({ a: 1 })` },
    { code: `expect(getList()).toEqual([1, 2])` },
    { code: `expect(x).toBe(1)` },
    { code: `expect({ a }).toBe(value)` },
    { code: `expect({ a, b }).toContain(x)` },
    { code: `await expect(getValue()).resolves.toEqual({ a: 1 })` },
    { code: `expect(getValue()).rejects.toEqual([1, 2])` },
    { code: `expect(getValue()).not.toEqual({ a: 1 })` },
  ],
  invalid: [
    {
      code: `expect({ a, b }).toEqual({ a: 1, b: 2 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: `expect([a, b]).toStrictEqual([1, 2])`,
      errors: [
        {
          messageId: 'inlineArray',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: `expect({ a }).toMatchObject({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: `await expect({ a, b }).resolves.toEqual({ a: 1, b: 2 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 14,
          endLine: 1,
          endColumn: 22,
        },
      ],
    },
    {
      code: `expect({ a, b }).rejects.toEqual({ a: 1, b: 2 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: `expect([a, b]).not.toStrictEqual([1, 2])`,
      errors: [
        {
          messageId: 'inlineArray',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: `expect({ a }).resolves.not.toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: `expect({ a: 1 } as const).toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: `expect([1, 2] as const).toStrictEqual([1, 2])`,
      errors: [
        {
          messageId: 'inlineArray',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: `expect({ a: 1 } satisfies { a: number }).toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: `expect({ a: 1 }!).toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
  ],
})
