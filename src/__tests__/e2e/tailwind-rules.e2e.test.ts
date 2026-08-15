import { describe, expect, it } from 'vitest'

import {
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject,
} from '#__tests__/e2e/helpers/e2e-test-helper.js'

const CSS_FILE = {
  path: 'styles.css',
  content: '@import "tailwindcss";\n',
}

describe('Tailwind Rules E2E', { timeout: 30000 }, () => {
  it('detects an arbitrary Tailwind value passed to a clsx() call', () => {
    withTestProject(
      {
        tailwind: { cssConfigPath: 'styles.css' },
        files: [
          CSS_FILE,
          {
            path: 'test.ts',
            content: `import clsx from 'clsx'

export const classes = clsx('w-[600px]')
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        expectRule(output, 'tailwindcss/no-arbitrary-value')
      },
    )
  })

  it('detects an arbitrary value stashed in a bare string constant', () => {
    withTestProject(
      {
        tailwind: { cssConfigPath: 'styles.css' },
        files: [
          CSS_FILE,
          {
            path: 'test.ts',
            content: `export const width = 'w-[600px]'
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

  it('allows Tailwind classes that are not arbitrary values', () => {
    withTestProject(
      {
        tailwind: { cssConfigPath: 'styles.css' },
        files: [
          CSS_FILE,
          {
            path: 'test.ts',
            content: `import clsx from 'clsx'

export const classes = clsx('w-4')
`,
          },
        ],
      },
      (projectDir) => {
        const output = runESLint(projectDir)
        const messages = [
          ...getMessagesForRule(output, 'tailwindcss/no-arbitrary-value'),
          ...getMessagesForRule(output, 'no-restricted-syntax'),
        ]
        expect(messages).toHaveLength(0)
      },
    )
  })

  it('does not ban arbitrary-value-looking strings when tailwind is not provided', () => {
    withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `export const width = 'w-[600px]'
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

  describe('combined with errorHandling', () => {
    it('bans throw and arbitrary values together inside tailwind.files', () => {
      withTestProject(
        {
          typeChecked: true,
          errorHandling: {},
          tailwind: {
            files: ['web/**/*.ts'],
            cssConfigPath: 'web/styles.css',
          },
          files: [
            { path: 'web/styles.css', content: '@import "tailwindcss";\n' },
            {
              path: 'web/test.ts',
              content: `export const width = 'w-[600px]'

export function run() {
  throw new Error('boom')
}
`,
            },
          ],
        },
        (projectDir) => {
          const output = runESLint(projectDir)
          const messages = getMessagesForRule(output, 'no-restricted-syntax')
          expect(messages).toHaveLength(2)
        },
      )
    })

    it('still bans throw outside tailwind.files, without applying the tailwind ban there', () => {
      withTestProject(
        {
          typeChecked: true,
          errorHandling: {},
          tailwind: {
            files: ['web/**/*.ts'],
            cssConfigPath: 'web/styles.css',
          },
          files: [
            { path: 'web/styles.css', content: '@import "tailwindcss";\n' },
            {
              path: 'other/test.ts',
              content: `export const width = 'w-[600px]'

export function run() {
  throw new Error('boom')
}
`,
            },
          ],
        },
        (projectDir) => {
          const output = runESLint(projectDir)
          const messages = getMessagesForRule(output, 'no-restricted-syntax')
          expect(messages).toHaveLength(1)
        },
      )
    })
  })
})
