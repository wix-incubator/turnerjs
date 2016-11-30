define([
    'tpaIntegrationEditor/driver/driver',
    'tpaIntegrationEditor/driver/driverDom',
    'jasmine-boot'
], function (driver, driverDom) {
    'use strict';

    describe('Full width tests', function () {
        var compId = 'comp-imey4337';
        var appDefId = '1440a4f0-309d-843a-7e2f-5515549ab6f3';
        describe('should allow enter and exit full width mode', function() {
            it('should enter full width for a widget is not in full width', function (done) {
                var originalSize = 250;
                var msg = {
                    data: {
                        stretch: true
                    }
                };
                driver.setFullWidth(appDefId, msg, function () {
                    driverDom.waitForDomElementWithinPreview('#' + compId , 3, 1000, 'failed').then(function(domElement) {
                        expect(domElement.dom.width()).toBeGreaterThan(originalSize);
                        done();
                    });
                });
            });

            it('should exit full width for a widget that is in full width', function (done) {
                var originalSize = 250;
                var msg = {
                    data: {
                        stretch: false
                    }
                };
                driver.setFullWidth(appDefId, msg, function () {
                    driverDom.waitForDomElementWithinPreview('#' + compId , 3, 1000, 'failed').then(function(domElement) {
                        expect(domElement.dom.width()).toBe(originalSize);
                        done();
                    });
                });
            });
        });
    });
});
