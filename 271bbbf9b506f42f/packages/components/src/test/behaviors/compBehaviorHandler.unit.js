define([
    'lodash',
    'testUtils',
    'components/behaviors/compBehaviorHandler'
], function (_, testUtils, compBehaviorHandler) {
    'use strict';

    describe('compBehaviorHandler', function () {

        beforeEach(function() {
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.siteAPI = testUtils.mockFactory.mockSiteAPI();
        });

        describe('handle', function() {

            it('should call behaviorAspect.registerBehavior', function(){
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SlideShowGallery', this.siteAPI.getSiteData(), this.siteData.getCurrentUrlPageId());
                var testBehavior = testUtils.mockFactory.behaviorMocks.comp(compStructure.id, 'nextSlide', {});
                var callback = jasmine.createSpy('callback');
                var event = {callback: callback};
                var behaviorAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                spyOn(behaviorAspect, 'registerBehavior').and.callThrough();

                compBehaviorHandler.handle([testBehavior], this.siteAPI, event);

                expect(behaviorAspect.registerBehavior).toHaveBeenCalledWith(testBehavior, callback);
            });

            it('should call forceUpdate in case behavior is not registered', function(){
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SlideShowGallery', this.siteAPI.getSiteData(), this.siteData.getCurrentUrlPageId());
                var testBehavior = testUtils.mockFactory.behaviorMocks.comp(compStructure.id, 'nextSlide', {});
                var callback = jasmine.createSpy('callback');
                var event = {callback: callback};
                var behaviorAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                spyOn(behaviorAspect, 'registerBehavior').and.callThrough();
                spyOn(this.siteAPI, 'forceUpdate');

                compBehaviorHandler.handle([testBehavior], this.siteAPI, event);

                expect(this.siteAPI.forceUpdate.calls.count()).toBe(1);
            });


            it('should call behaviorAspect.registerBehavior multiple times', function(){
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.Sl   ideShowGallery', this.siteAPI.getSiteData(), this.siteData.getCurrentUrlPageId());
                var testBehaviorA = testUtils.mockFactory.behaviorMocks.comp(compStructure.id, 'nextSlide', {});
                var testBehaviorB = testUtils.mockFactory.behaviorMocks.comp(compStructure.id, 'prevSlide', {});
                var behaviors = [testBehaviorA, testBehaviorB];
                var callback = jasmine.createSpy('callback');
                var event = {callback: callback};
                var behaviorAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                spyOn(behaviorAspect, 'registerBehavior').and.callThrough();

                compBehaviorHandler.handle(behaviors, this.siteAPI, event);

                expect(behaviorAspect.registerBehavior.calls.count()).toBe(2);
                expect(behaviorAspect.registerBehavior.calls.argsFor(0)[0]).toEqual(testBehaviorA, callback);
                expect(behaviorAspect.registerBehavior.calls.argsFor(1)[0]).toEqual(testBehaviorB, callback);
            });
        });
    });
});
