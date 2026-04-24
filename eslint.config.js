const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        // vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        // custom global
        t: 'readonly',
      },
    },
    rules: {
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
    },
  },
  {
    ignores: ['node_modules/**'],
  },
];
