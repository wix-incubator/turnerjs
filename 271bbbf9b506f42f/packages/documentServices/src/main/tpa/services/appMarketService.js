define(['lodash',
        'bluebird',
        'utils',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/tpa/constants',
        'documentServices/tpa/utils/AppMarketUrlBuilder',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/services/appMarketCacheService',
        'documentServices/tpa/services/billingService',
        'experiment'
], function (_, Promise, utils, siteMetadata, tpaConstants, AppMarketUrlBuilder, installedTpaAppsOnSiteService, cache, billing, experiment) {

    'use strict';

    var permissionsUrlTemplate = _.template('#/permission-request?appId=<%= appId %>');
    var appInfoUrlTemplate = _.template('#/<%= appName %>/<%= tab %>');
    var pricedAppUrl = _.template('<%= appMarketEditorAPIUrl %><%= appDefinitionId %>/priced-app?metaSiteId=<%= metaSiteId %>&lang=<%= lang %>');
    var relatedAppsUrl = _.template('<%= appMarketEditorAPIUrl %>?market=related_apps');
    var marketAPIBulk = _.template('<%= appMarketEditorAPIUrl %>?id=<%= appDefinitionIds %>');
    var premiumUrlTemplate = _.template('<%= premiumBaseUrl %>?appInstanceId=<%= instanceId %>&appDefinitionId=<%= appDefinitionId %>&paymentCycle=<%= cycle %>&vendorProductId=<%= vendorProductId %>');

    var getAppMarketTopology = function (ps) {
        var serviceTopology = ps.pointers.general.getServiceTopology();
        var premiumStatePointer = ps.pointers.getInnerPointer(serviceTopology, 'appMarketEditorApiUrl');
        return ps.dal.get(premiumStatePointer) + '/';
    };

    function updateResponseWithCacheData(appDefinitionId, response) {
        if (experiment.isOpen('appMarketCache')) {
            var dataFromCache = cache.get(appDefinitionId);
            if (dataFromCache) {
                response = _.merge(response, dataFromCache);
            }
        }
        return response;
    }

    var callServerWith = function (ps, appDefinitionId, options, resolve, reject) {
        cache.lock(appDefinitionId);
        var ajaxLibrary = utils.ajaxLibrary;
        var metaSiteId = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.META_SITE_ID);
        var lang = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE) || 'en';
        ajaxLibrary.ajax({
            type: 'GET',
            url: pricedAppUrl({
                appMarketEditorAPIUrl: getAppMarketTopology(ps),
                appDefinitionId: appDefinitionId,
                metaSiteId: metaSiteId,
                lang: lang
            }),
            success: function(response) {
                response = updateResponseWithCacheData(appDefinitionId, response);
                response = cache.set(appDefinitionId, response);
                cache.unlock(appDefinitionId);
                if (resolve) {
                    resolve(response);
                }
            },
            error: function () {
                //TODO - send bi message
                cache.unlock(appDefinitionId);
                if (resolve) {
                    resolve({
                        error: 'app market response error for appDefinitionId: ' + appDefinitionId
                    });
                } else if (reject) {
                    reject({
                        error: 'app market response error for appDefinitionId: ' + appDefinitionId
                    });
                }
            }
        });
    };

    var getAppMarketDataAsync = function (ps, appDefinitionId, options) {
        return new Promise(function (resolve, reject) {
            if (_.isUndefined(appDefinitionId)) {
                reject({
                    error: 'appDefinitionId was not given'
                });
                //TODO - send bi message
            } else {
                var dataFromCache = cache.get(appDefinitionId);
                if (dataFromCache && hasPriceData(dataFromCache)) {
                    resolve(dataFromCache);
                } else {
                    callServerWith(ps, appDefinitionId, options, resolve, reject);
                }
            }
        });
    };

    var getAppMarketData = function (ps, appDefinitionId, options) {
        var dataFromCache = cache.get(appDefinitionId);
        if (shouldMakeAServerRequest(appDefinitionId)) {
            callServerWith(ps, appDefinitionId, options);
        }
        return dataFromCache;
    };

    var hasPriceData = function (data) {
        return data && data.price;
    };

    var shouldMakeAServerRequest = function (appDefinitionId) {
        var dataFromCache = cache.get(appDefinitionId);
        var requestInProgress = cache.isLocked(appDefinitionId);
        return requestInProgress !== 1 && (_.isUndefined(dataFromCache) || !hasPriceData(dataFromCache));
    };

    var getAppMarketUrl = function (ps, editorParams) {
        var serviceTopology = ps.pointers.general.getServiceTopology();
        var premiumStatePointer = ps.pointers.getInnerPointer(serviceTopology, 'appMarketEditorNewUrl');
        var appMarketBaseUrl = ps.dal.get(premiumStatePointer);
        if (experiment.isOpen('reactAppMarket') && editorParams.newUrl) {
            appMarketBaseUrl = appMarketBaseUrl.replace('wix-app-market', 'one-app-market');
        }
        var appMarketUrlBuilder = new AppMarketUrlBuilder(appMarketBaseUrl);
        var lang = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE) || 'en';
        var compId = 'MarketPanel';
        var metaSiteId = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.META_SITE_ID);
        var siteId = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.SITE_ID);
        var isNewWixStores = 'true'; //TODO TPA-DEPENDENCY-NOT-READY Needs to be implemented by IdoK's team in 1-2 weeks

        return appMarketUrlBuilder.addOriginParam(editorParams.origin)
            .addDevAppParam(editorParams.appDefinitionId)
            .addLangParam(lang)
            .addAppMarketTests(editorParams.tests)
            .addCompIdParam(compId)
            .addMetaSiteIdParam(metaSiteId, editorParams.newUrl)
            .addSiteIdParam(siteId)
            .addTagsParam(editorParams.query)
            .addOpenAppParam(editorParams.openAppDefId)
            .addNewWixStores(isNewWixStores)
            .addCategoryParam(editorParams.categorySlug)
            .addBiReferralInfoParam(editorParams.openMarketOrigin)
            .addBiReferralInfoCategoryParam(editorParams.referralInfoCategory)
            .addBiSectionParam(editorParams.section)
            .addAddingMethodParam(editorParams.addingMethod)
            .build();
    };

    var getAppMarketBulkUrl = function (ps, appDefinitionIds) {
        var base = getAppMarketTopology(ps);
        var url = marketAPIBulk({
            appMarketEditorAPIUrl: base,
            appDefinitionIds: appDefinitionIds.toString()
        });
        return url;
    };

    var getUncachedPageApps = function (ps, pageId) {
        var apps = installedTpaAppsOnSiteService.getInstalledAppsOnPage(ps, pageId);
        var appDefinitionIds = _.pluck(apps, 'appDefinitionId');
        var cachedAppDefinitionIds = cache.keys();
        var uncachedAppDefinitionIds = _.remove(appDefinitionIds, function(appDefId) {
            return !_.includes(cachedAppDefinitionIds, appDefId);
        });
        return uncachedAppDefinitionIds;
    };

    /* gets market data with no price data */
    var getAppMarketDataForPage = function (ps, pageId, resolve, reject) {
        if (_.isUndefined(pageId)) {
            if (reject) {
                reject({
                    error: 'pageId was not given'
                });
            }
        } else {
            var appDefinitionIds = getUncachedPageApps(ps, pageId);
            if (_.isEmpty(appDefinitionIds)) {
                return;
            }
            var url = getAppMarketBulkUrl(ps, appDefinitionIds);
            utils.ajaxLibrary.ajax({
                type: 'GET',
                url: url,
                success: function(apps) {
                    _.forEach(apps, function(app) {
                        app = updateResponseWithCacheData(app.appDefinitionId, app);
                        cache.set(app.appDefinitionId, app);
                    });
                    if (resolve) {
                        resolve(apps);
                    }
                },
                error: function () {
                    //TODO - send bi message
                    if (resolve) {
                        resolve({
                            error: 'app market response error for appDefinitionIds: ' + appDefinitionIds.toString()
                        });
                    } else if (reject) {
                        reject({
                            error: 'app market response error for appDefinitionIds: ' + appDefinitionIds.toString()
                        });
                    }
                }
            });
        }
    };

    var getRelatedAppsUrl = function (ps) {
        var base = getAppMarketTopology(ps);
        var url = relatedAppsUrl({
            appMarketEditorAPIUrl: base
        });
        return url;
    };

    var getRelatedApps = function (ps, onSuccess, onError) {
        var url = getRelatedAppsUrl(ps);
        utils.ajaxLibrary.ajax({
            type: 'GET',
            url: url,
            data: {},
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                onSuccess(relatedAppsNeededData(data));
            },
            error: onError
        });
    };

    var getAppMarketInfoUrl = function (ps, editorParams, appName) {
        var url = getAppMarketUrl(ps, editorParams)
            .concat(appInfoUrlTemplate({
                appName: appName,
                tab: 'overview'
            }));
        return url;
    };

    var getAppReviewsUrl = function (ps, editorParams, appName) {
        var url = getAppMarketUrl(ps, editorParams)
            .concat(appInfoUrlTemplate({
                appName: appName,
                tab: 'reviews'
            }));
        return url;
    };

    var getAppMarketPermissionsUrl = function (ps, editorParams, appId) {
        var url = getAppMarketUrl(ps, editorParams)
            .concat(permissionsUrlTemplate({
                appId: appId
            }));
        return url;
    };

    function updateCacheWithUpgradeToYearly(data, packageData) {
        data = _.merge(data, {
            upgradedToYearly: billing.isYearly(packageData)
        });
        cache.set(packageData.appDefinitionId, data);
    }

    var requestPremiumAppsCycleToBeCached = function (ps, json, callback) {
        _.forEach(json.tpaPackages, function(packageData){
            if (experiment.isOpen('appMarketCache')) {
                var dataFromCache = cache.get(packageData.appDefinitionId);
                if (!dataFromCache) {
                    callServerWith(ps, packageData.appDefinitionId, {}, function (data) {
                        updateCacheWithUpgradeToYearly(data, packageData);
                    });
                } else {
                    updateCacheWithUpgradeToYearly(dataFromCache, packageData);
                }
            } else {
                cache.set(packageData.appDefinitionId, {
                    upgradedToYearly: billing.isYearly(packageData)
                });
            }
        });

        if (_.isFunction(callback)) {
            callback(json.tpaPackages);
        }
    };

    var getPremiumApps = function(ps, metasiteId, onSuccess, onError) {
        billing.getPremiumApps(ps, metasiteId, function (premiumApps) {
            requestPremiumAppsCycleToBeCached(ps, premiumApps, onSuccess);
        }, onError);
    };

    var relatedAppsNeededData = function (data) {
        if (!_.isArray(data)) {
            data = [data];
        }
        return _.map(data, function (app) {
            return {
                appDefinitionId: app.appDefinitionId,
                slug: app.slug,
                widgets: app.widgets,
                name: app.name,
                appIcon: app.appIcon,
                weights: app.weights,
                categories: app.categories,
                by: app.by,
                relatedAppsTeaser: app.relatedAppsTeaser,
                description: app.description,
                hasSection: app.hasSection
            };
        });
    };


    function setPurchaseUrl(json, baseUrl, instanceId, appDefinitionId, cycle) {
        if (json.hasOwnProperty(cycle)) {
            if (json[cycle].hasOwnProperty('price')) {
                json[cycle].url = premiumUrlTemplate({
                    premiumBaseUrl: baseUrl,
                    instanceId: instanceId,
                    appDefinitionId: appDefinitionId,
                    cycle: _.findKey(tpaConstants.CYCLE, function (value) {
                        return value === cycle;
                    }),
                    vendorProductId: json.id
                });
            } else {
               delete json[cycle];
            }
        }
    }

    var getPackages = function (ps, appDefinitionId, instanceId) {
        return new Promise(function (resolve, reject) {
            getAppMarketDataAsync(ps, appDefinitionId).then(function (appMarketData) {
                if (appMarketData.error) {
                    reject(appMarketData);
                } else {
                    var premiumBaseUrl = appMarketData.purchaseStartUrl;
                    var priceRelevantData = _.pick(appMarketData.price, 'currencyCode', 'currencySymbol');
                    var result = _.map(appMarketData.packages, function (packageJson) {
                        var refactoredJson = _.assign(_.cloneDeep(packageJson), priceRelevantData);
                        _.forEach(tpaConstants.CYCLE, function (cycle) {
                            setPurchaseUrl(refactoredJson, premiumBaseUrl, instanceId, appDefinitionId, cycle);
                        });
                        return refactoredJson;
                    });
                    resolve(result);
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    };

    return {
        getAppMarketDataAsync: getAppMarketDataAsync,
        getAppMarketData: getAppMarketData,
        getAppMarketDataForPage: getAppMarketDataForPage,
        requestAppMarketDataToBeCached: getAppMarketData,
        getAppMarketUrl: getAppMarketUrl,
        getAppMarketInfoUrl: getAppMarketInfoUrl,
        getAppReviewsUrl: getAppReviewsUrl,
        getAppMarketPermissionsUrl: getAppMarketPermissionsUrl,
        getRelatedApps: getRelatedApps,
        getPremiumApps: getPremiumApps,
        relatedAppsNeededData: relatedAppsNeededData,
        getPackages: getPackages
    };
});
