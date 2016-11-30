define([
    'lodash',
    'santa-harness',
    'componentUtils',
    'generalUtils',
    'beakerUtils/matchers/index'
], function (_, santa, componentUtils, generalUtils, matchers) {
    'use strict';

    describe('Popup children', function () {
        var ds;
        var siteDocument;
        var popupPage, popupContainer;

        beforeAll(function (done) {
            santa.start({site: 'popup-children'}).then(function (harness) {
                console.log('Testing Popup children integration');
                ds = harness.documentServices;
                siteDocument = harness.window.document;
                var popup = _.find(ds.pages.popupPages.getDataList(), {title: "blank popup"});
                popupPage = ds.pages.getReference(popup.id);
                popupContainer = ds.components.getChildren(popupPage)[0];
                jasmine.addMatchers(matchers);
                done();
            }).catch(done.fail);
        });

        xdescribe('Things which close popup', function () {

            function isPopupLoadedInDom() {
                return !!componentUtils.getComponentDomNode(siteDocument, popupContainer.id);
            }

            function isPopupUnloadedFromDom() {
                return !isPopupLoadedInDom();
            }

            beforeEach(function (done) {

                function isNavigationButtonFound() {
                    var buttons = generalUtils.getButtonsElementsWithTitle(ds, siteDocument, 'Open popup');
                    return buttons.length > 0;
                }

                function navigateToPopup() {
                    var buttons = generalUtils.getButtonsElementsWithTitle(ds, siteDocument, 'Open popup');
                    buttons[0].click();
                    expect(isPopupLoadedInDom).toBecomeEventuallyTrue({
                        maximumTime: 1000,
                        success: done,
                        fail: function (message) {
                            done.fail("Failed to open a popup: " + message);
                        }
                    });
                }

                expect(isNavigationButtonFound).toBecomeEventuallyTrue({
                    maximumTime: 100,
                    success: navigateToPopup,
                    fail: function (message) {
                        done.fail("Failed to find navigation button DOM element: " + message);
                    }
                });
            });


            function navigateFromPopup(domElemForClosingPopupGetFunction, done) {
                domElemForClosingPopupGetFunction().click();

                expect(isPopupUnloadedFromDom).toBecomeEventuallyTrue({
                    maximumTime: 1000,
                    success: done,
                    fail: function (message) {
                        done.fail("Failed to close a popup: " + message);
                    }
                });
            }


            it('should close popup on Overlay click', function (done) {

                function getOverlayDomElem() {
                    return componentUtils.getSkinPartDomNode(siteDocument, popupPage.id, 'balata');
                }

                expect(function hasOverlayDomElem() {
                    return !!getOverlayDomElem();
                }).toBecomeEventuallyTrue({
                    maximumTime: 1000,
                    success: navigateFromPopup.bind(this, getOverlayDomElem, done),
                    fail: function (message) {
                        done.fail("Failed to find overlay DOM element: " + message);
                    }
                });
            });

            it('should close popup on popup close Text button click', function (done) {

                function getButtonClosingPopupDomElem() {
                    return componentUtils.getComponentDomNode(siteDocument, textButtonRef.id);
                }

                var textButtonRef = ds.components.add(popupContainer, componentUtils.getComponentDef(ds, 'POPUP_CLOSE_TEXT_BUTTON'));
                ds.waitForChangesApplied(function () {

                    expect(function hasButtonClosingPopupDomElem() {
                        return !!getButtonClosingPopupDomElem();
                    }).toBecomeEventuallyTrue({
                        maximumTime: 1000,
                        success: navigateFromPopup.bind(this, getButtonClosingPopupDomElem, done),
                        fail: function (message) {
                            done.fail("Failed to find close text button DOM element: " + message);
                        }
                    });
                });
            });

            it('should close popup on Icon button click', function (done) {

                function getIconClosingPopupDomElem() {
                    return componentUtils.getComponentDomNode(siteDocument, xButtonRef.id);
                }

                var xButtonRef = ds.components.add(popupContainer, componentUtils.getComponentDef(ds, 'POPUP_CLOSE_ICON_BUTTON'));
                ds.waitForChangesApplied(function () {

                    expect(function hasIconClosingPopupDomElem() {
                        return !!getIconClosingPopupDomElem();
                    }).toBecomeEventuallyTrue({
                        maximumTime: 1000,
                        success: navigateFromPopup.bind(this, getIconClosingPopupDomElem, done),
                        fail: function (message) {
                            done.fail("Failed to find close icon button DOM element: " + message);
                        }
                    });
                });
            });
        });
    });
});
