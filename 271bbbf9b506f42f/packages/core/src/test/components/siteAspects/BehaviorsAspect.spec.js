define([
    'lodash',
    'testUtils',
    'core/components/behaviorHandlers/behaviorHandlersFactory',
    'core/components/siteAspects/behaviorsService',
    'utils'
], function (_, testUtils, behaviorHandlersFactory, behaviorsService, utils) {
    'use strict';

    describe('BehaviorsAspect', function () {

        var mockSiteAPI, mockSiteData;
        var action, behavior, event, mockBehaviorHandler, behaviorsAspect;
        beforeEach(function() {
            mockSiteData = testUtils.mockFactory.mockSiteData();
            mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
            behaviorsAspect = mockSiteAPI.getSiteAspect('behaviorsAspect');
            mockBehaviorHandler = getMockBehaviorHandler();
            behaviorHandlersFactory.registerHandler('behaviorType', mockBehaviorHandler);
            action = {type: 'actionType', name: 'actionName', sourceId: 'sourceIdValue'};
            behavior = {type: 'behaviorType', name: 'behaviorName', targetId: 'targetIdValue', params: {dummy: 'dummy behavior params'}};
            event = {type: action.name, action: action.name, target: action.sourceId};
        });


        function getMockBehaviorHandler() {
            return {
                handle: jasmine.createSpy('handle')
            };
        }

        function setBehaviorsForActions(actionsAndBehaviors, pageId) {
            behaviorsAspect.setBehaviorsForActions(actionsAndBehaviors, pageId);
            mockSiteData.measureMap = {top: {}};
            _.forEach(actionsAndBehaviors, function (actionBehavior) {
                mockSiteData.measureMap.top[actionBehavior.action.sourceId] = 100;
                mockSiteData.measureMap.top[actionBehavior.behavior.targetId] = 100;
            });
            behaviorsAspect._handleDidLayout();
        }

        describe('handleAction', function() {

            describe('when a behavior is registered to the given action', function() {

                it('should call the right behavior handler according to the action\'s type, name & sourceId', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    behaviorsAspect.handleAction(action, event);

                    expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);
                    expect(mockBehaviorHandler.handle).toHaveBeenCalledWith([behavior], mockSiteAPI, event);
                });

                it('should call the behavior handler with an event obj containing the action name and action sourceId', function() {
                    var myAction = {type: 'myActionType', name: 'Heliwow', sourceId: 'someSourceId'};
                    setBehaviorsForActions([{action: myAction, behavior: behavior}, {action: action, behavior: behavior}], 'currentPage');
                    var myEvent = {
                        type: myAction.type,
                        action: myAction.name
                    };

                    behaviorsAspect.handleAction(myAction, myEvent);

                    var expectedEvent = {
                        type: myAction.type,
                        action: myAction.name
                    };
                    expect(mockBehaviorHandler.handle).toHaveBeenCalledWith([behavior], mockSiteAPI, expectedEvent);
                });

                it('should call the right behavior handler on successive actions', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    behaviorsAspect.handleAction(action, event);
                    behaviorsAspect.handleAction(action, event);

                    expect(mockBehaviorHandler.handle.calls.count()).toEqual(2);
                    expect(mockBehaviorHandler.handle.calls.argsFor(0)).toEqual([[behavior], mockSiteAPI, event]);
                    expect(mockBehaviorHandler.handle.calls.argsFor(1)).toEqual([[behavior], mockSiteAPI, event]);
                });

                it('should call the right behavior handler on successive actions', function() {
                    var behavior2 = _.clone(behavior);
                    setBehaviorsForActions([{action: action, behavior: behavior}, {action: action, behavior: behavior2}], 'currentPage');
                    behaviorsAspect.handleAction(action, event);

                    expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);
                    expect(mockBehaviorHandler.handle.calls.argsFor(0)).toEqual([[behavior, behavior2], mockSiteAPI, event]);
                    //expect(mockBehaviorHandler.handle.calls.argsFor(1)).toEqual([behavior2, mockSiteAPI, event]);
                });

                it('should call the right behavior handler for a copy of the action object', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    behaviorsAspect.handleAction(_.cloneDeep(action), event);

                    expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);
                    expect(mockBehaviorHandler.handle).toHaveBeenCalledWith([behavior], mockSiteAPI, event);
                });

                it('should not call the handler when the action type is different', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    behaviorsAspect.handleAction(_.assign({}, action, {type: 'anotherActionType'}));

                    expect(mockBehaviorHandler.handle).not.toHaveBeenCalled();
                });

                it('should not call the handler when the action name is different', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    behaviorsAspect.handleAction(_.assign({}, action, {name: 'anotherActionName'}));

                    expect(mockBehaviorHandler.handle).not.toHaveBeenCalled();
                });

                it('should not call the handler when the action sourceId is different', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    behaviorsAspect.handleAction(_.assign({}, action, {sourceId: 'anotherSourceId'}));

                    expect(mockBehaviorHandler.handle).not.toHaveBeenCalled();
                });

                it('should not call handlers of other behavior types', function() {
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                    var anotherMockBehaviorHandler = getMockBehaviorHandler();
                    behaviorHandlersFactory.registerHandler('otherBehaviorType', anotherMockBehaviorHandler);
                    behaviorsAspect.handleAction(action);

                    expect(anotherMockBehaviorHandler.handle).not.toHaveBeenCalled();
                });

            });

            describe('when multiple behaviors are registered to the same action', function() {

                it('should call multiple behavior handlers of for each behavior registered to the action', function() {
                    var type = 'otherBehaviorType';
                    var anotherBehavior = _.defaults({type: type}, behavior);
                    setBehaviorsForActions([{action: action, behavior: behavior}, {action: action, behavior: anotherBehavior}], 'currentPage');
                    var anotherMockBehaviorHandler = getMockBehaviorHandler();
                    behaviorHandlersFactory.registerHandler(type, anotherMockBehaviorHandler);
                    behaviorsAspect.handleAction(action, event);

                    expect(mockBehaviorHandler.handle).toHaveBeenCalledWith([behavior], mockSiteAPI, event);
                    expect(anotherMockBehaviorHandler.handle).toHaveBeenCalledWith([anotherBehavior], mockSiteAPI, event);
                });

                it('should call the same behavior handler when registered to the action for different behaviors', function() {
                    var behavior2 = _.defaults({targetId:'someOtherTarget'}, behavior);
                    setBehaviorsForActions([{action: action, behavior: behavior}, {action: action, behavior: behavior2}], 'currentPage');
                    behaviorsAspect.handleAction(action, event);

                    expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);
                    expect(mockBehaviorHandler.handle.calls.argsFor(0)).toEqual([[behavior, behavior2], mockSiteAPI, event]);
                    //expect(mockBehaviorHandler.handle.calls.argsFor(1)).toEqual([behavior2, mockSiteAPI, event]);
                });

            });

            describe('when action does not have any behavior', function() {

                it('should not call any handlers', function() {
                    behaviorsAspect.handleAction(action);

                    expect(mockBehaviorHandler.handle).not.toHaveBeenCalled();
                });

            });

            describe('error states', function() {

                it('should not break if a behavior handler is missing', function() {
                    spyOn(utils.log, 'warn');
                    behavior.type = 'otherType';
                    setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');

                    expect(behaviorsAspect.handleAction.bind(behaviorsAspect, action)).not.toThrow();
                    expect(utils.log.warn).toHaveBeenCalledWith('there is no behavior handler for type ' + behavior.type);
                });

            });

        });

        describe('setBehaviorsForActions', function() {

            it("should remove old actions on the page if they don't in the new ", function() {
                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                behaviorsAspect.handleAction(action, 'currentPage');
                expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);

                setBehaviorsForActions([], 'currentPage');
                behaviorsAspect.handleAction(action, 'currentPage');
                expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);
            });

            it('should add new actions on the page', function() {
                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                behaviorsAspect.handleAction(action, 'currentPage'); // +1
                expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);

                var action2 = _.defaults({name: 'action2'}, action);
                setBehaviorsForActions([{action: action, behavior: behavior}, {action: action2, behavior: behavior}], 'currentPage');

                behaviorsAspect.handleAction(action, 'currentPage'); // + 1
                behaviorsAspect.handleAction(action2, 'currentPage'); // + 1
                expect(mockBehaviorHandler.handle.calls.count()).toEqual(3);
            });

            it('should add behaviors which isEnabled return true', function() {
                mockBehaviorHandler = {
                    handle: jasmine.createSpy('handle'),
                    isEnabled: function() {return true;}
                };
                behaviorHandlersFactory.registerHandler('newBehavior', mockBehaviorHandler);
                action = {type: 'actionType', name: 'actionName', sourceId: 'sourceIdValue'};
                behavior = {type: 'newBehavior', name: 'behaviorName', targetId: 'targetIdValue', params: {dummy: 'dummy behavior params'}};

                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                behaviorsAspect.handleAction(action, 'currentPage'); // +1
                expect(mockBehaviorHandler.handle.calls.count()).toEqual(1);
            });

            it('should remove behaviors which isEnabled return false', function() {
                mockBehaviorHandler = {
                    handle: jasmine.createSpy('handle'),
                    isEnabled: function() {return false;}
                };
                behaviorHandlersFactory.registerHandler('newBehavior', mockBehaviorHandler);
                action = {type: 'actionType', name: 'actionName', sourceId: 'sourceIdValue'};
                behavior = {type: 'newBehavior', name: 'behaviorName', targetId: 'targetIdValue', params: {dummy: 'dummy behavior params'}};

                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                behaviorsAspect.handleAction(action, 'currentPage'); // +1
                expect(mockBehaviorHandler.handle.calls.count()).toEqual(0);
            });
        });

        describe('getActions', function () {
            it('should return empty object if there are no actions for this sourceId and type', function () {
                var actions = behaviorsAspect.getActions('comp', 'id');
                expect(actions).toEqual({});
            });

            it('should return empty object if there are no actions for this sourceId and type even if there are for a different type', function () {
                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                var actions = behaviorsAspect.getActions(action.type, action.sourceId + _.uniqueId());
                expect(actions).toEqual({});
            });

            it('should return the actions that are registered only for this component', function () {
                var action2 = _.defaults({sourceId: 'otherSourceId'}, action);
                setBehaviorsForActions([{action: action, behavior: behavior}, {action: action2, behavior: behavior}], 'currentPage');
                var actions = behaviorsAspect.getActions(action.type, action.sourceId);
                var expected = {};
                expected[action.name] = action;
                expect(actions).toEqual(expected);
            });

            it('should return all actions that are registered only for this component even from different pages', function () {
                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');

                var action2 = _.defaults({name: 'otherActionName'}, action);
                var behavior2 = _.defaults({targetId: 'otherTargetId'}, behavior);
                setBehaviorsForActions([{action: action2, behavior: behavior2}], 'masterPage');

                var actions = behaviorsAspect.getActions(action.type, action.sourceId);
                var expected = {};
                expected[action.name] = action;
                expected[action2.name] = action2;
                expect(actions).toEqual(expected);
            });

            it('should return unique actions that are registered for this component', function () {
                setBehaviorsForActions([{action: action, behavior: behavior}], 'currentPage');
                var behavior2 = _.defaults({targetId: 'otherTargetId'}, behavior);
                setBehaviorsForActions([{action: action, behavior: behavior2}], 'masterPage');
                var actions = behaviorsAspect.getActions(action.type, action.sourceId);
                var expected = {};
                expected[action.name] = action;
                expect(actions).toEqual(expected);
            });
        });

        describe('registerBehavior', function(){
            it('should return the registered behavior', function(){
                behaviorsAspect.registerBehavior(behavior);

                expect(behaviorsAspect.extractBehaviors(behavior.targetId)).toEqual([{name: behavior.name, params: behavior.params, callback: undefined}]);
            });

            it('should return the registered behaviors for the passed targetId in the correct order', function(){
                var componentType = 'wysiwyg.viewer.components.SlideShowGallery';
                var pageId = mockSiteData.getCurrentUrlPageId();
                var targetId = behavior.targetId;
                testUtils.mockFactory.mockComponent(componentType, mockSiteAPI.getSiteData(), pageId, {}, false, targetId);
                var anotherBehavior = testUtils.mockFactory.behaviorMocks.comp(targetId, 'next', {});
                var callback = jasmine.createSpy('callback');
                behaviorsAspect.registerBehavior(behavior, callback);
                behaviorsAspect.registerBehavior(anotherBehavior);

                var expectedResult = [{name: behavior.name, params: behavior.params, callback: callback}, {name: anotherBehavior.name, params: anotherBehavior.params, callback: undefined}];
                expect(behaviorsAspect.extractBehaviors(targetId)).toEqual(expectedResult);
            });

            it('should be able to register 2 identical behaviors', function(){
                var callback = jasmine.createSpy('callback');
                behaviorsAspect.registerBehavior(behavior, callback);
                behaviorsAspect.registerBehavior(behavior, callback);

                var expectedResult = [{name: behavior.name, params: behavior.params, callback: callback}, {name: behavior.name, params: behavior.params, callback: callback}];
                expect(behaviorsAspect.extractBehaviors(behavior.targetId)).toEqual(expectedResult);
            });
        });

        describe('extractBehaviors', function(){
            it('should return an empty array if no behavior was registered for the passed targetId', function(){
                var result = behaviorsAspect.extractBehaviors(behavior.targetId);

                expect(result).toEqual([]);
            });

            it('should return the registered behaviors', function(){
                behaviorsAspect.registerBehavior(behavior);
                behaviorsAspect.registerBehavior(behavior);

                var result = behaviorsAspect.extractBehaviors(behavior.targetId);

                var expectedResult = [{name: behavior.name, params: behavior.params, callback: undefined}, {name: behavior.name, params: behavior.params, callback: undefined}];
                expect(result).toEqual(expectedResult);
            });

            it('should return an empty array when calling extractBehaviors in the second time', function(){
                behaviorsAspect.registerBehavior(behavior);

                var firstResult = behaviorsAspect.extractBehaviors(behavior.targetId);
                var secondResult = behaviorsAspect.extractBehaviors(behavior.targetId);

                expect(firstResult).not.toEqual(secondResult);
                expect(secondResult).toEqual([]);
            });
        });

        describe('handleBehavior', function(){
            it('should proxy the call to the behaviorsService', function(){
                var behaviorEvent = {action: 'ActionName', callback: _.noop};
                spyOn(behaviorsService, 'handleBehaviors');

                behaviorsAspect.handleBehavior(behavior, behaviorEvent);

                expect(behaviorsService.handleBehaviors).toHaveBeenCalledWith(mockSiteAPI, [behavior], behaviorEvent, behavior.type);
            });

            it('should send a processed behavior to behaviorsService in case the there is a registered preprocessor', function(){
                var behaviorType = 'comp';
                var newTargetId = 'I am your new targetId';
                var preprocessor = function(originalBehavior){
                    return _.assign({}, originalBehavior, {targetId: newTargetId});
                };
                behaviorHandlersFactory.registerBehaviorPreprocessor(behaviorType, preprocessor);
                var mockBehavior = testUtils.mockFactory.behaviorMocks[behaviorType]('compId', 'click');
                var behaviorEvent = {action: 'click', callback: _.noop};
                spyOn(behaviorsService, 'handleBehaviors').and.callThrough();
                var expectedBehavior = _.assign({}, mockBehavior, {targetId: newTargetId});

                behaviorsAspect.handleBehavior(mockBehavior, behaviorEvent);

                expect(behaviorsService.handleBehaviors).toHaveBeenCalledWith(mockSiteAPI, [expectedBehavior], behaviorEvent, behaviorType);
            });
        });
    });
});
