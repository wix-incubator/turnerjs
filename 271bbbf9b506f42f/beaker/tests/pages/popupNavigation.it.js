define([
    'lodash',
    'santa-harness',
    'componentUtils'
], function (_,
             santa,
             componentUtils) {
    'use strict';

    describe('popups navigation', function () {
            var documentServices;
        var siteWindow;

        beforeAll(function (done) {
            santa.start({site: 'page-navigation'}).then(function (harness) {
                documentServices = harness.documentServices;
                siteWindow = harness.window;
                done();
            });
        });

        describe('close popup', function(){
            var popupPage;

            beforeEach(function (done) {
                var popupDefinition = componentUtils.getComponentDef(documentServices, 'POPUP');
                documentServices.documentMode.enableAction('exit', true);
                popupPage = documentServices.pages.popupPages.add('Popup', popupDefinition);
                documentServices.pages.popupPages.open(popupPage.id);
                documentServices.waitForChangesApplied(done);
            });

            it("should close popup without killing the Q even if exit action was cancelled during the closing", function(done){
                expect(documentServices.pages.popupPages.isPopupOpened()).toBe(true);
                documentServices.pages.popupPages.close(popupPage.id);

                //this is here so that the exit action will be disabled right after the popup was register to the exit animation
                //the ds Q uses animation frames.
                // in case of navigation with animations the Q waits for the animation to finish.
                siteWindow.requestAnimationFrame(function(){
                    // unfortunately enableAction is not in the Q at this point
                    documentServices.documentMode.enableAction('exit', false);
                });

                documentServices.waitForChangesApplied(function(){
                    expect(documentServices.pages.popupPages.isPopupOpened()).toBe(false);
                    done();
                });
            });
        });
    });
});
