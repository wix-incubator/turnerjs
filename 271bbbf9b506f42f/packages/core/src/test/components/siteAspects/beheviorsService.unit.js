define([
    'lodash',
    'testUtils',
    'core/components/behaviorHandlers/behaviorHandlersFactory',
    'core/components/siteAspects/behaviorsService',
    'utils'
], function (_, testUtils, behaviorHandlersFactory, behaviorsService) {
    'use strict';

    describe('behaviorsService', function () {

        var mockSiteAPI, mockSiteData;
        var mockBehaviorHandler;
        beforeEach(function() {
            mockSiteData = testUtils.mockFactory.mockSiteData();
            mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
            mockBehaviorHandler = getMockBehaviorHandler();
            behaviorHandlersFactory.registerHandler('behaviorType', mockBehaviorHandler);
            this.behaviors = [{type: 'behaviorType', name: 'behaviorName', targetId: 'targetIdValue', params: {dummy: 'dummy behavior params'}}];
            this.behaviorsType = _.first(this.behaviors).type;
        });


        function getMockBehaviorHandler() {
            return {
                handle: jasmine.createSpy('handle')
            };
        }

        describe('handleBehaviors', function(){
            it('should call the correct handler handle method with the passed callback', function(){
                var event = {callback: _.noop};

                behaviorsService.handleBehaviors(mockSiteAPI, this.behaviors, event, this.behaviorsType);

                expect(mockBehaviorHandler.handle).toHaveBeenCalledWith(this.behaviors, mockSiteAPI, event);
            });

            it('should call the correct handler handle method when no callback is passed', function(){
                var expectedEventObj = {};

                behaviorsService.handleBehaviors(mockSiteAPI, this.behaviors, null, this.behaviorsType);

                expect(mockBehaviorHandler.handle).toHaveBeenCalledWith(this.behaviors, mockSiteAPI, expectedEventObj);
            });
        });
    });
});
