define.dataSchema('map', {
    templates: 'object'
});

define.dataItem.multi({
    'CK_EDITOR_FONT_STYLES': {
        type: 'map',
        metaData: {'isPreset': true, 'isHidden': false, 'description': '', 'isPersistent': false},
        items:
        {
            "font_0" : {"seoTag": "h1", "label": "FONT_0_LABEL"},
            "font_1" : {"seoTag": "h2", "label": "FONT_1_LABEL"}, //menu- deprecated
            "font_2" : {"seoTag": "h2", "label": "FONT_2_LABEL"},
            "font_3" : {"seoTag": "h3", "label": "FONT_3_LABEL"},
            "font_4" : {"seoTag": "h4", "label": "FONT_4_LABEL"},
            "font_5" : {"seoTag": "h5", "label": "FONT_5_LABEL"},
            "font_6" : {"seoTag": "h6", "label": "FONT_6_LABEL"},
            "font_7" : {"seoTag": "p", "label": "FONT_7_LABEL"},
            "font_8" : {"seoTag": "p", "label": "FONT_8_LABEL"},
            "font_9" : {"seoTag": "p", "label": "FONT_9_LABEL"},
            "font_10" : {"seoTag": "p", "label": "FONT_10_LABEL"} //body xs deprecated
        }
    }
});