define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.thumbnails
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'ThumbnailsGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Thumbnails';
        },
        getStyleProps: function () {
            return {
                "textColor": "color1",
                "descriptionColor": "color2",
                "textBackgroundColor": "color3"
            };
        }
    };
});