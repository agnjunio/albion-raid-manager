import defaultConfig from "../../eslint.config.js";

import globals from "globals";

export default tseslint.config({
  extends: [...defaultConfig],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  },
});
