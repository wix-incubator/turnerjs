define([
    "lodash",
    "core",
    "utils",
    "wixappsCore",
    "wixappsClassics/ecommerce/data/ecomDataRequirementsChecker",
    "wixappsClassics/core/batchableListsRequestsMerger",
    "wixappsClassics/core/data/converters/mediaPostConverter",
    "wixappsClassics/core/timeout",
    "wixappsClassics/core/transformAndSetMetaData",
    "wixappsClassics/core/blogCategories",
    "wixappsClassics/blog/blog",
    "wixappsClassics/util/appPartCommonDataManager",
    "wixappsClassics/util/numberOfPostsPerPageGetter",
    "wixappsClassics/core/relatedPosts",
    "wixappsClassics/core/transformMediaItemsResponse",
    "experiment"
], function (
    _,
    core,
    utils,
    wixapps,
    ecomDataRequirementsChecker,
    batchableListsRequestsMerger,
    mediaPostConverter,
    TIMEOUT,
    transformAndSetMetaData,
    blogCategories,
    blog,
    appPartCommonDataManager,
    numberOfPostsPerPageGetter,
    relatedPosts,
    transformMediaItemsResponse,
    experiment
) {
    "use strict";
    /*eslint max-statements: ["error", 80]*/

    var objectUtils = utils.objectUtils;
    var urlUtils = utils.urlUtils;
    var dataRequirementsChecker = core.dataRequirementsChecker;
    var wixappsDataHandler = wixapps.wixappsDataHandler;
    var videoThumbDataHandler = wixapps.videoThumbDataHandler;
    var wixappsLogger = wixapps.wixappsLogger;
    var lang;

    var blogAppPartNames = utils.blogAppPartNames;

    var appSpecificFilterMap = {
        "Posts": {
            "query": {
                "scheduled.iso": {
                    "$not": {
                        "$gt": "$now"
                    }
                },
                "deleted": {"$ne": true}
            },
            "groupByAndCount": {
                "scheduled.iso": {
                    "$not": {
                        "$gt": "$now"
                    }
                },
                "draft": false,
                "deleted": {"$ne": true}
            }
        }
    };

    var partsQueryMap = {};

    /*********************** Blog *****************************/
    partsQueryMap[blogAppPartNames.ARCHIVE] = {
        method: archiveGroupByAndCount,
        defaultOptions: {
            "collectionId": "Posts",
            "type": "Post",
            "field": "date.iso",
            "project": {
                "date": {
                    "iso": {
                        "$substr": [
                            "$date.iso",
                            0,
                            7
                        ]
                    }
                }
            },
            "filter": {
                "draft": false
            },
            "sort": "byKeyDesc",
            "normalizeTo": 5,
            "limit": null
        }
    };

    partsQueryMap[blogAppPartNames.CUSTOM_FEED] = {
        method: queryAndHandleMediaPostWithUrllessPagination,
        defaultOptions: {
            "collectionId": "Posts",
            "limit": "",
            "sort": {"date.iso": -1},
            "filterView": "filter",
            "filterType": "PostFilter",
            "resultType": "Post",
            "fields": ['title', 'text', 'coverImageData', 'date', 'permalink', 'permalinkVersion', 'author', 'categoryIds', 'video', 'photo', 'defaultPost', 'description', 'mobileTitle']
        }
    };

    partsQueryMap[blogAppPartNames.POSTS_GALLERY] = {
        method: queryAndHandleMediaPost,
        defaultOptions: {
            "collectionId": "Posts",
            "limit": 30,
            "sort": {"date.iso": -1},
            "filterView": "filter",
            "filterType": "PostFilter",
            "resultType": "Post",
            "fields": ['title', 'text', 'coverImageData', 'date', 'permalink', 'permalinkVersion', 'video', 'photo', 'defaultPost', 'description', 'mobileTitle']
        }
    };

    partsQueryMap[blogAppPartNames.TICKER] = {
        method: queryAndHandleMediaPost,
        defaultOptions: {
            "collectionId": "Posts",
            "limit": 10,
            "sort": {"date.iso": -1},
            "filterView": "filter",
            "filterType": "PostFilter",
            "resultType": "Post",
            "fields": ['title', 'text', 'coverImageData', 'date', 'permalink', 'permalinkVersion', 'video', 'photo', 'defaultPost', 'description', 'mobileTitle']
        }
    };

    partsQueryMap[blogAppPartNames.FEATURED_POSTS] = {
        method: queryAndHandleMediaPost,
        defaultOptions: {
            "collectionId": "Posts",
            "limit": 10,
            "sort": {"date.iso": -1},
            "filter": {
                "featured": true
            },
            "filterView": "filter",
            "filterType": "PostFilter",
            "resultType": "Post",
            "fields": ['title', 'text', 'coverImageData', 'date', 'permalink', 'permalinkVersion', 'video', 'photo', 'defaultPost', 'description', 'mobileTitle']
        }
    };

    partsQueryMap[blogAppPartNames.POSTS_LIST] = {
        method: queryAndHandleMediaPost,
        defaultOptions: {
            "collectionId": "Posts",
            "limit": 10,
            "sort": {"date.iso": -1},
            "filterView": "filter",
            "filterType": "PostFilter",
            "resultType": "Post",
            "fields": ['title', 'text', 'coverImageData', 'date', 'permalink', 'permalinkVersion', 'video', 'photo', 'defaultPost', 'description', 'mobileTitle']
        }
    };

    partsQueryMap[blogAppPartNames.AUTHOR] = {
        method: query,
        defaultOptions: {
            "collectionId": "Posts",
            "limit": 10,
            "sort": {"date.iso": -1},
            "filterView": "filter",
            "filterType": "PostFilter",
            "resultType": "Post"
        }
    };

    partsQueryMap[blogAppPartNames.FEED] = {
        method: queryFromUrlAndHandleMediaPost,
        defaultOptions: {
            "getTotalCount": true,
            "collectionId": "Posts",
            "limit": 10,
            "sort": "{\"date.iso\":-1}",
            "fields": ['title', 'text', 'coverImageData', 'date', 'permalink', 'permalinkVersion', 'author', 'categoryIds', 'video', 'photo', 'defaultPost', 'description', 'mobileTitle']
        }
    };

    partsQueryMap[blogAppPartNames.TAG_CLOUD] = {
        method: groupByAndCount,
        defaultOptions: {
            "collectionId": "Posts",
            "type": "Post",
            "field": "tags",
            "filter": {},
            "sort": "byKeyAsc",
            "normalizeTo": 5
        }
    };

    partsQueryMap[blogAppPartNames.SINGLE_POST] = {
        method: readItemFromUrl,
        defaultOptions: {
            "collectionId": "Posts",
            "acceptableTypes": [
                "PhotoPost",
                "VideoPost",
                "TextPost"
            ],
            "filter": {
                "draft": false
            },
            "sort": {"date.iso": -1}
        }
    };

    partsQueryMap[blogAppPartNames.CATEGORIES] = {
        method: blogCategories.queryBlogCategoryPostCounts
    };

    if (experiment.isOpen('sv_blogRelatedPosts')) {
        partsQueryMap[blogAppPartNames.RELATED_POSTS] = {
            method: _.partialRight(relatedPosts.readRelatedPosts, getLang())
        };
    }

    if (experiment.isOpen('sv_blogHeroImage')) {
        partsQueryMap[blogAppPartNames.HERO_IMAGE] = {
            method: readItemFromUrl,
            defaultOptions: {
                "collectionId": "Posts",
                "filter": {
                    "draft": false
                },
                "sort": {"date.iso": -1}
            }
        };
    }

    /***************************** Menu *****************************/
    partsQueryMap['1660c5f3-b183-4e6c-a873-5d6bbd918224'] = {
        method: readItem,
        defaultOptions: {
            "collectionId": "Menus",
            "itemId": "SampleMenu1"
        }
    };

    /***************************** FAQ *****************************/
    partsQueryMap['f2c4fc13-e24d-4e99-aadf-4cff71092b88'] = {
        method: readItem,
        defaultOptions: {
            "collectionId": "FAQs",
            "itemId": "SampleMenu1"
        }
    };

    /***************************** NEWS *****************************/
    partsQueryMap['045dd836-ef5d-11e1-ace3-c0dd6188709b'] = {
        method: readItem,
        defaultOptions: {
            "collectionId": "Lists",
            "itemId": "SampleFeed1"
        }
    };

    partsQueryMap['63631b64-a981-40c3-8772-40238db5aff6'] = {
        method: readItem,
        defaultOptions: {
            "collectionId": "Items",
            "itemId": "0537E434-5F86-4392-BEF5-7DC62B8412B3"
        }
    };


    function compare(a, b) {
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        return 0;
    }

    var sortOptions = {
        "byKeyAsc": function (a, b) {
            return compare(a.key, b.key);
        },
        "byKeyDesc": function (a, b) {
            return compare(b.key, a.key);
        },
        "byCountAsc": function (a, b) {
            return compare(a.count, b.count);
        },
        "byCountDesc": function (a, b) {
            return compare(b.count, a.count);
        }
    };

    function getItemId(item) {
        return item._iid;
    }

    var MONTHS_TRANSLATION = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    };

    var getDateWithCounter = function (date, count) {
        var dateParts = date.split('-');
        return MONTHS_TRANSLATION[dateParts[1]] + ' ' + dateParts[0] + ' (' + count + ')';
    };

    function getLang() {
        return lang;
    }


    var performanceCounter = 0;
    var performanceMeasurementNameByCompId = {};
    var blogAppPartHashToName = _.invert(utils.blogAppPartNames);

    function reportQueryStart(compData) {
        if (_.isUndefined(performanceMeasurementNameByCompId[compData.id])) {
            var batchedPrefix = '';
            if (experiment.isOpen('sv_listsBatchRequest')) {
                batchedPrefix = 'batched ';
            }
            performanceMeasurementNameByCompId[compData.id] = batchedPrefix + 'blogAppPart ' + performanceCounter;
            performanceCounter++;
            utils.performance.startOnce(performanceMeasurementNameByCompId[compData.id]);
        }
    }

    function reportQueryEnd(compData) {
        utils.performance.finish(performanceMeasurementNameByCompId[compData.id], true, {
            appPart: blogAppPartHashToName[compData.appPartName],
            compId: compData.id
        });
    }

    function transformArchiveItemsResponse(compId, collectionId, keyGen, options, responseData, currentValue) {
        var _itemToDate = function (key) {
            var date = key.split('-');
            var d = {_type: "wix:Date", iso: null};
            var iso = new Date(0);
            iso.setFullYear(date[0]);
            iso.setDate(15);
            var monthInt = parseInt(date[1], 10);
            iso.setMonth(isNaN(monthInt) ? date[1] - 1 : monthInt - 1);
            d.iso = iso.toString();

            return d;
        };
        var comboOptionsItems = _(responseData.payload)
            .map(function (value, key) {
                return {
                    _type: 'Option',
                    text: getDateWithCounter(key, value),
                    value: key,
                    dateValue: _itemToDate(key),
                    count: value,
                    selected: false
                };
            })
            .sortBy(function (option) {
                return Date.parse(option.dateValue.iso);
            })
            .reverse().value();

        var selectAllValue = null;

        function getSelectAllText(selectedValue) {
            return selectedValue === selectAllValue ? 'Select Month' : 'Show All';
        }

        comboOptionsItems.unshift({_type: 'Option', text: 'Select Month', getText: getSelectAllText, value: selectAllValue, dateValue: null, count: -1, selected: false});

        var archiveData = {
            _type: 'ComboOptionsList',
            title: '',
            items: comboOptionsItems,
            selectedValue: comboOptionsItems[0].value
        };

        var itemKey = keyGen();
        currentValue[compId] = [collectionId, itemKey];

        currentValue.items = currentValue.items || {};
        currentValue.items[collectionId] = currentValue.items[collectionId] || {};
        currentValue.items[collectionId][itemKey] = archiveData;

        return currentValue;
    }



    function transformItemsResponse(compId, collectionId, responseData, currentValue) {
        currentValue[compId + '_extraData'] = _.omit(responseData.payload, ['items', 'referencedItems', 'unreferencedItems']);
        currentValue[compId] = _.map(responseData.payload.items, function (item) {
            return [collectionId, getItemId(item)];
        });

        currentValue.items = currentValue.items || {};
        currentValue.items[collectionId] = currentValue.items[collectionId] || {};

        _.forEach(responseData.payload.items, function (item) {
            currentValue.items[collectionId][getItemId(item)] = item;
        });

        _.forEach(responseData.payload.referencedItems, function (refItem, refItemKey) {
            var colId = refItemKey.split("/")[0];
            var iid = refItemKey.split("/")[1];
            currentValue.items[colId] = currentValue.items[colId] || {};
            currentValue.items[colId][iid] = refItem;
        });

        return currentValue;
    }

    function transformItemResponse(compId, collectionId, responseData, currentValue) {
        var itemId = getItemId(responseData.payload.item);
        currentValue[compId + '_extraData'] = _.omit(responseData.payload, ['item', 'referencedItems', 'unreferencedItems']);
        currentValue[compId] = [collectionId, itemId];

        currentValue.items = currentValue.items || {};
        currentValue.items[collectionId] = currentValue.items[collectionId] || {};

        // will fix the data if it's media post
        currentValue.items[collectionId][itemId] = mediaPostConverter.fixMediaPostDataRefs(responseData.payload.item);

        _.forEach(responseData.payload.referencedItems, function (refItem, refItemKey) {
            var colId = refItemKey.split("/")[0];
            var iid = refItemKey.split("/")[1];
            currentValue.items[colId] = currentValue.items[colId] || {};
            currentValue.items[colId][iid] = refItem;
        });

        return currentValue;
    }

    function transformItemResponseFromUrl(compId, collectionId, responseData, currentValue, siteData) {
        currentValue = transformItemResponse(compId, collectionId, responseData, currentValue);
        var itemId = getItemId(responseData.payload.item);

        var fixedItem = mediaPostConverter.addAuthorFieldWhenMissing(currentValue.items[collectionId][itemId]);
        fixedItem = mediaPostConverter.getPostWithConvertedMobileTitle(fixedItem);
        if (fixedItem.deleted) {
            currentValue.items[collectionId][itemId] = [];
        } else {
            fixedItem = mediaPostConverter.translateDefaultPosts(fixedItem, getLang());

            mediaPostConverter.fixMasterPageIdInLinksInside(fixedItem);

            currentValue.items[collectionId][itemId] = fixedItem;
            mediaPostConverter.resolveCategories(currentValue, fixedItem);
        }

        if (siteData && siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH) && utils.stringUtils.startsWith(siteData.currentUrl.hash, '#!')) {
            siteData.currentUrl.full = siteData.currentUrl.full.replace('/' + itemId, '/' + fixedItem.permalink);
        }

        return currentValue;
    }

    function transformSingleItemFromQuery(compId, collectionId, responseData, currentValue) {
        if (responseData.payload.items && responseData.payload.items.length > 0) {
            responseData.payload.item = responseData.payload.items[0];
            return transformItemResponseFromUrl(compId, collectionId, responseData, currentValue);
        }

        currentValue.items = currentValue.items || {};
        currentValue.items[collectionId] = currentValue.items[collectionId] || {};
        currentValue.items[collectionId]['-1'] = [];
        currentValue[compId] = [collectionId, ['-1']];

        return currentValue;
    }

    function generateGroupByKey(postData) {
        return JSON.stringify(postData).replace(/\./g, "");
    }

    function transformGroupByResponse(compId, collectionId, keyGen, options, responseData, currentValue) {
        var itemKey = keyGen();
        currentValue[compId] = [collectionId, itemKey];

        currentValue.items = currentValue.items || {};
        currentValue.items[collectionId] = currentValue.items[collectionId] || {};
        currentValue.items[collectionId][itemKey] = _.map(responseData.payload, function (count, key) {
            return {
                key: key,
                count: count
            };
        });

        if (options.sort && sortOptions[options.sort]) {
            currentValue.items[collectionId][itemKey] = currentValue.items[collectionId][itemKey].sort(sortOptions[options.sort]);
        }
        if (options.limit) {
            currentValue.items[collectionId][itemKey] = currentValue.items[collectionId][itemKey].slice(0, options.limit);
        }
        if (options.normalizeTo) {
            var normalizeMax = parseInt(options.normalizeTo, 10);
            var maxItem = _.max(currentValue.items[collectionId][itemKey], "count");
            var max = maxItem ? maxItem.count : -1;
            _.forEach(currentValue.items[collectionId][itemKey], function (o) {
                o.normalized = Math.ceil(o.count * normalizeMax / max);
            });
        }

        return currentValue;
    }

    function getRequestCustomParams(logicParams) {
        var ret = {};
        _.forOwn(logicParams, function (param, key) {
            if (param && param.value) {
                if (_.isString(param.value) && param.value.charAt(0) === "{") {
                    ret[key] = JSON.parse(param.value);
                } else {
                    ret[key] = param.value;
                }
            }
        });
        return ret;
    }

    function serializeRequests(requests) {
        return JSON.stringify(_.map(requests, function (request) {
            return [request.data, request.url];
        }));
    }

    function createPartDataRequest(siteData, compData, appService, urlData) {
        var packageName = appService.packageName;
        var params = getRequestCustomParams(compData.appLogicParams);

        if (!partsQueryMap[compData.appPartName]) {
            return [];
        }
        var dataRequests = partsQueryMap[compData.appPartName].method(siteData, compData, appService, params, urlData);
        dataRequests = dataRequests && (_.isArray(dataRequests) ? dataRequests : [dataRequests]);

        var currentRequestsKey = serializeRequests(dataRequests);

        // make sure we have a request cache
        objectUtils.ensurePath(siteData, ["wixapps", packageName, "requestCache"]);
        var requestCache = objectUtils.resolvePath(siteData, ["wixapps", packageName, "requestCache"]);

        var lastRequestKey = requestCache[compData.id];
        if (lastRequestKey === currentRequestsKey) {
            _(dataRequests)
                .filter('callback')
                .forEach(function (req) {
                    req.callback(objectUtils.resolvePath(siteData, req.destination));
                }).value();
            return [];
        }
        requestCache[compData.id] = currentRequestsKey;

        var descriptor = wixappsDataHandler.getDescriptor(siteData, packageName);
        var stillLoading = dataRequests.length || !descriptor;
        if (stillLoading) {
            var metadata = {
                dataReady: !dataRequests.length,
                loading: true
            };
            wixappsDataHandler.setCompMetadata(metadata, siteData, packageName, compData.id);
        } else {
            wixappsDataHandler.clearCompMetadata(siteData, packageName, compData.id);
        }

        return dataRequests;
    }

    function createZoomDataRequest(siteData, compData, appService, urlData) {
        var itemId = wixapps.wixappsUrlParser.getPageSubItemId(siteData, urlData);
        if (!itemId) {
            return [];
        }

        var packageName = appService.packageName;
        var data = wixappsDataHandler.getDataByCompId(siteData, packageName, compData.id);

        if (data) {
            if (data[1] === itemId) {
                var videoItems = getVideoItems(siteData, packageName, data);
                return videoThumbDataHandler.handleVideoThumbUrls(videoItems, siteData);
            }
            wixappsDataHandler.clearDataForCompId(siteData, packageName, compData.id);
        }

        var defaultOptions = partsQueryMap[compData.appPartName].defaultOptions;

        var itemPath = [defaultOptions.collectionId, itemId];
        var dataItem = wixappsDataHandler.getDataByPath(siteData, packageName, itemPath);

        if (dataItem) {
            wixappsDataHandler.setDataForCompId(siteData, packageName, compData.id, itemPath);
            return [];
        }

        var params = {
            itemId: itemId
        };

        return partsQueryMap[compData.appPartName].method(siteData, compData, appService, params);
    }

    function getVideoItems(siteData, packageName, data) {
        if (_.isArray(data)) {
            if (_.isArray(data[0])) {
                return _(data)
                    .map(extractVideoPostsByRefs.bind(undefined, siteData, packageName))
                    .flattenDeep()
                    .compact()
                    .value();
            }

            return extractVideoPostsByRefs(siteData, packageName, data);
        }
        if (_.isObject(data)) {
            return extractVideoPosts(packageName, data);
        }
        return null;
    }

    function extractVideoPostsByRefs(siteData, packageName, path) {
        var postItem = wixappsDataHandler.getDataByPath(siteData, packageName, path);
        return extractVideoPosts(packageName, postItem, path);
    }

    function extractVideoPosts(packageName, postItem, itemPath) {
        itemPath = itemPath || [];
        var postItemBasePath = wixappsDataHandler.getSiteDataDestination(packageName).concat(['items']).concat(itemPath);

        var type = postItem && postItem._type;

        switch (type) {
            case 'MediaPost':
                return _.map(_.reject(postItem.mediaText.videoList, 'imageSrc'), function (videoItem) {
                    return {item: videoItem, path: postItemBasePath.concat(['mediaText', 'videoList'])};
                });
            case 'VideoPost':
                return !postItem.video.imageSrc && [
                    {item: postItem.video, path: postItemBasePath.concat(['video'])}
                ];
            default:
                return null;
        }
    }

    function readItem(siteData, compData, appService, params, urlData, transformationFn) {
        var defaultOptions = partsQueryMap[compData.appPartName].defaultOptions;
        var dataUrl = urlUtils.baseUrl(siteData.getExternalBaseUrl()) + "/apps/lists/1/ReadItem?consistentRead=false";

        var collectionId = params.collectionId || defaultOptions.collectionId;
        var itemId = params.itemId || defaultOptions.itemId;

        var postData = {
            autoDereferenceLevel: 3,
            collectionId: collectionId,
            itemId: itemId,
            storeId: appService.datastoreId
        };

        var transformFunc = transformationFn ? transformationFn : transformItemResponse;
        transformFunc = transformFunc.bind(undefined, compData.id, collectionId);

        return [
            {
                force: true,
                destination: wixappsDataHandler.getSiteDataDestination(appService.packageName),
                url: dataUrl,
                data: postData,
                transformFunc: transformAndSetMetaData.bind(this, transformFunc, siteData, appService.packageName, compData.id),
                timeout: TIMEOUT
            }
        ];
    }

    function readItemFromUrl(siteData, compData, appService, params, urlData) {
        var request;
        //this will work as long as we won't have item pages in popups
        var primaryRootInfo = siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId());
        var pageInfo = urlData ? _.assign(primaryRootInfo, urlData) : primaryRootInfo;
        if (pageInfo && pageInfo.pageAdditionalData) {
            if (siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH) && _.includes(pageInfo.pageAdditionalData, '/')) {
                var queryParams = wixapps.wixappsUrlParser.getAppPageParams(siteData, urlData);
                request = query(siteData, compData, appService, queryParams, urlData, transformSingleItemFromQuery);
            } else {
                var readItemParams = _.merge({}, params, {itemId: pageInfo.pageAdditionalData});
                request = readItem(siteData, compData, appService, readItemParams, urlData, transformItemResponseFromUrl);
            }
        } else {
            request = query(siteData, compData, appService, {"limit": 1, "itemId": "1"}, urlData, transformSingleItemFromQuery);
        }

        if (request && request.length) {
            delete request[0].timeout;
        }

        return request;
    }


    function query(siteData, compData, appService, params, urlData, transformationFn) {
        var defaultOptions = partsQueryMap[compData.appPartName].defaultOptions;
        var dataUrl = urlUtils.baseUrl(siteData.getExternalBaseUrl()) + "/apps/lists/1/Query?consistentRead=false";
        var transformItemsFn = transformationFn ? transformationFn : transformItemsResponse;
        var collectionId = params.collectionId || defaultOptions.collectionId;
        var appSpecificFilter = appSpecificFilterMap[collectionId].query;

        var getTotalCount = params.getTotalCount || defaultOptions.getTotalCount;
        var filter = _.merge(params.filter || defaultOptions.filter || {}, appSpecificFilter);
        if (_.isUndefined(filter.draft)) {
            filter.draft = false;
        }
        var sort = params.sort || defaultOptions.sort;
        var skip = parseInt(params.skip || defaultOptions.skip, 10) || 0;
        var limit = parseInt(params.limit || defaultOptions.limit, 10) || null;

        var postData = {
            autoDereferenceLevel: 3,
            collectionId: collectionId,
            storeId: appService.datastoreId,
            getTotalCount: getTotalCount,
            filter: filter,
            sort: sort,
            skip: skip,
            limit: limit
        };

        if (defaultOptions.fields) {
            postData.fields = defaultOptions.fields;
        }

        if (experiment.isOpen('wixappsPerformanceMeasuring') && !siteData.rendererModel.previewMode) {
            reportQueryStart(compData);
        }

        var wrappedTransformItemsFn = function () {
            if (experiment.isOpen('wixappsPerformanceMeasuring') && !siteData.rendererModel.previewMode) {
                reportQueryEnd(compData);
            }
            var args = [compData.id, collectionId].concat(Array.prototype.slice.call(arguments));
            return transformItemsFn.apply(undefined, args);
        };

        return [
            {
                force: true,
                destination: wixappsDataHandler.getSiteDataDestination(appService.packageName),
                url: dataUrl,
                data: postData,
                transformFunc: transformAndSetMetaData.bind(this, wrappedTransformItemsFn, siteData, appService.packageName, compData.id),
                timeout: TIMEOUT
            }
        ];
    }

    /**
     *
     * @param {core.SiteData} siteData
     * @param {string} packageName
     * @param {string} compId
     * @returns {utils.Store.requestDescriptor[]} requestDescriptors
     */
    function getVideoThumbRequests(siteData, packageName, compId) {
        var metaData = wixappsDataHandler.getCompMetadata(siteData, packageName, compId);
        var data = wixappsDataHandler.getDataByCompId(siteData, packageName, compId);
        var videoItems = getVideoItems(siteData, packageName, data);
        if (!videoItems || metaData.videos > 0) {
            return [];
        }

        var videoThumbRequests = videoThumbDataHandler.handleVideoThumbUrls(videoItems, siteData);
        var metadata = {videos: videoThumbRequests.length};
        if (videoThumbRequests.length === 0 && wixappsDataHandler.getDescriptor(siteData, packageName)) {
            wixappsDataHandler.clearCompMetadata(siteData, packageName, compId);
//            metadata.loading = false;
        } else {
            wixappsDataHandler.setCompMetadata(metadata, siteData, packageName, compId);
        }

        return _.map(videoThumbRequests, function (requestDesc) {
            if (requestDesc.transformFunc) {
                var originalTransformFunc = requestDesc.transformFunc;
                requestDesc.transformFunc = function () {
                    var result;
                    if (originalTransformFunc) {
                        result = originalTransformFunc.apply(this, arguments);
                    }
                    var remainingVideoRequests = metaData.videos - 1;
                    var descriptor = wixappsDataHandler.getDescriptor(siteData, packageName);
                    if (remainingVideoRequests === 0 && descriptor) {
                        wixappsDataHandler.clearCompMetadata(siteData, packageName, compId);
                    } else {
                        wixappsDataHandler.setCompMetadata({videos: remainingVideoRequests}, siteData, packageName, compId);
                    }
                    return result;
                };
            }

            return requestDesc;
        });
    }

    function queryFromUrlAndHandleMediaPost(siteData, compData, appService, params, urlData) {
        var DEFAULT_PAGE_SIZE = 10,
            MOBILE_PAGE_SIZE = 3;

        var defaultOptions = partsQueryMap[compData.appPartName].defaultOptions;

        var format = siteData.isMobileView() ? 'Mobile' : '';
        var defaultPageSize = siteData.isMobileView() ? MOBILE_PAGE_SIZE : DEFAULT_PAGE_SIZE;

        var numberOfPostsPerPage = numberOfPostsPerPageGetter.getNumberOfPostsPerPage(compData, format, defaultPageSize) ||
            _.min([defaultOptions.limit, params.limit]);
        params.limit = numberOfPostsPerPage;

        var pageParams = wixapps.wixappsUrlParser.getAppPageParams(siteData, urlData);
        if (!pageParams) {
            // This component is not in AppPage and can't be rendered.
            return [];
        }
        if (pageParams.page && Number(pageParams.page)) {
            params.skip = Number(pageParams.page) * numberOfPostsPerPage;
        }
        if (pageParams.filter && !_.isEmpty(pageParams.filter)) {
            params.filter = _.merge(params.filter || {}, pageParams.filter);
        }
        if (pageParams.categoryNames) {
            params.categoryNames = pageParams.categoryNames;
        }

        return queryAndHandleMediaPost(siteData, compData, appService, params, urlData);
    }

    function queryAndHandleMediaPost(siteData, compData, appService, params, urlData) {
        if (!blogCategories.extendParamsWithBlogCategoryFilter(siteData, params)) { // Are blog categories unready?
            return [];
        }

        return query(siteData, compData, appService, params, urlData, _.partial(transformMediaItemsResponse, _, _, _, _, getLang()));
    }

    function queryAndHandleMediaPostWithUrllessPagination(siteData, compData, appService, params, urlData) {
        var numberOfPostsPerPage = numberOfPostsPerPageGetter.getNumberOfPostsPerPage(compData);
        var currentPageNumber = appPartCommonDataManager.getAppPartCommonDataItem(compData.id, 'currentPageNumber', 1);
        var overridenParams = _.merge({}, params, {
            getTotalCount: true,
            limit: numberOfPostsPerPage,
            skip: (currentPageNumber - 1) * numberOfPostsPerPage
        });
        return queryAndHandleMediaPost(siteData, compData, appService, overridenParams, urlData);
    }

    function archiveGroupByAndCount(siteData, compData, appService, params, urlData) {
        var groupByAndCountRequest = groupByAndCount(siteData, compData, appService, params, urlData, transformArchiveItemsResponse);
        groupByAndCountRequest[0].callback = function () {
            var compDataRefs = wixappsDataHandler.getDataByCompId(siteData, appService.packageName, compData.id);
            var data = wixappsDataHandler.getDataByPath(siteData, appService.packageName, compDataRefs);
            var selectedItem;
            if (urlData && urlData.pageAdditionalData && urlData.pageAdditionalData.indexOf("Date/") === 0) {
                selectedItem = urlData.pageAdditionalData.replace("Date/", "");
            }
            if (data) {
                _.forEach(data.items, function (item) {
                    item.selected = item.value === selectedItem;
                });
            }
        };
        return groupByAndCountRequest;
    }

    function groupByAndCount(siteData, compData, appService, params, urlData, transformationFn) {
        var defaultOptions = partsQueryMap[compData.appPartName].defaultOptions;
        var dataUrl = urlUtils.baseUrl(siteData.getExternalBaseUrl()) + "/apps/lists/1/GroupByAndCount?consistentRead=false";

        var collectionId = params.collectionId || defaultOptions.collectionId;
        var appSpecificFilter = appSpecificFilterMap[collectionId].groupByAndCount;
        var field = params.field || defaultOptions.field;
        var filter = _.merge(params.filter || defaultOptions.filter || {}, appSpecificFilter);
        var project = params.project || defaultOptions.project;
        var type = params.type || defaultOptions.type;

        var postData = {
            collectionId: collectionId,
            storeId: appService.datastoreId,
            field: field,
            filter: filter,
            project: project,
            type: type
        };

        var options = {
            sort: params.sort || defaultOptions.sort,
            limit: params.limit || defaultOptions.limit,
            normalizeTo: params.normalizeTo || defaultOptions.normalizeTo
        };
        var transformGroupByFn = transformationFn ? transformationFn : transformGroupByResponse;

        if (experiment.isOpen('wixappsPerformanceMeasuring') && !siteData.rendererModel.previewMode) {
            reportQueryStart(compData);
        }

        var wrappedTransformGroupByFn = function() {
            if (experiment.isOpen('wixappsPerformanceMeasuring') && !siteData.rendererModel.previewMode) {
                reportQueryEnd(compData);
            }
            var args = [compData.id, collectionId, generateGroupByKey.bind(undefined, postData), options].concat(Array.prototype.slice.call(arguments));
            return transformGroupByFn.apply(undefined, args);
        };

        return [
            {
                force: true,
                destination: wixappsDataHandler.getSiteDataDestination(appService.packageName),
                url: dataUrl,
                data: postData,
                transformFunc: transformAndSetMetaData.bind(this, wrappedTransformGroupByFn, siteData, appService.packageName, compData.id),
                timeout: TIMEOUT
            }
        ];
    }

    var descriptorRequests = {};

    function getDescriptorUrl(siteData, packageName, isFallback) {
        var host = !isFallback ? siteData.santaBase : siteData.santaBaseFallbackUrl;
        if (_.last(host) !== '/') {
            host += '/';
        }

        return host + "static/wixapps/apps/" + packageName + "/descriptor.json";
    }

    /**
     *
     * @param {core.SiteData} siteData
     * @param {object} compInfo
     * @returns {utils.Store.requestDescriptor|null} requestDescriptors
     */
    function getDescriptorRequestIfNeeded(siteData, compInfo) {
        var appInnerId = compInfo.data.appInnerID;
        var appService = siteData.getClientSpecMapEntry(appInnerId);

        var packageName = appService.packageName;
        var descriptor = wixappsDataHandler.getDescriptor(siteData, appService.packageName);

        if (!descriptor) {
            descriptorRequests[packageName] = descriptorRequests[packageName] || [];
            descriptorRequests[packageName].push(compInfo.data.id);
            wixappsDataHandler.setCompMetadata({loading: true}, siteData, packageName, compInfo.data.id);
            if (descriptorRequests[packageName].length > 1) {
                return null;
            }
            var destination = wixappsDataHandler.getSiteDataDestination(packageName).concat(["descriptor"]);
            var descriptorUrl = getDescriptorUrl(siteData, packageName, false);
            return {
                urls: [descriptorUrl, getDescriptorUrl(siteData, packageName, true)],
                destination: destination,
                transformFunc: function (descriptorObj, currentValue) {
                    if (_.has(descriptorObj, 'generatedViews')) {
                        descriptorObj.views = descriptorObj.views.concat(descriptorObj.generatedViews);
                        delete descriptorObj.generatedViews;
                    }
                    _.assign(currentValue, descriptorObj);

                    _.forEach(descriptorRequests[packageName], function (compId) {
                        var metadata = wixappsDataHandler.getCompMetadata(siteData, packageName, compId);
                        if (metadata.dataReady) {
                            wixappsDataHandler.clearCompMetadata(siteData, packageName, compId);
                        }
                    });

                    descriptorRequests[packageName] = [];

                    return currentValue;
                },
                timeout: TIMEOUT,
                error: function () {
                    _.forEach(descriptorRequests[packageName], function (compId) {
                        wixappsDataHandler.setCompMetadata({hasError: -1}, siteData, packageName, compId);
                    });
                    descriptorRequests[packageName] = [];
                },
                onUrlRequestFailure: function (url, errName, err) {
                    if (url === descriptorUrl) {
                        var errorData = _.clone(wixappsLogger.errors.REQUEST_FAILED);
                        errorData.desc = errName ? errName : errorData.desc;
                        errorData.errorCode = err ? err : errorData.errorCode;
                        wixappsLogger.reportError(siteData, errorData);
                    }
                }
            };
        }
        return null;
    }

    // TODO: move this function to dataFixer when it will be plug-able from different packages.
    function migrateViewsWithProxyName(compInfo) {
        var viewName = compInfo.data.viewName;
        if (wixapps.proxyFactory.isValidProxyName(viewName)) {
            compInfo.data.viewName = viewName + 'View';
            _(compInfo.data.appLogicCustomizations)
                .filter({view: viewName})
                .forEach(function (customization) {
                    customization.view = compInfo.data.viewName;
                })
                .value();
        }
    }

    function getItemsRequests(getEcomRequests, getWixAppRequests, siteData, compData, packageName, appService, urlData) {
        var metadata = wixappsDataHandler.getCompMetadata(siteData, packageName, compData.id);
        if (metadata.dataReady) {
            return [];
        }

        var requests;
        try {
            switch (packageName) {
                case "ecommerce":
                    requests = getEcomRequests(siteData, compData, appService, urlData);
                    break;
                default:
                    requests = getWixAppRequests(siteData, compData, appService, urlData);
                    break;
            }
        } catch (e) {
            utils.log.error('appPartDataRequirementsChecker Error: ' + e);
            requests = [];
        }

        if (requests.length === 0) {
            var descriptor = wixappsDataHandler.getDescriptor(siteData, packageName);
            if (descriptor) {
                wixappsDataHandler.clearCompMetadata(siteData, packageName, compData.id);
            } else {
                var dataPath = wixappsDataHandler.getDataByCompId(siteData, packageName, compData.id);
                if (!dataPath || (dataPath && wixappsDataHandler.getDataByPath(siteData, packageName, dataPath))) {
                    wixappsDataHandler.setCompMetadata({dataReady: true}, siteData, packageName, compData.id);
                }
            }
        }

        return requests;
    }

    function getAppPartRequests(getEcomRequests, getWixAppRequests, disableTimeout, siteData, compInfo, urlData) {
        var appInnerId = compInfo.data.appInnerID;
        var appService = siteData.getClientSpecMapEntry(appInnerId);
        if (!appService) {
            return [];
        }
        var packageName = appService.packageName;

        var requests = getVideoThumbRequests(siteData, packageName, compInfo.data.id);
        var metadata = wixappsDataHandler.getCompMetadata(siteData, packageName, compInfo.data.id);
        if (metadata.hasError || (metadata.loading && !requests.length)) {
            return [];
        }

        migrateViewsWithProxyName(compInfo);
        var descriptorRequest = getDescriptorRequestIfNeeded(siteData, compInfo);
        if (descriptorRequest) {
            requests.push(descriptorRequest);
        }

        requests = requests.concat(blogCategories.queryBlogCategories(siteData, compInfo.data, appService));

        if (experiment.isOpen('sv_blogSettings')) {
            var blogRequests = blog.getRequests(siteData, compInfo.data, appService);
            requests = requests.concat(blogRequests);
        }

        requests = requests.concat(getItemsRequests(getEcomRequests, getWixAppRequests, siteData, compInfo.data, packageName, appService, urlData));

        if (disableTimeout) {
            _.forEach(requests, function (request) {
                delete request.timeout;
            });
        }

        _.forEach(requests, function (request) {
            request.error = request.error || function (error, res) {
                wixappsDataHandler.setCompMetadata({hasError: res || -1}, siteData, packageName, compInfo.data.id);
            };
        });

        lang = lang || utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl).toLowerCase() || 'en';

        return requests;
    }

    dataRequirementsChecker.registerCheckerForCompType("Zoom:AppPart", getAppPartRequests.bind(this, ecomDataRequirementsChecker.checkZoomDataRequirements, createZoomDataRequest, true));

    if (experiment.isOpen('sv_listsBatchRequest')) {
        dataRequirementsChecker.registerCheckerForAllCompsOfType('wixapps.integration.components.AppPart', function (siteData, compInfos, urlData) {
            var requests = _.reduce(compInfos, function (compsRequests, compInfo) {
                var compRequests = getRequestsForAppPart(siteData, compInfo, urlData);
                return compsRequests.concat(compRequests);
            }, []);
            return batchableListsRequestsMerger.mergeBatchableListsRequestsIfAny(siteData, requests);
        });
    } else {
        dataRequirementsChecker.registerCheckerForCompType("wixapps.integration.components.AppPart", getRequestsForAppPart);
    }

    function getRequestsForAppPart(siteData, compInfo, urlData) {
        var timeoutIsDisabled = false;
        return getAppPartRequests(
            ecomDataRequirementsChecker.checkDataRequirements, createPartDataRequest, timeoutIsDisabled,
            siteData, compInfo, urlData
        );
    }
});
