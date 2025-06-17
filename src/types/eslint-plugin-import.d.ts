import type { ESLint } from 'eslint'

declare module 'eslint-plugin-import' {
  const plugin: ESLint.Plugin
  export default plugin
}
