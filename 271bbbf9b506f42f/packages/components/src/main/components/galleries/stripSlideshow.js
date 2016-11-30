define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.stripSlideShow
     * @extends {core.tpaGallery}
     * @extends {core.tpaStripGallery}
     */
    return {
        displayName: 'StripSlideshowGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'StripSlideshow';
        },
        getStyleProps: function () {
            return {
                "titleColor": "color1",
                "descriptionColor": "color2",
                "backgroundColor": "color3"
            };
        }
    };
});
