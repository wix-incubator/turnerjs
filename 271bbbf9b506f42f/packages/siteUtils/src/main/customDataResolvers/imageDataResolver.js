define(['lodash'], function (_) {
    'use strict';

    var globalProperties = ['quality', 'unsharpMask'];

    /**
     *
     * @param {object} data
     * @param {function(queryParam:string)} getData
     */
    function imageDataResolver(data, getData) {
        var newData = {};

        //Resolve 'link' and 'originalImageRef'
        if (data.link){
            newData.link = getData(data.link);
        }
        if (data.originalImageDataRef) {
            newData.originalImageDataRef = getData(data.originalImageDataRef);
        }

        // Apply global quality if exists
        var globalImageQuality = _.pick(getData('IMAGE_QUALITY'), globalProperties);

        if (_.isEmpty(data.quality) && !_.isEmpty(globalImageQuality)) {
            newData.quality = globalImageQuality;
        }

        if (!_.isEmpty(newData)){
            return _.defaults(newData, data);
        }

        return data;
    }

    return {
        resolve: imageDataResolver
    };
});
