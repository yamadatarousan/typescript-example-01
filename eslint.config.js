import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2022,
      },
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["frontend/**/*.ts", "frontend/**/*.tsx", "examples/frontend/**/*.ts", "examples/frontend/**/*.tsx"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["backend/legacy/**", "examples/backend/legacy/**"],
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
