define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('resize component handler', function () {
        var compId = 'TPASection_icvr7hir';

        it('should set comp width and height', function (done) {
            var params = {
                width: 100,
                height: 100
            };
            driver.navigateToPage('mqqs8').then(function () {
                driver.resizeComponent(params, compId, function (response) {
                    expect(response).toEqual({
                        width: 100,
                        height: 100
                    });
                    done();
                });
            });
        });

        it('should set comp width', function (done) {
            var params = {
                width: 400
            };
            driver.resizeComponent(params, compId, function (response) {
                expect(response).toEqual({
                    width: 400,
                    height: 100
                });
                done();
            });
        });

        it('should set comp height', function (done) {
            var params = {
                height: 400
            };

            driver.resizeComponent(params, compId, function (response) {
                expect(response).toEqual({
                    width: 400,
                    height: 400
                });
                done();
            });
        });

        it('should persist comp height and width after switch to preview', function (done) {
            var params = {
                height: 30,
                width: 70
            };

            driver.resizeComponent(params, compId, function (response) {
                expect(response).toEqual({
                    height: 30,
                    width: 70
                });
                driver.switchToPreviewPromise().then(function() {
                    driver.getBoundingRectAndOffsets(compId).then(function (data) {
                        expect(data.rect.height).toEqual(30);
                        expect(data.rect.width).toEqual(70);

                        done();
                    });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });
        });

        it('should allow manual resize after resizeComponent', function(done) {

            var appDef = '12f51ae9-aa4e-1717-f49f-581ef8058a7d';
            var page = 'c1dmp';
            var componentId = 'comp-icvr20p1';

            var params = {
                height: 30,
                width: 70
            };

            driver.navigateToPage(page).then(function () {
                driver.resizeComponent(params, componentId, function (response) {
                    expect(response).toEqual({
                        height: 30,
                        width: 70
                    });
                    setTimeout(function(){
                        driver.resizeComponentManual(appDef, {
                            x: 100,
                            y: 100,
                            height: 100,
                            width: 200
                        }).then(function() {
                            driver.getBoundingRectAndOffsets(componentId).then(function (data) {
                                expect(data.rect.height).toEqual(100);
                                expect(data.rect.width).toEqual(200);
                                done();
                            });
                        });
                    }, 2000);
                });
            });
        });
    });
});
