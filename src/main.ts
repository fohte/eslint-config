import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

export const mainConfig: Linter.FlatConfig[] = [
  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
      import: importPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
  eslintConfigPrettier,
];
