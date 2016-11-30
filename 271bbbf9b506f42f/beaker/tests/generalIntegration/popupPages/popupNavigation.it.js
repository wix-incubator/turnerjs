define([
    'lodash',
    'santa-harness',
    'componentUtils'
], function (_,
             santa,
             componentUtils) {
    'use strict';

    describe('Popup navigation', function () {
        var ds;

        //Navigation in Editor is done via Document Services only, while Viewer uses it's navigational methods and siteClickHandler in order to navigate.
        //Although Document Services and Viewer navigational logic is similar, it do varies.
        describe('Document Services level navigation', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    console.log('Testing Popup navigation integration');
                    ds = harness.documentServices;
                }).then(done, done.fail);
            });

            describe('Navigation from opened popup', function () {

                var popupPage, anotherPage, primaryPage;

                beforeAll(function (done) {
                    primaryPage = ds.pages.getFocusedPage();
                    anotherPage = ds.pages.add('anotherPage');
                    var popupDefinition = componentUtils.getComponentDef(ds, 'POPUP');
                    popupPage = ds.pages.popupPages.add('Popup', popupDefinition);
                    ds.waitForChangesApplied(done);
                });

                beforeEach(function (done) {
                    ds.pages.navigateTo(primaryPage.id);
                    ds.pages.popupPages.open(popupPage.id);
                    ds.waitForChangesApplied(function () {
                        var focusedPageId = ds.pages.getFocusedPageId();
                        expect(focusedPageId).toEqual(popupPage.id);
                        done();
                    });
                });

                it("Should close popup on navigation to primary page", function (done) {
                    ds.pages.navigateTo(primaryPage.id);
                    ds.waitForChangesApplied(function () {
                        var focusedPageId = ds.pages.getFocusedPageId();
                        expect(focusedPageId).not.toEqual(popupPage.id);
                        expect(focusedPageId).toEqual(primaryPage.id);
                        done();
                    });
                });

                it("Should not close popup on navigation to the top ot the same page", function (done) {
                    var masterPageId = ds.pages.getMasterPageId();
                    ds.pages.navigateToAndScroll(masterPageId, "SCROLL_TO_TOP");
                    ds.waitForChangesApplied(function () {
                        var focusedPageId = ds.pages.getFocusedPageId();
                        expect(focusedPageId).toEqual(popupPage.id);
                        done();
                    });
                });

                it("Should close popup on navigation to another (not primary) page", function (done) {
                    ds.pages.navigateTo(anotherPage.id);
                    ds.waitForChangesApplied(function () {
                        var focusedPageId = ds.pages.getFocusedPageId();
                        expect(focusedPageId).not.toEqual(popupPage.id);
                        expect(focusedPageId).toEqual(anotherPage.id);
                        done();
                    });
                });


                it("Should not close popup on navigation to the top of the another page", function (done) {
                    ds.pages.navigateToAndScroll(anotherPage.id, "SCROLL_TO_TOP");
                    ds.waitForChangesApplied(function () {
                        var focusedPageId = ds.pages.getFocusedPageId();
                        expect(focusedPageId).toEqual(popupPage.id);
                        done();
                    });
                });
            });
        });
    });
});
