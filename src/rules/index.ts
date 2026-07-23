import type { ESLint } from 'eslint'

import { noInlineObjectInExpect } from './no-inline-object-in-expect.js'
import { noRawSqlExecutionEntrypointsRuleModule } from './no-raw-sql-execution-entrypoints.js'

export const fohtePlugin: ESLint.Plugin = {
  meta: {
    name: 'fohte',
  },
  rules: {
    'no-inline-object-in-expect': noInlineObjectInExpect,
    'no-raw-sql-execution-entrypoints': noRawSqlExecutionEntrypointsRuleModule,
  },
}
