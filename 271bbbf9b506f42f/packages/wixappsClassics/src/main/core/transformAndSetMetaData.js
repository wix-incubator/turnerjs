define(['lodash', 'wixappsCore'], function (_, wixappsCore) {
    'use strict';

    var wixappsDataHandler = wixappsCore.wixappsDataHandler;

    function transformAndSetMetaData(transformFunc, siteData, packageName, compId, responseData, currentValue) {
        transformFunc(responseData, currentValue, siteData);

        var updatedMetadata = {dataReady: true};
        var descriptor = wixappsDataHandler.getDescriptor(siteData, packageName);
        var metadata = wixappsDataHandler.getCompMetadata(siteData, packageName, compId);
        if (descriptor && (!_.has(metadata, 'videos') || metadata.videos === 0)) {
            wixappsDataHandler.clearCompMetadata(siteData, packageName, compId);
        } else {
            wixappsDataHandler.setCompMetadata(updatedMetadata, siteData, packageName, compId);
        }

        return currentValue;
    }

    return transformAndSetMetaData;
});
