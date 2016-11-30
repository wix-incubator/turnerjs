define([
    'tpaIntegrationEditor/driver/driver',
    'jasmine-boot'
], function (driver) {
    'use strict';

    describe('revalidateSession Tests', function () {
        var compId = 'comp-icvqs8e0';

        it('should revalidate session for the given application', function (done) {
            var instance;
            driver.revalidateSession(compId)
                .then(function (result) {
                    instance = result.instance;
                    return driver.revalidateSession(compId);
                })
                .then(function (result2) {
                    var newInstance = result2.instance;
                    var instanceId = JSON.parse(atob(instance.split('.')[1])).instanceId;
                    var newInstanceId = JSON.parse(atob(newInstance.split('.')[1])).instanceId;
                    expect(instance).not.toEqual(newInstance);
                    expect(instanceId).toEqual(newInstanceId);
                    done();
                });
        });
    });

});