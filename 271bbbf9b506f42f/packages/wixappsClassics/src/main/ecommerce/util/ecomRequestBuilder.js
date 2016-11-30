define(['lodash',
    'utils',
    "wixappsCore",
    'wixappsClassics/ecommerce/util/responseTransformation',
    "wixappsClassics/ecommerce/util/ecomLogger",
    'wixappsClassics/ecommerce/util/ecomDataUtils',
    "experiment"
], function (_, utils, /** wixappsCore */wixapps, responseTransformation, /** wixappsCore.ecomLogger */ecomLogger, ecomDataUtils, experiment) {
    "use strict";

    var wixappsDataHandler = wixapps.wixappsDataHandler;
    var API_URL_SEGMENT = '/apps/ecommerce/api/json';
    var FALLBACK_API_URL_SEGMENT = 'https://fallback.wix.com/_api/ecommerce/api/json';
    var MIGRATION_API_URL_SEGMENT = "/_api/wix-ecommerce-migration-web/apps/ecommerce/api/json";
    var MIGRATION_FALLBACK_API_URL_SEGMENT = 'https://fallback.wix.com/_api/wix-ecommerce-migration-web/_api/ecommerce/api/json';
    var OUTER_DEFAULT_CATEGORY = 'defaultCategory';
    var INNER_DEFAULT_CATEGORY = '-1';
    var TIMEOUT = 150;

    function getApiUrl(siteData, isReadOnly, isFallback) {
        var eComMigrationViewerExp = experiment.isOpen('ecommigrationviewer');
        var apiUrl = eComMigrationViewerExp ? MIGRATION_API_URL_SEGMENT : API_URL_SEGMENT;
        var fallbackApiUrl = eComMigrationViewerExp ? MIGRATION_FALLBACK_API_URL_SEGMENT : FALLBACK_API_URL_SEGMENT;
        var baseUrl = isFallback ? fallbackApiUrl : (utils.urlUtils.baseUrl(siteData.currentUrl.full) + apiUrl);
        var siteUrl = baseUrl + "?metaSiteId=" + siteData.getMetaSiteId() +
            "&svSession=" + siteData.getSvSession();
        if (isReadOnly) {
            siteUrl += '&ro=true';
        }
        return siteUrl;
    }

    function getDefaultCompMetadata() {
        return {
            isReadOnly: false,
            isOnline: true
        };
    }

    function transformAndSetMetaData(transformFunc, siteData, packageName, compId, responseData, currentValue) {
        transformFunc(responseData, currentValue);

        var descriptor = wixappsDataHandler.getDescriptor(siteData, packageName);
        var compData = wixappsDataHandler.getDataByPath(siteData, packageName, wixappsDataHandler.getDataByCompId(siteData, packageName, compId));
        if (descriptor && compData) {
            wixappsDataHandler.clearCompMetadata(siteData, packageName, compId);
        } else {
            wixappsDataHandler.setCompMetadata({dataReady: true}, siteData, packageName, compId);
        }

        return currentValue;
    }

    function buildRequest(siteData, compData, packageName, additionalParams, compMetadata) {
        compMetadata = compMetadata || getDefaultCompMetadata();

        var transformFunc;

        if (compMetadata.transformFunc) {
            if (compMetadata.customTransform) {
                transformFunc = compMetadata.transformFunc;
            } else {
                transformFunc = responseTransformation.transformResponse.bind(this, compData && compData.id, compMetadata.transformFunc);
            }
        }

        var urls = [getApiUrl(siteData, compMetadata.isReadOnly, false), getApiUrl(siteData, compMetadata.isReadOnly, true)];
        var request = {
            force: true,
            urls: urls,
            data: buildParams(siteData, compMetadata, compData, additionalParams),
            destination: wixappsDataHandler.getSiteDataDestination(packageName),
            transformFunc: transformAndSetMetaData.bind(this, transformFunc, siteData, packageName, compData && compData.id),
            timeout: TIMEOUT,
            callback: onEcomRequestSuccess.bind(this, compMetadata.action, siteData),
            error: createFailCallback(siteData, compMetadata.onError),
            onUrlRequestFailure: function (url) {
                if (url === urls[0]) {
                    ecomLogger.reportError(siteData, ecomLogger.errors.ATNT_FIX);
                }
            }
        };
        return request;
    }

    function createFailCallback(siteData, onErrorCallback) {
        return function(error, response) {
            if (onErrorCallback) {
                onErrorCallback({code: response, statusText: error});
            }
            onEcomRequestFailure(siteData);
        };
    }

    function onEcomRequestSuccess(action, siteData/*, currentValue, response*/){
        ecomLogger.reportEvent(siteData, ecomLogger.events.MAGENTO_CLIENT_SUCCESS, {
            action: action
        });
    }

    function onEcomRequestFailure(siteData, err, response){
        ecomLogger.reportError(siteData, err, response);
    }

    function transformParamsForDefaultStore (params) {
        var categoryId = params.categoryId;

        //default data has -1 on wixId to notify we have to use default collection
        if (params && params.wixId && params.wixId === "-1") {
            params.wixId = categoryId && categoryId !== INNER_DEFAULT_CATEGORY ? categoryId : OUTER_DEFAULT_CATEGORY;
        }

        //some templates do not have 'categoryId' so if the field is still on params also use default collection
        if (params && params.wixId && params.wixId === "categoryId") {
            params.wixId = categoryId && categoryId !== INNER_DEFAULT_CATEGORY ? categoryId : OUTER_DEFAULT_CATEGORY;
        }
    }


    function buildParams(siteData, compMetadata, compData, additionalParams) {
        var storeId = wixappsDataHandler.getDataByPath(siteData, ecomDataUtils.packageName, ['storeId']);
        var compDataParams = compData && compData.appLogicParams;
        var params = {
            storeId: storeId
        };
        if (compMetadata.params) {
            _.forOwn(compMetadata.params, function (value, key) {
                params[key] = (compDataParams[value] && compDataParams[value].value) || value;

            });
        }
        if (additionalParams) {
            _.forOwn(additionalParams, function (value, key) {
                params[key] = value;
            });
        }

        //if we need custom transformations on the params object (i.e. on default store)
        transformParamsForDefaultStore(params);

        return {
            jsonrpc: "2.0",
            id: 1,
            method: "frontend",
            params: [
                compMetadata.action,
                [
                    params
                ]
            ]
        };
    }

    return {
        buildRequest: buildRequest
    };

});
