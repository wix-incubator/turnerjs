define.dataSchema('PinterestPinItProperties', {
    'size': {
        'type': 'string',
        'enum': ['small', 'large'],
        'default': 'small'
    },
    'color': {
        'type': 'string',
        'enum': ['gray', 'red', 'white'],
        'default': 'gray'
    },
    'counterPosition': {
        'type': 'string',
        'enum': ['none', 'above', 'beside'],
        'default': 'none'
    }
});

