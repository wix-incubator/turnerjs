define(['fonts/utils/fontUtils', 'fonts/utils/fontCss', 'fonts/utils/fontMetadata', 'fonts/utils/fontsTracker'], function (fontUtils, fontCss, fontMetadata, fontsTracker) {
    'use strict';

    /**
     * @class fonts
     */
    return {
        fontUtils: fontUtils,
        fontCss: fontCss,
        fontMetadata: fontMetadata,
        fontsTracker: fontsTracker
    };
});
