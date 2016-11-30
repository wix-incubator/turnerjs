define(["utils",
    "wixappsClassics/ecommerce/data/cartManager",
    "wixappsClassics/ecommerce/util/thankYouPageHandler",
    "wixappsClassics/ecommerce/util/ecomDataUtils",
    "experiment"
], function (utils, cartManager, /** ecommerce.util.thankYouPageHandler */thankYouPageHandler, ecomDataUtils, experiment) {
    'use strict';

    var API_URL_SEGMENT = "/apps/ecommerce/api/checkout?";
    var MIGRATION_API_URL_SEGMENT = "/_api/wix-ecommerce-migration-web/apps/ecommerce/api/checkout?";

    function createCheckoutUrlParamsString(partApi, sendSiteId) {
        var siteData = partApi.getSiteData();
        var storeId = ecomDataUtils.getApplicationDataStore(siteData).items.storeId;
        var cartId = cartManager.getCartId(siteData);

        var urlQueryObj = {
            storeId: storeId,
            cartId: cartId,
            metaSiteId: siteData.rendererModel.metaSiteId,
            svSession: siteData.getSvSession(),
            successURL: getSuccessURL(partApi),
            returnToURL: utils.urlUtils.removeUrlParam(partApi.getSiteData().currentUrl.full, 'f_checkoutResult')
        };

        if (sendSiteId){
            urlQueryObj.siteId = siteData.rendererModel.siteId;
        }

        return utils.urlUtils.toQueryString(urlQueryObj);
    }

    function getSuccessURL(partApi){
        var currentUrl = thankYouPageHandler.getThankYouPageUrl(partApi) || partApi.getSiteData().currentUrl.full;
        return utils.urlUtils.removeUrlParam(currentUrl, 'f_checkoutResult');
    }

    /**
     * Gateways such as Skrill, WebMoney, Authorize.net, Tranzila, PayU and offline checkouts are handled via
     * a window handled by us (prefixed with safer-checkout.wix.....)
     */
    function getInternalHandledCheckoutUrl(partApi) {
        var siteData = partApi.getSiteData();
        var url = siteData.serviceTopology.ecommerceCheckoutUrl;
        //fix - when url don't have '/' at the end
        if (!url.match('/$')) {
            url += '/';
        }
        url += "payment?";
        url += createCheckoutUrlParamsString(partApi, true);
        return url;
    }

    /**
     * Gateways such as PayPal and PagSeguro need to checkout via an external url (can be opened in same
     * window or new tab)
     */
    function getExternalHandledCheckoutUtl(partApi) {
        var apiUrl = experiment.isOpen('ecommigrationviewer') ? MIGRATION_API_URL_SEGMENT : API_URL_SEGMENT;
        var url = utils.urlUtils.baseUrl(partApi.getSiteData().getExternalBaseUrl()) + apiUrl;
        url += createCheckoutUrlParamsString(partApi, false);
        return url;
    }

    return {
        getInternalHandledCheckoutUrl: getInternalHandledCheckoutUrl,
        getExternalHandledCheckoutUtl: getExternalHandledCheckoutUtl,
        getSuccessURL: getSuccessURL
    };
});
