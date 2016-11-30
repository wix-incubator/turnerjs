define(['lodash', 'documentServices/tpa/services/appInstallationAndDeletionEvents'], function (
    _,
    appInstallationAndDeletionEvents
    ) {
    'use strict';

    describe('Service that support registration for first time app installation and deletion', function () {
        describe('registerOnAppDeleted', function () {
            it('should invoke delete callbacks if has some', function () {
                var appDefId = 'appDefId';
                var cbAppDefId1Mock = jasmine.createSpy('cb1');
                var cbAppDefId2Mock = jasmine.createSpy('cb2');

                appInstallationAndDeletionEvents.registerOnAppDeleted(appDefId, cbAppDefId1Mock);
                appInstallationAndDeletionEvents.registerOnAppDeleted(appDefId, cbAppDefId2Mock);

                appInstallationAndDeletionEvents.invokeDeleteAppCallbacks(appDefId);
                expect(cbAppDefId1Mock).toHaveBeenCalled();
                expect(cbAppDefId2Mock).toHaveBeenCalled();


            });

            it('should invoke install callbacks if has some', function () {
                var appDefId = 'appDefId';
                var cbAppDefId1Mock = jasmine.createSpy('cb1');
                var cbAppDefId2Mock = jasmine.createSpy('cb2');

                appInstallationAndDeletionEvents.registerOnAppInstalled(appDefId, cbAppDefId1Mock);
                appInstallationAndDeletionEvents.registerOnAppInstalled(appDefId, cbAppDefId2Mock);

                appInstallationAndDeletionEvents.invokeAddAppCallbacks(appDefId);
                expect(cbAppDefId1Mock).toHaveBeenCalled();
                expect(cbAppDefId2Mock).toHaveBeenCalled();
            });
        });
    });
});