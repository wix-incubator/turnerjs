define(['lodash', 'components/components/galleries/tpaGallery'], function (_, tpaGallery) {
    'use strict';
    /**
     * @class components.honeycomb
     * @extends {core.tpaGallery}
     */
    return {
        displayName: 'HoneycombGallery',
        mixins: [tpaGallery],
        getGalleryType: function () {
            return 'Honeycomb';
        },
        debounceIframe: _.debounce(function (compProp, compData, styleId) {
            this.sendIframeMessage(compProp, compData, styleId);
        }, 400),
        shouldDebounceIframe: function (compProp) {
            return compProp.numOfColumns !== this.props.compProp.numOfColumns;
        },
        getStyleProps: function () {
            return {
                "textColor": "color1",
                "descriptionColor": "color2",
                "textBackgroundColor": "color3",
                "backgroundMouseoverColor": "color4",
                "holesColor": "color5"
            };
        }
    };
});