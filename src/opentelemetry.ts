import type { Linter } from 'eslint'

export interface RestrictedSyntaxOption {
  selector: string
  message: string
}

// startSpan() never enters the active context on its own, so a child span
// created during its execution (e.g. an HTTP call fired inside it) won't be
// parented to it unless the caller explicitly enters it via context.with().
const START_SPAN_MESSAGE =
  "Don't call tracer.startSpan() directly — wrap the code that should run as its child in context.with(trace.setSpan(context.active(), span), ...) so nested spans are parented correctly. startSpan() never enters the active context on its own. If context.with() genuinely can't wrap the span (e.g. start and end happen in separate callbacks), add an eslint-disable-next-line comment explaining why."

// startActiveSpan()'s callback runs inside the active context automatically,
// but only for the callback's own duration — storing the span to end() it
// later (e.g. start and end split across separate callbacks) drops it from
// the active context before that later code runs, so it stops parenting.
const START_ACTIVE_SPAN_MESSAGE =
  "Don't call tracer.startActiveSpan() and use the span outside its own callback — it's only the active context for the duration of that callback, so ending it later (e.g. start and end split across separate callbacks) breaks propagation for anything that runs after the callback returns. Keep all child-producing work inside the callback, or use tracer.startSpan() plus context.with() instead. If neither fits, add an eslint-disable-next-line comment explaining why."

export const openTelemetryRestrictedSyntaxOptions: RestrictedSyntaxOption[] = [
  {
    selector: "CallExpression[callee.property.name='startSpan']",
    message: START_SPAN_MESSAGE,
  },
  {
    selector: "CallExpression[callee.property.name='startActiveSpan']",
    message: START_ACTIVE_SPAN_MESSAGE,
  },
]

export const openTelemetryConfig: Linter.Config[] = [
  {
    files: ['**/*.ts{,x}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...openTelemetryRestrictedSyntaxOptions,
      ],
    },
  },
]
