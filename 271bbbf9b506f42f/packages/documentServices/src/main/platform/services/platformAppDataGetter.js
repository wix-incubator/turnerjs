define([
    'documentServices/tpa/services/clientSpecMapService'
], function (
             clientSpecMapService
) {
    'use strict';


    function getAppDataByAppDefId(ps, appDefId) {
        return clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefId);
    }

    function getAppDataByApplicationId(ps, applicationId) {
        return clientSpecMapService.getAppData(ps, applicationId);
    }


    return {
        getAppDataByAppDefId: getAppDataByAppDefId,
        getAppDataByApplicationId: getAppDataByApplicationId
    };
});
