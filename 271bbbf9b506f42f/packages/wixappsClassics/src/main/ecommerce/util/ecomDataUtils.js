define(['lodash'], function (_) {
    "use strict";

    function getApplicationDataStore(siteData){
        if (!siteData.wixapps) {
            siteData.wixapps = {};
        }
        if (!siteData.wixapps.ecommerce){
            siteData.wixapps.ecommerce = {};
        }
        if (!siteData.wixapps.ecommerce.items){
            siteData.wixapps.ecommerce.items = {};
        }
        return siteData.wixapps.ecommerce;
    }

    function clearApplicationDataStore(siteData){
        siteData.wixapps.ecommerce = _.pick(siteData.wixapps.ecommerce, ['descriptor']);
    }

    /**
     * @class ecomDataUtils
     */
    return {
        packageName: 'ecommerce',
        getApplicationDataStore: getApplicationDataStore,
        clearApplicationDataStore: clearApplicationDataStore
    };

});