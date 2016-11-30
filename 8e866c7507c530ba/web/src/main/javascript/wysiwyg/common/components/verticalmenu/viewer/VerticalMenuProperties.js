define.dataSchema('VerticalMenuProperties', {
    itemsAlignment: {
        'type': 'string',
        'enum': ['left', 'center', 'right'],
        'default': 'left',
        'description': 'alignment of the menu items'
    },
    subMenuOpenSide: {
        'type': 'string',
        'enum': ['left', 'right'],
        'default': 'right',
        'description': "Opening direction of sub-menus"
    }
});