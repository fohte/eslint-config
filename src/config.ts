import type { Linter } from 'eslint'

import {
  errorHandlingConfig,
  type ErrorHandlingOptions,
  errorHandlingRestrictedSyntaxOptions,
} from '#error-handling.js'
import { fohteConfig } from '#fohte.js'
import { mainConfig } from '#main.js'
import {
  openTelemetryConfig,
  openTelemetryRestrictedSyntaxOptions,
} from '#opentelemetry.js'
import { tailwindConfig, type TailwindOptions } from '#tailwind.js'
import {
  typescriptBaseConfig,
  typescriptConfig,
  typescriptTypeCheckedConfig,
} from '#typescript.js'
import { vitestConfig } from '#vitest.js'

export interface TypeScriptOptions {
  /**
   * Enable type-checked rules (strict-type-checked, strict-boolean-expressions, etc.).
   * When true, parserOptions.projectService is automatically configured.
   */
  typeChecked?: boolean
}

export type { ErrorHandlingOptions }
export type { TailwindOptions }

export interface OpenTelemetryOptions {
  /**
   * Ban tracer.startSpan()/startActiveSpan() calls that may not correctly
   * parent child spans created during their execution: startSpan() never
   * enters the active context on its own, and startActiveSpan()'s span stops
   * being the active context once its callback returns.
   */
  enabled?: boolean
}

export interface ConfigOptions {
  typescript?: TypeScriptOptions
  /**
   * Ban throw/try-catch and forbid discarding neverthrow Results. Exceptions
   * (e.g. an external SDK's throw-based contract) go through an
   * eslint-disable-next-line comment rather than a file-level exemption.
   * Requires `typescript.typeChecked: true`, because neverthrow/must-use-result
   * needs type information to detect unused Result values.
   */
  errorHandling?: ErrorHandlingOptions
  opentelemetry?: OpenTelemetryOptions
  /**
   * Ban Tailwind CSS arbitrary values (e.g. `w-[600px]`), including ones
   * stashed in a bare string constant, steering towards design tokens
   * defined in `@theme` instead.
   */
  tailwind?: TailwindOptions
}

export function config(
  options: ConfigOptions = {},
  ...userConfigs: Linter.Config[]
): Linter.Config[] {
  const { typescript, errorHandling, opentelemetry, tailwind } = options
  const typeChecked = typescript?.typeChecked ?? false

  if (errorHandling && !typeChecked) {
    // eslint-disable-next-line no-restricted-syntax -- fail fast on invalid eslint.config.js at load time, not a Result-returning runtime path
    throw new Error(
      'errorHandling requires typescript.typeChecked: true, because neverthrow/must-use-result needs type information to detect unused Result values.',
    )
  }

  if (errorHandling && 'interopBoundaryFiles' in errorHandling) {
    // eslint-disable-next-line no-restricted-syntax -- fail fast on invalid eslint.config.js at load time, not a Result-returning runtime path
    throw new Error(
      'errorHandling.interopBoundaryFiles was removed — add an eslint-disable-next-line comment on the throw/try-catch instead.',
    )
  }

  const configs: Linter.Config[] = [...mainConfig]

  if (typeChecked) {
    // strict-type-checked is a superset of strict, so only include the
    // base config (parser + .cjs exception) alongside it
    configs.push(...typescriptBaseConfig, ...typescriptTypeCheckedConfig, {
      files: ['**/*.ts{,x}'],
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
      },
    })
  } else {
    configs.push(...typescriptConfig)
  }

  configs.push(...vitestConfig)
  configs.push(...fohteConfig)

  const openTelemetryEnabled = opentelemetry?.enabled === true

  if (errorHandling) {
    // Both errorHandling and opentelemetry configure `no-restricted-syntax`
    // on the same `.ts{,x}` file set. ESLint flat config fully replaces a
    // rule's settings (not merges them) when two config objects set the same
    // rule for the same file, so the otel selectors are merged into this
    // same rule entry instead of being pushed as a separate config.
    configs.push(
      ...errorHandlingConfig(
        openTelemetryEnabled ? openTelemetryRestrictedSyntaxOptions : [],
      ),
    )
  } else if (openTelemetryEnabled) {
    configs.push(...openTelemetryConfig)
  }

  if (tailwind) {
    // Pushed after the errorHandling/opentelemetry merge above, and scoped
    // to tailwind.files (which may be narrower, e.g. a monorepo package
    // subdirectory): for files it matches, this config's no-restricted-syntax
    // is the last one applied and so must carry the union of every selector
    // that should still apply there, or it would silently drop the broader
    // entry's bans for that subset of files.
    configs.push(
      ...tailwindConfig(tailwind, [
        ...(errorHandling ? errorHandlingRestrictedSyntaxOptions : []),
        ...(openTelemetryEnabled ? openTelemetryRestrictedSyntaxOptions : []),
      ]),
    )
  }

  configs.push(...userConfigs)

  return configs
}
