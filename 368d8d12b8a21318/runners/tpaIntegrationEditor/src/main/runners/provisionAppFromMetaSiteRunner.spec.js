define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    var getInstanceValue = function (instanceStr, key) {
        var encodedInstance = instanceStr.substring(instanceStr.indexOf(".")+1);
        var decodedInstance = JSON.parse(atob(encodedInstance));

        if (decodedInstance) {
            return decodedInstance[key] || null;
        }
        return null;
    };

    describe('provision app from metaSite', function () {
            it('should add app from sourceTemplateId', function (done) {
                var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                var sourceTemplateId = 'b0ee2dd4-d99b-42b4-a04e-d3a80588ed27';
                driver.addSection(appDefId, {
                    sourceTemplateId: sourceTemplateId
                }).then(function (results) {
                    expect(results.result).toBe('ok');
                    expect(driver.isInDemoMode(appDefId)).toBeFalsy();
                    expect(getInstanceValue(driver.getDataByAppDefId(appDefId).instance, 'originInstanceId')).not.toBeUndefined();
                    done();
                });
            });
        }
    );
});

