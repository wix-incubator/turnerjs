define(['lodash', 'documentServices/tpa/services/appMarketService', 'documentServices/tpa/bi/errors'], function (_, appMarketService, tpaErrors) {
    'use strict';

    var cacheAppMarketDataAfterProvision = function(ps, appData){
        appMarketService.getAppMarketDataAsync(ps, appData.appDefinitionId)
            .catch(function(){
                ps.siteAPI.reportBI(tpaErrors.FAIL_TO_GET_APP_MARKET_DATA);
            });
    };

    var generateAppFlowsLargestAppId = function (currentLargest) {
        return _.max([currentLargest, 999]) + _.random(1, 999) + _.random(1, 99);
    };

    return {
        cacheAppMarketDataAfterProvision: cacheAppMarketDataAfterProvision,
        generateAppFlowsLargestAppId: generateAppFlowsLargestAppId
    };
});
