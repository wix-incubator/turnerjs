define(['tpaIntegrationEditor/driver/driver', 'jquery', 'jasmine-boot'], function (driver, $) {
    'use strict';

    describe('tpa openMediaDialog handler', function () {
        it('should handle openMediaDialog', function (done) {
            var msg = {
                compId: 'i85ofg2c',
                data: {
                    callOnCancel: false,
                    mediaType: 'photos',
                    multiSelection: false
                }
            };
            var callback = jasmine.createSpy('callback');
            driver.openMediaDialog(msg, callback)
            .then(function(panel) {
                var id = $(panel.dom[0]).attr('id');
                expect(id).toBe('mediaGalleryFrame');
                done();
            }).catch(function(panel) {
                fail(panel.result);
                done();
            });
        });
    });
});