define([
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/wixCode/utils/pathUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/platform/services/viewerInfoChangedEmitter'
], function (wixCodeModelService, pathUtils, privateServicesHelper, viewerInfoChangedEmitter) {
    'use strict';

    describe('wixCodeModelService', function () {
        var ps;

        beforeEach(function() {
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(null, {siteData: [{
                path: ['wixCode'],
                optional: true
            }]});
            pathUtils.initPaths(ps);
        });

        it('should set/get scari', function() {
            var scari = 'scari';
            wixCodeModelService.setScari(ps, scari);
            var result = wixCodeModelService.getScari(ps);

            expect(result).toEqual(scari);
        });

        it('should emit a viewerInfoChanged event with new scari when calling .setScari', function() {
            var scari = 'scari';
            var dummyAppId = 'dummy_appId';
            var spy = jasmine.createSpy();
            var unregister = viewerInfoChangedEmitter.register(ps, dummyAppId, spy);

            wixCodeModelService.setScari(ps, scari);

            expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
                eventPayload: jasmine.objectContaining({scari: scari})
            }));

            unregister();
        });

        it('should set/get gridAppId', function() {
            var gridAppId = '27608700-06eb-4fd7-b6a7-5dc3f8386b62';
            wixCodeModelService.setGridAppId(ps, gridAppId);
            var result = wixCodeModelService.getGridAppId(ps);

            expect(result).toEqual(gridAppId);
        });

    });
});
