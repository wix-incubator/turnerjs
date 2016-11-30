define([
    'lodash',
    'react',
    'core/components/compBehaviorsExecuterMixin',
    'testUtils'
], function(_, React, compBehaviorsExecuterMixin, testUtils) {
    'use strict';

    describe('compBehaviorsExecuter', function() {
        var callback;

        beforeEach(function(){
            this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
            callback = jasmine.createSpy('callback');
            this.compDef = {
                mixins: [compBehaviorsExecuterMixin],
                statics: {
                    behaviors: {
                        behaviorMethodA: {params: ['a', 'c', 'b'], methodName: 'behaviorMethodA'},
                        behaviorMethodB: {methodName: 'behaviorMethodB'},
                        behaviorMethodC: {methodName: 'someOtherName'}
                    }
                },
                behaviorMethodA: _.noop,
                behaviorMethodB: _.noop,
                someOtherName: _.noop,
                render: function () {
                    return React.DOM.div();
                }
            };

        });

        function buildComponentProps(behaviorArr, compId) {
            var compBehaviors = _.map(behaviorArr, function(behavior) {
                return {name: behavior.name, params: behavior.params, callback: callback};
            });
            return {id: compId, compBehaviors: compBehaviors};
        }

        function getCompMethodName(behaviorName, compDef) {
            return _.get(compDef, ['statics', 'behaviors', behaviorName, 'methodName']);
        }

        it('should run the registered behavior methods with the passed params in the defined order when component is rendered for the first time', function(){
            var compId = 'my component';
            var parmas = {b: 'bParamValue', a: 'aParamValue', c: 'cParamValue'};
            var behavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodA', parmas);
            var compProps = buildComponentProps([behavior], compId);
            var methodName = getCompMethodName(behavior.name, this.compDef);
            spyOn(this.compDef, methodName);

            testUtils.getComponentFromDefinition(this.compDef, compProps);

            var behaviorOrderedParams = this.compDef.statics.behaviors[behavior.name].params;
            expect(this.compDef[methodName]).toHaveBeenCalledWith(
                behavior.params[behaviorOrderedParams[0]],
                behavior.params[behaviorOrderedParams[1]],
                behavior.params[behaviorOrderedParams[2]],
                callback
            );
        });

        it('should run the registered behavior methods when the passed params are empty and component is rendered for the first time', function(){
            var compId = 'my component';
            var params = {};
            var behavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodB', params);
            var compProps = buildComponentProps([behavior], compId);
            var methodName = getCompMethodName(behavior.name, this.compDef);
            spyOn(this.compDef, methodName);

            testUtils.getComponentFromDefinition(this.compDef, compProps);

            expect(this.compDef[methodName]).toHaveBeenCalledWith(callback);
        });

        it('should run all registered behavior methods (multiple), with the passed params when component is rendered for the first time', function(){
            var compId = 'my component';
            var paramsA = {b: 'bParamValue', a: 'aParamValue', c: 'cParamValue'};
            var paramsB = {};
            var behaviorA = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodA', paramsA);
            var behaviorB = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodB', paramsB);
            var compProps = buildComponentProps([behaviorA, behaviorB], compId);
            var methodAName = getCompMethodName(behaviorA.name, this.compDef);
            var methodBName = getCompMethodName(behaviorB.name, this.compDef);
            spyOn(this.compDef, methodAName);
            spyOn(this.compDef, methodBName);

            testUtils.getComponentFromDefinition(this.compDef, compProps);

            var behaviorOrderedParams = this.compDef.statics.behaviors[behaviorA.name].params;
            expect(this.compDef[methodAName]).toHaveBeenCalledWith(
                behaviorA.params[behaviorOrderedParams[0]],
                behaviorA.params[behaviorOrderedParams[1]],
                behaviorA.params[behaviorOrderedParams[2]],
                callback
            );
            expect(this.compDef[methodBName]).toHaveBeenCalledWith(callback);

        });

        it('should run the registered behavior methods when component is re-rendered with new props', function(){
            var compId = 'my component';
            var firstBehavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodB', {});
            var firstCompProps = buildComponentProps([firstBehavior], compId);
            var newBehavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodA', {b: 'bParamValue', a: 'aParamValue', c: 'cParamValue'});
            var newCompProps = buildComponentProps([newBehavior], compId);
            var methodName = getCompMethodName(newBehavior.name, this.compDef);
            spyOn(this.compDef, methodName);

            var node = window.document.createElement('div');
            var compClass = React.createClass(this.compDef);
            testUtils.getComponentFromReactClass(compClass, firstCompProps, node);
            testUtils.getComponentFromReactClass(compClass, newCompProps, node);

            var behaviorOrderedParams = this.compDef.statics.behaviors[newBehavior.name].params;
            expect(this.compDef[methodName]).toHaveBeenCalledWith(
                newBehavior.params[behaviorOrderedParams[0]],
                newBehavior.params[behaviorOrderedParams[1]],
                newBehavior.params[behaviorOrderedParams[2]],
                callback
            );
        });

        it('should run the registered behavior methods twice when component is re-rendered with same props as before', function(){
            var compId = 'my component';
            var behavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodB', {});
            var compProps = buildComponentProps([behavior], compId);
            var methodName = getCompMethodName(behavior.name, this.compDef);
            spyOn(this.compDef, methodName);

            var node = window.document.createElement('div');
            var compClass = React.createClass(this.compDef);
            testUtils.getComponentFromReactClass(compClass, compProps, node);
            testUtils.getComponentFromReactClass(compClass, compProps, node);

            expect(this.compDef[methodName].calls.count()).toBe(2);
        });

        it('should do nothing in case the registered behavior name is not a function of the targeted component', function(){
            var compId = 'my component';
            var params = {};
            var behavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'notExistBehaviorMethod', params);
            var compProps = buildComponentProps([behavior], compId);

            expect(_.partial(testUtils.getComponentFromDefinition, this.compDef, compProps)).not.toThrow();//what's the best way to check that it does nothing
        });

        it('should run the correct registered behavior name when the component method has a different name', function(){
            var compId = 'my component';
            var params = {};
            var behavior = testUtils.mockFactory.behaviorMocks.comp(compId, 'behaviorMethodC', params);
            var compProps = buildComponentProps([behavior], compId);
            var methodName = getCompMethodName(behavior.name, this.compDef);
            spyOn(this.compDef, methodName);

            testUtils.getComponentFromDefinition(this.compDef, compProps);

            expect(this.compDef[methodName]).toHaveBeenCalledWith(callback);
        });
    });
});
