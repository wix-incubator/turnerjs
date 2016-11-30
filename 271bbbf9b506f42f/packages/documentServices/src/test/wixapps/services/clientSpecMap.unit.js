define([
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/siteMetadata/clientSpecMap',
    'documentServices/wixapps/services/clientSpecMap'
], function (
    privateServicesHelper,
    siteMetadata,
    clientSpecMap,
    clientSpecMapService
) {
    'use strict';
    describe('wixapps clientSpecMap service', function () {
        var ps;
        var appData = {
            "type": "appbuilder",
            "applicationId": 8,
            "appDefinitionId": "3d590cbc-4907-4cc4-b0b1-ddf2c5edf297",
            "instanceId": "131ac4d1-991d-c742-ee9b-6fd0149c2103",
            "state": "Initialized"
        };

        beforeAll(function () {
            ps = ps || privateServicesHelper.mockPrivateServices();
            spyOn(clientSpecMap, "filterAppsDataByType").and.returnValue([appData]);
        });

        it('should return appbuilder instanceId', function () {
            var result = clientSpecMapService.getInstanceId(ps);
            expect(result).toBe('131ac4d1-991d-c742-ee9b-6fd0149c2103');
        });

        it('should return appbuilder applicationId', function () {
            var result = clientSpecMapService.getApplicationId(ps);
            expect(result).toBe(8);
        });
    });
});
