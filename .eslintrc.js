module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'linebreak-style': 0,
    'no-console': 0,
    'class-methods-use-this': 0,
    'comma-dangle': 0,
  },
};
