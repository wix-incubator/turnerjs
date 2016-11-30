define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('provision add app flow - template', function () {
            it('should add an app to a template', function (done) {
                var appDefinitionId = '13bb5d67-1add-e770-a71f-001277e17c57';
                driver.addWidget(appDefinitionId).then(function (domElement) {
                    expect(domElement.result).toBe('ok');
                    done();
                });
            });

            it('should add a glued app to a template', function (done) {
                var appDefinitionId = '13a0fdb7-8f49-2cb3-c634-c9158ba38c0d';
                driver.addWidget(appDefinitionId).then(function (domElement) {
                    expect(domElement.result).toBe('ok');
                    done();
                });
            });

            it('should add an app w/ a page to a template', function (done) {
                var appDefinitionId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                driver.addSection(appDefinitionId).then(function (domElement) {
                    expect(domElement.result).toBe('ok');
                    done();
                });
            });
        }
    );
});