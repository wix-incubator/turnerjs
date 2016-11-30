define([
    'lodash',
    'beakerUtils/matchers/index',
    'santa-harness'
], function (
    _,
    matchers,
    santa
) {
    'use strict';

    xdescribe('Popup behaviors', function () {
        var ds, mainPage, popup1, popup2;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                console.log('Testing Popup behaviors integration');
                ds = harness.documentServices;
                mainPage = ds.pages.getFocusedPage();
                jasmine.addMatchers(matchers);
                done();
            });
        });

        describe('after adding 2 popups to a focused page', function () {

            beforeAll(function (done) {
                popup1 = ds.pages.popupPages.add('popup1');
                popup2 = ds.pages.popupPages.add('popup2');
                ds.waitForChangesApplied(done);
            });

            afterEach(function (done) {
                ds.pages.popupPages.close();
                ds.waitForChangesApplied(done);
            });

            it('should be configured to open the first popup, but not the second', function () {

                var behaviors = ds.behaviors.get(mainPage);

                expect(behaviors).toEqual([
                    jasmine.objectContaining({
                        action: jasmine.objectContaining({
                            type: 'comp',
                            name: 'load',
                            sourceId: mainPage.id
                        }),
                        behavior: jasmine.objectContaining({
                            type: 'site',
                            name: 'openPopup',
                            targetId: popup1.id
                        })
                    })
                ]);

                expect(behaviors).not.toContain({
                    action: jasmine.objectContaining({
                        sourceId: mainPage.id
                    }),
                    behavior: jasmine.objectContaining({
                        targetId: popup2.id
                    })
                });
            });

            it('should not show popup immediately, but only after 2 seconds (default delay)', function (done) {
                expect(ds.pages.popupPages.getCurrentPopupId()).toBeFalsy();

                expect(function () {
                    return ds.pages.popupPages.getCurrentPopupId() === popup1.id;
                }).toBecomeEventuallyTrue({
                    minimalTime: 1800,
                    maximumTime: 2200,
                    pollInterval: 50,
                    success: done,
                    fail: function(message){done.fail(message);}
                });
            });
        });
    });
});
