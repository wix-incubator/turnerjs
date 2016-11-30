define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';

    /**
     * @class components.freestyle
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'FreestyleGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Freestyle';
        },
        getStyleProps: function () {
            return {
                "borderColor": "color1"
            };
        }
    };
});