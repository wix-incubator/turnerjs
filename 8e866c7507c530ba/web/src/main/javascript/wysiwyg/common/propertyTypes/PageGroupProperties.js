define.dataSchema('PageGroupProperties', {
    transition: {
            'type': 'string',
            'enum': ['none', 'swipeHorizontalFullScreen', 'swipeVerticalFullScreen', 'crossfade', 'outIn'],
            'default': 'slide',
            'description': 'page transition'
        }
});

