define([
    'layout/util/spaceCalculationsRegardingWixAds'
], function (spaceCalculationsRegardingWixAds) {
    'use strict';

    describe('In Mobile Viewer,', function () {

        describe('for freemium site with ads,', function () {

            var wixAdHeight = 50;
            var wixAdTop = 1;
            var screenHeight = 600;

            beforeEach(function () {

                this.measureMap = {
                    height: {
                        screen: screenHeight,
                        WIX_ADS: wixAdHeight
                    },
                    top: {
                        WIX_ADS: wixAdTop
                    }
                };
            });

            describe('getFirstVisibleTopCoordinate function', function () {

                it('should return first visible space after wix ads(which are full width)', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstVisibleTopCoordinate(this.measureMap);
                    expect(result).toBe(wixAdHeight + wixAdTop);
                });
            });

            describe('getFirstUnoccupiedTopCoordinate function', function () {

                it('should return first unoccupied space after wix ads(which are full width)', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstUnoccupiedTopCoordinate(this.measureMap);
                    expect(result).toBe(wixAdHeight + wixAdTop);
                });
            });

            describe('getScreenHeightExcludingAds function', function () {

                it('should return screen height excluding ads height', function () {
                    var result = spaceCalculationsRegardingWixAds.getScreenHeightExcludingAds(this.measureMap);
                    expect(result).toBe(screenHeight - wixAdHeight - wixAdTop);
                });
            });
        });

        describe('for premium site without ads', function () {
            var screenHeight = 600;

            beforeEach(function () {

                this.measureMap = {
                    height: {
                        screen: screenHeight
                    },
                    top: {}
                };
            });

            describe('getFirstVisibleTopCoordinate function', function () {

                it('should return 0, cause there are no ads', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstVisibleTopCoordinate(this.measureMap);
                    expect(result).toBe(0);
                });
            });

            describe('getFirstUnoccupiedTopCoordinate function', function () {

                it('should return 0, cause there are no ads', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstUnoccupiedTopCoordinate(this.measureMap);
                    expect(result).toBe(0);
                });
            });

            describe('getScreenHeightExcludingAds function', function () {

                it('Should return full screen height, cause there are no ads', function () {
                    var result = spaceCalculationsRegardingWixAds.getScreenHeightExcludingAds(this.measureMap);
                    expect(result).toBe(screenHeight);
                });
            });
        });

    });

    describe('In Desktop Viewer', function () {

        describe('free freemium site with ads', function () {

            var wixTopAdHeight = 50;
            var wixTopAdTop = 1;
            var wixBottomAdHeight = 60;
            var screenHeight = 600;

            beforeEach(function () {

                this.measureMap = {
                    height: {
                        WIX_ADSdesktopWADTop: wixTopAdHeight,
                        WIX_ADSdesktopWADBottom: wixBottomAdHeight,
                        screen: screenHeight
                    },
                    top: {
                        WIX_ADSdesktopWADTop: wixTopAdTop
                    }
                };
            });

            describe('getFirstVisibleTopCoordinate function', function () {

                it('should return 0  - the first visible space along wix ads (which occupy little space on the top)', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstVisibleTopCoordinate(this.measureMap);
                    expect(result).toBe(0);
                });
            });

            describe('getFirstUnoccupiedTopCoordinate function', function () {

                it('should return first unoccupied space after wix ads(no matter if they are full width or not)', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstUnoccupiedTopCoordinate(this.measureMap);
                    expect(result).toBe(wixTopAdTop + wixTopAdHeight);
                });
            });

            describe('getScreenHeightExcludingAds function', function () {

                it('should return screen height excluding ads height', function () {
                    var result = spaceCalculationsRegardingWixAds.getScreenHeightExcludingAds(this.measureMap);
                    expect(result).toBe(screenHeight - wixTopAdHeight - wixTopAdTop - wixBottomAdHeight);
                });
            });
        });

        describe('free premium site with no ads', function () {
            var screenHeight = 600;

            beforeEach(function () {

                this.measureMap = {
                    height: {
                        screen: screenHeight
                    },
                    top: {}
                };
            });

            describe('getFirstVisibleTopCoordinate function', function () {

                it('should return 0, cause there are no ads', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstVisibleTopCoordinate(this.measureMap);
                    expect(result).toBe(0);
                });
            });

            describe('getFirstUnoccupiedTopCoordinate function', function () {

                it('should return 0, cause there are no ads', function () {
                    var result = spaceCalculationsRegardingWixAds.getFirstUnoccupiedTopCoordinate(this.measureMap);
                    expect(result).toBe(0);
                });
            });

            describe('getScreenHeightExcludingAds function', function () {

                it('Should return full screen height, cause there are no ads', function () {
                    var result = spaceCalculationsRegardingWixAds.getScreenHeightExcludingAds(this.measureMap);
                    expect(result).toBe(screenHeight);
                });
            });
        });
    });
});
