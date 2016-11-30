define(['core',
        'documentServices/pathHelpers/siteMetadataPropertiesInfo'],
    function(core, siteMetadataPropertiesInfo){
        "use strict";
        var type = 'metadata';
        var pointerGeneratorsRegistry = core.pointerGeneratorsRegistry;
        pointerGeneratorsRegistry.registerPointerType(type, function(){return null;}, function(){return true;});

        var getterFunctions = {
            getSiteMetaDataPointer: function(getItemAt, cache, key){
                if (!siteMetadataPropertiesInfo[key]){
                    return null;
                }
                var path = siteMetadataPropertiesInfo[key].path;
                return cache.getPointer(key, type, path);
            }
        };

        pointerGeneratorsRegistry.registerDataAccessPointersGenerator(type, getterFunctions);
});