import type { ESLint } from 'eslint'

declare module 'eslint-plugin-import-x' {
  const plugin: ESLint.Plugin
  export default plugin
}
