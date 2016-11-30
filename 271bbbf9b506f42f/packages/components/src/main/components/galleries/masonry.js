define(['lodash', 'components/components/galleries/tpaGallery'], function (_, tpaGallery) {
    'use strict';
    /**
     * @class components.masonry
     * @extends {core.tpaGallery}
     */

    var version1LegacyStyles = {
        textColor: '#000',
        descriptionColor: '#000',
        textBackgroundColor: '#fff',
        backgroundMouseoverColor: '#000',
        alphaBackgroundMouseoverColor: 0.4
    };

    return {
        displayName: 'MasonryGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Masonry';
        },
        getStyleProps: function () {
            return {
                "textColor": "color1",
                "descriptionColor": "color2",
                "textBackgroundColor": "color3",
                "backgroundMouseoverColor": "color4",
                "textButtonColor": "color5"
            };
        },
        /**
         * Patch message props before sending them to the iframe
         *
         * @param {object} messageProps
         */
        patchMessageProps: function (messageProps, styleId) {
            var styleData = this.getStyleData(styleId);
            if (!styleData.version || parseInt(styleData.version, 10) === 1) {
                _.assign(messageProps, version1LegacyStyles);
            }
        }
    };
});
