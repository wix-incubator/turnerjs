define(['bluebird', 'lodash', 'zepto', 'utils', 'documentServices/wixapps/utils/requestPayloadCreator', 'documentServices/wixapps/utils/pathUtils', 'documentServices/wixapps/services/items', 'documentServices/wixapps/bi/BIService'], function (Promise, _, $, utils, requestPayloadCreator, pathUtils, items, BIService) {
    'use strict';

    function getPublishUrls(appInstance) {
        return [utils.urlUtils.origin() + '/apps/appBuilder/published/' + appInstance.applicationInstanceId];
    }

    function getBatchUrls() {
        return [utils.urlUtils.origin() + '/apps/appBuilder/1/editor/Batch?checkConcurrentModification=true'];
    }

    function getSaveRepoUrls(appInstance) {
        return [utils.urlUtils.origin() + '/apps/appBuilder/saved/' + appInstance.applicationInstanceId + '?checkConcurrentModification=true'];
    }

    function getBIService(biCallbacks) {
        return new BIService(biCallbacks.event, biCallbacks.error);
    }

    function saveRepo(appInstance, repo, biCallbacks) {
        var bi = getBIService(biCallbacks);
        bi.beforeSavingRepo(appInstance);

        var defer = Promise.defer();

        function doneCallback(responseData, err) {
            if (err || !responseData.success) {
                defer.reject({errorCode: err ? responseData : responseData.errorCode, changes: null});
                bi.errorSavingRepo(appInstance, responseData, err);
            } else {
                bi.successSavingRepo(appInstance, responseData);
                var changes = null;

                if (responseData.payload.applicationInstanceVersion) {
                    changes = {};
                    changes[pathUtils.getApplicationInstanceVersionPath().join('.')] = responseData.payload.applicationInstanceVersion;
                    appInstance.applicationInstanceVersion = responseData.payload.applicationInstanceVersion;
                }

                defer.resolve(changes);
            }
        }


        if (!repo) {
            bi.skippedSavingRepo(appInstance);
            defer.resolve(null);
        } else {
            _(repo.dataSelectors).filter(function (currentSelector) {
                return _.isUndefined(currentSelector.dataProviderId);
            }).forEach(function (currentSelector) {
                currentSelector.dataProviderId = 'wixdb';
            }).value();

            var request = {
                urls: getSaveRepoUrls(appInstance),
                data: _.assign({
                    applicationInstanceVersion: appInstance.applicationInstanceVersion,
                    dataProviders: {wixdb: {type: "WixDb"}},
                    tags: {},
                    pages: {}
                }, repo)
            };

            utils.requestsUtil.createAndSendRequest(request, doneCallback, $.ajax);
        }

        return defer.promise;
    }

    function getSuccessfulSaveChanges(results, dataItems) {
        return _(results)
            .filter('success')
            .transform(function (acc, result) {
                var itemId = result.payload.id;
                var item = _.find(dataItems.created, {_iid: itemId});
                if (item) {
                    acc[pathUtils.getItemPath(item._type, itemId, '_state').join('.')] = items.STATES.SAVED;
                }
            }, {})
            .value();
    }

    function getPartialSuccessfulChanges(results, dataItems) {
        return _(results)
            .filter('success')
            .transform(function (acc, result) {
                var itemId = result.payload.id;
                var createdItem = _.find(dataItems.created, {_iid: itemId});
                if (createdItem) {
                    createdItem._state = items.STATES.SAVED;
                    acc[pathUtils.getItemPath(createdItem._type, itemId).join('.')] = createdItem;
                    return;
                }

                var deletedItemId = _.find(dataItems.deleted, itemId);
                if (deletedItemId) {
                    acc[pathUtils.getItemPath(createdItem._type, itemId).join('.')] = undefined;
                }
            }, {})
            .value();
    }

    function saveItems(appInstance, dataItems, biCallbacks) {
        var bi = getBIService(biCallbacks);
        bi.beforeSavingItems(appInstance, dataItems);

        var defer = Promise.defer();

        function doneCallback(responseData, err) {
            var results = _.get(responseData, 'payload.results');

            if (err || !responseData.success) {
                var partialSuccessChanges = results ? getPartialSuccessfulChanges(results, dataItems) : null;
                // update store
                defer.reject({errorCode: err ? responseData : responseData.errorCode, changes: partialSuccessChanges});
                bi.errorSavingItems(appInstance, responseData, err);
            } else {
                var successChanges = getSuccessfulSaveChanges(results, dataItems);
                defer.resolve(successChanges);
                bi.successSavingItems(appInstance, responseData);
            }
        }

        var hasDataItemChanges = _.some(dataItems, function (array) {
            return array.length > 0;
        });

        if (!hasDataItemChanges) {
            bi.skippedSavingItems(appInstance);
            defer.resolve(null);
        } else {
            var batchRequest = {
                urls: getBatchUrls(),
                data: {operations: requestPayloadCreator.getSaveItemsOperations(appInstance, dataItems)}
            };

            utils.requestsUtil.createAndSendRequest(batchRequest, doneCallback, $.ajax);
        }

        return defer.promise;
    }

    function saveRepoAndItems(appInstance, repo, dataItems, biCallbacks) {
        var aggregatedChanges = {};

        function collectChanges(changes) {
            _.assign(aggregatedChanges, changes);
        }

        var defer = Promise.defer();

        this.saveRepo(appInstance, repo, biCallbacks)
            .bind(this)
            .then(function(changes) {
                collectChanges(changes);
                return this.saveItems(appInstance, dataItems, biCallbacks);
            })
            .then(function (changes) {
                collectChanges(changes);
                defer.resolve(aggregatedChanges);
            })
            .catch(function (error) {
                collectChanges(error.changes);
                var response = {changes: aggregatedChanges, errorCode: error.errorCode};
                defer.reject(response);
            });

        return defer.promise;
    }

    function publish(appInstance, biCallbacks) {
        var bi = getBIService(biCallbacks);

        var defer = Promise.defer();
        function doneCallback(responseData, err) {
            if (err || !responseData.success) {
                defer.reject({errorCode: err ? responseData : responseData.errorCode});
                bi.errorPublish(appInstance, responseData, err);
            } else {
                defer.resolve(responseData.payload);
                bi.successPublish(appInstance);
            }
        }

        var request = {
            urls: getPublishUrls(appInstance),
            data: {}
        };

        bi.beforePublish(appInstance);
        utils.requestsUtil.createAndSendRequest(request, doneCallback, $.ajax);
        return defer.promise;
    }


    return {
        saveRepo: saveRepo,
        saveItems: saveItems,
        saveRepoAndItems: saveRepoAndItems,
        publish: publish
    };
});
