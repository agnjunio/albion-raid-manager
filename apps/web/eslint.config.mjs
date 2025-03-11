import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next", "next/core-web-vitals", "next/typescript"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-page-custom-font": "off",
      "no-console": "warn",
      "no-unused-vars": [
        "warn",
        {
          exclude: ["^_"],
        },
      ],
    },
  }),
];

export default eslintConfig;
