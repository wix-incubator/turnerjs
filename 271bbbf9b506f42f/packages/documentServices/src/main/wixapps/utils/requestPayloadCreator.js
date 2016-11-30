define(['lodash'], function (_) {
    'use strict';

    var saveOperationsFunctions = [
        getCreateItemOperations,
        getUpdateItemOperations,
        getDeleteItemOperations,
        getCreateTypesOperations
    ];

    var saveItemsOperationsFunctions = [
        getCreateItemOperations,
        getUpdateItemOperations,
        getDeleteItemOperations
    ];

    var publishOperationsFunctions = [
        getPublishItemsOperations,
        getPublishTypesOperations
    ];

    function getCreateItemOperations(appInstance, dataItems) {
        return _.map(dataItems.created, function (item) {
            return {
                name: 'CreateItem',
                params: {
                    applicationInstanceId: appInstance.applicationInstanceId,
                    applicationInstanceVersion: appInstance.applicationInstanceVersion,
                    item: item
                }
            };
        });
    }

    function getUpdateItemOperations(appInstance, dataItems) {
        return _.map(dataItems.updated, function (item) {
            return {
                name: 'UpdateItem',
                params: {
                    applicationInstanceId: appInstance.applicationInstanceId,
                    applicationInstanceVersion: appInstance.applicationInstanceVersion,
                    item: item
                }
            };
        });
    }

    function getDeleteItemOperations(appInstance, dataItems) {
        return _.map(dataItems.deleted, function (itemId) {
            return {
                name: 'DeleteItem',
                params: {
                    applicationInstanceId: appInstance.applicationInstanceId,
                    applicationInstanceVersion: appInstance.applicationInstanceVersion,
                    itemId: itemId
                }
            };
        });
    }

    function getCreateTypesOperations(appInstance, types) {
        var createdTypes = types.created;

        if (createdTypes.length === 0) {
            return [];
        }

        var op = {
            name: 'CreateTypes',
            params: {
                applicationInstanceId: appInstance.applicationInstanceId,
                applicationInstanceVersion: appInstance.applicationInstanceVersion,
                types: createdTypes
            }
        };

        return [op];
    }


    function getPublishItemsOperations(appInstance, dataItems) {
        if (dataItems.length === 0) {
            return [];
        }

        var op = {
            name: 'PublishItems',
            params: {
                applicationInstanceId: appInstance.applicationInstanceId,
                applicationInstanceVersion: appInstance.applicationInstanceVersion,
                itemIds: dataItems
            }
        };

        return [op];
    }

    function getPublishTypesOperations(appInstance, types) {
        if (types.length === 0) {
            return [];
        }

        var op = {
            name: 'PublishTypes',
            params: {
                applicationInstanceId: appInstance.applicationInstanceId,
                applicationInstanceVersion: appInstance.applicationInstanceVersion,
                names: types
            }
        };

        return [op];
    }


    function runOperations(operationsFunctions, appInstance, payload) {
        return _(operationsFunctions).map(function (op) {
            return op(appInstance, payload);
        }).flattenDeep().value();
    }

    function getSaveItemsOperations(appInstance, dataItems) {
        return runOperations(saveItemsOperationsFunctions, appInstance, dataItems);
    }

    function getSaveOperations(appInstance, payload) {
        return runOperations(saveOperationsFunctions, appInstance, payload);
    }

    function getPublishOperations(appInstance, payload) {
        return runOperations(publishOperationsFunctions, appInstance, payload);
    }

    return {
        getSaveOperations: getSaveOperations,
        getSaveItemsOperations: getSaveItemsOperations,
        getPublishOperations: getPublishOperations
    };
});