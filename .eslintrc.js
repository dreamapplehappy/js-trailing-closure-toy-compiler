module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true
    },
    parserOptions: {
        ecmaVersion: 12
    },
    extends: 'eslint:recommended',
    rules: {
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'quote-props': ['error', 'as-needed']
    }
};
