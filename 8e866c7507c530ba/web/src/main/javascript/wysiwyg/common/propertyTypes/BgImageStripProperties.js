define.dataSchema('BgImageStripProperties', {
    bgUrl: {
        'type': 'string',
        'default': '',
        'description': 'Set image background'
    },
    bgSize: {
        'type': 'string',
        'enum': [
            {label: "Actual Size", value: "auto"},
            {label: "Crop       ", value: "cover"},
            {label: "Fit        ", value: "contain"}
        ],
        'default': 'auto',
        'description': 'Set background mode'
    },
    bgRepeat: {
        'type': 'string',
        'enum': [
            {label: "No Tiling", value: "no-repeat"},
            {label: "Tile Horizontal", value: "repeat-x "},
            {label: "Tile Vertical", value: "repeat-y "},
            {label: "Tile All", value: "repeat"}
        ],
        'default': 'repeat',
        'description': 'Set background tile direction'
    },
    bgPosition: {
        'type': 'string',
        'enum': [ 'top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left', 'bottom center', 'bottom right' ],
        'default': 'center',
        'description': 'Set background position'
    }
});
