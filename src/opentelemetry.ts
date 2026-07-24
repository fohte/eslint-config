import type { Linter } from 'eslint'

// A span created via a raw startSpan()/startActiveSpan() call never becomes
// the parent of child spans created during its execution unless it's put
// into the active context via context.with(). Forgetting that step is an
// easy mistake, and one that surfaces only as a mis-parented span in a trace
// backend, not as a runtime error.
const MESSAGE =
  "Don't call tracer.startSpan()/startActiveSpan() directly — wrap the code that should run as its child in context.with(trace.setSpan(context.active(), span), ...) so nested spans (e.g. an HTTP call fired during this span) are parented correctly. If context.with() genuinely can't wrap the span (e.g. start and end happen in separate callbacks), add an eslint-disable-next-line comment explaining why."

export const openTelemetryConfig: Linter.Config[] = [
  {
    files: ['**/*.ts{,x}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='startSpan']",
          message: MESSAGE,
        },
        {
          selector: "CallExpression[callee.property.name='startActiveSpan']",
          message: MESSAGE,
        },
      ],
    },
  },
]
