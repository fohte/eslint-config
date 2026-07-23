import { describe, expect, it } from 'vitest'

import { config } from '../config.js'
import { errorHandlingConfig } from '../error-handling.js'

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
      expect(() =>
        config({ errorHandling: { interopBoundaryFiles: [] } }),
      ).toThrow(
        'errorHandling requires typescript.typeChecked: true, because neverthrow/must-use-result needs type information to detect unused Result values.',
      )
    })

    it('appends the error-handling config when typescript.typeChecked is enabled', () => {
      const options = { interopBoundaryFiles: ['src/legacy/**/*.ts'] }
      const result = config({
        typescript: { typeChecked: true },
        errorHandling: options,
      })

      expect(result.at(-1)).toEqual(errorHandlingConfig(options)[0])
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
