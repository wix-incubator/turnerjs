define([
    'lodash',
    'siteUtils/core/dataRefs.json',
    'siteUtils/customDataResolvers/customDataResolvers'
], function (_, dataRefs, customResolvers) {
    'use strict';

    var DATA_REFS_TYPES = {
        component_properties: 'Properties',
        document_data: 'Data',
        design_data: 'Design'
    };

    var MASTER_PAGE = ['masterPage'];
    function resolveWithCustomResolver(data, pageId, currentRootIds, pagesData, dataType) {
        var customResolver = _.get(customResolvers, [data.type, 'resolve']);

        var self = this;
        function boundGetData(query, rootId) {
            rootId = rootId || pageId;
            var fallbackIds = rootId === 'masterPage' ? currentRootIds : MASTER_PAGE;
            return getData.call(self, pagesData, currentRootIds, fallbackIds, rootId, dataType, query);
        }

        return customResolver(data, boundGetData);
    }

    function getData(pagesData, currentRootIds, fallbackPageIds, pageId, dataType, dataQuery, refs) {
        var dataRefsForType = dataRefs[DATA_REFS_TYPES[dataType]];
        var data = null;

        if (_.isUndefined(dataQuery)) {
            return null;
        }

        if (_.isPlainObject(dataQuery)) {
            if (_.has(customResolvers, dataQuery.type)) {
                data = resolveWithCustomResolver.call(this, dataQuery, pageId, currentRootIds, pagesData, dataType);
            } else {
                refs = refs || _.get(dataRefsForType, dataQuery.type, {});
                data = _.mapValues(refs, function (isRef, ref) {
                    var propValue = getData.call(this, pagesData, currentRootIds, fallbackPageIds, pageId, dataType, dataQuery[ref], isRef);
                    return !propValue && isRef === true ? dataQuery[ref] : propValue;
                }, this);
            }

            return _.defaults(data, dataQuery);
        }

        if (_.isArray(dataQuery)) {
            return _.map(dataQuery, function (innerQuery) {
                return getData.call(this, pagesData, currentRootIds, fallbackPageIds, pageId, dataType, innerQuery);
            }, this);
        }

        if (_.startsWith(dataQuery, '#')) {
            dataQuery = dataQuery.slice(1);
        }

        var dataPageId = pageId;
        data = _.get(pagesData, [pageId, 'data', dataType, dataQuery]);
        if (!data) {
            _.forEach(fallbackPageIds, function (fallbackPageId) {
                data = _.get(pagesData, [fallbackPageId, 'data', dataType, dataQuery]);
                return !data;
            });

            if (!data) {
                return null;
            }
        }

        var cachedData = this.readingFromCache && _.get(this.cache, [dataPageId, dataType, dataQuery]);
        if (cachedData) {
            return cachedData;
        }

        if (_.has(customResolvers, data.type)){

            data = resolveWithCustomResolver.call(this, data, pageId, currentRootIds, pagesData, dataType);

        } else {

            refs = refs || _.get(dataRefsForType, data.type);

            if (!refs) {
                return data;
            }

            data = _.assign({}, data);

            _.forEach(refs, function (innerRefs, key) {
                if (!_.has(data, key)) {
                    return;
                }

                var propData = getData.call(this, pagesData, currentRootIds, fallbackPageIds, pageId, dataType, data[key], innerRefs);
                if (propData || !innerRefs) {
                    data[key] = propData;
                }
            }, this);
        }

        _.set(this.cache, [dataPageId, dataType, dataQuery], data);

        return data;
    }

    /**
     * Resolves data of the dataQuery from the pageId or from the currentRootIds
     * @param {object} pagesData SiteData.pagesData
     * @param {String[]} currentRootIds The current pageId
     * @param {String} pageId The requested pageId to get the data from.
     * @param {SiteData.dataTypes} dataType The type of the data
     * @param {String} query The data id
     * @returns {*} The resolved data of this query
     */
    function getDataByQuery(pagesData, currentRootIds, pageId, dataType, query) {
        if (!_.has(pagesData, [pageId, 'data'])) {
            return {};
        }

        var fallbackPageIds = pageId === 'masterPage' ? currentRootIds : ['masterPage'];
        return getData.call(this, pagesData, currentRootIds, fallbackPageIds, pageId, dataType, query, null);
    }

    function DataResolver() {
        this.cache = {};
        this.readingFromCache = true;
    }

    DataResolver.prototype = {
        getDataByQuery: getDataByQuery,
        clearCache: function () {
            this.cache = {};
        },
        setReadingFromCache: function (reading) {
            this.readingFromCache = Boolean(reading);
        }
    };

    return DataResolver;
});
