define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';
    /**
     * @class components.impress
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'ImpressGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Impress';
        },
        getStyleProps: function () {
            return {
                "bcgColor1": "color1",
                "bcgColor2": "color2",
                "bcgColor3": "color3",
                "bcgColor4": "color4",
                "bcgColor5": "color5",
                "textColor": "color6",
                "descriptionColor": "color7",
                "textBackgroundColor": "color8"
            };
        }
    };
});