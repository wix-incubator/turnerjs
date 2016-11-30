define(['lodash', 'core/core/data/pointers/pointerGeneratorsRegistry'], function (_, pointerGeneratorsRegistry) {
    "use strict";


    function addRegularGetterFunctionsToNameSpace(namespace, pathsCache, regularCache) {
        var pointersGenerators = pointerGeneratorsRegistry.getRegularJsonGenerators();
        _.forEach(pointersGenerators, function (functions, name) {
            namespace[name] = _.mapValues(functions, function (func) {
                return func.bind(functions, pathsCache.getItemInPath, regularCache);
            });
        });
    }

    function addBothRegularAndFullFunctionsToNameSpace(namespace, getWrappedGetterFunction) {
        var bothRegularAndFullPointerGenerators = pointerGeneratorsRegistry.getBothRegularAndFullJsonGenerators();
        _.forEach(bothRegularAndFullPointerGenerators, function (functions, name) {

            namespace[name] = _.mapValues(functions, function (func) {
                return getWrappedGetterFunction(func, false, functions);
            });

            namespace.full[name] = _.mapValues(functions, function (func) {
                return getWrappedGetterFunction(func, true, functions);
            });

        });
    }

    function displayedJson(pathsCache) {
        this.full = {};

        var regularCache = pathsCache.getBoundCacheInstance(false);
        var fullCache = pathsCache.getBoundCacheInstance(true);

        var getWrappedGetterFunction = function (func, isFull, functions) {
            return function () {
                var args = _.toArray(arguments);
                var regularArgs = [pathsCache.getItemInPath, regularCache].concat(args);
                var fullArgs = [pathsCache.fullJsonGetItemInPath, fullCache].concat(args);
                var regularResult = func.apply(functions, regularArgs);
                var fullResult = func.apply(functions, fullArgs);
                return isFull ? fullResult : regularResult;
            };
        };

        addRegularGetterFunctionsToNameSpace(this, pathsCache, regularCache);
        addBothRegularAndFullFunctionsToNameSpace(this, getWrappedGetterFunction);
    }

    function DataAccessPointers(pathsCache) {
        if (pathsCache) {
            displayedJson.call(this, pathsCache);
        }
    }

    function getOriginalPointerFromInner(innerPointer) {
        if (innerPointer) {
            return {
                type: innerPointer.type,
                id: innerPointer.id
            };
        }
    }


    DataAccessPointers.prototype = {
        getGeneralTheme: function () {

        },

        getInnerPointer: function (pointer, innerPath) {
            var newPointer = getOriginalPointerFromInner(pointer);
            if (newPointer) {
                var additionalPath = _.isString(innerPath) ?
                    innerPath.split('.') :
                    innerPath;
                newPointer.innerPath = pointer.innerPath ?
                    pointer.innerPath.concat(additionalPath) :
                    additionalPath;
            }
            return newPointer;
        },

        isSamePointer: function (pointer1, pointer2) {
            return pointer1 && pointer2 &&
                pointer1.type === pointer2.type &&
                pointer1.id === pointer2.id;
        },

        getInnerPointerPathRoot: function (innerPointer) {
            return innerPointer.innerPath ? innerPointer.innerPath[0] : null;
        },

        getOriginalPointerFromInner: getOriginalPointerFromInner,

        getPointerType: function (pointer) {
            switch (pointer.type) {
                case 'DESKTOP':
                case 'MOBILE':
                    return _.isEmpty(pointer.innerPath) ? 'component' : 'componentStructure';
                default:
                    return pointer.type;
            }
        }

    };

    return DataAccessPointers;

});
