define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('tpa appIsAlive handler', function () {
        it('should handle appIsAlive', function () {
            var appDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
            var callback = jasmine.createSpy('callback');
            driver.appIsAlive(appDefId, callback);
            expect(callback).toHaveBeenCalledWith(jasmine.any(Object));
        });
    });
});