define.dataSchema('PayPalButtonProperties', {

    buttonType: {
        'type': 'string',
        'enum': ['buy', 'donate'],
        'default': 'buy',
        'description': 'buy or donate button'
    },

    itemName: {
        'type': 'string',
        'default': '',
        'description': 'some amazing description'
    },
    itemID: {
        'type': 'string',
        'default': '',
        'description': 'some amazing description'
    },
    organizationName: {
        'type': 'string',
        'default': '',
        'description': 'some amazing description'
    },

    organizationID: {
        'type': 'string',
        'default': '',
        'description': 'some amazing description'
    },

    amount: {
        'type': 'string',
        'default': '',
        'description': 'some amazing description'
    },

    currencyCode: {
        'type': 'string',
        'enum': ['USD', 'GBP', 'NIS'],
        'default': 'USD',
        'description': 'Currency Code'
    },

    target: {
        'type': 'string',
        'enum': ['_self', '_blank'],
        'default': '_blank',
        'description': 'Currency Code'
    },

    showCreditCards: {
        'type' : 'boolean',
        'default': true,
        description: 'Show credit card symbols'
    },

    smallButton: {
        'type' : 'boolean',
        'default': false,
        description: 'use small button'
    },
    language: {
        'type': 'string',
        enum: ['userLang', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr'],
        'default': 'en',
        description: 'https://developer.paypal.com/docs/classic/api/locale_codes/'
    }
});
