/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  trailingComma: 'none',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  tailwindPreserveWhitespace: true,
  plugins: ['prettier-plugin-tailwindcss']
}

export default config
