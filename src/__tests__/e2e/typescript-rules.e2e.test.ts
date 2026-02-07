import { describe, expect, it } from 'vitest'

import {
  expectNoErrors,
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject,
} from './helpers/e2e-test-helper.js'

describe('TypeScript Rules E2E', { timeout: 30000 }, () => {
  it('detects unused variables in TypeScript', async () => {
    await withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `const unusedVar = 'hello'

export function doSomething() {
  return 'done'
}
`,
          },
        ],
      },
      async (projectDir) => {
        const output = await runESLint(projectDir)
        expectRule(output, '@typescript-eslint/no-unused-vars')

        const messages = getMessagesForRule(
          output,
          '@typescript-eslint/no-unused-vars',
        )
        expect(messages[0].message).toContain(
          'is assigned a value but never used',
        )
      },
    )
  })

  it('detects no-explicit-any violations', async () => {
    await withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `function processData(data: any) {
  return data
}
`,
          },
        ],
      },
      async (projectDir) => {
        const output = await runESLint(projectDir)
        expectRule(output, '@typescript-eslint/no-explicit-any')
      },
    )
  })

  it('allows require() in .cjs files', async () => {
    await withTestProject(
      {
        files: [
          {
            path: 'config.cjs',
            content: `const path = require('path')
module.exports = { root: path.resolve(__dirname) }
`,
          },
        ],
      },
      async (projectDir) => {
        const output = await runESLint(projectDir)
        const requireMessages = getMessagesForRule(
          output,
          '@typescript-eslint/no-require-imports',
        )
        expect(requireMessages).toHaveLength(0)
      },
    )
  })

  it('still detects require() in .ts files', async () => {
    await withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `const fs = require('fs')
export default fs
`,
          },
        ],
      },
      async (projectDir) => {
        const output = await runESLint(projectDir)
        expectRule(output, '@typescript-eslint/no-require-imports')
      },
    )
  })

  it('allows valid TypeScript code', async () => {
    await withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `export interface User {
  id: string
  name: string
}

export class UserService {
  getUser(id: string): User {
    return { id, name: 'Test' }
  }
}

export const processUsers = (users: User[]): string[] => {
  return users.map(u => u.name)
}
`,
          },
        ],
      },
      async (projectDir) => {
        const output = await runESLint(projectDir)
        expectNoErrors(output)
      },
    )
  })
})
