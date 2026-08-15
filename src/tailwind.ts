import { createRequire } from 'node:module'

import type { ESLint, Linter } from 'eslint'

import type { RestrictedSyntaxOption } from '#opentelemetry.js'
import { vitestTestFiles } from '#vitest.js'

const require = createRequire(import.meta.url)

// Matches a Tailwind arbitrary *value* token (e.g. `w-[600px]`,
// `grid-cols-[14px_1fr]`) — the bracket sits right before the end of the
// token (optionally followed by `!`). Deliberately does not match arbitrary
// *variants* (e.g. `data-[state=open]:hidden`, `[&_svg]:size-4`,
// `group-[.is-open]:block`), where the bracket is either not preceded by a
// dash or is followed by `:` rather than the end of the token.
const ARBITRARY_VALUE_PATTERN = String.raw`-\[[^\]]+\]!?(?=\s|$)`

export interface TailwindOptions {
  /**
   * Glob patterns for the files to apply the Tailwind arbitrary-value ban
   * to. Defaults to all .ts{,x} files.
   */
  files?: string[]
  /**
   * Path to the CSS file that defines Tailwind's `@theme` design tokens,
   * passed through as eslint-plugin-tailwindcss's `cssConfigPath` setting.
   */
  cssConfigPath: string
}

// eslint-plugin-tailwindcss's no-arbitrary-value rule only checks class
// attributes/functions, so a bracket value stashed in a bare string constant
// (then interpolated into className) would otherwise slip through
// undetected. Exported so callers (e.g. config.ts) can merge this into
// another no-restricted-syntax entry — see errorHandlingConfig's
// extraRestrictedSyntax param for why merging is required.
export const tailwindRestrictedSyntaxOption: RestrictedSyntaxOption = {
  // TemplateElement covers backtick strings (e.g. `` `w-[600px]` ``) with no
  // interpolation — those parse as a template literal, not a plain Literal
  // node, and would otherwise bypass this check.
  selector: `:matches(Literal[value=/${ARBITRARY_VALUE_PATTERN}/], TemplateElement[value.raw=/${ARBITRARY_VALUE_PATTERN}/])`,
  message:
    'Arbitrary Tailwind values are not allowed, including inside string constants. Add a token to `@theme` in your Tailwind CSS config instead.',
}

export function tailwindConfig(
  options: TailwindOptions,
  // ESLint flat config fully replaces a rule's settings — rather than
  // merging them — when two config objects set the same rule for the same
  // file. Any other no-restricted-syntax selectors that must apply to the
  // same file set (e.g. errorHandling's throw/try-catch ban) have to be
  // merged into this rule entry instead of their own config object, or
  // whichever config is pushed last would silently drop the other's ban.
  extraRestrictedSyntax: RestrictedSyntaxOption[] = [],
): Linter.Config[] {
  // Lazily required (not statically imported) so importing @fohte/eslint-config
  // doesn't force this optional peer dependency to resolve for consumers who
  // don't opt into tailwind. eslint-plugin-tailwindcss types its own `configs`
  // against @typescript-eslint/utils' Config type, which ESLint.Plugin's
  // stricter typing (exactOptionalPropertyTypes) rejects, so this is widened
  // to ESLint.Plugin rather than the package's own type.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns any; widened to ESLint.Plugin above
  const tailwindPlugin: ESLint.Plugin = require('eslint-plugin-tailwindcss')

  return [
    {
      files: options.files ?? ['**/*.ts{,x}'],
      ignores: vitestTestFiles,
      plugins: { tailwindcss: tailwindPlugin },
      settings: {
        tailwindcss: {
          cssConfigPath: options.cssConfigPath,
        },
      },
      rules: {
        'tailwindcss/no-arbitrary-value': 'error',
        'no-restricted-syntax': [
          'error',
          ...extraRestrictedSyntax,
          tailwindRestrictedSyntaxOption,
        ],
      },
    },
  ]
}
