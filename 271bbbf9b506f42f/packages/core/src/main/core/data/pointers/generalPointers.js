define(['lodash', 'core/core/data/pointers/pointerGeneratorsRegistry'],
    function (_, pointerGeneratorsRegistry) {
        "use strict";
        var type = 'general';

        pointerGeneratorsRegistry.registerPointerType(type, _.constant(null), _.constant(true));
        pointerGeneratorsRegistry.registerPointerType('metadata', _.constant(null), _.constant(true));
        var simpleGetterSchemas = {
            getAllTheme: {id: 'theme', path: ['pagesData', 'masterPage', 'data', 'theme_data']},
            getOrphanPermanentDataNodes: {id: 'orphanPermanentDataNodes', path: ['orphanPermanentDataNodes']},
            getTextRuntimeOverallBorders: {id: 'overallBorders', path: ['textRuntimeLayout', 'overallBorders']},
            getDockedRuntimeLayout: {id: 'dockedRuntimeLayout', path: ['dockedRuntimeLayout']},
            getSaveInvalidationCount: {id: 'saveInvalidationCount', path: ['saveInvalidationCount']},
            getPagesData: {id: 'pagesData', path: ['pagesData']},
            getServiceTopology: {id: 'serviceTopology', path: ['serviceTopology']},
            getDeletedMobileComps: {id: 'mobileDeletedCompsMap', path: ['mobileDeletedCompsMap']},
            getCommittedMobilePages: {id: 'committedMobilePages', path: ['committedMobilePages']},
            getDeletedPagesMapPointer: {id: 'deletedPagesMap', path: ['deletedPagesMap']},
            getUserId: {id: 'userId', path: ["rendererModel", "userId"]},
            getIsStudioUser: {id: 'isStudioUser', path: ['documentServicesModel', 'userInfo', 'isStudio']},
            getEditorData: {id: 'editorData', path: ["editorData"]},
            getMobileStructuresPointer: {id: 'mobileStructures', path: ['mobileStructures']},
            getCompsToUpdateAnchors: {id: 'compsToUpdateAnchors', path: ['compsToUpdateAnchors']},
            getRuntimePointer: {id: 'runtime', path: ['runtime']},
            getNeverSaved: {id: 'neverSaved', path: ['documentServicesModel', 'neverSaved']},
            getPublicUrl: {id: 'publicUrl', path: ['documentServicesModel', 'publicUrl']},
            getPermissions: {id: 'permissions', path: ['documentServicesModel', 'permissionsInfo']},
            getForbiddenPageUriSEOs: {id: 'forbiddenPageUriSEOs', path: ['urlFormatModel', 'forbiddenPageUriSEOs']},
            getUrlFormat: {id: 'urlFormat', path: ['urlFormatModel', 'format']},
            getClientSpecMap: {id: 'clientSpecMap', path: ['rendererModel', 'clientSpecMap']},
            getAutosaveInfo: {id: 'autoSaveInfo', path: ['documentServicesModel', 'autoSaveInfo']},
            getMetaSiteId: {id: 'metaSiteId', path: ['rendererModel', 'metaSiteId']},
            getDocumentType: {id: 'documentType', path: ["rendererModel", "siteInfo", "documentType"]},
            getActiveModes: {id: 'activeModes', path: ["activeModes"]},
            getContactFormsMetaData: {id: 'contactformsMetaData', path: ["contactforms_metadata"]},
            getRootsRenderedInMobileEditor: {id: 'rootsRenderedInMobileEditor', path: ['rootsRenderedInMobileEditor']},
            getRenderFlags: {id: 'renderFlags', path: ['renderFlags']},
            getRoutersPointer: {id: 'routers', path: ['routers']}
        };
        var complexGetters = {
            getRenderFlag: function(getItemAt, cache, flagName){
                return cache.getPointer('renderFlags' + flagName, type, ['renderFlags', flagName]);
            },
            getRenderRealtimeConfigItem: function(getItemAt, cache, itemName) {
                return cache.getPointer('renderRealtimeConfig' + itemName, type, ['renderRealtimeConfig', itemName]);
            },
            getAutoSaveInnerPointer: function(getItemAt, cache, key) {
                return cache.getPointer('autoSaveInfo' + key, type, ['documentServicesModel', 'autoSaveInfo', key]);
            }
        };

        var getterFunctions = _(simpleGetterSchemas)
            .mapValues(function (schema) {
                return function (getItemAt, cache) {
                    return cache.getPointer(schema.id, type, schema.path);
                };
            })
            .assign(complexGetters)
            .value();

        pointerGeneratorsRegistry.registerDataAccessPointersGenerator(type, getterFunctions);
    });
