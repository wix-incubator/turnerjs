'use strict';

const conversionConfig = {
    MOBILE_WIDTH: 320,
    MARGIN_BETWEEN_TEXT_AND_NON_TEXT: 20,
    COMPONENT_MOBILE_MARGIN_X: 10,
    COMPONENT_MOBILE_MARGIN_Y: 10,
    SECTION_MOBILE_MARGIN_Y: 20,
    SITE_SEGMENT_PADDING_X: 20,
    TINY_MENU_SIZE: 50,
    TEXT_MAX_LENGTH_FOR_RESCALING: 25,
    MIN_WIDTH_FOR_ENLARGE: 140,
    DEFAULT_TEXT_HEIGHT: 10,

    VIRTUAL_GROUP_TYPES: {
        OVERLAP: 'VIRTUAL_GROUP',
        BACKGROUND: 'BACKGROUND_VIRTUAL_GROUP',
        MERGE: 'MERGE_VIRTUAL_GROUP'
    },

    CONTAINER_TYPES: [
        'Column',
        'StripColumnsContainer',
        'Container',
        'Page'
    ],

    HEURISTIC_STRATEGIES: {
        'default': {detectSemanticGroups: true},
        'onboarding': {detectSemanticGroups: false}
    }
};


export {
    conversionConfig
}
