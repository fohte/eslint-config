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
    { code: `expect.soft(result).toEqual({ a: 1 })` },
    { code: `expect.poll(() => getValue()).toEqual({ a: 1 })` },
    { code: `const actual = getValue()\nexpect(actual).toEqual({ a: 1 })` },
    {
      code: `let actual = { a: 1 }\nactual = getValue()\nexpect(actual).toEqual({ a: 1 })`,
    },
    {
      code: `function f(actual) {\n  expect(actual).toEqual({ a: 1 })\n}`,
    },
    {
      code: `const { actual } = { a: 1 }\nexpect(actual).toEqual({ a: 1 })`,
    },
    {
      code: `const actual = { a: 1 }\nactual.a = 2\nexpect(actual).toEqual({ a: 2 })`,
    },
    {
      code: `const actual = [1]\nactual.push(2)\nexpect(actual).toStrictEqual([1, 2])`,
    },
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
    {
      code: `expect.soft({ a, b }).toEqual({ a: 1, b: 2 })`,
      errors: [
        {
          messageId: 'inlineObject',
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: `const actual = { a: 1, b: 2 }\nexpect(actual).toEqual({ a: 1, b: 2 })`,
      errors: [
        {
          messageId: 'inlineObjectAlias',
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 14,
        },
      ],
    },
    {
      code: `const actual = [1, 2]\nexpect(actual).toStrictEqual([1, 2])`,
      errors: [
        {
          messageId: 'inlineArrayAlias',
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 14,
        },
      ],
    },
    {
      code: `const actual = { a: 1 } as const\nexpect(actual).toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObjectAlias',
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 14,
        },
      ],
    },
    {
      code: `let actual = { a: 1 }\nexpect(actual).toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObjectAlias',
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 14,
        },
      ],
    },
    {
      code: `const actual = { a: 1 }\nawait expect(actual).resolves.toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObjectAlias',
          line: 2,
          column: 14,
          endLine: 2,
          endColumn: 20,
        },
      ],
    },
    {
      code: `const actual = { a: 1 }\nexpect.soft(actual).toEqual({ a: 1 })`,
      errors: [
        {
          messageId: 'inlineObjectAlias',
          line: 2,
          column: 13,
          endLine: 2,
          endColumn: 19,
        },
      ],
    },
  ],
})
