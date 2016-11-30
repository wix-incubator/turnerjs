define([
    'lodash',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/hooks/hooks',
    'documentServices/dataModel/dataModel',
    'documentServices/wixapps/services/listTemplates',
    'documentServices/wixapps/services/lists',
    'documentServices/wixapps/services/clientSpecMap'
], function (_, pathUtils, hooks, dataModel, listTemplates, lists, clientSpecMap) {
    'use strict';

    var APP_PART_2_COMP_TYPE = 'wixapps.integration.components.AppPart2';
    var COMP_DEFINITION_CUSTOM_TEMPLATE_ATTRIBUTE = 'template';

    function afterAddAppPart2(ps, compPointer, compDefinition) {
        var listId = listTemplates.createListFromTemplate(ps, compDefinition.custom[COMP_DEFINITION_CUSTOM_TEMPLATE_ATTRIBUTE]);
        var appInnerId = clientSpecMap.getApplicationId(ps);
        ps.dal.full.pushByPath(pathUtils.getAppbuilderMetadataPath('requestedPartNames'), listId);
        ps.dal.full.setByPath(pathUtils.getAppPart2MetadataPath(listId), {loading: false});
        dataModel.updateDataItem(ps, compPointer, {appPartName: listId, appInnerID: appInnerId});
        return {success: true, description: 'New list was added with id [' + listId + ']'};
    }

    function afterSerializeAppPart2(ps, compPointer, customStructureData) {
        var compData = dataModel.getDataItem(ps, compPointer);
        customStructureData[COMP_DEFINITION_CUSTOM_TEMPLATE_ATTRIBUTE] = listTemplates.generateTemplate(ps, compData.appPartName);
        return {success: true, description: 'Added template to the custom component structure'};
    }

    function afterDeleteList(ps, compRef, deletingParent, removeArgs, deletedParentFromFull, dataItem) {
        if (compRef.type === 'MOBILE') {
            return {success: true, description: 'Skipped deleting part views when deleting mobile component'};
        }

        var appPartName = dataItem.appPartName;
        var listDef = lists.getListDef(ps, appPartName);
        var views = ps.dal.getByPath(pathUtils.getBaseViewsPath());

        _(views)
            .pick(function (val) {
                return val.name === listDef.viewName;
            })
            .forEach(function (view, viewKey) {
                ps.dal.full.removeByPath(pathUtils.getViewPath(viewKey));
            })
            .value();

        return {success: true, description: 'Deleted Part views'};
    }

    function registerHooks() {
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, afterAddAppPart2, APP_PART_2_COMP_TYPE);
        hooks.registerHook(hooks.HOOKS.SERIALIZE.SET_CUSTOM, afterSerializeAppPart2, APP_PART_2_COMP_TYPE);
        hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, afterDeleteList, APP_PART_2_COMP_TYPE);
    }

    return {
        registerHooks: registerHooks,
        afterDeleteList: afterDeleteList, //here for testing purposes
        unregisterAllHooks: hooks.unregisterAllHooks
    };

});
