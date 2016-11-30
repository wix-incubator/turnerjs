define.dataSchema('ButtonProperties', {
    align: {
            'type': 'string',
            'enum': ['left', 'center', 'right'],
            'default': 'center',
            'description': 'alignment of the menu'
        },
        margin: {
            'type': 'number',
            'default': 0,
            'description': 'text left and right margins'
        }
});

