import type { Linter } from 'eslint'

import { mainConfig } from './main.js'
import { typescriptConfig, typescriptTypeCheckedConfig } from './typescript.js'

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
    // type-checked includes strict rules as a superset, but we still need
    // the parser and .cjs exception from typescriptConfig
    configs.push(...typescriptConfig, ...typescriptTypeCheckedConfig, {
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
