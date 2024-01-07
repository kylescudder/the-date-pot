module.export = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb-base",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/semi": "off",
    curly: "warn",
    eqeqeq: "warn",
    "no-throw-literal": "warn",
    semi: ["error", "never"],
    "linebreak-style": [
      "error",
      process.platform === "win32" ? "windows" : "unix",
    ],
    indent: ["error", "tab"],
    "no-tabs": "off",
    quotes: ["error", "single"],
    "import/extensions": "off",
    "no-new": "off",
    "no-underscore-dangle": ["error", { allow: ["_id"] }],
    "comma-dangle": ["error", "never"],
    "max-len": ["error", { code: 110 }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE"],
      },
      {
        selector: "typeProperty",
        format: ["camelCase", "UPPER_CASE"],
      },
    ],
    "no-await-in-loop": "off",
  },
};
