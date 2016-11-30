define.dataSchema('ItunesButtonProperties',
    {
        language: {
            'type': 'string',
            'enum': ['userLang', 'de', 'en', 'es', 'fr', 'it', 'jp', 'ko', 'pl', 'pt', 'ru'],
            'default': 'en',
            'description': 'Language of the button'
        },

        openIn: {
            'type': 'string',
            'enum': ['_self', '_blank'],
            'default': '_blank',
            'description': 'Where the link will be opened'
        }
    }
);