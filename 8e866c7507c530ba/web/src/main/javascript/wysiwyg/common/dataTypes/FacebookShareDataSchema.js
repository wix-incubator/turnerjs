define.dataSchema('FacebookShareButton', {
    urlChoice: {
        'type': 'string',
        'enum': ['Current page', 'Site'],
        'default': 'Current page',
        'description': 'Share: current/site url'
    },
    label: {
        'type': 'string',
        'default': 'Share',
        'description': ''
    }

});
