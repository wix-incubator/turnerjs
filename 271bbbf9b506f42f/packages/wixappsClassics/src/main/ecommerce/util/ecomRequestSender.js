define([
    'lodash',
    'wixappsClassics/ecommerce/util/ecomRequestBuilder',
    'wixappsClassics/ecommerce/util/ecomDataUtils'], function(_, ecomRequestBuilder, ecomDataUtils){
    'use strict';
    function sendRequest(siteData, params, requestMetadata, onSuccessCallback, onFailCallback){
        requestMetadata = requestMetadata || {};
        requestMetadata.onError = onFailCallback;
        var store = siteData.store;
        var request = ecomRequestBuilder.buildRequest(siteData, null,
            ecomDataUtils.packageName, params, requestMetadata);

        store.loadBatch([request], onSuccessCallback);
    }

    return {
        sendRequest: sendRequest
    };
});