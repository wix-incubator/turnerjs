define(['components/components/galleries/tpaGallery'], function (tpaGallery) {
    'use strict';

    /**
     * @class components.collage
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'CollageGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Collage';
        },
        getStyleProps: function () {
            return {
                "textColor": "color1",
                "descriptionColor": "color2",
                "backgroundMouseoverColor": "color3"
            };
        },

        getOverrideParams: function (compProp) {
            if (compProp.maxImageSize > compProp.numOfCells) {
                compProp.maxImageSize = compProp.numOfCells;
            }
            if (compProp.minImageSize > compProp.maxImageSize) {
                compProp.minImageSize = compProp.maxImageSize;
            } else if (compProp.maxImageSize < compProp.minImageSize) {
                compProp.maxImageSize = compProp.minImageSize;
            }

            return compProp;
        }
    };
});