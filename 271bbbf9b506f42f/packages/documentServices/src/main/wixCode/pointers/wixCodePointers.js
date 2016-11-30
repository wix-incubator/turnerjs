define(['core', 'documentServices/wixCode/utils/constants'], function(core, constants){
    'use strict';

    var type = 'wixCode';

    var pointerGeneratorsRegistry = core.pointerGeneratorsRegistry;
    pointerGeneratorsRegistry.registerPointerType(type, function(){return null;}, function(){return true;});

    var getterFunctions = {
        getRoot: function(getItemAt, cache){
            return cache.getPointer('wixCodeRoot', type, constants.paths.BASE);
        },
        getModifiedFileContentMap: function(getItemAt, cache){
            return cache.getPointer('modifiedFileContents', type, constants.paths.MODIFIED_FILE_CONTENTS);
        },
        getModifiedFileContent: function(getItemAt, cache, fileId){
            return cache.getPointer('modifiedFileContents_' + fileId, type, constants.paths.MODIFIED_FILE_CONTENTS.concat(fileId));
        },
        getDefaultFileCacheKiller: function(getItemAt, cache) {
            return cache.getPointer('defaultFileCacheKiller', type, constants.paths.DEFAULT_FILE_CACHE_KILLER);
        },
        getFileCacheKillerMap: function(getItemAt, cache) {
            return cache.getPointer('fileCacheKillers', type, constants.paths.FILE_CACHE_KILLERS);
        },
        getFileCacheKiller: function(getItemAt, cache, fileId) {
            return cache.getPointer('fileCacheKillers_' + fileId, type, constants.paths.FILE_CACHE_KILLERS.concat(fileId));
        },
        getWixCodeModel: function(getItemAt, cache) {
            return cache.getPointer('wixCodeModel', type, constants.paths.WIX_CODE_MODEL);
        },
        getWixCodeAppData: function(getItemAt, cache) {
            return cache.getPointer('appData', type, constants.paths.WIX_CODE_APP_DATA);
        },
        getGridAppId: function(getItemAt, cache) {
            return cache.getPointer('gridAppId', type, constants.paths.GRID_APP_ID);
        },
        getScari: function(getItemAt, cache) {
            return cache.getPointer('scari', type, constants.paths.SCARI);
        },
        getIsAppReadOnly: function(getItemAt, cache) {
            return cache.getPointer('isAppReadOnly', type, constants.paths.IS_APP_READ_ONLY);
        }
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator(type, getterFunctions);
});
