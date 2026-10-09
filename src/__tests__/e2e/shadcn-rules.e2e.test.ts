import { describe, expect, it } from 'vitest'

import {
  runESLint,
  withTestProject,
} from '#__tests__/e2e/helpers/e2e-test-helper.js'

const COMPONENT_SOURCE = `import { Button } from '@fohte/ui/button'

export const Example = () => <Button className="font-bold" />
`

// Diagnostic wording belongs to the peer plugin and can vary across supported versions.
function normalizeMessages(
  messages: ReturnType<typeof runESLint>[number]['messages'],
) {
  return messages.map((diagnostic) => ({
    ...diagnostic,
    message: '<plugin diagnostic>',
  }))
}

describe('shadcn rules E2E', { timeout: 30000 }, () => {
  it('recognizes components imported from @fohte/ui subpaths', () => {
    withTestProject(
      {
        shadcn: { files: ['**/*.tsx'] },
        files: [{ path: 'example.tsx', content: COMPONENT_SOURCE }],
      },
      (projectDir) => {
        const messages = normalizeMessages(
          runESLint(projectDir).flatMap((result) => result.messages),
        )

        expect(messages).toEqual([
          {
            ruleId: 'shadcn/no-restyle',
            severity: 2,
            message: '<plugin diagnostic>',
            line: 3,
            column: 48,
            messageId: 'appearanceClass',
            endLine: 3,
            endColumn: 59,
          },
        ])
      },
    )
  })

  it('allows layout classes on shared components', () => {
    withTestProject(
      {
        shadcn: { files: ['**/*.tsx'] },
        files: [
          {
            path: 'example.tsx',
            content: `import { Button } from '@fohte/ui/button'

export const Example = () => <Button className="flex" />
`,
          },
        ],
      },
      (projectDir) => {
        const messages = normalizeMessages(
          runESLint(projectDir).flatMap((result) => result.messages),
        )

        expect(messages).toEqual([])
      },
    )
  })

  it('allows @fohte/ui theme colors with opacity while reporting raw palette colors', () => {
    withTestProject(
      {
        shadcn: { files: ['apps/web/**/*.tsx'], rootDir: 'apps/web' },
        userConfigs: [
          {
            files: ['apps/web/**/*.tsx'],
            rules: {
              'shadcn/no-inline-styles': 'off',
              'shadcn/no-restyle': 'off',
              'shadcn/no-unknown-classes': 'off',
              'shadcn/require-static-classes': 'off',
            },
          },
        ],
        files: [
          {
            path: 'apps/web/package.json',
            content: JSON.stringify({
              name: 'web-app',
              type: 'module',
              dependencies: { '@fohte/ui': '*' },
            }),
          },
          {
            path: 'apps/web/node_modules/@fohte/ui/package.json',
            content: JSON.stringify({
              name: '@fohte/ui',
              type: 'module',
              exports: { './tokens.css': './tokens.css' },
            }),
          },
          {
            path: 'apps/web/node_modules/@fohte/ui/tokens.css',
            content: `@theme static {
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
}
`,
          },
          {
            path: 'apps/web/src/index.css',
            content: `@import 'tailwindcss';
@import '@fohte/ui/tokens.css';

@theme {
  --color-local-test: #fff;
}
`,
          },
          {
            path: 'apps/web/example.tsx',
            content: `export const Example = () => (
  <div className="text-muted-foreground bg-accent/50 bg-red-500" />
)
`,
          },
        ],
      },
      (projectDir) => {
        const messages = normalizeMessages(
          runESLint(projectDir).flatMap((result) => result.messages),
        )

        expect(messages).toEqual([
          {
            ruleId: 'shadcn/no-raw-colors',
            severity: 2,
            message: '<plugin diagnostic>',
            line: 2,
            column: 18,
            messageId: 'paletteClassFar',
            endLine: 2,
            endColumn: 65,
          },
        ])
      },
    )
  })

  it('continues loading when @fohte/ui does not export tokens.css', () => {
    withTestProject(
      {
        shadcn: { files: ['apps/web/**/*.tsx'], rootDir: 'apps/web' },
        userConfigs: [
          {
            files: ['apps/web/**/*.tsx'],
            rules: {
              'shadcn/no-inline-styles': 'off',
              'shadcn/no-restyle': 'off',
              'shadcn/no-unknown-classes': 'off',
              'shadcn/require-static-classes': 'off',
            },
          },
        ],
        files: [
          {
            path: 'apps/web/package.json',
            content: JSON.stringify({
              name: 'web-app',
              type: 'module',
              dependencies: { '@fohte/ui': '*' },
            }),
          },
          {
            path: 'apps/web/node_modules/@fohte/ui/package.json',
            content: JSON.stringify({
              name: '@fohte/ui',
              type: 'module',
              exports: { '.': './index.js' },
            }),
          },
          {
            path: 'apps/web/example.tsx',
            content: `export const Example = () => <div />\n`,
          },
        ],
      },
      (projectDir) => {
        const messages = normalizeMessages(
          runESLint(projectDir).flatMap((result) => result.messages),
        )

        expect(messages).toEqual([])
      },
    )
  })

  it('does not allow theme colors when @fohte/ui is not a project dependency', () => {
    withTestProject(
      {
        shadcn: { files: ['apps/web/**/*.tsx'], rootDir: 'apps/web' },
        userConfigs: [
          {
            files: ['apps/web/**/*.tsx'],
            rules: {
              'shadcn/no-inline-styles': 'off',
              'shadcn/no-restyle': 'off',
              'shadcn/no-unknown-classes': 'off',
              'shadcn/require-static-classes': 'off',
            },
          },
        ],
        files: [
          {
            path: 'apps/web/package.json',
            content: JSON.stringify({ name: 'web-app', type: 'module' }),
          },
          {
            path: 'node_modules/@fohte/ui/package.json',
            content: JSON.stringify({
              name: '@fohte/ui',
              type: 'module',
              exports: { './tokens.css': './tokens.css' },
            }),
          },
          {
            path: 'node_modules/@fohte/ui/tokens.css',
            content: `@theme static {
  --color-accent: var(--accent);
}
`,
          },
          {
            path: 'apps/web/src/index.css',
            content: `@import 'tailwindcss';
@import '@fohte/ui/tokens.css';

@theme {
  --color-local-test: #fff;
}
`,
          },
          {
            path: 'apps/web/example.tsx',
            content: `export const Example = () => <div className="bg-accent" />\n`,
          },
        ],
      },
      (projectDir) => {
        const messages = normalizeMessages(
          runESLint(projectDir).flatMap((result) => result.messages),
        )

        expect(messages).toEqual([
          {
            ruleId: 'shadcn/no-raw-colors',
            severity: 2,
            message: '<plugin diagnostic>',
            line: 1,
            column: 45,
            messageId: 'undeclaredToken',
            endLine: 1,
            endColumn: 56,
          },
        ])
      },
    )
  })

  it('allows a trailing config to disable an individual rule', () => {
    withTestProject(
      {
        shadcn: { files: ['**/*.tsx'] },
        userConfigs: [
          {
            files: ['**/*.tsx'],
            rules: { 'shadcn/no-restyle': 'off' },
          },
        ],
        files: [{ path: 'example.tsx', content: COMPONENT_SOURCE }],
      },
      (projectDir) => {
        const messages = normalizeMessages(
          runESLint(projectDir).flatMap((result) => result.messages),
        )

        expect(messages).toEqual([])
      },
    )
  })
})
