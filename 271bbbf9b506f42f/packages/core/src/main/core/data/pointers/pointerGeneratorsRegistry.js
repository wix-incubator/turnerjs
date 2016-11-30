define([], function () {
    "use strict";

    var regularJsonPointerGenerators = {};

    var bothRegularAndFullPointerGenerators = {};

    var pointersGenerators = {};

    var types = {};

    return {
        registerDataAccessPointersGenerator: function(name, pointerGetterFunctions, isUsingDifferentNameSpaceForFull) {
            if (isUsingDifferentNameSpaceForFull){
                bothRegularAndFullPointerGenerators[name] = pointerGetterFunctions;
            } else {
                regularJsonPointerGenerators[name] = pointerGetterFunctions;
            }

            pointersGenerators[name] = pointerGetterFunctions;
        },

        registerPointerType: function(name, findItemFunction, identityCheckFunction, isUsingDifferentNameSpaceForFull, isExistInFullJson){
            types[name] = {
                'findItemFunction': findItemFunction,
                'identityCheckFunction': identityCheckFunction,
                'isUsingDifferentNameSpaceForFull': isUsingDifferentNameSpaceForFull,
                'isExistInFullJson': isExistInFullJson
            };
        },

        getRegularJsonGenerators: function(){
            return regularJsonPointerGenerators;
        },

        getBothRegularAndFullJsonGenerators: function(){
            return bothRegularAndFullPointerGenerators;
        },

        getAllTypes: function(){
            return types;
        }
    };

});
