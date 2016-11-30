define([
	'lodash',
	'documentServices/dataAccessLayer/wixImmutable',
	'documentServices/wixapps/utils/diffCalculator',
	'documentServices/wixapps/utils/pathUtils',
	'documentServices/wixapps/services/serverApi',
	'documentServices/wixapps/utils/appBuilder',
    'experiment'
], function (_, wixImmutable, diffCalculator, pathUtils, serverApi, appBuilderUtils, experiment) {
    'use strict';

	var parts = wixImmutable.fromJS({parts: null});
	var dataSelectors = wixImmutable.fromJS({dataSelectors: null});
	var views = wixImmutable.fromJS({views: null});
	var types = wixImmutable.fromJS({types: null});

    //wrap parts, dataSelectors, views and types, because of the difference in json structure
    //between them and items. items has another level of type/itemId, and diffCalculator knows
    // this structure. this is done in order to avoid deep diff
    var appbuilderGetters =
    {
        items: function (data) {
            return getByPath(data, pathUtils.getBaseItemsPath());
        },
        parts: function (data) {
	        return parts.update('parts', getByPath.bind(null, data, pathUtils.getBasePartsPath()));
        },
        dataSelectors: function (data) {
	        return dataSelectors.update('dataSelectors', getByPath.bind(this, data, pathUtils.getBaseDataSelectorsPath()));
        },
        views: function (data) {
	        return views.update('views', getByPath.bind(this, data, pathUtils.getBaseViewsPath()));
        },
        types: function (data) {
	        return types.update('types', getByPath.bind(this, data, pathUtils.getBaseTypesPath()));
        }
    };

    var fieldsToIgnoreOnDiff = ['_state'];

    function applyTimestamp(itemBefore, itemAfter) {
        return _.assign(itemAfter, {_timestamp: itemBefore._updatedAt});
    }

	function getByPath(data, path) {
	    return data.getIn(path, wixImmutable.fromJS({}));
    }

    function getDiffForDataType(lastSavedData, currentData, ignoreList, transformFunc, dataType) {
        var lastSnapshotOfDataType = appbuilderGetters[dataType](lastSavedData);
        var currentSnapshotOfDataType = appbuilderGetters[dataType](currentData);
        return diffCalculator.getItemsDiff(lastSnapshotOfDataType, currentSnapshotOfDataType, ignoreList, transformFunc);
    }

    function getDiff(lastSavedData, currentData, dataTypes, ignoreList, transformFunc) {
        var diffsPerDataType = _.map(dataTypes, getDiffForDataType.bind(null, lastSavedData, currentData, ignoreList, transformFunc));

        return {
            created: _(diffsPerDataType).pluck('created').flattenDeep().value(),
            updated: _(diffsPerDataType).pluck('updated').flattenDeep().value(),
            deleted: _(diffsPerDataType).pluck('deleted').flattenDeep().value()
        };
    }

    function hasNoData(data) {
        return _.every(appbuilderGetters, function (getter) {
	        return getter(data).every(function (immutableData) {
                return immutableData && immutableData.isEmpty();
            });
        });
    }

    function saveAll(lastSavedData, currentData, resolve, reject, biCallbacks) {
	    if (currentData === lastSavedData || (hasNoData(currentData) && hasNoData(lastSavedData))) {
            resolve();
            return;
        }

        var payload = getSavePayload(lastSavedData, currentData);

        serverApi.saveRepoAndItems(appBuilderUtils.getAppInstance(currentData), payload.repo, payload.dataItems, biCallbacks)
            .then(resolve)
            .catch(reject);
    }

    function getRepo(lastSavedData, currentData) {
        var repoDiffs = getDiff(lastSavedData, currentData, ['types', 'parts', 'dataSelectors', 'views']);
        var hasChanges = _.some(repoDiffs, function (changeList) {
            return changeList.length > 0;
        });

        if (!hasChanges) {
            return null;
        }

        var convertedToArrays = _.transform(['dataSelectors', 'views', 'types'], function (res, dataType) {
            var repoPart = appbuilderGetters[dataType](currentData).toJS();
            res[dataType] = _(repoPart).map(_.values).flattenDeep().value();
        }, {});

        var asObjects = appbuilderGetters.parts(currentData).toJS();

        return _.assign(convertedToArrays, asObjects);
    }

    function getSavePayload(lastSavedData, currentData) {
        return {
            dataItems: getDiff(lastSavedData, currentData, ['items'], fieldsToIgnoreOnDiff, applyTimestamp),
            repo: getRepo(lastSavedData, currentData)
        };
    }

    return {
        partialSave: function (lastSavedData, currentData, resolve, reject, biCallbacks) {
            saveAll(lastSavedData, currentData, resolve, reject, biCallbacks);
        },

        fullSave: function (lastSavedData, currentData, resolve, reject, biCallbacks) {
            saveAll(lastSavedData, currentData, resolve, reject, biCallbacks);
        },

        firstSave: function (lastSavedData, currentData, resolve, reject, biCallbacks) {
            var lastInstanceId = appBuilderUtils.getAppInstanceId(lastSavedData);
            var currentInstanceId = appBuilderUtils.getAppInstanceId(currentData);
            if (lastInstanceId === currentInstanceId) {
                reject({
                    errorCode: 1970,
                    errorDescription: 'application instance id is the template id',
                    changes: null
                });
            } else {
                saveAll(lastSavedData, currentData, resolve, reject, biCallbacks);
            }
        },

        saveAsTemplate: function(lastSavedData, currentData, resolve) {
            resolve();
        },

        autosave: function(lastSavedData, currentData, resolve, reject, biCallbacks) {
            if (experiment.isOpen('autosaveWixappsSettle')) {
                saveAll(lastSavedData, currentData, resolve, reject, biCallbacks);
            } else {
                resolve();
            }
        },

        publish: function (currentData, resolve, reject, biCallbacks) {
            if (hasNoData(currentData)){
                resolve();
                return;
            }

            serverApi.publish(appBuilderUtils.getAppInstance(currentData), biCallbacks)
                .then(resolve)
                .catch(reject);
        },

        getTaskName: function () {
            return 'appbuilder';
        }
    };
});
