define([
    'lodash',
    'documentServices/dataModel/dataModel'
], function (
    _,
    dataModel
) {
    'use strict';

    function getDevicePropName(ps, pointer) {
        return ps.pointers.components.getViewMode(pointer).toLowerCase();
    }

    function getPagePropsForDevice(ps, pagePointer) {
        return _.get(dataModel.getPropertiesItem(ps, pagePointer), getDevicePropName(ps, pagePointer));
    }

    function mergePageProps(ps, pagePointer, chunkToMerge) {
        var allPageProps = dataModel.getPropertiesItem(ps, pagePointer) || dataModel.createPropertiesItemByType(ps, 'PageProperties');
        var path = getDevicePropName(ps, pagePointer);
        var mergedChunk;

        if (_.isPlainObject(chunkToMerge)) {
            var chunkFromDAL = _.get(allPageProps, path, {});
            mergedChunk = _.assign(chunkFromDAL, chunkToMerge);
        } else {
            mergedChunk = chunkToMerge;
        }
        _.set(allPageProps, path, mergedChunk);

        return allPageProps;
    }

    function updatePagePropsForDevice(ps, pagePointer, props) {
        var mergedProps = mergePageProps(ps, pagePointer, props);
        dataModel.updatePropertiesItem(ps, pagePointer, mergedProps);
    }


    return {
        getPageProperties: getPagePropsForDevice,
        updatePageProperties: updatePagePropsForDevice
    };
});
