import neverthrowPlugin from '@ninoseki/eslint-plugin-neverthrow'
import { describe, expect, it } from 'vitest'

import { config } from '#config.js'

describe('config', () => {
  it('returns configs without error when called with no arguments', () => {
    const result = config()
    expect(result.length).toBeGreaterThan(0)
  })

  it('appends user configs after built-in configs', () => {
    const userConfig = { rules: { 'no-console': 'error' as const } }
    const result = config({}, userConfig)

    expect(result.at(-1)).toBe(userConfig)
  })

  it('appends multiple user configs in order', () => {
    const userConfig1 = { rules: { 'no-console': 'error' as const } }
    const userConfig2 = { rules: { 'no-debugger': 'error' as const } }
    const result = config({}, userConfig1, userConfig2)

    expect(result.at(-2)).toBe(userConfig1)
    expect(result.at(-1)).toBe(userConfig2)
  })

  it('returns only built-in configs when no user configs are provided', () => {
    const withoutUser = config()
    const withEmptySpread = config({})

    expect(withoutUser).toEqual(withEmptySpread)
  })

  it('includes vitest rules scoped to test files', () => {
    const result = config()
    const vitestEntry = result.find(
      (c) =>
        c.plugins !== undefined && Object.keys(c.plugins).includes('vitest'),
    )

    expect(vitestEntry).toBeDefined()
    expect(vitestEntry?.files).toBeDefined()
    expect(vitestEntry?.rules?.['vitest/expect-expect']).toBeDefined()
  })

  describe('no-restricted-imports', () => {
    it('bans relative imports and the @ alias, guiding towards # subpath imports', () => {
      const result = config()
      const mainEntry = result.find(
        (c) =>
          c.plugins !== undefined &&
          Object.keys(c.plugins).includes('simple-import-sort'),
      )

      expect(mainEntry?.rules?.['no-restricted-imports']).toEqual([
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message:
                'Relative imports are not allowed. Use a # subpath import (package.json "imports" field) instead — see https://nodejs.org/api/packages.html#subpath-imports.',
            },
            {
              group: ['@/*'],
              message:
                'The @ alias is not allowed: it only exists for TypeScript/bundlers and is not resolved by Node at runtime. Use a # subpath import (package.json "imports" field) instead — see https://nodejs.org/api/packages.html#subpath-imports.',
            },
          ],
        },
      ])
    })
  })

  describe('errorHandling', () => {
    it('throws when errorHandling is provided without typescript.typeChecked', () => {
      expect(() =>
        config({ errorHandling: { interopBoundaryFiles: [] } }),
      ).toThrow(
        new Error(
          'errorHandling requires typescript.typeChecked: true, because neverthrow/must-use-result needs type information to detect unused Result values.',
        ),
      )
    })

    it('bans throw/try-catch and discarded neverthrow Results outside the interop boundary and test files', () => {
      const result = config({
        typescript: { typeChecked: true },
        errorHandling: { interopBoundaryFiles: ['src/legacy/**/*.ts'] },
      })

      expect(result.at(-1)).toEqual({
        files: ['**/*.ts{,x}'],
        ignores: [
          '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
          '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
          'src/legacy/**/*.ts',
        ],
        plugins: { neverthrow: neverthrowPlugin },
        rules: {
          'no-restricted-syntax': [
            'error',
            {
              selector: 'ThrowStatement',
              message:
                "Don't throw — return a Result via err()/errAsync(), or use ResultAsync.fromPromise() to interop with a throwing API without a local throw. Only files listed in errorHandling.interopBoundaryFiles may throw, to satisfy an external SDK's throw-based contract.",
            },
            {
              selector: 'TryStatement',
              message:
                "Don't use try/catch — use ResultAsync.fromPromise()/.andThen()/.mapErr()/.match() to turn a failure into a Result value. Only files listed in errorHandling.interopBoundaryFiles may use try/catch, to satisfy an external SDK's throw-based contract.",
            },
          ],
          'neverthrow/must-use-result': 'error',
        },
      })
    })

    it('omits the error-handling config when errorHandling is not provided', () => {
      const result = config({ typescript: { typeChecked: true } })
      const hasNeverthrowPlugin = result.some(
        (c) =>
          c.plugins !== undefined &&
          Object.keys(c.plugins).includes('neverthrow'),
      )

      expect(hasNeverthrowPlugin).toBe(false)
    })
  })
})
