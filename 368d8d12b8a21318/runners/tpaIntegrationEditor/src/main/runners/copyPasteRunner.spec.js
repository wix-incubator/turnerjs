define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    // http://editor.wix.com/html/editor/web/renderer/edit/3aa29da2-a9df-4ee8-8bbc-0a5b80d9e449?metaSiteId=2c1a89a8-351f-4708-a103-2b5027e71196&editorSessionId=C8E776AE-2AE8-4113-AF0A-CDA708771CA7
    describe('copy paste runner', function () {
        var compRef;
        it('should cut component and delete hidden pages', function (done) {
            var compId = "comp-irg92t7w";
            expect(driver.gePagesCount()).toEqual(2);
            driver.cutComponent(compId).then(function(comp) {
                expect(driver.gePagesCount()).toEqual(1);
                compRef = comp;
                done();
            });

        });

        it('should paste component and add hidden pages', function (done) {
            driver.pasteComponent(compRef).then(function() {
                expect(driver.gePagesCount()).toEqual(2);
                done();
            });
        });
    });
});
