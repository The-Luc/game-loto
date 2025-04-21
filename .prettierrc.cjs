/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  jsxBracketSameLine: false, // Deprecated, use bracketSameLine
  bracketSameLine: false,
  arrowParens: 'always',
  // Add plugins if needed, e.g.,
  // plugins: [require('prettier-plugin-tailwindcss')],
};
