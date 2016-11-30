define(['lodash', 'testUtils', 'coreUtils/core/viewportUtils'], function (_, testUtils, viewportUtils) {
    'use strict';

    describe('viewportUtils', function () {

        beforeEach(function () {
            var mockMeasureMap = {
                height: {
                    screen: 800,

                    shortCompStart: 100,
                    medCompStart: 1000,
                    longCompStart: 10000,

                    shortCompMid: 100,
                    medCompMid: 1000,
                    longCompMid: 10000,

                    shortCompEnd: 100,
                    medCompEnd: 1000,
                    longCompEnd: 10000
                },
                absoluteTop: {
                    shortCompStart: 0,
                    medCompStart: 0,
                    longCompStart: 0,

                    shortCompMid: 500,
                    medCompMid: 500,
                    longCompMid: 500,

                    shortCompEnd: 5000,
                    medCompEnd: 5000,
                    longCompEnd: 5000
                }
            };
            var mockSiteData = testUtils
                .mockFactory
                .mockSiteData()
                .addMeasureMap(mockMeasureMap);

            this.siteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
        });

        describe('scroll 0', function () {
            it('should have components with top 0 in viewport', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'shortCompStart', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'medCompStart', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'longCompStart', 0)).toBeTruthy();
            });

            it('should have components with top 500 in viewport', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'shortCompMid', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'medCompMid', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'longCompMid', 0)).toBeTruthy();
            });

            it('should have components with top 0 in viewport regardless of threshold', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'shortCompStart', 0.15)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'medCompStart', 0.15)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'longCompStart', 0.15)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'shortCompStart', 0.75)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'medCompStart', 0.75)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'longCompStart', 0.75)).toBeTruthy();
            });

            it('should have components with top 10000 out of viewport', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'shortCompEnd', 0)).toBeFalsy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'medCompEnd', 0)).toBeFalsy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 0}, 'longCompEnd', 0)).toBeFalsy();
            });
        });

        describe('scroll 5000', function () {
            it('should have components with top 5000 in viewport', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'shortCompEnd', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'medCompEnd', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'longCompEnd', 0)).toBeTruthy();
            });

            it('should have all long components in y 0 and 500 in viewport', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'longCompStart', 0)).toBeTruthy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'longCompMid', 0)).toBeTruthy();
            });

            it('should have all short components in y 0 and 500 out of viewport', function () {
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'shortCompStart', 0)).toBeFalsy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'medCompStart', 0)).toBeFalsy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'shortCompMid', 0)).toBeFalsy();
                expect(viewportUtils.isInViewport(this.siteAPI, {x: 0, y: 5000}, 'medCompMid', 0)).toBeFalsy();
            });
        });
    });
});
