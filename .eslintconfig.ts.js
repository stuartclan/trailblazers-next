module.exports = {
  extends: [
    // Any plugin we use that comes with a recommended set, should be extended, so they can update their defaults as necessary.
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',

    // Prettier plugin comes last, and disables any eslint rule that might conflict with prettier, which we use for code formatting.
    // See: https://eslint.org/blog/2023/10/deprecating-formatting-rules/#what-you-should-do-instead
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: true,
    },
  },
  rules: {
    // Incorrect use of type `any` is poison in a typescript repo, and too often used by devs new to TS,
    // without considering the impact. This is THE MOST IMPORTANT linting rule for TS.
    // The very few valid usecases for `any` (utility helpers that are actually type agnostic) can be handled with an eslint exception.
    '@typescript-eslint/no-explicit-any': 'error',

    // @SEE: https://www.npmjs.com/package/eslint-plugin-unused-imports#usage
    '@typescript-eslint/no-unused-vars': 'off',
    'import/order': 'off',

    // Empty functions are great for unit tests. We don't want this to be an error, just a warning in case it's not intentional.
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',

    // Consider a different name for your var.
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],

    // Typescript will handle this for us.
    'consistent-return': 'off',
    'no-redeclare': 'off',

    // We don't want people to use the convention of underscore prefixing to indicate something private,
    // but we do want to allow the common GraphQL property "__typename".
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
  },
};
