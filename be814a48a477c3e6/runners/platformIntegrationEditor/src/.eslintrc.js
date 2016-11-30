'use strict'

module.exports = {
    'ecmaFeatures': {
        'arrowFunctions': false,
    },
    'env': {
        'amd': true,
        'browser': true,
        'node': false
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 5,
    },
    'rules': {
        'strict': ['error', 'function']
    }
}
