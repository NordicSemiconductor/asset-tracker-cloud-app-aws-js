module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "unicorn", "prefer-arrow", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/indent": ["off"],
    "@typescript-eslint/no-object-literal-type-assertion": ["off"],
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/await-thenable": ["error"],
    "@typescript-eslint/no-extraneous-class": ["error"],
    "@typescript-eslint/no-floating-promises": ["error"],
    "@typescript-eslint/no-for-in-array": ["error"],
    "@typescript-eslint/no-require-imports": ["error"],
    "@typescript-eslint/no-this-alias": ["error"],
    "@typescript-eslint/no-type-alias": ["off"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
    "@typescript-eslint/no-useless-constructor": ["error"],
    "@typescript-eslint/prefer-for-of": ["error"],
    "@typescript-eslint/prefer-function-type": ["error"],
    "@typescript-eslint/prefer-includes": ["error"],
    "@typescript-eslint/prefer-readonly": ["error"],
    "@typescript-eslint/prefer-regexp-exec": ["error"],
    "@typescript-eslint/prefer-string-starts-ends-with": ["error"],
    "@typescript-eslint/promise-function-async": ["error"],
    "@typescript-eslint/require-array-sort-compare": ["error"],
    "@typescript-eslint/restrict-plus-operands": ["error"],
    semi: "off",
    "@typescript-eslint/semi": ["off"],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "none",
          requireLast: false,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
      },
    ],
    "@typescript-eslint/prefer-interface": ["off"],
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "no-console": ["off"],
    "@typescript-eslint/strict-boolean-expressions": ["error"],
    "@typescript-eslint/prefer-nullish-coalescing": ["error"],
    "@typescript-eslint/prefer-optional-chain": ["error"],
    "@typescript-eslint/explicit-module-boundary-types": ["error"],
    "prefer-promise-reject-errors": ["error"],
    "unicorn/prefer-string-slice": ["error"],
    "@typescript-eslint/switch-exhaustiveness-check": ["error"],
    "prefer-arrow/prefer-arrow-functions": ["error"],
    "object-shorthand": ["error"],
    "import/extensions": ["error", "always", { ignorePackages: true }],
  },
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.tsx"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
};
