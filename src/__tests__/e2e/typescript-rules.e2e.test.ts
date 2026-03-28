import { describe, expect, it } from 'vitest'

import {
  expectNoErrors,
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject,
} from './helpers/e2e-test-helper.js'

describe('TypeScript Rules E2E', { timeout: 30000 }, () => {
  it('detects unused variables in TypeScript', () => {
    withTestProject(
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
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, '@typescript-eslint/no-unused-vars')

        const messages = getMessagesForRule(
          output,
          '@typescript-eslint/no-unused-vars',
        )
        expect(messages[0]?.message).toContain(
          'is assigned a value but never used',
        )
      },
    )
  })

  it('detects no-explicit-any violations', () => {
    withTestProject(
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
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, '@typescript-eslint/no-explicit-any')
      },
    )
  })

  it('allows require() in .cjs files', () => {
    withTestProject(
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
      (projectDir) => {
        const output = runESLint(projectDir)
        const requireMessages = getMessagesForRule(
          output,
          '@typescript-eslint/no-require-imports',
        )
        expect(requireMessages).toHaveLength(0)
      },
    )
  })

  it('still detects require() in .ts files', () => {
    withTestProject(
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
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, '@typescript-eslint/no-require-imports')
      },
    )
  })

  it('allows valid TypeScript code', () => {
    withTestProject(
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
      (projectDir) => {
        const output = runESLint(projectDir)
        expectNoErrors(output)
      },
    )
  })

  describe(
    'strict-boolean-expressions (type-checked)',
    { timeout: 60000 },
    () => {
      it('detects nullable string in conditionals', () => {
        withTestProject(
          {
            typeChecked: true,
            files: [
              {
                path: 'test.ts',
                content: `export function check(str: string | undefined) {
  if (str) {
    return 'truthy'
  }
  return 'falsy'
}
`,
              },
            ],
          },
          (projectDir) => {
            const output = runESLint(projectDir)
            expectRule(output, '@typescript-eslint/strict-boolean-expressions')
          },
        )
      })

      it('detects nullable boolean in conditionals', () => {
        withTestProject(
          {
            typeChecked: true,
            files: [
              {
                path: 'test.ts',
                content: `export function check(flag: boolean | null) {
  if (flag) {
    return 'truthy'
  }
  return 'falsy'
}
`,
              },
            ],
          },
          (projectDir) => {
            const output = runESLint(projectDir)
            expectRule(output, '@typescript-eslint/strict-boolean-expressions')
          },
        )
      })

      it('allows nullable object in conditionals', () => {
        withTestProject(
          {
            typeChecked: true,
            files: [
              {
                path: 'test.ts',
                content: `interface User {
  name: string
}

export function check(user: User | null) {
  if (user) {
    return user.name
  }
  return 'anonymous'
}
`,
              },
            ],
          },
          (projectDir) => {
            const output = runESLint(projectDir)
            const messages = getMessagesForRule(
              output,
              '@typescript-eslint/strict-boolean-expressions',
            )
            expect(messages).toHaveLength(0)
          },
        )
      })

      it('allows explicit boolean in conditionals', () => {
        withTestProject(
          {
            typeChecked: true,
            files: [
              {
                path: 'test.ts',
                content: `export function check(flag: boolean) {
  if (flag) {
    return 'yes'
  }
  return 'no'
}
`,
              },
            ],
          },
          (projectDir) => {
            const output = runESLint(projectDir)
            const messages = getMessagesForRule(
              output,
              '@typescript-eslint/strict-boolean-expressions',
            )
            expect(messages).toHaveLength(0)
          },
        )
      })
    },
  )

  describe('.cjs files with type-checked mode', { timeout: 60000 }, () => {
    it('allows require() in .cjs files', () => {
      withTestProject(
        {
          typeChecked: true,
          files: [
            {
              path: 'config.cjs',
              content: `const path = require('path')
module.exports = { root: path.resolve(__dirname) }
`,
            },
          ],
        },
        (projectDir) => {
          const output = runESLint(projectDir)
          const requireMessages = getMessagesForRule(
            output,
            '@typescript-eslint/no-require-imports',
          )
          expect(requireMessages).toHaveLength(0)
        },
      )
    })

    it('allows eslint-disable comment for no-require-imports in .cjs files', () => {
      withTestProject(
        {
          typeChecked: true,
          files: [
            {
              path: 'config.cjs',
              content: `// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')

module.exports = { root: path.resolve(__dirname) }
`,
            },
          ],
        },
        (projectDir) => {
          const output = runESLint(projectDir)
          expectNoErrors(output)
        },
      )
    })
  })
})
