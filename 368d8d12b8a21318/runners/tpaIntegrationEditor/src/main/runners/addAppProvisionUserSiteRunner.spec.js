define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';
    
    //site: http://liorshefer.wix.com/add-app-user-site
    describe('provision add app flow - user site', function () {
        it('should add a new app to a user site', function (done) {
            var appDefinitionId = '134139f3-f2a0-2c2c-693c-ed22165cfd84';
            driver.addWidget(appDefinitionId).then(function (domElement) {
                expect(domElement.result).toBe('ok');
                done();
            });
        });

        it('should add another component from the same app to a user site', function (done) {
            var appDefinitionId = '134139f3-f2a0-2c2c-693c-ed22165cfd84';
            driver.addWidget(appDefinitionId).then(function (domElement) {
                expect(domElement.result).toBe('ok');
                done();
            });
        });

        it('should add an already provisioned glued app to a user site', function (done) {
            var appDefinitionId = '13a0fdb7-8f49-2cb3-c634-c9158ba38c0d';
            driver.addWidget(appDefinitionId).then(function (domElement) {
                expect(domElement.result).toBe('ok');
                done();
            });
        });

        it('should add a new app w/ a page to a user site', function (done) {
            var appDefinitionId = '135aad86-9125-6074-7346-29dc6a3c9bcf';
            driver.addSection(appDefinitionId).then(function (domElement) {
                expect(domElement.result).toBe('ok');
                done();
            });
        });
    });
});