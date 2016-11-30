define([], function() {
    "use strict";

    var schema = [
        {
            name: 'CrossFade',
            groups: ['transition', 'pageTransition'],
            legacyName: 'crossfade'
        },
        {
            NoTransition: 'NoTransition',
            groups: ['transition', 'pageTransition'],
            legacyName: 'none'
        },
        {
            OutIn: 'OutIn',
            groups: ['transition', 'pageTransition'],
            legacyName: 'outIn'
        },
        {
            name: 'SlideHorizontal',
            groups: ['transition', 'pageTransition'],
            legacyName: 'swipeHorizontalFullScreen'
        },
        {
            name: 'SlideVertical',
            groups: ['transition', 'pageTransition'],
            legacyName: 'swipeVerticalFullScreen'
        }
    ];

    return schema;

});