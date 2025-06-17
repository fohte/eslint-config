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
          '@typescript-eslint/no-unused-vars'
        )
        expect(messages[0].message).toContain(
          'is assigned a value but never used'
        )
      }
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
      }
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
      }
    )
  })
})
