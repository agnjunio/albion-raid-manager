import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules", "dist"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettier.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": "warn",
      "prefer-const": ["warn"],
    },
  },
];
