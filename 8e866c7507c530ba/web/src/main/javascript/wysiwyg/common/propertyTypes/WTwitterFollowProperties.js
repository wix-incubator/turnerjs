define.dataSchema('WTwitterFollowProperties', {
    showCount: {
        'type': 'boolean',
        'default': true,
        'description': 'Followers count display'
    },

    showScreenName: {
        'type': 'boolean',
        'default': true,
        'description': 'Show screen name'
    },

    textColor: {
        'type': 'hexcolor',
        'default': '',
        'description': 'HEX color code for the text color'
    },

    linkColor: {
        'type': 'hexcolor',
        'default': '',
        'description': 'HEX color code for the Username link color'
    },

    width: {
        'type': 'number',
        'default': '100',
        'description': 'width of the Follow Button'
    },

//    align: {
//        'type': 'string',
//        'default': '',
//        'description': 'alignment of the Follow Button'
//    },

    dataLang: {
        'type': 'string',
        'enum': ['userLang', 'en', 'fr', 'de', 'it', 'es', 'ko', 'ja', 'nl', 'pt', 'ru', 'tr'],
        'default': 'en',
        'description': 'The language for the Tweet Button'
    }
});

