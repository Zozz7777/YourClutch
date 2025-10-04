module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:promise/recommended',
    'plugin:security/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-import': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
  ],
};

