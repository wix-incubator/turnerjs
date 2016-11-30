/* global Proxy */
define(['lodash'], function (_) {
    'use strict';

    var MAX_RECURSION_LEVEL = 4;

    /**
     *
     * @param {function} ConstructorFunction
     * @param overrides
     * @param {number} level
     * @returns {__mockConstructor}
     */
    function mockConstructor(ConstructorFunction, overrides, level) {
        var obj = new ConstructorFunction();
        var mockProto = mockObject(obj, overrides, level);
        var __mockConstructor = function () {};
        __mockConstructor.prototype = mockProto;
        return __mockConstructor;
    }

    /**
     *
     * @param origModule - module or object or function or whatever
     * @param overrides
     * @param {number} level - how deep are we willing to do down the rabbit hole
     * @returns {*} - the mock copy
     */
    function mockObject(origModule, overrides, level) {
        var myLevel = level || 1;
        if (myLevel > MAX_RECURSION_LEVEL) {
            return {};
        }
        var valueOverride = origModule !== 'object' ? overrides : false;
        var mock = {};
        switch (typeof origModule) {
            case 'object':
                // Perform deep copy while replacing methods with empty functions
                _.forIn(origModule, function (value, key) {
                    var fieldOverrides = overrides && overrides[key];
                    mock[key] = mockObject(value, fieldOverrides, myLevel + 1);
                });
                _.defaults(mock, overrides);
                break;
            case 'function':
                mock = mockFunction(origModule, overrides, myLevel);
                break;
            default:
                mock = valueOverride || origModule;
                break;
        }
        return mock;
    }

    function mockFunction(origModule, overrides, myLevel) {
        var valueOverride = origModule !== 'object' ? overrides : false;

        if (typeof Proxy === 'function') {
            return new Proxy(origModule, {
                construct: function (TargetConstructor/*, argumentsList, newTarget*/) {
                    var obj = new TargetConstructor();
                    var mockProto = mockObject(obj, overrides, myLevel);
                    var __mockConstructor = function () {};
                    __mockConstructor.prototype = mockProto;
                    return new __mockConstructor();
                },
                apply: function (target, thisArg, argumentsList) {
                    return valueOverride ? valueOverride.apply(thisArg, argumentsList) : undefined;
                }
            });
        }

        // No Proxy, fallback to constructor guessing
        // If module name is capitalized then the function it returns is a constructor,
        //  otherwise it's a regular function
        if (/^[A-Z]/.test(origModule.name)) {
            return mockConstructor(origModule, overrides, myLevel);
        }
        return valueOverride || function () {};
    }

    return {
        version: '1.0.0',

        load: function (name, parentRequire, onload /*, config*/) {
            parentRequire([name], function (original) {
                onload(mockObject(original));
            });
        },
        mockObject: mockObject
    };
});
