// @ts-check

import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import * as importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import * as tseslint from "typescript-eslint";

const ignoreConfig = {
  ignores: ["**/node_modules/**", "**/dist/**", "**/.turbo/**", "**/build/**", "**/.next/**", "**/generated/**"],
};

const typescriptConfig = {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json", "./apps/*/vite.config.ts"],
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.node,
      NodeJS: "readonly",
    },
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    import: importPlugin,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
        alwaysTryTypes: true,
      },
      node: true,
    },
  },
  rules: {
    ...tseslint.configs.recommended[0].rules,
    ...tseslint.configs.strict[0].rules,
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-unused-enum-values": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "import/order": [
      "error",
      {
        groups: ["type", "builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
      },
    ],
  },
};

const typescriptTestConfig = {
  files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};

const reactConfig = {
  files: ["**/*.{jsx,tsx}"],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      React: true,
    },
  },
  plugins: {
    react,
    "react-hooks": reactHooksPlugin,
  },
  rules: {
    ...react.configs.recommended.rules,
    ...reactHooksPlugin.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

const commonConfig = {
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "warn",
    "no-unused-expressions": "warn",
    "no-duplicate-imports": "error",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "no-trailing-spaces": "error",
    "eol-last": "error",
  },
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
    },
  },
};

const viteConfig = {
  files: ["**/vite.config.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: false,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
};

export default [
  ignoreConfig,
  js.configs.recommended,
  typescriptConfig,
  typescriptTestConfig,
  reactConfig,
  commonConfig,
  viteConfig,
  {
    files: ["**/*"],
    plugins: {
      prettier,
    },
    rules: {
      ...prettier.rules,
    },
  },
];
