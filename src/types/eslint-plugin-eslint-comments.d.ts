import type { ESLint } from 'eslint'

declare module '@eslint-community/eslint-plugin-eslint-comments' {
  const plugin: ESLint.Plugin
  export default plugin
}
