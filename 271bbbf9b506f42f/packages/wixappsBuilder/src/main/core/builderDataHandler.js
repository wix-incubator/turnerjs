define([
    "lodash",
    "utils",
    "coreUtils",
    "wixappsCore",
    'wixappsBuilder/util/viewsTemplatesData',
    'wixappsBuilder/util/viewsTemplatesUtils',
    'wixappsBuilder/core/appRepo',
    'wixappsBuilder/core/appPart2DataFetchingStateManager',
    'wixappsBuilder/core/dataSelectorFactory'
], function (_, /** utils */ utils, coreUtils, /** wixappsCore */ wixapps, viewsTemplatesData, viewsTemplatesUtils, /** appRepo */ appRepo, dataFetchingStateManager, dataSelectorFactory) {
    'use strict';

    var TIMEOUT = 150;

    var objectUtils = utils.objectUtils;

    var wixappsDataHandler = wixapps.wixappsDataHandler;
    var wixappsLogger = wixapps.wixappsLogger;

    function siteNeverSaved(siteData) {
        // TODO: documentServicesModel should only be used in documentServices. need to find another way to know if a site was saved before or not.
        return siteData.documentServicesModel && siteData.documentServicesModel.neverSaved;
    }

    function clearLoadingStateFromAllPartsOfType(siteData, appService, typeId) {
        var repo = wixappsDataHandler.getDescriptor(siteData, appService.type);
        var partNames = appRepo.getNamesOfPartsOfType(repo, typeId);
        _.forEach(partNames, dataFetchingStateManager.clearPartLoadingState.bind(null, siteData, appService));
    }

    function setAllPartsOfTypeAsErroneous(siteData, appService, typeId) {
        var repo = wixappsDataHandler.getDescriptor(siteData, appService.type);
        var partNames = appRepo.getNamesOfPartsOfType(repo, typeId);
        _.forEach(partNames, dataFetchingStateManager.setPartAsErroneous.bind(null, siteData, appService));
    }

    /**
     * Convert the AppRpo that return from the server to the one we work with in the client.
     * @param repo
     * @returns {AppRepoDefinition}
     */
    function transformAppRepo(repo) {
        repo = ensureRepoFields(repo);
        var views = _.transform(repo.views, function (result, viewDef) {
            var id = wixapps.viewsUtils.getViewId(viewDef.forType, viewDef.name, viewDef.format);
            result[id] = viewDef;
        }, {});
        var dataSelectors = _.transform(repo.dataSelectors, function (result, dataSelectorDef) {
            result[dataSelectorDef.id] = dataSelectorDef;
        }, {});
        var types = _.transform(repo.types, function (result, typeDef) {
            result[typeDef.name] = typeDef;
        }, {});

        return _.defaults({
            views: views,
            dataSelectors: dataSelectors,
            types: types,
            offsetFromServerTime: new Date() - new Date(repo.serverTime)
        }, repo);
    }

    function restorePaginationSettings(originalView, targetView) {
        if (originalView.forType !== 'Array') {
            return;
        }

        var compDefSettings;
        wixapps.viewsUtils.traverseViews(originalView, function (viewDef) {
            if (viewDef.comp && viewDef.comp.name === 'PaginatedList') {
                compDefSettings = _.pick(viewDef.comp, ['hidePagination', 'itemsPerPage']);
                return false;
            }
        });

        if (compDefSettings) {
            wixapps.viewsUtils.traverseViews(targetView, function (viewDef) {
                if (viewDef.comp && viewDef.comp.name === 'PaginatedList') {
                    _.assign(viewDef.comp, compDefSettings);
                    return false;
                }
            });
        }
    }

    function getActiveParts(siteData) {
        var allPageIds = siteData.getAllPageIds().concat('masterPage');
        return _(allPageIds)
            .filter(siteData.getPageData, siteData)
            .map(function (pageId) {
                var comps = coreUtils.dataUtils.getAllCompsInStructure(siteData.getPageData(pageId).structure, false, function (comp) {
                    return comp.componentType === 'wixapps.integration.components.AppPart2';
                });

                return _.map(comps, function (comp) {
                    return _.get(siteData.getDataByQuery(comp.dataQuery, pageId), 'appPartName');
                });
            })
            .flatten()
            .value();
    }

    /**
     *  performs validations on the returned repo and do stuff accordingly (such as fixing and report to BI)
     * @param siteData
     * @param repo
     */
    function validateAppRepoAndFix(siteData, repo) {
        repo.views = _.reduce(getActiveParts(siteData), function (views, partName) {
            var part = repo.parts[partName];
            if (!part) {
                return views;
            }

            var dataSelectorId = part.dataSelector || (part.dataSelectorDef && part.dataSelectorDef.id);
            if (!repo.dataSelectors[dataSelectorId]) {
                wixappsLogger.reportEvent(siteData, wixappsLogger.events.APP_PART2_FAILED_TO_LOAD_DATA_SELECTOR,
                    {dataSelector: part.dataSelector});
            }

            if (!_.has(repo.types, part.type)) {
                // the type doesn't exist, so we can't generate a matching view
                return views;
            }

            var possibleViews = [
                {forType: 'Array', name: part.viewName},
                {forType: 'Array', name: part.viewName, format: 'Mobile'},
                {forType: part.type, name: part.viewName},
                {forType: part.type, name: part.viewName, format: 'Mobile'}
            ];

            _.forEach(possibleViews, function (possibleView) {
                var viewId = _.compact([possibleView.forType, possibleView.name, possibleView.format]).join('|');

                if (repo.views[viewId]) {
                    // no need to generate a view
                    views[viewId] = repo.views[viewId];
                    return;
                }

                var partType = repo.types[part.type];
                var generateView = viewsTemplatesUtils.generateView(viewsTemplatesData[part.version || 'default'], possibleView, partType);
                var desktopView = repo.views[possibleView.forType + '|' + possibleView.name];
                if (desktopView) {
                    restorePaginationSettings(desktopView, generateView);
                }
                views[viewId] = generateView;
            });

            return views;
        }, {});

        _.forEach(repo.dataSelectors, function (dataSelector) {
            if (dataSelector.itemIds && dataSelector.itemIds.length) {
                var newItemIds = _.compact(dataSelector.itemIds);
                if (newItemIds.length !== dataSelector.itemIds.length) {
                    wixappsLogger.reportError(siteData, wixappsLogger.errors.DATA_SELECTOR_CONTAINS_NULL);
                    dataSelector.itemsIds = newItemIds;
                }
            }
            if (dataSelector.hiddenItemIds && dataSelector.hiddenItemIds.length) {
                dataSelector.itemIds = _.difference(dataSelector.itemIds, dataSelector.hiddenItemIds);
            }
        });

        _.forEach(repo.views, function (view) {
            var badStylesheets = objectUtils.filter(view, function (o) {
                return _.isPlainObject(o) &&
                    _.has(o, "color") &&
                    _.has(o.color, "$expr") &&
                    /Theme\.getColor\([^)]*/.test(o.color.$expr);
            });
            _.forEach(badStylesheets, function (stylesheet) {
                delete stylesheet.color;
            });
        });
    }

    function ensureRepoFields(repo) {
        repo = repo || {};
        repo.views = repo.views || {};
        repo.types = repo.types || {};
        repo.dataSelectors = repo.dataSelectors || {};
        repo.parts = repo.parts || {};
        return repo;
    }

    function transformBundledPartsData(siteData, responseData, currentValue) {
        if (!responseData.success) {
            return {};
        }
        var resData = responseData.payload;

        if (!resData.repo && resData.blob) {
            resData.repo = JSON.parse(resData.blob);
        }
        resData.repo = transformAppRepo(resData.repo);

        _.forEach(resData.repo, function (repo, field) {
            objectUtils.ensurePath(currentValue, ["descriptor", field]);
            _.forEach(repo, function (value, key) {
                objectUtils.setInPath(currentValue, ["descriptor", field, key], value);
            });
        });

        objectUtils.ensurePath(currentValue, ["descriptor", "types"]);
        _.forEach(resData.types, function (type) {
            objectUtils.setInPath(currentValue, ["descriptor", "types", type.name], type);
            objectUtils.ensurePath(currentValue, ["items", type.name]);
        });

        objectUtils.ensurePath(currentValue, ["descriptor", "tags"]);
        _.forEach(resData.tags, function (value, key) {
            objectUtils.setInPath(currentValue, ["descriptor", "tags", key], value);
        });

        objectUtils.setInPath(currentValue, ["descriptor", "applicationInstanceVersion"], resData.version);

        _.forEach(resData.items, function (item) {
            objectUtils.setInPath(currentValue, ["items", item._type, item._iid], item);
        });

        validateAppRepoAndFix(siteData, currentValue.descriptor);

        return currentValue;
    }

    function getBundledPartsDataRequest(siteData, appService, partNames) {
        var urlData = utils.wixUrlParser.parseUrl(siteData, siteData.currentUrl.full);
        var destination = wixappsDataHandler.getSiteDataDestination(appService.type);
        _.forEach(partNames, dataFetchingStateManager.setPartLoadingState.bind(null, siteData, appService));

        var request = {
            url: utils.urlUtils.baseUrl(siteData.currentUrl.full) + '/apps/appBuilder/1/viewer/GetAppPartData',
            force: true,
            destination: destination,
            data: {
                applicationInstanceId: appService.instanceId,
                appPartIds: partNames,
                itemIds: _.compact([urlData.pageAdditionalData])
            },
            transformFunc: function (responseData, currentValue) {
                if (!responseData) {
                    _.forEach(partNames, dataFetchingStateManager.setPartAsErroneous.bind(null, siteData, appService));
                    return currentValue || {};
                }

                _.forEach(partNames, dataFetchingStateManager.clearPartLoadingState.bind(null, siteData, appService));
                return transformBundledPartsData(siteData, responseData, currentValue);
            },
            error: function () {
                _.forEach(partNames, dataFetchingStateManager.setPartAsErroneous.bind(null, siteData, appService));
            },
            timeout: TIMEOUT
        };

        return [request];
    }

    function getApplicationRepoRequest(siteData, appService) {
        dataFetchingStateManager.setPackageLoadingState(siteData, appService);

        var savedOrPublished = siteNeverSaved(siteData) ? 'published' : 'saved';
        var url = utils.urlUtils.baseUrl(siteData.currentUrl.full) + '/apps/appBuilder/' + savedOrPublished + '/' + appService.instanceId; // only used by editor
        var destination = wixappsDataHandler.getSiteDataDestination(appService.type).concat(['descriptor']);

        return {
            url: url,
            force: true,
            destination: destination,
            transformFunc: function (responseData) {
                if (!responseData.success) {
                    dataFetchingStateManager.setPackageAsErroneous(siteData, appService); //TODO: Do we want the package to be erroneous?
                    return ensureRepoFields(); //return empty repo
                }
                dataFetchingStateManager.clearPackageLoadingState(siteData, appService);
                var repo = transformAppRepo(responseData.payload);
                validateAppRepoAndFix(siteData, repo);

                return repo;
            },
            error: dataFetchingStateManager.setPackageAsErroneous.bind(null, siteData, appService)
        };
    }

    function getAppPartDataRequest(siteData, appService, partName, urlData) {
        var setPartAsErroneous = dataFetchingStateManager.setPartAsErroneous.bind(null, siteData, appService, partName);

        if (dataFetchingStateManager.isPackageErroneous(siteData, appService)) {
            setPartAsErroneous();
            return null;
        }

        var repo = wixappsDataHandler.getDescriptor(siteData, appService.type);
        var dataSelector = appRepo.getDataSelector(repo, partName, siteData, appService, repo.applicationInstanceVersion);

        if (!dataSelector) {
            return null;
        }

        dataFetchingStateManager.setPartLoadingState(siteData, appService, partName);

        return dataSelector.getRequest(
            urlData,
            dataFetchingStateManager.clearPartLoadingState.bind(null, siteData, appService, partName),
            setPartAsErroneous);
    }

    function getAllItemsOfTypeRequest(siteData, appService, typeId) {
        var dataSelectorDef = {
            logicalTypeName: 'IB.AllItemsOfType',
            forType: typeId
        };

        var repo = wixappsDataHandler.getDescriptor(siteData, appService.type);
        var dataSelector = dataSelectorFactory.getDataSelector(dataSelectorDef, siteData, appService, repo.applicationInstanceVersion);
        return dataSelector.getRequest(
            null,
            clearLoadingStateFromAllPartsOfType.bind(null, siteData, appService, typeId),
            setAllPartsOfTypeAsErroneous.bind(null, siteData, appService, typeId)
        );
    }

    return {
        transformAppRepo: transformAppRepo,
        transformBundledPartsData: transformBundledPartsData,
        ensureRepoFields: ensureRepoFields,
        getBundledPartsDataRequest: getBundledPartsDataRequest,
        getApplicationRepoRequest: getApplicationRepoRequest,
        getAppPartDataRequest: getAppPartDataRequest,
        getAllItemsOfTypeRequest: getAllItemsOfTypeRequest
    };
});
