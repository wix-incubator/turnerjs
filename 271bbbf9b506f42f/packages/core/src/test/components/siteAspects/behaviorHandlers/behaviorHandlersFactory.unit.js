define(['lodash', 'testUtils', 'core/components/behaviorHandlers/behaviorHandlersFactory'], function (_, testUtils, behaviorHandlersFactory) {
    'use strict';

    describe('behaviorHandlersFactory', function () {

        function getNewTypeName(){
            return 'barvaz' + _.uniq();
        }

        it('get a handler we already registered - returns the handler', function () {
            var handler = {
                handle: function () {
                    return false;
                }
            };
            var typeName = getNewTypeName();
            behaviorHandlersFactory.registerHandler(typeName, handler);

            var actual = behaviorHandlersFactory.getHandler(typeName);

            expect(actual).toBe(handler);
        });

        it('register twice on the same type returns the last one', function () {
            var handler1 = {
                handle: function () {
                    return false;
                }
            };
            var handler2 = {
                handle: function () {
                    return false;
                }
            };

            var typeName = getNewTypeName();

            behaviorHandlersFactory.registerHandler(typeName, handler1);
            behaviorHandlersFactory.registerHandler(typeName, handler2);

            var actual = behaviorHandlersFactory.getHandler(typeName);

            expect(actual).toBe(handler2);

        });

        it('get a handler we havent registered - empty handler', function () {
            var actual = behaviorHandlersFactory.getHandler(getNewTypeName());

            expect(actual.handle).toBeDefined();
        });

        describe('BehaviorPreprocessor', function(){
            beforeEach(function(){
                var compId = 'someCompId';
                this.originalTargetId = 'someTargetId';
                this.mockBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode(compId, 'someFunc', this.originalTargetId);
                this.mockAction = testUtils.mockFactory.actionMocks.comp('someCompName', compId);
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
            });

            it('should return the behavior as is in case no handler was registered', function(){
                var nonRegisteredPreprocessor = behaviorHandlersFactory.getBehaviorPreprocessor('someType');

                expect(nonRegisteredPreprocessor(this.mockBehavior, this.mockAction, this.mockSiteAPI)).toEqual(this.mockBehavior);
            });

            it('should return the result of the registered preprocessor in case it was registered', function(){
                var addNewProp = function(behavior){
                    return _.assign({}, behavior, {newProp: 'I am the new prop'});
                };
                var preprocessorType = 'someType';
                behaviorHandlersFactory.registerBehaviorPreprocessor(preprocessorType, addNewProp);
                var expectedProcessedBehavior = _.assign({}, this.mockBehavior, {newProp: 'I am the new prop'});

                var registeredPreprocessor = behaviorHandlersFactory.getBehaviorPreprocessor(preprocessorType);

                expect(registeredPreprocessor(this.mockBehavior, this.mockAction, this.mockSiteAPI)).toEqual(expectedProcessedBehavior);
            });

            it('should return the correct preprocessor result in case multiple are registered', function(){
                var addNewProp = function(behavior){
                    return _.assign({}, behavior, {newProp: 'I am the new prop'});
                };
                var changeTargetId = function(behavior){
                    return _.assign({}, behavior, {targetId: 'I am the new targetId'});
                };
                var preprocessorTypeA = 'someType';
                var preprocessorTypeB = 'anotherType';
                behaviorHandlersFactory.registerBehaviorPreprocessor(preprocessorTypeA, addNewProp);
                behaviorHandlersFactory.registerBehaviorPreprocessor(preprocessorTypeB, changeTargetId);
                var expectedProcessedBehavior = _.assign({}, this.mockBehavior, {newProp: 'I am the new prop'});

                var registeredPreprocessor = behaviorHandlersFactory.getBehaviorPreprocessor(preprocessorTypeA);
                var processedBehavior = registeredPreprocessor(this.mockBehavior, this.mockAction, this.mockSiteAPI);

                expect(processedBehavior).toEqual(expectedProcessedBehavior);
                expect(processedBehavior.targetId).toEqual(this.originalTargetId);
            });
        });
    });
});
