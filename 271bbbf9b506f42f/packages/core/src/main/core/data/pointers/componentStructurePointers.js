define(['lodash', 'core/core/data/pointers/DataAccessPointers', 'core/core/data/pointers/pointerGeneratorsRegistry'], function
    (_, DataAccessPointers, pointerGeneratorsRegistry){
    'use strict';

    var pointers = new DataAccessPointers();

    var getterFunctions = {
        getModes: function (getItemAtPath, cache, pointer) {
            return pointers.getInnerPointer(pointer, ['modes']);
        },

        getModesDefinitions: function(getItemAtPath, cache, pointer){
            return pointers.getInnerPointer(pointer, ['modes', 'definitions']);
        },

        getModesOverrides: function(getItemAtPath, cache, pointer){
            return pointers.getInnerPointer(pointer, ['modes', 'overrides']);
        }
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator('componentStructure', getterFunctions);
});
