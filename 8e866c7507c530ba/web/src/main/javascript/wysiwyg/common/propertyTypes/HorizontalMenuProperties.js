define.dataSchema('HorizontalMenuProperties', {
        alignButtons: {
            'type': 'string',
            'enum': ['left', 'center', 'right'],
            'default': 'center',
            'description': 'alignment of the menu buttons'
        },
        alignText: {
            'type': 'string',
            'enum': ['left', 'center', 'right'],
            'default': 'center',
            'description': "alignment of the menu buttons' text"
        },
//        spacing: {
//            'type': 'number',
//            'default': 5,
//            'description': 'backward compatible property - space between buttons'
//        },
        sameWidthButtons: {
            'type': 'boolean',
            'default': false,
            'description': 'Keep buttons the same size'
        },
        moreButtonLabel: {
            'type': 'string',
            'default': "More",
            'description': 'Label to use for "more button"'
        },

        moreItemHeight: {
            'type': 'number',
            'default': 15,
            'description':'height of items in the more menu'
        },
        stretchButtonsToMenuWidth: {
            'type': 'boolean',
            'default': true,
            'description':''
        }
});

