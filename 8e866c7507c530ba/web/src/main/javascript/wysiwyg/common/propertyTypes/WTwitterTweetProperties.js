define.dataSchema('WTwitterTweetProperties', {
    'dataCount': {
        'type': 'string',
        'enum': ['none', 'horizontal', 'vertical'],
        'default': 'horizontal',
        'description': 'Count box position'
    },

    'dataLang': {
        'type': 'string',
        'enum': ['userLang', 'en', 'fr', 'de', 'it', 'es', 'ko', 'ja', 'nl', 'pt', 'ru', 'tr'],
        'default': 'en',
        'description': 'The language for the Tweet Button'
    }
});

