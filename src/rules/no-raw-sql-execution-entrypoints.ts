import type { TSESTree } from '@typescript-eslint/utils'
import { ESLintUtils } from '@typescript-eslint/utils'
import type { Rule } from 'eslint'
import type * as ts from 'typescript'

// The postgres.js `Sql` call signature is shared by the plain client, transactions,
// and reserved connections; all three resolve to one of these interface names.
const POSTGRES_SQL_TYPE_NAMES = new Set([
  'Sql',
  'TransactionSql',
  'ReservedSql',
])
const DRIZZLE_SQL_TAG_NAME = 'sql'
const DRIZZLE_EXECUTE_METHOD_NAME = 'execute'

type MessageId = 'postgresSqlCall' | 'drizzleSqlTag' | 'drizzleExecuteCall'

function isDeclaredUnderPackage(
  declarations: readonly ts.Declaration[] | undefined,
  packageName: string,
): boolean {
  if (!declarations) return false
  const marker = `/node_modules/${packageName}/`
  return declarations.some((decl) =>
    decl.getSourceFile().fileName.includes(marker),
  )
}

export const noRawSqlExecutionEntrypoints = ESLintUtils.RuleCreator.withoutDocs(
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow raw SQL execution entrypoints (the postgres.js `Sql` call signature, and drizzle-orm `db.execute()` / `sql`)',
      },
      messages: {
        postgresSqlCall:
          'Avoid invoking the postgres.js `Sql` instance directly (as a tagged template or a call). Express the query through the drizzle-orm typed query builder instead. If raw SQL is truly unavoidable, disable this rule for the line with a justification comment.',
        drizzleSqlTag:
          "Avoid drizzle-orm's `sql` raw-SQL escape hatch. Express the query through the typed query builder instead. If raw SQL is truly unavoidable, disable this rule for the line with a justification comment.",
        drizzleExecuteCall:
          'Avoid calling `execute()` to run raw SQL through drizzle-orm. Express the query through the typed query builder instead. If raw SQL is truly unavoidable, disable this rule for the line with a justification comment.',
      },
      schema: [],
    },
    defaultOptions: [],
    create(context) {
      const services = ESLintUtils.getParserServices(context)
      const checker = services.program.getTypeChecker()

      // A nullable value accessed through optional chaining (`maybeDb?.execute(...)`)
      // resolves to a union type, whose `getSymbol()` is always undefined; the
      // symbol lives on each union constituent instead.
      function getExpressionTypeSymbols(
        node: TSESTree.Expression,
      ): ts.Symbol[] {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node)
        const type = checker.getTypeAtLocation(tsNode)
        const constituents = type.isUnion() ? type.types : [type]
        return constituents
          .map((constituent) => constituent.getSymbol())
          .filter((symbol) => symbol !== undefined)
      }

      function reportIfSymbolMatches(
        node: TSESTree.Expression,
        matchesName: (name: string) => boolean,
        packageName: string,
        messageId: MessageId,
      ): boolean {
        const matched = getExpressionTypeSymbols(node).some(
          (symbol) =>
            matchesName(symbol.getName()) &&
            isDeclaredUnderPackage(symbol.getDeclarations(), packageName),
        )
        if (!matched) return false

        context.report({ node, messageId })
        return true
      }

      // Matches both call-signature overloads (`sql\`...\`` and `sql(helper)`),
      // since postgres.js exposes both directly on the `Sql` instance itself.
      function reportIfPostgresSqlCall(node: TSESTree.Expression): boolean {
        return reportIfSymbolMatches(
          node,
          (name) => POSTGRES_SQL_TYPE_NAMES.has(name),
          'postgres',
          'postgresSqlCall',
        )
      }

      function reportIfDrizzleSqlTag(node: TSESTree.Expression): boolean {
        return reportIfSymbolMatches(
          node,
          (name) => name === DRIZZLE_SQL_TAG_NAME,
          'drizzle-orm',
          'drizzleSqlTag',
        )
      }

      // Checking the resolved method symbol (rather than the property name in the
      // source) also catches `execute` after it has been destructured off a
      // drizzle-orm db instance into a differently-named local binding.
      function reportIfDrizzleExecuteCall(node: TSESTree.Expression): boolean {
        return reportIfSymbolMatches(
          node,
          (name) => name === DRIZZLE_EXECUTE_METHOD_NAME,
          'drizzle-orm',
          'drizzleExecuteCall',
        )
      }

      return {
        TaggedTemplateExpression(node) {
          if (reportIfPostgresSqlCall(node.tag)) return
          reportIfDrizzleSqlTag(node.tag)
        },
        CallExpression(node) {
          if (reportIfPostgresSqlCall(node.callee)) return
          reportIfDrizzleExecuteCall(node.callee)
        },
      }
    },
  },
)

export const noRawSqlExecutionEntrypointsRuleModule =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- @typescript-eslint/utils's RuleModule doesn't yet type-match eslint 10's core RuleDefinition context shape, though it's the same object shape at runtime
  noRawSqlExecutionEntrypoints as unknown as Rule.RuleModule
