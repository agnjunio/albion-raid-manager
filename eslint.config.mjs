import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tslint from "typescript-eslint";

export default [
  {
    ignores: ["**/dist/"],
  },
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      "no-usused-vars": "off",
      "prefer-const": ["warn"],
    },
  },
];
