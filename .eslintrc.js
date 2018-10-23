module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  plugins: ["typescript"],
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": ["warn", {
      semi: false,
      quote: 'single',
      trailingComma: "es5"
    }]
  },
  parserOptions: {
    // ecmaVersion: 6
    sourceType: 'module'
  },
  parser: "typescript-eslint-parser"
}
