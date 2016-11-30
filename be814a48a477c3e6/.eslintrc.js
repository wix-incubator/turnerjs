'use strict'

module.exports = {
    'ecmaFeatures': {
        'arrowFunctions': true,
    },
    'env': {
        'browser': false,
        'node': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 6,
    },
    'rules': {
        'indent': [2, 4],
        'quotes': [2, 'single'],
        'comma-dangle': [2, 'never'],
        'strict': ['error', 'global']
    }
};
