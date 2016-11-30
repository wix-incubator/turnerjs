define(['lodash', 'zepto', 'coreUtils/core/requestsUtil', 'wixCodeInit', 'coreUtils/core/errorPages', 'coreUtils/core/logWixCodeConsoleMessage'], function (_, $, requestsUtil, wixCodeInit, errorPages, logWixCodeConsoleMessage) {
    'use strict';

    function getBackendRequestUrl(currentUrl, clientSpecMap, routerDefinition, isSiteMap){
        var domainForRouter = currentUrl.host;
        var constantPath = '/_api/cloud-dispatcher/public';
        var isWixCode = routerDefinition.appDefinitionId === 'wix-code';
        var routerType = isWixCode ? '/custom' : '/data-binding';
        return 'http://' + domainForRouter + constantPath + routerType + (isSiteMap ? '/sitemap' : '/pages');
    }

    function getUrlParams(clientSpecMap, scari, isEditor){
        var viewMode = 'viewMode=' + (isEditor ? 'editor' : 'site');
        var instance = 'instance=' + wixCodeInit.specMapUtils.getAppSpec(clientSpecMap).instance;
        var _scari = 'scari=' + scari;
        return '?' + [viewMode, instance, _scari].join('&');
    }

    function getBackendRequestObject(pageRoles, suffix, routerDefinition){
        var routerConfig = _.isString(routerDefinition.config) ? JSON.parse(routerDefinition.config) : routerDefinition.config;
        //todo - temporarly send the /<prefix>/<suffix> in the fullUrl parameter, just until the router backend will be fixed to use the right parameters
        var result = {
            fullUrl: '/' + routerDefinition.prefix + '/' + suffix,
            routerPrefix: '/' + routerDefinition.prefix,
            routerSuffix: '/' + suffix,
            requestInfo: {
                formFactor: 'this property must not be empty but other than that, it is actually ignored'
            },
            config: routerConfig,
            pageRoles: pageRoles
        };

        return result;
    }

    function onBackEndReponse(onSuccess, onError, routerResponse, err){
        //todo - remove this once https://jira.wixpress.com/browse/SE-18763 is done
        if (routerResponse.result._elementoryError) {
            logWixCodeConsoleMessage('Internal server error:' + routerResponse.result.stack);
        }

        consoleLogBackend(_.get(routerResponse, 'consoleMethodCalls'));
        if (err) {
            onError(err);
        } else {
            onSuccess(routerResponse);
        }
    }

    function getFromBackEnd(paramObj, isSiteMap, onSuccess, onError) {
        var requestParams = {
            url: getBackendRequestUrl(paramObj.currentUrl, paramObj.clientSpecMap, paramObj.routerDefinition, isSiteMap) + getUrlParams(paramObj.clientSpecMap, paramObj.rendererModel_wixCodeModel_appRenderInfo, paramObj.isEditor),
            data: getBackendRequestObject(paramObj.pageRoles, paramObj.suffix, paramObj.routerDefinition)
        };
        var doneCallback = _.partial(onBackEndReponse, onSuccess, onError);
        requestsUtil.createAndSendRequest(requestParams, doneCallback, $.ajax);
    }

    function onPageResponse(routerDefinition, suffix, addDynamicResponseForUrl, onSuccess, routerResponse) {
        var resultingObj = {
            pageId: routerResponse.result.page,
            title: _.get(routerResponse, 'result.head.title') || _.get(routerResponse, 'result.title'), /*TODO-davidsu: we should know for sure the format of the response instead of guessing like this!!!*/
            pageData: routerResponse.result.data
        };

        var statusCode = _.parseInt(routerResponse.result.status);
        if (statusCode === 403) {
            logWixCodeConsoleMessage('Forbidden (403) - The request was a valid request, but the server is refusing to respond to it. The user might be logged in but does not have the necessary permissions for the resource.');
            resultingObj.pageId = errorPages.IDS.FORBIDDEN;
        } else if (statusCode === 302 || statusCode === 301) {
            logWixCodeConsoleMessage('Redirected to URL: "' + routerResponse.result.redirectUrl + '"');
            resultingObj.redirectUrl = routerResponse.result.redirectUrl;
        } else if (statusCode === 404) {
            logWixCodeConsoleMessage('Not Found (404) - The requested resource could not be found');
            resultingObj.pageId = errorPages.IDS.NOT_FOUND;
        } else if (!resultingObj.pageId) {
            if (statusCode === 500) {
                logWixCodeConsoleMessage('Internal Server Error (500)');
            } else {
                logWixCodeConsoleMessage('Error Code (' + statusCode + ')');
            }
            resultingObj.pageId = errorPages.IDS.INTERNAL_ERROR;
        }

        logWixCodeConsoleMessage(routerResponse.result.message);

        addDynamicResponseForUrl(routerDefinition.prefix + suffix, resultingObj);
        onSuccess(resultingObj);
    }

    function consoleLogBackend(consoleMethodCalls) {
        _.forEach(consoleMethodCalls, function(consoleMethodCall) {
            logWixCodeConsoleMessage(consoleMethodCall[1]);
        });
    }

    function makeParamObjFromPs(ps, routerDefinition, pageData){
        var pages = _.map(pageData.getPagesList(ps, true), function(_pageId){
            return {
                pageId: _pageId,
                title: pageData.getPageData(ps, _pageId).title
            };
        });
        var paramObj = {
            isEditor: true,
            currentUrl: ps.dal.getByPath(['currentUrl']),
            clientSpecMap: ps.dal.get(ps.pointers.general.getClientSpecMap()),
            rendererModel_wixCodeModel_appRenderInfo: ps.dal.getByPath(['rendererModel', 'wixCodeModel', 'signedAppRenderInfo']),
            routerDefinition: routerDefinition,
            suffix: '',
            pageRoles: _.reduce(routerDefinition.pages, function(result, value, key){
                result[key] = {
                    id: value,
                    title: _.find(pages, {pageId: value}).title
                };
                return result;
            }, {})
        };
        return paramObj;
    }

    function makeParamObjFromSiteData(siteData, routerDefinition, suffix){
        var paramObj = {
            isEditor: !siteData.isViewerMode(),
            currentUrl: siteData.currentUrl,
            clientSpecMap: siteData.rendererModel.clientSpecMap,
            rendererModel_wixCodeModel_appRenderInfo: siteData.rendererModel.wixCodeModel.signedAppRenderInfo,
            routerDefinition: routerDefinition,
            suffix: suffix,
            addDynamicResponseForUrl: _.bind(siteData.addDynamicResponseForUrl, siteData),
            pageRoles: _.reduce(routerDefinition.pages, function(result, value, key){
                var title = _.chain(siteData)
                .get('publicModel.pageList.pages')
                .find({pageId: value})
                .get('title')
                .value();
                result[key] = {
                    id: value,
                    title: title || _.get(siteData.getDataByQuery(value), 'title')
                };
                return result;
            }, {})
        };
        return paramObj;
    }

    function cleanPrefixesFromSiteMap(siteMapEntries, prefix) {
        var reg = new RegExp('.*?\/' + prefix);
        _.forEach(siteMapEntries, function(entry) {
            if (entry && entry.url) {
                entry.url = entry.url.replace(reg, '');
                if (entry.url.charAt(0) === "/" && entry.url.length > 1) {
                    entry.url = entry.url.substring(1);
                }
            }
        });
    }

    function getInnerRoutesSiteMap(paramObj, onSuccess, onError){
        function onSiteMapResponse(routerResponse){
            if (routerResponse.exception){
                onError();
                return;
            }
            var siteMap = routerResponse.result;
            cleanPrefixesFromSiteMap(siteMap, paramObj.routerDefinition.prefix);
            onSuccess(routerResponse.result);
        }
        getFromBackEnd(paramObj, true, onSiteMapResponse, onError);
    }

    function getPage(paramObj, onSuccess, onError) {
        var _onPageResponse = _.partial(onPageResponse, paramObj.routerDefinition, paramObj.suffix, paramObj.addDynamicResponseForUrl, onSuccess);
        getFromBackEnd(paramObj, false, _onPageResponse, onError);
    }

    return {
        getPage: getPage,
        getInnerRoutesSiteMap: getInnerRoutesSiteMap,
        makeParamObjFromPs: makeParamObjFromPs,
        makeParamObjFromSiteData: makeParamObjFromSiteData
    };
});
