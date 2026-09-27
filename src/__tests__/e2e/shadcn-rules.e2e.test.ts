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
