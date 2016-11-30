define.dataSchema('LayoutProperties', {
    x: {
        'type': 'number',
        'default': 0,
        'description': 'x position'
    },
    y: {
        'type': 'number',
        'default': 0,
        'description': 'y position'
    },
    w: {
        'type': 'number',
        'default': 100,
        'description': 'width'
    },
    h: {
        'type': 'number',
        'default': 100,
        'description': 'height'
    },
    anchors: {
        'type': 'array',
        'description': 'list of anchors'
    }
});

