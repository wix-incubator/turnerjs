define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('tpa getViewMode handler', function () {
        var compId = 'comp-ica98sbu';

        it('should return editMode editor in editor', function (done) {
            driver.getViewMode(compId, function (data) {
                expect(data.editMode).toEqual('editor');
                done();
            });
        });

        it('should return editMode preview in preview', function (done) {
            driver.switchToPreviewPromise().then(function() {
                driver.getViewMode(compId, function (data) {
                    expect(data.editMode).toEqual('preview');
                    done();
                });
            }, function(){
                fail('switch to preview failed');
                done();
            });
        });
    });
});
