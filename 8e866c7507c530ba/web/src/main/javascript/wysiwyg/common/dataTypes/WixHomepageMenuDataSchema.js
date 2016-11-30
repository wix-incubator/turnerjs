define.dataSchema('WixHomepageMenu', {
    menuDataSource: {
        'type': 'string',
        'enum': ['topMenu', 'bottomMenu'],
        'default': 'topMenu',
        'description': 'some amazing description'
    }
});
