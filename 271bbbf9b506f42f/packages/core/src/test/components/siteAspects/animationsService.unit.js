define(['testUtils', 'core/components/siteAspects/animationsService'], function (testUtils, animationsService) {
    'use strict';

    describe('animationsService', function () {

        beforeEach(function() {
            this.animationGroup = jasmine.createSpy('animationGroup');
            this.animations = jasmine.createSpy('animations');
            this.onCompleteCallback = jasmine.createSpy('onCompleteCallback');
            this.siteAPI = testUtils.mockFactory.mockSiteAPI();
        });


        describe('playAnimations', function(){

            it('should call the provided callback given that no animationsAspect was registered', function(){
                spyOn(this.siteAPI, 'getSiteAspect').and.returnValue(undefined);

                animationsService.playAnimations(this.siteAPI, this.animationGroup, this.animations, true, this.onCompleteCallback);

                expect(this.onCompleteCallback).toHaveBeenCalled();
            });

            it('should not fail it no callback was provided and given that no animationsAspect was registered', function(){
                spyOn(this.siteAPI, 'getSiteAspect').and.returnValue(undefined);

                expect(animationsService.playAnimations.bind(null, this.siteAPI, this.animationGroup, this.animations, true, undefined)).not.toThrow();
            });

            it('should call the animationsAspect playAnimations given the aspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'playAnimations');

                animationsService.playAnimations(this.siteAPI, this.animationGroup, this.animations, true, this.onCompleteCallback);

                expect(animationsAspect.playAnimations).toHaveBeenCalledWith(this.animationGroup, this.animations, true, this.onCompleteCallback);
            });
        });

        describe('hideElementsByAnimationType', function(){
            it('should call the animationsAspect hideElementsByAnimationType given the aspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'hideElementsByAnimationType');

                animationsService.hideElementsByAnimationType(this.siteAPI, this.animations);

                expect(animationsAspect.hideElementsByAnimationType).toHaveBeenCalledWith(this.animations);
            });

            it('should not call the hideElementsByAnimationType method if no animationsAspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'hideElementsByAnimationType');
                spyOn(this.siteAPI, 'getSiteAspect').and.returnValue(undefined);

                animationsService.hideElementsByAnimationType(this.siteAPI, this.animations);

                expect(animationsAspect.hideElementsByAnimationType).not.toHaveBeenCalled();
            });
        });

        describe('revertHideElementsByAnimations', function(){
            it('should call the animationsAspect revertHideElementsByAnimations given the aspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'revertHideElementsByAnimations');

                animationsService.revertHideElementsByAnimations(this.siteAPI, this.animations);

                expect(animationsAspect.revertHideElementsByAnimations).toHaveBeenCalledWith(this.animations);
            });

            it('should not call the revertHideElementsByAnimations method if no animationsAspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'revertHideElementsByAnimations');
                spyOn(this.siteAPI, 'getSiteAspect').and.returnValue(undefined);

                animationsService.revertHideElementsByAnimations(this.siteAPI, this.animations);

                expect(animationsAspect.revertHideElementsByAnimations).not.toHaveBeenCalled();
            });
        });

        describe('stopAndClearAnimations', function(){
            it('should call the animationsAspect stopAndClearAnimations given the aspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'stopAndClearAnimations');

                animationsService.stopAndClearAnimations(this.siteAPI, this.animations, 0);

                expect(animationsAspect.stopAndClearAnimations).toHaveBeenCalledWith(this.animations, 0);
            });

            it('should not call the hideElementsByAnimationType method if no animationsAspect was registered', function(){
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'stopAndClearAnimations');
                spyOn(this.siteAPI, 'getSiteAspect').and.returnValue(undefined);

                animationsService.stopAndClearAnimations(this.siteAPI, this.animations, 0);

                expect(animationsAspect.stopAndClearAnimations).not.toHaveBeenCalled();
            });
        });
    });
});
