module.exports = {
  extends: [
    // Any plugin we use that comes with a recommended set, should be extended, so they can update their defaults as necessary.
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:i18next/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:storybook/recommended',

    // We have chosen to use Airbnb's ruleset as a set of defaults, because we trust their thought processes.
    // This saves us from having to think through every possible rule.
    // It currently has a lot of deprecated rules, so we will need to reconsider.
    'airbnb/rules/react',
    'airbnb/rules/react-hooks',
    'airbnb/rules/react-a11y',

    // Prettier plugin comes last, and disables any eslint rule that might conflict with prettier, which we use for code formatting.
    // See: https://eslint.org/blog/2023/10/deprecating-formatting-rules/#what-you-should-do-instead
    'prettier',
  ],
  rules: {
    // All human readable strings should be passed through a translation layer.
    'i18next/no-literal-string': 'error',

    // Naming components can be handy for debugging, but it is annoying to require it.
    'react/display-name': 'off',

    // No need to explicitly import React.
    // See: https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#removing-unused-react-imports
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',

    // Enforcing the self-closing pattern where possible, promotes standardization.
    'react/self-closing-comp': ['error'],

    // We prefer arrow functions for everything, for consistency. Hoisting is magic.
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],

    // Catch any file naming mistakes.
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],

    // We use the spreading props pattern frequently.
    'react/jsx-props-no-spreading': 'off',

    // Unique keys are commonly forgotten, and can cause bugs
    'react/no-array-index-key': 'error',

    // Prevent performance issues.
    'react/no-unstable-nested-components': [
      'error',
      {
        allowAsProps: true,
      },
    ],

    // Typescript is better.
    'react/require-default-props': 'off',
    'react/prop-types': 'off',

    // Many times a hook does not need exhaustive deps, but the warning can be a nice reminder for devs who might miss something.
    // Open to turning this off if it gets too painful.
    'react-hooks/exhaustive-deps': 'warn',
  },
};
