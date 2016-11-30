define([
    'lodash',
    'documentServices/dataModel/dataModel'
], function (_, dataModel) {
    'use strict';

    var qualityItemId = 'IMAGE_QUALITY';
    var qualityItemType = 'GlobalImageQuality';

    function getQualityItemPointer(ps) {
        return ps.pointers.data.getDataItem(qualityItemId, 'masterPage');
    }

    /**
     * update (or create new) the global image quality data item of the site
     * @param {PrivateDocumentServices} ps
     * @param {object} data a GlobalImageQuality data item
     */
    function updateQualityDataItem(ps, data) {
        var pointer = getQualityItemPointer(ps);
        if (!ps.dal.isExist(pointer)) {
            var newItem = dataModel.createDataItemByType(ps, qualityItemType);
            dataModel.setDataItemByPointer(ps, pointer, newItem, 'data');

        }
        validateRadiusValue(data);
        var currentData = ps.dal.get(pointer);
        dataModel.setDataItemByPointer(ps, pointer, _.assign(currentData, data), 'data');
    }

    /**
     * get the global quality data item
     * @param {PrivateDocumentServices} ps
     * @returns {object}
     */
    function getQualityDataItem(ps) {
        var pointer = getQualityItemPointer(ps);
        return ps.dal.get(pointer);
    }

    /**
     * reset the global quality data item (We never remove the item, only its content)
     * @param {PrivateDocumentServices} ps
     */
    function resetQualityDataItem(ps) {
        var pointer = getQualityItemPointer(ps);
        if (ps.dal.isExist(pointer)) {
            var newItem = dataModel.createDataItemByType(ps, qualityItemType);
            dataModel.setDataItemByPointer(ps, pointer, newItem, 'data');
        }
    }

    function validateRadiusValue(data) {
        var radius = _.get(data, 'unsharpMask.radius');
        if (_.isNumber(radius) && radius < 0.1) {
            if (!(data.unsharpMask.radius === 0 && data.unsharpMask.amount === 0 && data.unsharpMask.threshold === 0)) {
                throw new Error('radius value must be in 0.1-500.0 range, unless all radius, amount and threshold values are 0');
            }
        }

    }

    return {
        get: getQualityDataItem,
        update: updateQualityDataItem,
        reset: resetQualityDataItem
    };

});
