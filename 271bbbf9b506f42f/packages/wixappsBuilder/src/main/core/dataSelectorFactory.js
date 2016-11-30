define(['lodash', 'utils', 'wixappsCore'], function (_, /** utils */utils, /** wixappsCore */ wixapps) {
    'use strict';

    var urlUtils = utils.urlUtils;
    var wixappsDataHandler = wixapps.wixappsDataHandler;

    /**
     * Update siteData with the item/s return from in the response.
     * @param {object} data the response's data.
     * @param {object[]} itemsOfType the current items for this type in siteData
     * @returns {object[]} The merged items that will be set in siteData.
     */
    function setItemsInSiteData(data, itemsOfType) {
        var items = data.payload.items || [data.payload.item];
        _.forEach(items, function (item) {
            itemsOfType[item._iid] = item;
        });

        return itemsOfType;
    }


    /**
     * Builds the request for the given dataSelector of this instance id and version.
     * @param {SiteData} siteData
     * @param {object} data The post data of the request.
     * @param {string} type The type name
     * @param {object} appService The application service from the client spec map
     * @param {string} instanceVersion The version of the application instance.
     * @returns {utils.Store.requestDescriptor} The request that is needed in order to get all items of this data selector.
     */
    function buildQuery(siteData, data, type, appService, instanceVersion, onSuccess, onError) {
        data = _.defaults(data, {
            type: type,
            applicationInstanceId: appService.instanceId,
            applicationInstanceVersion: instanceVersion,
            skip: 0,
            sort: {},
            limit: null,
            filter: {}
        });

        var queryParams = {consistentRead: 'true'}; // TODO: Do we need to check if this is the owner of the site??
        var destination = wixappsDataHandler.getSiteDataDestination(appService.type).concat(["items", type]);
        var url = utils.urlUtils.baseUrl(siteData.currentUrl.full) + '/apps/appBuilder/1/editor/Query?' + urlUtils.toQueryString(queryParams);

        var requestDescriptor = {
            url: url,
            force: true,
            destination: destination,
            data: data,
            transformFunc: function (response, currentValue) {
                if (!response.success) {
                    onError();
                    return currentValue;
                }
                onSuccess();
                return setItemsInSiteData(response, currentValue);
            },
            error: onError
        };

        return requestDescriptor;
    }

    /**
     *
     * @param {ManualSelectedListDataSelector} dataSelectorDef The manual list data selector definition.
     * @param {SiteData} siteData
     * @param {object} appService The entry of this app in the clientSpecMap
     * @param {number} instanceVersion the version of the current repo
     * @returns {DataSelector}
     */
    function getManualSelectedListDataSelector(dataSelectorDef, siteData, appService, instanceVersion) {
        return {
            getRequest: function (urlData, onSuccess, onError) {
                var data = {
                    filter: {
                        _iid: {
                            '$in': dataSelectorDef.itemIds
                        }
                    }
                };

                return buildQuery(siteData, data, dataSelectorDef.forType, appService, instanceVersion, onSuccess, onError);
            },

            getData: function () {
                var existingItemsOfType = wixappsDataHandler.getDataByPath(siteData, 'appbuilder', [dataSelectorDef.forType]);
                var validDataSelectorItemIds = _.intersection(dataSelectorDef.itemIds, _.pluck(existingItemsOfType, '_iid'));
                return _.map(validDataSelectorItemIds, function (iid) {
                    return [dataSelectorDef.forType, iid];
                });
            }
        };
    }

    /**
     *
     * @param {AllItemsOfTypeDataSelector} dataSelectorDef The all items of type data selector definition.
     * @param {SiteData} siteData
     * @param {object} appService The entry of this app in the clientSpecMap
     * @param {number} instanceVersion the version of the current repo
     * @returns {DataSelector}
     */
    function getAllItemsOfTypeDataSelector(dataSelectorDef, siteData, appService, instanceVersion) {
        return {
            getRequest: function (urlData, onSuccess, onError) {
                var data = {
                    filter: {}
                };
                return buildQuery(siteData, data, dataSelectorDef.forType, appService, instanceVersion, onSuccess, onError);
            },

            getData: function () {
                var existingItemsOfType = wixappsDataHandler.getDataByPath(siteData, 'appbuilder', [dataSelectorDef.forType]);
                return _.map(existingItemsOfType, function(item) {
                    return [dataSelectorDef.forType, item._iid];
                });
            }
        };
    }

    /**
     *
     * @param {PageSelectedItemDataSelector} dataSelectorDef
     * @param {SiteData} siteData
     * @param {object} appService The entry of this app in the clientSpecMap
     * @param {number} instanceVersion the version of the current repo
     * @returns {DataSelector}
     */
    function getPageSelectedItemDataSelector(dataSelectorDef, siteData, appService, instanceVersion) {
        return {
            getRequest: function (urlData, onSuccess, onError) {
                var itemId = wixapps.wixappsUrlParser.getPageSubItemId(siteData, urlData);

                var data = {
                    applicationInstanceId: appService.instanceId,
                    applicationInstanceVersion: instanceVersion,
                    itemId: itemId
                };
                var queryParams = {consistentRead: 'true'}; // TODO: Do we need to check if this is the owner of the site??

                var context = 'viewer'; // TODO: set to editor when it's a saved site that is open in the editor.
                var destination = wixappsDataHandler.getSiteDataDestination(appService.type).concat(["items", dataSelectorDef.forType]);
                var url = utils.urlUtils.baseUrl(siteData.currentUrl.full) + '/apps/appBuilder/1/' + context + '/ReadItem?' + urlUtils.toQueryString(queryParams);
                return {
                    url: url,
                    force: true,
                    destination: destination,
                    data: data,
                    transformFunc: function (response, currentValue) {
                        onSuccess();
                        return setItemsInSiteData(response, currentValue);
                    },
                    error: onError
                };
            },

            getData: function () {
                var pageSubItemId = wixapps.wixappsUrlParser.getPageSubItemId(siteData);
                if (pageSubItemId) {
                    return [dataSelectorDef.forType, pageSubItemId];
                }
                return [];
            }
        };
    }

    /**
     * Gets the sort property for the request.
     * @param {SortedListDataSelector} dataSelectorDef
     */
    function getSortData(dataSelectorDef) {
        var sort = {};
        var sortField = (dataSelectorDef.sortField || 'title');
        var sortAscending = _.has(dataSelectorDef, 'sortAscending') ? dataSelectorDef.sortAscending : true;
        sort[sortField] = sortAscending ? 1 : 0;

        return sort;
    }

    /**
     *
     * @param {TagsFilteredItemsDataSelector} dataSelectorDef
     * @param {SiteData} siteData
     * @param {object} appService The entry of this app in the clientSpecMap
     * @param {number} instanceVersion the version of the current repo
     * @returns {DataSelector}
     */
    function getTagsFilteredItemsDataSelector(dataSelectorDef, siteData, appService, instanceVersion) {
        var dataSelectorDefClone = _.clone(dataSelectorDef);
        return {
            getRequest: function (urlData, onSuccess, onError) {
                var tagIds = dataSelectorDefClone.tagIds;
                if (tagIds.length === 0) {
                    onSuccess();
                    return null;
                }
                var data = {
                    filter: {
                        _tags: tagIds.length > 1 ? {$in: tagIds} : _.first(tagIds)
                    },
                    sort: getSortData(dataSelectorDefClone)
                };

                return buildQuery(siteData, data, dataSelectorDefClone.forType, appService, instanceVersion, onSuccess, onError);
            },

            getData: function () {
                var items = wixappsDataHandler.getDataByPath(siteData, 'appbuilder', [dataSelectorDefClone.forType]);
                // TODO: cache this until setTags was called
                var result = _(items)
                    .filter(function (item) {
                        return _.intersection(item._tags, dataSelectorDefClone.tagIds).length > 0;
                    })
                    .sortBy(dataSelectorDefClone.sortField)
                    .map(function (item) {
                        return [item._type, item._iid];
                    })
                    .value();

                return dataSelectorDefClone.sortAscending ? result : _.reverse(result);
            },

            setTags: function (tagIds, callback) {
                dataSelectorDefClone.tagIds = tagIds;
                var request = this.getRequest();
                if (!request) {
                    callback();
                } else {
                    var store = siteData.store;
                    store.loadBatch([request], callback);
                }
            }
        };
    }

    /**
     * Get the data selector that will be used to get the data or create the request needed for retrieving data.
     * @param {DataSelectorDefinition} dataSelectorDef
     * @param {SiteData} siteData
     * @param {object} appService The entry of this app in the clientSpecMap
     * @param {number} instanceVersion the version of the current repo
     * @returns {DataSelector}
     */
    function getDataSelector(dataSelectorDef, siteData, appService, instanceVersion) {
        switch (dataSelectorDef.logicalTypeName) {
            case 'IB.ManualSelectedList':
                return getManualSelectedListDataSelector(dataSelectorDef, siteData, appService, instanceVersion);
            case 'IB.PageSelectedItem':
                return getPageSelectedItemDataSelector(dataSelectorDef, siteData, appService, instanceVersion);
            case 'IB.TagsFilteredList':
                return getTagsFilteredItemsDataSelector(dataSelectorDef, siteData, appService, instanceVersion);
            case 'IB.AllItemsOfType':
                return getAllItemsOfTypeDataSelector(dataSelectorDef, siteData, appService, instanceVersion);
            default:
                throw "Data selector of type: " + dataSelectorDef.logicalTypeName + " is not implemented.";
        }
    }

    /**
     * @class dataSelectorFactory
     */
    return {
        getDataSelector: getDataSelector
    };

    /**
     * @typedef {object} DataSelector
     * @property {function(string, string): utils.Store.requestDescriptor} getRequest
     * @property {function(object): object|object[]} getData
     */

    /**
     * @typedef {object} DataSelectorDefinition
     * @property {string} dataProviderId
     * @property {string} forType
     * @property {string} id
     * @property {string} logicalTypeName
     */

    /**
     * @typedef {DataSelectorDefinition} SortedListDataSelector
     * @property {string} sortField
     * @property {string} sortAscending
     */

    /**
     * @typedef {DataSelectorDefinition} ManualSelectedListDataSelector
     * @property {string[]} itemIds
     */

    /**
     * @typedef {DataSelectorDefinition} PageSelectedItemDataSelector
     * @property {string} appPageId
     */

    /**
     * @typedef {SortedListDataSelector} TagsFilteredItemsDataSelector
     * @property {string[]} tagIds
     */

});
