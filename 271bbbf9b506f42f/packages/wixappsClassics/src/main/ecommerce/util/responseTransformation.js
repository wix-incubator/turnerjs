define(['lodash'], function (_) {
    "use strict";

    function transformResponse(compId, transformFunc, responseData, currentValue) {
        var strippedResponseData = stripJsonRpc(responseData);

        currentValue[compId] = [compId];

        currentValue.items = currentValue.items || {};
        var value = strippedResponseData;
        if (transformFunc){
            value = transformFunc(strippedResponseData.result, strippedResponseData.error);
        }
        currentValue.items[compId] = value;

        return currentValue;
    }

    function transformSingleProductResponse(compId, transformFunc, responseData, currentValue){
        var strippedResponseData = stripJsonRpc(responseData);

        var value = strippedResponseData;
        if (transformFunc){
            value = transformFunc(strippedResponseData.result, strippedResponseData.error);
        }

        currentValue[compId] = [value.id];
        currentValue.items = currentValue.items || {};
        currentValue.items[value.id] = value;

        return currentValue;
    }

    function transformSingleProductResponseForZoom(compId, transformFunc, responseData, currentValue){
        var strippedResponseData = stripJsonRpc(responseData);

        var value = strippedResponseData;
        if (transformFunc){
            value = transformFunc(strippedResponseData.result, strippedResponseData.error);
        }

        currentValue.items = currentValue.items || {};

        // set the data to the default location
        currentValue.items[value.id] = value;

        // set the data for the zoom
        currentValue[compId] = ["zoom"];
        currentValue.items.zoom = value;

        return currentValue;
    }

    /**
     * In some scenarios ecom server returns a string with a space at the end: "cart "
     * @param rawData
     */
    function fixCartField(rawData){
        if (_.get(rawData, 'result["cart "]')) {
            rawData.result.cart = _.cloneDeep(rawData.result["cart "]);
            delete rawData.result["cart "];
        }
    }

    function stripJsonRpc(rawData) {
        fixCartField(rawData);
        if (rawData && rawData.jsonrpc) {
            return {result: rawData.result, error: rawData.error};
        }
        return {result: rawData};
    }



    return {
        transformResponse: transformResponse,
        transformSingleProductResponse: transformSingleProductResponse,
        transformSingleProductResponseForZoom: transformSingleProductResponseForZoom,
        stripJsonRpc: stripJsonRpc
    };

});
