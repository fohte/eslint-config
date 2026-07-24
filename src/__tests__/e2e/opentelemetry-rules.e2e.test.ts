import { describe, expect, it } from 'vitest'

import {
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject,
} from './helpers/e2e-test-helper.js'

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

  it('allows tracer.startSpan()/startActiveSpan() when opentelemetry is not enabled', () => {
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
})
