import { describe, expect, it } from 'vitest'

import {
  runESLint,
  withTestProject,
} from '#__tests__/e2e/helpers/e2e-test-helper.js'

const COMPONENT_SOURCE = `import { Button } from '@fohte/ui/button'

export const Example = () => <Button className="font-bold" />
`

describe('shadcn rules E2E', { timeout: 30000 }, () => {
  it('recognizes components imported from @fohte/ui subpaths', () => {
    withTestProject(
      {
        shadcn: { files: ['**/*.tsx'] },
        files: [{ path: 'example.tsx', content: COMPONENT_SOURCE }],
      },
      (projectDir) => {
        const messages = runESLint(projectDir).flatMap(
          (result) => result.messages,
        )

        expect(messages).toEqual([
          {
            ruleId: 'shadcn/no-restyle',
            severity: 2,
            message:
              '"font-bold" is not allowed on <Button>: <Button> owns its typography. Use one of its variants. Add a new variant only if the design explicitly calls for a treatment none of them provides.',
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
        const messages = runESLint(projectDir).flatMap(
          (result) => result.messages,
        )

        expect(messages).toEqual([])
      },
    )
  })
})
