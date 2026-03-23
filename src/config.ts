import type { Linter } from 'eslint'

import { mainConfig } from './main.js'
import {
  typescriptBaseConfig,
  typescriptConfig,
  typescriptTypeCheckedConfig,
} from './typescript.js'

export interface TypeScriptOptions {
  /**
   * Enable type-checked rules (strict-type-checked, strict-boolean-expressions, etc.).
   * When true, parserOptions.projectService is automatically configured.
   */
  typeChecked?: boolean
}

export interface ConfigOptions {
  typescript?: TypeScriptOptions
}

export function config(options: ConfigOptions = {}): Linter.Config[] {
  const { typescript } = options
  const typeChecked = typescript?.typeChecked ?? false

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

  return configs
}
