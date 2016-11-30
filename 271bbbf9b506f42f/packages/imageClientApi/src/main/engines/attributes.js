define([
    'imageClientApi/helpers/imageServiceConstants',
    'imageClientApi/helpers/imageServiceUtils',
    'imageClientApi/engines/attributes/backgroundAttributes',
    'imageClientApi/engines/attributes/imgAttributes',
    'imageClientApi/engines/attributes/SVGAttributes',
    'imageClientApi/engines/attributes/imgPolyfillAttributes'
], function (constants, imageServiceUtils, backgroundAttributes, imgAttributes, SVGAttributes, imgPolyfillAttributes) {
    'use strict';

    /**
     * get CSS or SVG attributes to be used in the browser
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformTarget}    target
     *
     * @returns object
     */
    function getAttributes(transformsObj, target) {
        var attributesGetter;

        if (target.htmlTag === constants.htmlTag.BG) {
            attributesGetter = backgroundAttributes;

        } else if (target.htmlTag === constants.htmlTag.SVG) {
            attributesGetter = SVGAttributes;

        } else if (imageServiceUtils.isObjectFitBrowserSupport()) {
            attributesGetter = imgAttributes;

        } else {
            attributesGetter = imgPolyfillAttributes;
        }

        return attributesGetter.get(transformsObj, target);
    }

    return {
        getAttributes: getAttributes
    };
});
