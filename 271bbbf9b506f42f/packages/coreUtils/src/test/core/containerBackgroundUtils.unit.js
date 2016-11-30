define(['lodash', 'coreUtils/core/containerBackgroundUtils', 'testUtils'], function (_, containerBackgroundUtils, testUtils) {
    'use strict';
    describe('containerBackgroundUtils public functions', function () {

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
            _.set(this.siteData, ['renderFlags', 'renderFixedPositionBackgrounds'], true);
        });

        describe('getBgData', function(){
            it('should return background from compDesign data', function(){
                var compDesign = {
                    background: {backgroundData: 'compDesignBackground'}
                };

                var bgData = containerBackgroundUtils.getBgData(compDesign);

                expect(bgData).toEqual(compDesign.background);
            });

            it('should return compData.background if compDesign.background is not defined', function(){
                var compDesign = {};
                var compData = {
                    background: {backgroundData: 'compDataBackground'}
                };

                var bgData = containerBackgroundUtils.getBgData(compDesign, compData);

                expect(bgData).toEqual(compData.background);
            });

            it('should return compDesign.background if background defined in compDesign and compData', function(){
                var compDesign = {
                    background: {backgroundData: 'compDesignBackground'}
                };
                var compData = {
                    background: {backgroundData: 'compDataBackground'}
                };

                var bgData = containerBackgroundUtils.getBgData(compDesign, compData);

                expect(bgData).toEqual(compDesign.background);
            });

            it('should return empty obj if compDesign and compData are not defined', function(){
                var bgData = containerBackgroundUtils.getBgData(undefined, undefined);

                expect(bgData).toEqual({});
            });

            it('should return empty obj if compDesign.background and compData.background are not defined', function(){
                var compDesign = {};
                var compData = {};

                var bgData = containerBackgroundUtils.getBgData(compDesign, compData);

                expect(bgData).toEqual({});
            });
        });

        describe('getPositionByEffect', function () {
            it('should return fixed', function () {
                var fixedPos = containerBackgroundUtils.getPositionByEffect('BackgroundReveal', true);
                expect(fixedPos).toEqual('fixed');

            });

            it('should return absolute if renderFixedPositionBackgrounds is false', function(){
                var renderFixedPositionBackgrounds = false;
                var positionByEffect = containerBackgroundUtils.getPositionByEffect('BackgroundReveal', renderFixedPositionBackgrounds);
                expect(positionByEffect).toEqual('absolute');
            });

            it('should return absolute', function () {
                var absolutePos = containerBackgroundUtils.getPositionByEffect('BackgroundFadeIn', true);
                var absolutePosIfNone = containerBackgroundUtils.getPositionByEffect('None', true);
                expect(absolutePos).toEqual('absolute');
                expect(absolutePosIfNone).toEqual('absolute');
            });
        });

        describe('getHeightByEffect', function () {
            var measureMap = {
                height: {
                    screen: 1000
                }
            };
            var compHeight = 500;

            it('should return measureMap.height.screen', function () {
                var screen = containerBackgroundUtils.getHeightByEffect('BackgroundReveal', measureMap, compHeight);
                expect(screen).toEqual(measureMap.height.screen);

            });
            it('should return compHeight', function () {
                var component = containerBackgroundUtils.getHeightByEffect('BackgroundFadeIn', measureMap, compHeight);
                var componentNone = containerBackgroundUtils.getHeightByEffect('None', measureMap, compHeight);
                expect(component).toEqual(compHeight);
                expect(componentNone).toEqual(compHeight);
            });

        });

        describe('isFullScreenByEffect', function () {
            it('should return true', function () {
                var fullTrue = containerBackgroundUtils.isFullScreenByEffect('BackgroundReveal', true);
                expect(fullTrue).toEqual(true);

            });

            it('should return false if renderFixedPositionBackgrounds is false ', function () {
                var renderFixedPositionBackgrounds = false;
                var fullTrue = containerBackgroundUtils.isFullScreenByEffect('BackgroundReveal', renderFixedPositionBackgrounds);
                expect(fullTrue).toEqual(false);

            });

            it('should return false', function () {
                var fullFalse = containerBackgroundUtils.isFullScreenByEffect('BackgroundFadeIn', true);
                var fullFalseNone = containerBackgroundUtils.isFullScreenByEffect('None', true);
                expect(fullFalse).toEqual(false);
                expect(fullFalseNone).toEqual(false);
            });

        });

        describe('getBgEffectName', function () {
            var singleBehavior = [{action: 'bgScrub', name: 'BackgroundParallax'}];
            var multiBehaviors = [{action: 'bgScrub', name: 'BackgroundParallax'}, {action: 'bgScrub', name: 'BackgroundZoom'}];

            it('should return BackgroundParallax', function () {
                var isDesktopDevice = true;
                var isMobileView = false;
                var bgParallax = containerBackgroundUtils.getBgEffectName(singleBehavior, isDesktopDevice, isMobileView);
                expect(bgParallax).toEqual('BackgroundParallax');
            });
            it('should return BackgroundParallaxZoom', function () {
                var isDesktopDevice = true;
                var isMobileView = false;
                var bgParallaxZoom = containerBackgroundUtils.getBgEffectName(multiBehaviors, isDesktopDevice, isMobileView);
                expect(bgParallaxZoom).toEqual('BackgroundParallaxZoom');
            });

            it('should return empty string if not on desktop device', function(){
                var isDesktopDevice = false;
                var isMobileView = false;
                var bgParallaxZoom = containerBackgroundUtils.getBgEffectName(multiBehaviors, isDesktopDevice, isMobileView);
                expect(bgParallaxZoom).toEqual('');
            });

            it('should return empty string on mobile view', function(){
                var isDesktopDevice = true;
                var isMobileView = true;
                var bgParallaxZoom = containerBackgroundUtils.getBgEffectName(multiBehaviors, isDesktopDevice, isMobileView);
                expect(bgParallaxZoom).toEqual('');
            });

        });

        describe('return values for renderFixedPositionBackgrounds = false', function () {
            it('should return absolute', function () {
                var renderFixedPositionBackgrounds = false;

                var fixedPos = containerBackgroundUtils.getPositionByEffect('BackgroundReveal', renderFixedPositionBackgrounds);
                expect(fixedPos).toEqual('absolute');
            });

            it('should return false', function () {
                var renderFixedPositionBackgrounds = false;

                var fullTrue = containerBackgroundUtils.isFullScreenByEffect('BackgroundReveal', renderFixedPositionBackgrounds);
                expect(fullTrue).toEqual(false);
            });
        });
    });
});
