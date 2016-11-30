define.dataSchema('BackOfficeTextProperties',
    {
        align: {
            'type': 'string',
            'enum': ['left', 'center', 'right'],
            'default': 'center',
            'description': 'alignment of the text'
        },
        margin: {
            'type': 'number',
            'default': 0,
            'description': 'text left and right margins'
        }

    }
);