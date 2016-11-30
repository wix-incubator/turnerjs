define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.stripShowcase
     * @extends {core.tpaGallery}
     * @extends {core.tpaStripGallery}
     */
    return {
        displayName: 'StripShowcaseGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'StripShowcase';
        },
        getStyleProps: function () {
            return {};
        }
    };
});
