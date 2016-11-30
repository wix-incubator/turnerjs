/**
 * Created by avim on 1/5/2015.
 */
define(['lodash',
    'coreUtils',
    'loggingUtils',
    'dataFixer',
    'siteUtils/core/pagesUrlUtils',
    'experiment'
], function (_, coreUtils, loggerUtils, dataFixer, pagesUrlUtils, experiment) {
    'use strict';

    var MASTER_PAGE_ID = 'masterPage';

    function didPageRequestFail(siteData, pageId) {
        return _.some(siteData.failedRequests, function(reqDesc) {
            var destination = reqDesc.destination;
            return _.size(destination) === 2 && destination[0] === 'pagesData' && destination[1] === pageId;
        });
    }

    function reportPageRetrievalFailed(siteData, pageId) {
        loggerUtils.logger.reportBI(siteData, loggerUtils.bi.errors.ALL_PAGE_RETRIEVAL_ATTEMPTS_FAILED, {
            pageId: pageId
        });
    }

    function getMasterPageRequest(siteData, pageList) {
        var urls = pagesUrlUtils.getMasterPageURLs(pageList);
        return buildPageRequest(siteData, urls, MASTER_PAGE_ID, pageList);
    }

    function getTransformFunc(siteData, pageUrls){
       return function (pageData) {
           return dataFixer.fix(pageData, _.pluck(pageUrls.pages, "pageId"), siteData.requestModel, siteData.currentUrl, siteData.urlFormatModel, siteData.isViewerMode());
       };
    }

    function getPageRequest(siteData, pageList, pageId) {
        if (siteData.currentUrl && siteData.currentUrl.query.fakePage) {
            var pageName = siteData.currentUrl.query.fakePage;
            return {
                urls: [siteData.santaBase + "/static/fakePages/" + pageName + ".json"],
                destination: ["pagesData", pageId],
                transformFunc: getTransformFunc(siteData, pageList)
            };
        }

        var urls = pagesUrlUtils.getPageURLs(pageList, pageId);
        if (!urls) {
            pageId = pageList.mainPageId;
            urls = pagesUrlUtils.getPageURLs(pageList, pageList.mainPageId);
        }

        return buildPageRequest(siteData, urls, pageId, pageList);
    }

    var isHttps = typeof document !== "undefined" && window.document.location.protocol === "https:";
    var STATIC_DOMAIN_HTTP_REGEX = /http:\/\/[a-z]+\.[a-z]+\.com\//;
    var BASE_DOMAIN_FOR_PAGES_IN_HTTPS = "//static.wixstatic.com/";

    function buildPageRequest(siteData, urls, pageId, pageUrls) {
        if (isHttps) {
            urls[0] = urls[0].replace(STATIC_DOMAIN_HTTP_REGEX, BASE_DOMAIN_FOR_PAGES_IN_HTTPS);
        }
        var pageRequest = {
            urls: urls,
            destination: ["pagesData", pageId],
            isValidResponse: function(responseData){
                return _.isObject(responseData);
            },
            transformFunc: getTransformFunc(siteData, pageUrls),
            error: function() {
                siteData.failedRequests.push(this);
            },
            onUrlRequestFailure: function(failedUrl, responseStatusCode) {
                var parsedUrl = coreUtils.urlUtils.parseUrl(failedUrl);
                loggerUtils.logger.reportBI(siteData, loggerUtils.bi.errors.SINGLE_PAGE_RETRIEVAL_ATTEMPT_FAILED, {
                    pageId: pageId,
                    hostname: parsedUrl.hostname,
                    url: failedUrl,
                    responseStatusCode: responseStatusCode
                });
            }
        };

        if (experiment.isOpen('pageRequestTimeout')) {
            _.merge(pageRequest, {
                maxTimeouts: 1,
                requestTimeout: 2000,
                ontimeout: function () {
                    loggerUtils.logger.reportBeatEvent(siteData, 'reset', pageId);
                }
            });
        }

        return pageRequest;
    }

    function getRequestsForPages(siteData, fullPagesData, urlDataForPages) {

        if (!siteData.publicModel) {
            return [];
        }
        var requests = [];
        var pageList = siteData.publicModel.pageList;

        if (didPageRequestFail(siteData, MASTER_PAGE_ID)) {
            reportPageRetrievalFailed(siteData, MASTER_PAGE_ID);
        } else if (!fullPagesData.pagesData[MASTER_PAGE_ID]) {
            requests.push(getMasterPageRequest(siteData, pageList));
        }

        var _urlDataForPages = _.isArray(urlDataForPages) ? urlDataForPages : [urlDataForPages];
        _.forEach(_urlDataForPages, function(urlData){
            if (urlData.pageId) {
                if (experiment.isOpen('sv_dpages') && coreUtils.errorPages.isErrorPage(urlData.pageId)) {
                    requests.push(buildPageRequest(siteData, coreUtils.errorPages.getJSONS(siteData, urlData.pageId), urlData.pageId, pageList));
                } else if (didPageRequestFail(siteData, urlData.pageId)) {
                    reportPageRetrievalFailed(siteData, urlData.pageId);
                } else if (doesUrlDataContainsJsonUrlsAndPageDataDoesNotHaveUrls(siteData, urlData)) {
                    requests.push(buildPageRequest(siteData, urlData.jsonUrls, urlData.pageId, pageList));
                } else if (!isPasswordProtectedPage(siteData, urlData) && !fullPagesData.pagesData[urlData.pageId]) {
                    requests.push(getPageRequest(siteData, pageList, urlData.pageId));
                }
            }
        });

        return requests;
    }

    function isPasswordProtectedPage (siteData, urlData) {
        var protectedPages = _.get(siteData, 'rendererModel.passwordProtectedPages', []);
        return _.includes(protectedPages, urlData.pageId);
    }

    function doesUrlDataContainsJsonUrlsAndPageDataDoesNotHaveUrls (siteData, urlData) {
        var pageData = _.find(siteData.publicModel.pageList.pages, {pageId: urlData.pageId});
        return !_.isEmpty(urlData.jsonUrls) && _.isEmpty(_.get(pageData, 'urls'));
    }

    /**
     * @exports utils/siteUtils/pageRequests
     */
    return getRequestsForPages;
});
