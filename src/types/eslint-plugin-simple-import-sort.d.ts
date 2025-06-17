import type { ESLint } from "eslint";

declare module "eslint-plugin-simple-import-sort" {
  const plugin: ESLint.Plugin;
  export default plugin;
}
