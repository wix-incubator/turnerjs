define(['lodash'], function (_) {
    'use strict';

    function getThankYouPageUrl(partApi) {
        var thankYouPageData = getThankYouPageData(partApi);
        var baseUrl = partApi.getSiteData().getExternalBaseUrl();
        if (thankYouPageData){
            return baseUrl + '#!' + thankYouPageData.pageUriSEO + '/' + thankYouPageData.id;
        }
        return false;
    }

    function getThankYouPageData(partApi){
        var pagesData = partApi.getSiteData().getPagesDataItems();
        var thankYouPageId = getThankYouPageGUID(partApi);

        if (thankYouPageId) {
            return _.find(pagesData, {appPageId: thankYouPageId});
        }
        return null;
    }

    function getThankYouPageGUID(partApi) {
        var partDef = partApi.getPartDefinition();
        return partDef.childPage;
    }

    /**
     * @class ecommerce.util.thankYouPageHandler
     */
    return {
        getThankYouPageUrl: getThankYouPageUrl
    };
});
