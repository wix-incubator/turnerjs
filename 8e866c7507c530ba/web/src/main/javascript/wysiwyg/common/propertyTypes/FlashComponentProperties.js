define.dataSchema('FlashComponentProperties', {
    displayMode: {
        'type': 'string',
        'enum': [ 'original', 'fit', 'stretch'],
        'default': 'original',
        'description': 'displayMode of the movie'
    }
});
