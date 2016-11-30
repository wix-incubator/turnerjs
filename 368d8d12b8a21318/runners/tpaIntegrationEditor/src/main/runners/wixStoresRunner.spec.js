define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('tpa WixStores', function () {
        it('should open the store pages menu directly in the Store Pages tab', function (done) {
            driver.openWixStoresMenuInStorePagesTab()
                .then(function(response){
                    expect(response.result).toBe('ok');
                })
                .catch(function(e){
                   fail(e);
                })
                .finally(function(){
                    driver.closeAllPanels();
                    done();
            });
        });

        it('should add a new vertical product widget with correct options', function (done) {
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
            var widgetId = '13ec3e79-e668-cc0c-2d48-e99d53a213dd';
            var presetId = 'product_widget_vertical';
            var layout = {width: 320, height: 404, x: 200, y: 200};
            driver.addWidgetWithOptions(appDefId, widgetId, layout, {presetId: presetId}).then(function (result){
                var compData = driver.getCompData(result.compRef.id);
                expect(compData.tpaData.content).toEqual('{"presetId":"product_widget_vertical"}');

                driver.switchToPreviewPromise().then(function() {
                    driver.getBoundingRectAndOffsets(result.compRef.id).then(function (data) {
                        expect(data.rect.height).toEqual(404);
                        expect(data.rect.width).toEqual(320);

                        done();
                    });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });
        });

        it('should add a new horizontal product widget with correct options', function (done) {
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
            var widgetId = '13ec3e79-e668-cc0c-2d48-e99d53a213dd';
            var presetId = 'product_widget_horizontal';
            var layout = {width: 940, height: 400, x: 200, y: 200};
            driver.addWidgetWithOptions(appDefId, widgetId, layout, {presetId: presetId}).then(function (result){
                console.log(result);
                var compData = driver.getCompData(result.compRef.id);
                expect(compData.tpaData.content).toEqual('{"presetId":"product_widget_horizontal"}');

                driver.switchToPreviewPromise().then(function() {
                    driver.getBoundingRectAndOffsets(result.compRef.id).then(function (data) {
                        expect(data.rect.height).toEqual(400);
                        expect(data.rect.width).toEqual(940);

                        done();
                    });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });
        });
    });
});
