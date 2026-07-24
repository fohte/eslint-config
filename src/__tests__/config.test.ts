import neverthrowPlugin from '@ninoseki/eslint-plugin-neverthrow'
import { describe, expect, it } from 'vitest'

import { config } from '../config.js'

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

  describe('errorHandling', () => {
    it('throws when errorHandling is provided without typescript.typeChecked', () => {
      expect(() => config({ errorHandling: {} })).toThrow(
        new Error(
          'errorHandling requires typescript.typeChecked: true, because neverthrow/must-use-result needs type information to detect unused Result values.',
        ),
      )
    })

    it('bans throw/try-catch and discarded neverthrow Results outside test files', () => {
      const result = config({
        typescript: { typeChecked: true },
        errorHandling: {},
      })

      expect(result.at(-1)).toEqual({
        files: ['**/*.ts{,x}'],
        ignores: [
          '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
          '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
        ],
        plugins: { neverthrow: neverthrowPlugin },
        rules: {
          'no-restricted-syntax': [
            'error',
            {
              selector: 'ThrowStatement',
              message:
                "Don't throw — return a Result via err()/errAsync(), or use ResultAsync.fromPromise() to interop with a throwing API without a local throw. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an eslint-disable-next-line comment explaining why.",
            },
            {
              selector: 'TryStatement',
              message:
                "Don't use try/catch — use ResultAsync.fromPromise()/.andThen()/.mapErr()/.match() to turn a failure into a Result value. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an eslint-disable-next-line comment explaining why.",
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

  describe('opentelemetry', () => {
    it('bans tracer.startSpan()/startActiveSpan() when opentelemetry.enabled is true', () => {
      const result = config({ opentelemetry: { enabled: true } })

      expect(result.at(-1)).toEqual({
        files: ['**/*.ts{,x}'],
        rules: {
          'no-restricted-syntax': [
            'error',
            {
              selector: "CallExpression[callee.property.name='startSpan']",
              message:
                "Don't call tracer.startSpan() directly — wrap the code that should run as its child in context.with(trace.setSpan(context.active(), span), ...) so nested spans are parented correctly. startSpan() never enters the active context on its own. If context.with() genuinely can't wrap the span (e.g. start and end happen in separate callbacks), add an eslint-disable-next-line comment explaining why.",
            },
            {
              selector:
                "CallExpression[callee.property.name='startActiveSpan']",
              message:
                "Don't call tracer.startActiveSpan() and use the span outside its own callback — it's only the active context for the duration of that callback, so ending it later (e.g. start and end split across separate callbacks) breaks propagation for anything that runs after the callback returns. Keep all child-producing work inside the callback, or use tracer.startSpan() plus context.with() instead. If neither fits, add an eslint-disable-next-line comment explaining why.",
            },
          ],
        },
      })
    })

    it('omits the opentelemetry config when opentelemetry is not provided', () => {
      const result = config()
      const hasNoRestrictedSyntax = result.some(
        (c) => c.rules?.['no-restricted-syntax'] !== undefined,
      )

      expect(hasNoRestrictedSyntax).toBe(false)
    })

    it('omits the opentelemetry config when opentelemetry.enabled is false', () => {
      const result = config({ opentelemetry: { enabled: false } })
      const hasNoRestrictedSyntax = result.some(
        (c) => c.rules?.['no-restricted-syntax'] !== undefined,
      )

      expect(hasNoRestrictedSyntax).toBe(false)
    })

    it('merges startSpan/startActiveSpan selectors into the same no-restricted-syntax rule as errorHandling, instead of a separate config that would silently override it', () => {
      const result = config({
        typescript: { typeChecked: true },
        errorHandling: {},
        opentelemetry: { enabled: true },
      })

      expect(result.at(-1)).toEqual({
        files: ['**/*.ts{,x}'],
        ignores: [
          '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
          '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
        ],
        plugins: { neverthrow: neverthrowPlugin },
        rules: {
          'no-restricted-syntax': [
            'error',
            {
              selector: 'ThrowStatement',
              message:
                "Don't throw — return a Result via err()/errAsync(), or use ResultAsync.fromPromise() to interop with a throwing API without a local throw. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an eslint-disable-next-line comment explaining why.",
            },
            {
              selector: 'TryStatement',
              message:
                "Don't use try/catch — use ResultAsync.fromPromise()/.andThen()/.mapErr()/.match() to turn a failure into a Result value. If an external SDK's throw-based contract genuinely can't be wrapped that way, add an eslint-disable-next-line comment explaining why.",
            },
            {
              selector: "CallExpression[callee.property.name='startSpan']",
              message:
                "Don't call tracer.startSpan() directly — wrap the code that should run as its child in context.with(trace.setSpan(context.active(), span), ...) so nested spans are parented correctly. startSpan() never enters the active context on its own. If context.with() genuinely can't wrap the span (e.g. start and end happen in separate callbacks), add an eslint-disable-next-line comment explaining why.",
            },
            {
              selector:
                "CallExpression[callee.property.name='startActiveSpan']",
              message:
                "Don't call tracer.startActiveSpan() and use the span outside its own callback — it's only the active context for the duration of that callback, so ending it later (e.g. start and end split across separate callbacks) breaks propagation for anything that runs after the callback returns. Keep all child-producing work inside the callback, or use tracer.startSpan() plus context.with() instead. If neither fits, add an eslint-disable-next-line comment explaining why.",
            },
          ],
          'neverthrow/must-use-result': 'error',
        },
      })
    })
  })
})
