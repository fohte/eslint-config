import type { Linter } from 'eslint'

import {
  errorHandlingConfig,
  type ErrorHandlingOptions,
} from './error-handling.js'
import { fohteConfig } from './fohte.js'
import { mainConfig } from './main.js'
import {
  typescriptBaseConfig,
  typescriptConfig,
  typescriptTypeCheckedConfig,
} from './typescript.js'
import { vitestConfig } from './vitest.js'

export interface TypeScriptOptions {
  /**
   * Enable type-checked rules (strict-type-checked, strict-boolean-expressions, etc.).
   * When true, parserOptions.projectService is automatically configured.
   */
  typeChecked?: boolean
}

export type { ErrorHandlingOptions }

export interface ConfigOptions {
  typescript?: TypeScriptOptions
  /**
   * Ban throw/try-catch outside an interop boundary and forbid discarding
   * neverthrow Results. Requires `typescript.typeChecked: true`, because
   * neverthrow/must-use-result needs type information to detect unused
   * Result values.
   */
  errorHandling?: ErrorHandlingOptions
}

export function config(
  options: ConfigOptions = {},
  ...userConfigs: Linter.Config[]
): Linter.Config[] {
  const { typescript, errorHandling } = options
  const typeChecked = typescript?.typeChecked ?? false

  if (errorHandling && !typeChecked) {
    throw new Error(
      'errorHandling requires typescript.typeChecked: true, because neverthrow/must-use-result needs type information to detect unused Result values.',
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

  if (errorHandling) {
    configs.push(...errorHandlingConfig(errorHandling))
  }

  configs.push(...userConfigs)

  return configs
}
