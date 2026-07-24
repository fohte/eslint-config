import { describe, expect, it } from 'vitest'

import {
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject,
} from '#__tests__/e2e/helpers/e2e-test-helper.js'

describe('OpenTelemetry Rules E2E', { timeout: 30000 }, () => {
  it('detects tracer.startSpan() when opentelemetry.enabled is true', () => {
    withTestProject(
      {
        opentelemetry: { enabled: true },
        files: [
          {
            path: 'test.ts',
            content: `declare const tracer: { startSpan: (name: string) => { end: () => void } }

export function run() {
  const span = tracer.startSpan('run')
  span.end()
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

  it('detects tracer.startActiveSpan() when opentelemetry.enabled is true', () => {
    withTestProject(
      {
        opentelemetry: { enabled: true },
        files: [
          {
            path: 'test.ts',
            content: `declare const tracer: {
  startActiveSpan: <T>(name: string, fn: (span: { end: () => void }) => T) => T
}

export function run() {
  return tracer.startActiveSpan('run', (span) => {
    span.end()
  })
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

  it('allows tracer.startSpan() when opentelemetry is not enabled', () => {
    withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `declare const tracer: { startSpan: (name: string) => { end: () => void } }

export function run() {
  const span = tracer.startSpan('run')
  span.end()
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

  it('allows tracer.startActiveSpan() when opentelemetry is not enabled', () => {
    withTestProject(
      {
        files: [
          {
            path: 'test.ts',
            content: `declare const tracer: {
  startActiveSpan: <T>(name: string, fn: (span: { end: () => void }) => T) => T
}

export function run() {
  return tracer.startActiveSpan('run', (span) => {
    span.end()
  })
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

  describe('combined with errorHandling', () => {
    it('bans throw/try-catch and startSpan/startActiveSpan together outside test files', () => {
      withTestProject(
        {
          typeChecked: true,
          errorHandling: { interopBoundaryFiles: [] },
          opentelemetry: { enabled: true },
          files: [
            {
              path: 'test.ts',
              content: `declare const tracer: { startSpan: (name: string) => { end: () => void } }

export function run() {
  throw new Error('boom')
}

export function run2() {
  const span = tracer.startSpan('run2')
  span.end()
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

    it('exempts test files from both bans, following errorHandling exemption scope', () => {
      withTestProject(
        {
          typeChecked: true,
          errorHandling: { interopBoundaryFiles: [] },
          opentelemetry: { enabled: true },
          files: [
            {
              path: 'run.test.ts',
              content: `declare const tracer: { startSpan: (name: string) => { end: () => void } }

export function run() {
  try {
    throw new Error('boom')
  } catch (error) {
    return error
  }
}

export function run2() {
  const span = tracer.startSpan('run2')
  span.end()
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
  })
})
