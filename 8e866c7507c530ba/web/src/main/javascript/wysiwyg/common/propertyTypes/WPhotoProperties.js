define.dataSchema('WPhotoProperties', {
    displayMode: {
        'type': 'string',
        //fitWidth - it's more just fit, which initially sets it's size according to width
        //fitWidthStrict - actual fit width that changes size always according to width
        //fitHeightStrict - actual fit height that changes size always according to height
        'enum': ['fill', 'full', 'stretch', 'fitWidth', 'fitWidthStrict', 'fitHeightStrict'],
        'default': 'fill',
        'description': 'displayMode of the photo'
    },
    onClickBehavior:  {
        'type': 'string',
        'enum': ['disabled', 'goToLink', 'zoomMode','zoomAndPanMode'],
        'default': 'goToLink',
        'description': 'goToLink'
    }
});
