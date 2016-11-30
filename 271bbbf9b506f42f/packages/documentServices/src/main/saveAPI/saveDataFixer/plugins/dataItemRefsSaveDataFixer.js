define(['lodash',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/dataSerialization'
], function (_, dataSchemas, designSchemas, dataSerialization) {
    'use strict';

    var schemaByType = {
        'document_data': dataSchemas,
        'design_data': designSchemas
    };

    function getRefDataItem(pageId, ref, immutablePagesData, dataType) {
        var dataId = ref.replace('#', '');
        return getDataItem(pageId, dataId, immutablePagesData, dataType);
    }

    function getDataItem(pageId, dataId, immutablePagesData, dataType) {
        var dataItem = immutablePagesData.getIn([pageId, 'data', dataType, dataId]);
        return dataItem && dataItem.toJS();
    }

    function isRefChanged(pageId, currentDataItem, dataType, key, lastImmutablePagesData) {
        var oldDataItem = getDataItem(pageId, currentDataItem.id, lastImmutablePagesData, dataType);
        return !oldDataItem || !_.isEqual(oldDataItem[key], currentDataItem[key]);
    }

    function addDataItemToRefCollection(pageId, ref, lastImmutablePagesData, currentImmutablePagesData, refCollection, dataType) {
        var dataItemToAdd = getRefDataItem(pageId, ref, currentImmutablePagesData, dataType);
        if (dataItemToAdd && !refCollection[dataItemToAdd.id]) {
            refCollection[dataItemToAdd.id] = dataItemToAdd;
            addResolvedRefsIfChanged(pageId, dataItemToAdd, dataType, lastImmutablePagesData, currentImmutablePagesData, false, refCollection);
        }
    }

    function handlePageBackgroundItem(pageId, currentDataItem, dataType, lastImmutablePagesData, currentImmutablePagesData, refCollection) {
        var oldDataItem = getDataItem(pageId, currentDataItem.id, lastImmutablePagesData, dataType);

        _.forEach(['desktop', 'mobile'], function (device) {
            var isBackgroundRefChanged = !oldDataItem || !oldDataItem.pageBackgrounds || oldDataItem.pageBackgrounds[device].ref !== currentDataItem.pageBackgrounds[device].ref;
            if (isBackgroundRefChanged) {
                addDataItemToRefCollection(pageId, currentDataItem.pageBackgrounds[device].ref, lastImmutablePagesData, currentImmutablePagesData, refCollection, dataType);
            }
        });
    }

    function addResolvedRefsIfChanged(pageId, dataItem, dataType, lastImmutablePagesData, currentImmutablePagesData, shouldCheckIfRefChanged, refCollection) {
        if (dataItem.type === 'Page' && dataItem.pageBackgrounds) {
            handlePageBackgroundItem(pageId, dataItem, dataType, lastImmutablePagesData, currentImmutablePagesData, refCollection);
        }
        var schemaSource = schemaByType[dataType];
        var schema = schemaSource[dataItem.type];

        _.forEach(dataItem, function (value, key) {
            if (!value) {
                return;
            }
            if (dataSerialization.isOfType(schema, key, 'ref', schemaSource) && (!shouldCheckIfRefChanged || isRefChanged(pageId, dataItem, dataType, key, lastImmutablePagesData))) {
                addDataItemToRefCollection(pageId, value, lastImmutablePagesData, currentImmutablePagesData, refCollection, dataType);
            } else if (dataSerialization.isOfType(schema, key, 'refList', schemaSource) && (!shouldCheckIfRefChanged || isRefChanged(pageId, dataItem, dataType, key, lastImmutablePagesData))) {
                var currentRefList = value;
                var oldDataItem = shouldCheckIfRefChanged && getDataItem(pageId, dataItem.id, lastImmutablePagesData, dataType);
                var refsDiff = oldDataItem ? _.difference(currentRefList, oldDataItem[key]) : currentRefList;
                _.forEach(refsDiff, function (changedRef) {
                    addDataItemToRefCollection(pageId, changedRef, lastImmutablePagesData, currentImmutablePagesData, refCollection, dataType);
                });
            }
        });
    }

    function getDataItemPageId(dataItem, dataType, immutablePagesData) {
        var pathToDataItem = ['data', dataType, dataItem.id];
        var pageEntry = immutablePagesData.findEntry(function (page) {
            return Boolean(page.getIn(pathToDataItem));
        });
        return pageEntry && pageEntry[0]; //immutable.findEntry returns [key, immutableVal]
    }

    function fixData(dataItemsDelta, dataType, lastImmutablePagesData, currentImmutablePagesData) {
        var result = {};
        _.forEach(dataItemsDelta, function (dataItem) {
            var pageId = getDataItemPageId(dataItem, dataType, currentImmutablePagesData);
            addResolvedRefsIfChanged(pageId, dataItem, dataType, lastImmutablePagesData, currentImmutablePagesData, true, result);
        });

        _.assign(dataItemsDelta, result);
    }

    ///**
    // * @exports utils/saveDataFixer/plugins/backgroundsSaveDataFixer
    // * @type {{exec: function}}
    // */
    var exports = {
        exec: function (dataToSave, lastImmutableSnapshot, currentImmutableSnapshot) {
            if (!lastImmutableSnapshot) {
                return;
            }

            var dataItemsDelta = dataToSave.dataDelta.document_data;
            var designItemsDelta = dataToSave.dataDelta.design_data;

            if (!_.isEmpty(dataItemsDelta)) {
                fixData(dataItemsDelta, 'document_data', lastImmutableSnapshot.get('pagesData'), currentImmutableSnapshot.get('pagesData'));
            }
            if (!_.isEmpty(designItemsDelta)) {
                fixData(designItemsDelta, 'design_data', lastImmutableSnapshot.get('pagesData'), currentImmutableSnapshot.get('pagesData'));
            }
        }
    };

    return exports;
});
