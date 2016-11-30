define.dataSchema('VKShareButton', {
    style: {
        'type': 'string',
        'enum': ['Button', 'ButtonWithoutCounter', 'Link', 'LinkWithoutIcon','Icon'],
        'default': 'Button',
        'description': 'the layout of the button'
    },
    text: {
        'type': 'string',
        'default': 'Share',
        'description': 'the text of the Button'
    }
});
