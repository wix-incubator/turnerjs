define(['lodash', 'definition!wixappsCore/core/logicFactory', 'utils'], function (_, logicFactoryDefinition, utils) {
    'use strict';

    describe('logicFactory', function () {
        var mockPartId = '3a76a74a-e3fd-48d1-b2c3-aff7ae6103a3',
            logicFactory;

        var MockLogic = function () {
            this.name = 'Mock Logic';
        };

        beforeEach(function () {
            logicFactory = logicFactoryDefinition(_, utils);
        });

        describe('register', function () {
            it('should register partId with the desired logic constructor', function () {
                logicFactory.register(mockPartId, MockLogic);
                var logic = logicFactory.getLogicClass(mockPartId);
                expect(logic).toEqual(MockLogic);
            });
        });

        describe('extend', function () {
            var mockExtensionFunction = function () {
                return 'I am a new function';
            };

            beforeEach(function () {
                logicFactory.register(mockPartId, MockLogic);
            });
            it('should extend partId logic with new function', function () {
                logicFactory.extend(mockPartId, {newFunction: mockExtensionFunction});
                var logic = logicFactory.getLogicClass(mockPartId);
                expect(logic.prototype.newFunction).toEqual(mockExtensionFunction);
            });

            it('should override an existing function on logic prototype', function () {
                MockLogic.prototype.someFunction = function () {
                    return 1;
                };
                logicFactory.extend(mockPartId, {someFunction: mockExtensionFunction});
                var logic = logicFactory.getLogicClass(mockPartId);
                expect(logic.prototype.someFunction).toEqual(mockExtensionFunction);
            });

            it('should not add new logic to logicMap in case partId is not registered', function () {
                var mockPartId2 = '3a76a74a-e3fd-48d1-b2c3-aff7ae6103a4';
                logicFactory.extend(mockPartId2, {newFunction: mockExtensionFunction});
                var logic = logicFactory.getLogicClass(mockPartId2);
                expect(logic).toBeUndefined();
            });
        });
    });
});
