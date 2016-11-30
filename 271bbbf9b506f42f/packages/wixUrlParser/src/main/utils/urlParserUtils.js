define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    function getResolvedSiteData(siteData) {
        if (siteData.isResolvedSiteData) {
            return siteData;
        }

        var currentUrlPageId = siteData.getCurrentUrlPageId();
        var masterPageData = _.get(siteData.getMasterPageData(), ['data', 'document_data']);
        var permalinksMap = _(masterPageData)
                                .filter({type: 'PermaLink'})
                                .indexBy('id')
                                .value();
        var pagesDataItemsMap = _.indexBy(siteData.getPagesDataItems(), 'id');

        var resolvedSiteData = {
            primaryPageId:             siteData.getPrimaryPageId(),
            urlFormat:                 siteData.getUrlFormat(),
            mainPageId:                siteData.getMainPageId(),
            externalBaseUrl:           siteData.getExternalBaseUrl(),
            unicodeExternalBaseUrl:    siteData.getUnicodeExternalBaseUrl(),
            publicBaseUrl:             siteData.getPublicBaseUrl(),
            currentUrl:                siteData.currentUrl,
            currentUrlPageId:          currentUrlPageId,
            isFeedbackEndpoint:        siteData.isFeedbackEndpoint(),
            isViewerMode:              siteData.isViewerMode(),
            isWixSite:                 siteData.isWixSite(),
            isTemplate:                siteData.isTemplate(),
            isUsingSlashUrlFormat:     siteData.isUsingUrlFormat(coreUtils.siteConstants.URL_FORMATS.SLASH),
            isPremiumDomain:           siteData.isPremiumDomain(),
            allPageIds:                siteData.getAllPageIds(),  // Hashbang parser uses it to check if id from URL is a page
            routersConfigMap:          _.get(siteData, 'routers.configMap'),
            cookie:                    siteData.requestModel && siteData.requestModel.cookie,
            serviceTopology: {
                basePublicUrl:         siteData.getServiceTopologyProperty('basePublicUrl'),
                baseDomain:            siteData.getServiceTopologyProperty('baseDomain'),
                staticDocsUrl:         siteData.getServiceTopologyProperty('staticDocsUrl')
            },
            pagesDataItemsMap:         pagesDataItemsMap,
            permalinksMap:             permalinksMap,
            mapFromPageUriSeoToPageId: siteData.mapFromPageUriSeoToPageId,
            pageResponseForUrl: siteData.pageResponseForUrl
        };

        resolvedSiteData.isResolvedSiteData = true;

        return resolvedSiteData;
    }

    return {
        getResolvedSiteData: getResolvedSiteData
    };
});
