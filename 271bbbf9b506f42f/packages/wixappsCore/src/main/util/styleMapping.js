define(['lodash'], function (_) {
    'use strict';

    var mapping = {
        'Title': 'font_0',
        'Menu': 'font_1',
        'Page title': 'font_2',
        'Heading XL': 'font_3',
        'Heading L': 'font_4',
        'Heading M': 'font_5',
        'Heading S': 'font_6',
        'Body L': 'font_7',
        'Body M': 'font_8',
        'Body S': 'font_9',
        'Body XS': 'font_10'
    };

    function styleToFontClass(style) {
        return mapping[style];
    }

    function fontClassToStyle(fontClass) {
        return _.invert(mapping)[fontClass];
    }

    return {
        styleToFontClass: styleToFontClass,
        fontClassToStyle: fontClassToStyle
    };
});
