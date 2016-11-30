define(['documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/core',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/appStoreService',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/services/experimentService'], function (privateServicesHelper, tpaCore, clientSpecMapService, appStoreService,
                                                                  tpaUtils, experimentService) {

    'use strict';

    describe('initEditor', function () {
        var mockPs;//, isSiteSavedMock;
        beforeEach(function () {
            mockPs = privateServicesHelper.mockPrivateServices();
            //isSiteSavedMock = spyOn(tpaUtils, 'isSiteSaved');
            spyOn(experimentService, 'setExperiments');
            spyOn(clientSpecMapService, 'setIsInDevMode');
        });

        it('should set clientSpecMapService dev mode', function () {
            tpaCore.initEditor(mockPs, true);
            expect(clientSpecMapService.setIsInDevMode).toHaveBeenCalledWith(true);
        });

        it('should set experimentService w/ given experiments', function () {
            var experiments = {
                foo: 'bar'
            };
            tpaCore.initEditor(mockPs, true, experiments);
            expect(experimentService.setExperiments).toHaveBeenCalledWith(experiments);
        });
    });
});
