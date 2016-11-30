/**
 * Created by vladale on 25/10/2016.
 */
define([
    'lodash',
    'santa-harness',
    'componentUtils'
], function (_,
             santa,
             componentUtils) {
    'use strict';

    xdescribe('Navigation with scroll from opened popup to anchor on another page', function () {
            var ds;
            var popupPage, anotherPage, primaryPage, anchorRefAnotherPage;

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    ds = harness.documentServices;
                    primaryPage = ds.pages.getFocusedPage();
                    anotherPage = ds.pages.add('anotherPage');
                    var anchorDefinition = componentUtils.getComponentDef(ds, 'ANCHOR');
                    anchorRefAnotherPage = ds.components.add(anotherPage, anchorDefinition);
                    var popupDefinition = componentUtils.getComponentDef(ds, 'POPUP');
                    popupPage = ds.pages.popupPages.add('Popup', popupDefinition);
                    ds.waitForChangesApplied(done);
                });
            });


            it("fails on timeout when starts from opened popup ", function (done) {
                var focusedPageId;
                ds.pages.popupPages.open(popupPage.id); // <- if you remove it this test will success
                ds.pages.navigateToAndScroll(anotherPage.id, anchorRefAnotherPage.id);
                ds.waitForChangesApplied(function () {                 //<- this callback happens before scrollToAnchor callback is called
                    focusedPageId = ds.pages.getFocusedPageId();
                    expect(focusedPageId).not.toEqual(popupPage.id);
                    expect(focusedPageId).toEqual(anotherPage.id);
                    ds.pages.navigateTo(primaryPage.id);
                    ds.pages.popupPages.open(popupPage.id);  // <- if you remove it this test will success
                    ds.waitForChangesApplied(function () {
                        focusedPageId = ds.pages.getFocusedPageId();
                        expect(focusedPageId).toEqual(popupPage.id);
                        done();
                    });
                });
            });
        });
});
