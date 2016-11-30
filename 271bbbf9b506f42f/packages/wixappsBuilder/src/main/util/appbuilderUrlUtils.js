define(['lodash', 'utils', 'wixappsBuilder/util/oldImagesConversionMap'], function (_, utils, oldImagesConversionMap) {
    'use strict';

    var NON_MEDIA_URL = /^(http:\/\/)?(images\/.*)/;

    function resolveImageData(data, serviceTopology) {
        data = fixNonMediaServiceImage(data);

        var appBasedPath = _.get(serviceTopology, 'scriptsLocationMap.wixapps');
        var match = NON_MEDIA_URL.exec(data.src);
        if (match && appBasedPath) {
            data.src = utils.urlUtils.joinURL(appBasedPath, match[2]);
        }

        return data;
    }

    /**
     * Replace old images that were part of the wixapps artifact to images from the media server.
     * @param data
     * @returns {*}
     */
    function fixNonMediaServiceImage(data) {
        if (NON_MEDIA_URL.test(data.src)) {
            var imageFileName = _.last(data.src.split('/'));
            var convertedImage = oldImagesConversionMap[imageFileName];
            if (convertedImage) {
                return _.assign({}, data, convertedImage);
            }
        }

        return _.clone(data);
    }

    return {
        resolveImageData: resolveImageData
    };

});
