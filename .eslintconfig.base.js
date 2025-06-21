module.exports = {
  extends: [
    // Any plugin we use that comes with a recommended set, should be extended, so they can update their defaults as necessary.
    'eslint:recommended',
    'plugin:import/recommended',

    // We have chosen to use Airbnb's ruleset as a set of defaults, because we trust their thought processes.
    // This saves us from having to think through every possible rule.
    // It currently has a lot of deprecated rules, so we will need to reconsider.
    'airbnb-base',

    // Prettier plugin comes last, and disables any eslint rule that might conflict with prettier, which we use for code formatting.
    // See: https://eslint.org/blog/2023/10/deprecating-formatting-rules/#what-you-should-do-instead
    'plugin:prettier/recommended',
  ],
  plugins: ['unused-imports'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  rules: {
    // JS functions without curlies rely on whitespace for syntax, which is error-prone and "magic".
    // Being explicit increases readability and prevents bugs.
    curly: 'error',

    // Nested ternaries are hard to reason through and prone to bugs.
    // Consider rethinking your logic structure and using named conditionals for self-documenting code.
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',

    // We don't want people to use the convention of underscore prefixing to indicate something private,
    // but we do want to allow the common GraphQL property "__typename".
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],

    // "Else" is a code smell, and indicates your code is doing too many things in a single unit.
    // Try using a return-early pattern for whatever would be in your else.
    'no-else-return': ['error', { allowElseIf: false }],

    // One of the most important features of the switch/case pattern is to have a single effect for multiple conditions, without repetition.
    'no-fallthrough': 'off',
    'default-case': 'off',

    // Hoisting is magic. Don't rely on it.
    'no-use-before-define': 'error',

    // A new dev might have a return in a conditional, and not realize that the conditional doesn't always match.
    // Can turn this off in Typescript as it handles it naturally.
    'consistent-return': 'warn',

    // Many devs use console.log for debugging, and having a warning is a good way to catch it before it goes to prod.
    // Allowing debug messages to ship to prod can result in noisy logs and can open vulnerabilities if used carelessly.
    // We assume that is only the case for logging. We allow "console.warn()" and "console.error()" as they are more likely to be valid.
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // These are valid language features we would like to retain.
    'no-plusplus': 'off',

    // We have an ongoing discussion about this one. For loops are not used often with es6+. Should we prohibit them altogether?
    // Concerns about side effects vs pure function.
    'no-continue': 'off',
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'ForOfStatement',
        message:
          'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
      {
        selector: 'UnaryExpression[operator.name="delete"]',
        message:
          'The delete keyword is a mutation pattern, and we always prefer immutability.',
      },
    ],

    // ###### IMPORT HANDLING #######
    'import/prefer-default-export': 'off',
    'import/order': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**.config.js',
          '**.config.ts',

          '**/*.test.js',
          '**/*.test.jsx',
          '**/*.test.ts',
          '**/*.test.tsx',
        ],
      },
    ],
    // We want to disallow the pattern export default new Foo()
    'import/no-anonymous-default-export': [
      'error',
      {
        allowAnonymousClass: true,
        allowAnonymousFunction: true,
        allowArray: true,
        allowArrowFunction: true,
        allowCallExpression: true,
        allowLiteral: true,
        allowObject: true,
        allowNew: false,
      },
    ],

    // @SEE: https://www.npmjs.com/package/eslint-plugin-unused-imports#usage
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // ###### DEPRECATED RULES #######
    // @SEE: https://eslint.org/blog/2023/10/deprecating-formatting-rules/#what-you-should-do-instead
    'brace-style': 'off',
    indent: 'off',
    'max-len': 'off',
    'no-tabs': 'off',
    'arrow-body-style': 'off',
    'no-return-await': 'off',
  },
};
