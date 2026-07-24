import { describe, expect, it } from 'vitest'

import {
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject,
} from './helpers/e2e-test-helper.js'

describe('Error Handling Rules E2E', { timeout: 30000 }, () => {
  it('detects throw statements', () => {
    withTestProject(
      {
        typeChecked: true,
        errorHandling: {},
        files: [
          {
            path: 'test.ts',
            content: `export function run() {
  throw new Error('boom')
}
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, 'no-restricted-syntax')
      },
    )
  })

  it('detects try/catch statements', () => {
    withTestProject(
      {
        typeChecked: true,
        errorHandling: {},
        files: [
          {
            path: 'test.ts',
            content: `export function run() {
  try {
    return 1
  } catch {
    return 0
  }
}
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, 'no-restricted-syntax')
      },
    )
  })

  it('allows try/catch disabled via eslint-disable-next-line', () => {
    withTestProject(
      {
        typeChecked: true,
        errorHandling: {},
        files: [
          {
            path: 'boundary.ts',
            content: `declare function externalSdkCall(): number

export function run() {
  // eslint-disable-next-line no-restricted-syntax -- interops with an external SDK's throw-based contract
  try {
    return externalSdkCall()
  } catch (error) {
    return error
  }
}
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        const messages = getMessagesForRule(output, 'no-restricted-syntax')
        expect(messages).toHaveLength(0)
      },
    )
  })

  it('allows throw/try-catch inside test files', () => {
    withTestProject(
      {
        typeChecked: true,
        errorHandling: {},
        files: [
          {
            path: 'run.test.ts',
            content: `export function run() {
  try {
    throw new Error('boom')
  } catch (error) {
    return error
  }
}
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        const messages = getMessagesForRule(output, 'no-restricted-syntax')
        expect(messages).toHaveLength(0)
      },
    )
  })

  it('detects a discarded neverthrow Result', () => {
    withTestProject(
      {
        typeChecked: true,
        errorHandling: {},
        files: [
          {
            path: 'test.ts',
            content: `import { ok } from 'neverthrow'

export function run() {
  ok(1)
}
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, 'neverthrow/must-use-result')
      },
    )
  })

  it('allows a returned neverthrow Result', () => {
    withTestProject(
      {
        typeChecked: true,
        errorHandling: {},
        files: [
          {
            path: 'test.ts',
            content: `import { ok } from 'neverthrow'

export function run() {
  return ok(1)
}
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        const messages = getMessagesForRule(
          output,
          'neverthrow/must-use-result',
        )
        expect(messages).toHaveLength(0)
      },
    )
  })
})
