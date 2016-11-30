define([
    'documentServices/structure/utils/windowScroll'
], function (windowScroll) {
    'use strict';


    describe('Window Scroll', function () {
        describe('getScroll:', function () {
            beforeEach(function () {
                this.popupDOMNode = {
                    scrollTop: 0,
                    scrollLeft: 0
                };

                this.ps = {
                    siteAPI: {
                        isPopupOpened: jasmine.createSpy('isPopupOpened').and.returnValue(false)
                    }
                };

                spyOn(window.document, 'getElementById').and.returnValue(this.popupDOMNode);
            });

            it('should return window "scrollY" and "scrollX"', function () {
                expect(windowScroll.getScroll(this.ps)).toEqual({
                    x: window.scrollX,
                    y: window.scrollY
                });
            });

            describe('popup is opened', function () {
                beforeEach(function () {
                    this.ps.siteAPI.isPopupOpened.and.returnValue(true);
                });

                it('should return popup root scroll position, if a popup is opened', function () {
                    this.popupDOMNode.scrollLeft = 10;
                    this.popupDOMNode.scrollTop = 20;

                    expect(windowScroll.getScroll(this.ps)).toEqual({
                        x: 10,
                        y: 20
                    });
                });

                it('should return popup root scroll position, if a popup is opened', function () {
                    this.popupDOMNode.scrollLeft = 100;
                    this.popupDOMNode.scrollTop = 200;

                    expect(windowScroll.getScroll(this.ps)).toEqual({
                        x: 100,
                        y: 200
                    });
                });
            });
        });

        describe('setScroll:', function () {
            function expectToScroll(DOMNode, x, y) {
                expect(DOMNode.scrollTop).toBe(x);
                expect(DOMNode.scrollLeft).toBe(y);
                expect(window.scrollTo).not.toHaveBeenCalled();
            }

            beforeEach(function () {
                this.popupDOMNode = {
                    scrollTop: 0,
                    scrollLeft: 0
                };

                this.ps = {
                    siteAPI: {
                        isPopupOpened: jasmine.createSpy('isPopupOpened').and.returnValue(false)
                    }
                };

                spyOn(window.document, 'getElementById').and.returnValue(this.popupDOMNode);
                spyOn(window, 'scrollTo');
            });

            it('should scroll "window" to "x" and "y"', function () {
                windowScroll.setScroll(this.ps, 1, 1);

                expect(window.scrollTo).toHaveBeenCalledWith(1, 1);
            });

            it('should scroll "window" to "x" and "y"', function () {
                windowScroll.setScroll(this.ps, 2, 2);

                expect(window.scrollTo).toHaveBeenCalledWith(2, 2);
            });

            it('should scroll popup root div, if popup is opened', function () {
                this.ps.siteAPI.isPopupOpened.and.returnValue(true);

                windowScroll.setScroll(this.ps, 1, 1);

                expectToScroll(this.popupDOMNode, 1, 1);
            });

            it('should scroll popup root div, if popup is opened', function () {
                this.ps.siteAPI.isPopupOpened.and.returnValue(true);

                windowScroll.setScroll(this.ps, 2, 2);

                expectToScroll(this.popupDOMNode, 2, 2);
            });
        });
    });
});
