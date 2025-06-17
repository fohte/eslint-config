import type { ESLint } from 'eslint'

declare module 'eslint-config-prettier' {
  const config: ESLint.Linter.Config
  export default config
}
