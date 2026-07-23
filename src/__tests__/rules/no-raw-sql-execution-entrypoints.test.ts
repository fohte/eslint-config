import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'

import { noRawSqlExecutionEntrypointsRuleModule } from '../../rules/no-raw-sql-execution-entrypoints.js'

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures/no-raw-sql-execution-entrypoints',
)
const filename = path.join(fixturesDir, 'file.ts')

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
    parserOptions: {
      tsconfigRootDir: fixturesDir,
      project: './tsconfig.json',
    },
  },
})

ruleTester.run(
  'no-raw-sql-execution-entrypoints',
  noRawSqlExecutionEntrypointsRuleModule,
  {
    valid: [
      {
        filename,
        code: `import postgres from 'postgres'\nconst pg = postgres('postgres://localhost/db')\nvoid pg`,
      },
      {
        filename,
        code: `import postgres from 'postgres'\nimport { drizzle } from 'drizzle-orm/postgres-js'\nconst pg = postgres('postgres://localhost/db')\nconst db = drizzle(pg)\nvoid db`,
      },
      {
        filename,
        code: `import postgres from 'postgres'\nimport { eq } from 'drizzle-orm'\nimport { drizzle } from 'drizzle-orm/postgres-js'\nimport { pgTable, text } from 'drizzle-orm/pg-core'\nconst users = pgTable('users', { name: text('name') })\nconst pg = postgres('postgres://localhost/db')\nconst db = drizzle(pg)\nasync function run() {\n  await db.select().from(users).where(eq(users.name, 'a'))\n}\nvoid run`,
      },
      {
        filename,
        code: `function sql(strings: TemplateStringsArray, ...args: unknown[]) {\n  return strings.join('')\n}\nconst query = sql\`select 1\`\nvoid query`,
      },
      {
        filename,
        code: `const db = { execute: (q: string) => q }\ndb.execute('select 1')`,
      },
    ],
    invalid: [
      {
        filename,
        code: `import postgres from 'postgres'\nconst pg = postgres('postgres://localhost/db')\npg\`select 1\``,
        errors: [
          {
            messageId: 'postgresSqlCall',
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 3,
          },
        ],
      },
      {
        filename,
        code: `import postgres from 'postgres'\nconst pg = postgres('postgres://localhost/db')\npg(1, 2)`,
        errors: [
          {
            messageId: 'postgresSqlCall',
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 3,
          },
        ],
      },
      {
        filename,
        code: `import postgres from 'postgres'\nconst pg = postgres('postgres://localhost/db')\npg.begin((tx) => tx\`select 1\`)`,
        errors: [
          {
            messageId: 'postgresSqlCall',
            line: 3,
            column: 18,
            endLine: 3,
            endColumn: 20,
          },
        ],
      },
      {
        filename,
        code: `import { sql } from 'drizzle-orm'\nconst query = sql\`select 1\`\nvoid query`,
        errors: [
          {
            messageId: 'drizzleSqlTag',
            line: 2,
            column: 15,
            endLine: 2,
            endColumn: 18,
          },
        ],
      },
      {
        filename,
        code: `import { sql as rawSql } from 'drizzle-orm'\nconst query = rawSql\`select 1\`\nvoid query`,
        errors: [
          {
            messageId: 'drizzleSqlTag',
            line: 2,
            column: 15,
            endLine: 2,
            endColumn: 21,
          },
        ],
      },
      {
        filename,
        code: `import postgres from 'postgres'\nimport { drizzle } from 'drizzle-orm/postgres-js'\nimport { sql } from 'drizzle-orm'\nconst pg = postgres('postgres://localhost/db')\nconst db = drizzle(pg)\ndb.execute(sql\`select 1\`)`,
        errors: [
          {
            messageId: 'drizzleExecuteCall',
            line: 6,
            column: 1,
            endLine: 6,
            endColumn: 11,
          },
          {
            messageId: 'drizzleSqlTag',
            line: 6,
            column: 12,
            endLine: 6,
            endColumn: 15,
          },
        ],
      },
      {
        filename,
        code: `import postgres from 'postgres'\nimport { drizzle } from 'drizzle-orm/postgres-js'\nconst pg = postgres('postgres://localhost/db')\nconst db = drizzle(pg)\nconst { execute } = db\nexecute('select 1')`,
        errors: [
          {
            messageId: 'drizzleExecuteCall',
            line: 6,
            column: 1,
            endLine: 6,
            endColumn: 8,
          },
        ],
      },
      {
        filename,
        code: `import postgres from 'postgres'\nconst pg = postgres('postgres://localhost/db')\nconst maybePg: typeof pg | undefined = pg\nmaybePg?.(1, 2)`,
        errors: [
          {
            messageId: 'postgresSqlCall',
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 8,
          },
        ],
      },
      {
        filename,
        code: `import postgres from 'postgres'\nimport { drizzle } from 'drizzle-orm/postgres-js'\nconst pg = postgres('postgres://localhost/db')\nconst db = drizzle(pg)\nconst maybeDb: typeof db | undefined = db\nmaybeDb?.execute('select 1')`,
        errors: [
          {
            messageId: 'drizzleExecuteCall',
            line: 6,
            column: 1,
            endLine: 6,
            endColumn: 17,
          },
        ],
      },
    ],
  },
)
