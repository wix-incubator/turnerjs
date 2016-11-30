define(['core', 'documentServices/routers/utils/constants'], function(core, constants){
    'use strict';

    var type = 'routers';

    var pointerGeneratorsRegistry = core.pointerGeneratorsRegistry;
    pointerGeneratorsRegistry.registerPointerType(type, function(){return null;}, function(){return true;});

    var getterFunctions = {
        getRoutersPointer: function (getItemAt, cache){
            return cache.getPointer('routers', type, constants.paths.ROUTERS_PATH);
        },
        getRoutersConfigMapPointer: function(getItemAt, cache){
            return cache.getPointer('routers_config_map', type, constants.paths.ROUTERS_CONFIG_MAP);
        },
        getRouterPointer: function(getItemAt, cache, routerId){
            return cache.getPointer('router_' + routerId, type, constants.paths.ROUTERS_CONFIG_MAP.concat(routerId));
        }
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator(type, getterFunctions);
});
