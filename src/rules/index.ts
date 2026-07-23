import type { ESLint, Rule } from 'eslint'

import { noInlineObjectInExpect } from './no-inline-object-in-expect.js'
import { noRawSqlExecutionEntrypoints } from './no-raw-sql-execution-entrypoints.js'

export const fohtePlugin: ESLint.Plugin = {
  meta: {
    name: 'fohte',
  },
  rules: {
    'no-inline-object-in-expect': noInlineObjectInExpect,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- @typescript-eslint/utils's RuleModule doesn't yet type-match eslint 10's core RuleDefinition context shape, though it's the same object shape at runtime
    'no-raw-sql-execution-entrypoints':
      noRawSqlExecutionEntrypoints as unknown as Rule.RuleModule,
  },
}
