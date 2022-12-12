module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 100,
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: '*.sol',
      options: {
        compiler: '^0.8.9',
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false,
      },
    },
  ],
}
