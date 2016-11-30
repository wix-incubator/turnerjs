define([
    'core/core/data/pointers/pointerGeneratorsRegistry',
    'core/core/data/pointers/pointersCache',
    'core/core/data/pointers/DataAccessPointers',

    // Side effects
    'core/core/data/pointers/componentPointers',
    'core/core/data/pointers/componentStructurePointers',
    'core/core/data/pointers/dataPointers',
    'core/core/data/pointers/generalPointers',
    'core/core/data/pointers/platformPointers',
    'core/core/data/pointers/pagePointers'
], function(pointerGeneratorsRegistry, PointersCache, DataAccessPointers){
    'use strict';

    return {
        pointerGeneratorsRegistry: pointerGeneratorsRegistry,
        PointersCache: PointersCache,
        DataAccessPointers: DataAccessPointers
    };
});
