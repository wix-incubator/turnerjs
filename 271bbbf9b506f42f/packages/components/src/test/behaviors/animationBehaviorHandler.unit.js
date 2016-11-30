define([
    'lodash',
    'testUtils',
    'components/behaviors/animationBehaviorHandler'
], function (_, testUtils, animationBehaviorHandler) {
    'use strict';

    describe('animationBehaviorHandler', function () {

        beforeEach(function() {
            this.pageId = 'testPageId';
            this.siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults('testPageId');
            this.siteData.setCurrentPage('testPageId');
            this.component = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.WPhoto', this.siteData, this.pageId);
            this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
        });

        describe('handle', function() {

            it('should call playAnimations with the correct animation in desktop mode', function() {
                var action = "ActionName";
                var mockedBehaviors = [testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'})];
                var callback = _.noop;
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'playAnimations');

                animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {callback: callback, action: action});

                expect(animationsAspect.playAnimations).toHaveBeenCalledWith(action, mockedBehaviors, true, callback);
            });

            it('should ignore hidden components', function() {
                var compProps = testUtils.mockFactory.dataMocks.imageProperties();
                compProps.isHidden = true;
                var hiddenComp = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.WPhoto', this.siteData, this.pageId, {props: compProps});
                this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
                var action = "ActionName";
                var mockedBehaviors = [
                    testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'}),
                    testUtils.mockFactory.behaviorMocks.animation('SlideIn', hiddenComp.id, {direction: 'left'})
                ];

                var callback = _.noop;
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'playAnimations');

                animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {callback: callback, action: action});

                var expectedBehaviors = [mockedBehaviors[0]];
                expect(animationsAspect.playAnimations).toHaveBeenCalledWith(action, expectedBehaviors, true, callback);
            });

            it('should ignore collapsed components', function() {
                var compProps = testUtils.mockFactory.dataMocks.imageProperties();
                compProps.isCollapsed = true;
                var hiddenComp = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.WPhoto', this.siteData, this.pageId, {props: compProps});
                this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
                var action = "ActionName";
                var mockedBehaviors = [
                    testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'}),
                    testUtils.mockFactory.behaviorMocks.animation('SlideIn', hiddenComp.id, {direction: 'left'})
                ];

                var callback = _.noop;
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'playAnimations');

                animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {callback: callback, action: action});

                var expectedBehaviors = [mockedBehaviors[0]];
                expect(animationsAspect.playAnimations).toHaveBeenCalledWith(action, expectedBehaviors, true, callback);
            });

            it('should call playAnimations and override action name with group', function() {
                var action = "ActionName";
                var group = "BehaviorGroup";
                var mockedBehaviors = [testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'})];
                var callback = _.noop;
                var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                spyOn(animationsAspect, 'playAnimations');

                animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {callback: callback, action: action, group: group});

                expect(animationsAspect.playAnimations).toHaveBeenCalledWith(group, mockedBehaviors, true, callback);
            });

            describe('mobile mode', function(){

                beforeEach(function(){
                    this.siteData.setMobileView(true);
                });

                it('should not call playAnimations', function(){
                    var action = "ActionName";
                    var mockedBehaviors = [testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'})];
                    var callback = _.noop;
                    var animationsAspect = this.siteAPI.getSiteAspect('animationsAspect');
                    spyOn(animationsAspect, 'playAnimations');

                    animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {callback: callback, action: action});

                    expect(animationsAspect.playAnimations).not.toHaveBeenCalled();
                });

                it('should execute the given callback asynchronously', function(done){
                    var action = "ActionName";
                    var mockedBehaviors = [testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'})];
                    var callback = jasmine.createSpy();

                    animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {callback: callback, action: action});

                    expect(callback).not.toHaveBeenCalled();
                    _.defer(function(){
                        expect(callback).toHaveBeenCalledWith();
                        done();
                    });
                });

                it('should not throw if no callback is passed', function(){
                    var action = "ActionName";
                    var mockedBehaviors = [testUtils.mockFactory.behaviorMocks.animation('SlideIn', this.component.id, {direction: 'left'})];

                    expect(function(){
                        animationBehaviorHandler.handle(mockedBehaviors, this.siteAPI, {action: action});
                    }.bind(this)).not.toThrow();
                });
            });
        });

        describe('isEnabled', function() {
            it('should return false in case of mobile view', function() {
                this.siteData.setMobileView(true);

                expect(animationBehaviorHandler.isEnabled({}, this.siteAPI)).toBeFalsy();
            });

            it('should return true is case of desktop view', function() {
                this.siteData.setMobileView(false);

                expect(animationBehaviorHandler.isEnabled({}, this.siteAPI)).toBeTruthy();
            });
        });
    });
});
