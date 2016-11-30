define([
    'lodash',
    'documentServices/wixapps/services/items',
    'documentServices/wixapps/services/types',
    'documentServices/wixapps/services/lists',
    'documentServices/wixapps/services/selection',
    'documentServices/wixapps/services/listTemplates',
    'documentServices/wixapps/services/fieldsLayout',
    'documentServices/wixapps/services/appBuilder',
    'documentServices/wixapps/services/classics',
    'documentServices/wixapps/services/clientSpecMap',
    'documentServices/wixapps/services/savePublish',
    'documentServices/wixapps/services/listsLayout',
    'documentServices/wixapps/services/metadata',
    'documentServices/wixapps/utils/initializer',
    'documentServices/wixapps/utils/repoFixer',
    'documentServices/wixapps/utils/migrationUtils',
    'documentServices/wixapps/services/blogUtils'
], function (_,
             items,
             types,
             lists,
             selection,
             listTemplates,
             fieldsLayout,
             appbuilder,
             classics,
             clientSpecMap,
             savePublish,
             listsLayout,
             metadata,
             initializer,
             repoFixer,
             migrationUtils,
             blogUtils
) {
    "use strict";

    return {
        methods: {
            wixapps: {
                classics: {
                    forceUpdate: {dataManipulation: function () {}},
                    invalidateComponentViewCache: classics.invalidateComponentViewCache,
                    getAllAppPartComps: classics.getAllAppPartComps,
                    getPackageName: classics.getPackageName,
                    getDataStoreId: classics.getDataStoreId,
                    provision: classics.provision,
                    account: {
                        getApplicationId: classics.getApplicationId,
                        getBlogInstanceId: classics.getBlogInstanceId,
                        getUserId: classics.getUserId
                    },
                    reloadApp: {dataManipulation: classics.reloadApp},
                    registerHooks: {dataManipulation: classics.registerHooks},
                    isBlogPage: blogUtils.isBlogPage,
                    getAvailableViewNames: classics.getAvailableViewNames,
                    isRTLAllowed: classics.isRTLAllowed,
                    getAvailableCustomizations: classics.getAvailableCustomizations,
                    getInnerComps: classics.getInnerComps,
                    findCustomizationDefaultValueFromDescriptor: classics.findCustomizationDefaultValueFromDescriptor,
                    findCustomizationOverride: classics.findCustomizationOverride,
                    getStyleCustomizations: classics.getStyleCustomizations,
                    getAppPartRole: classics.getAppPartRole,
                    getComponentTypeByProxyName: classics.getComponentTypeByProxyName,
                    loadTagNames: classics.loadTagNames,
                    getTagNames: classics.getTagNames,
                    styleMapping: classics.styleMapping,
                    getBlogCategories: classics.getBlogCategories,
                    getAppPartViewFieldKeyValue: classics.getAppPartViewFieldKeyValue,
                    getSinglePostId: classics.getSinglePostId,
                    getBlogPaginationCustomizationsByAppPartName: classics.getBlogPaginationCustomizationsByAppPartName,
                    blog: classics.blog,
                    blogFeedOrCustomFeedHasPagination: classics.blogFeedOrCustomFeedHasPagination,
                    getBlogNewSocialShareButtonsCustomizationForView: classics.getBlogNewSocialShareButtonsCustomizationForView,
                    getAppPartExtraData: classics.getAppPartExtraData
                },
                appbuilder: {
                    metadata: metadata,
                    reload: {dataManipulation: appbuilder.reload},
                    save: appbuilder.save,
                    account: {
                        getInstanceId: clientSpecMap.getInstanceId
                    },
                    layout: {
                        setItemTemplate: {dataManipulation: listTemplates.setItemViewFromTemplate},
                        getAllFields: fieldsLayout.getAll,
                        getField: fieldsLayout.getField,
                        setField: {dataManipulation: fieldsLayout.set},
                        getListLayout: listsLayout.get,
                        setListLayout: {dataManipulation: listsLayout.set}
                    },
                    data: {
                        items: {
                            //performance tweak
                            create: items.createItem, //{dataManipulation: items.createItem, getReturnValue: getUniqueId},
                            update: items.updateItem, //{dataManipulation: items.updateItem},
                            delete: items.deleteItem, //{dataManipulation: items.deleteItem},
                            restore: items.restoreItem,
                            publish: _.noop
                        },
                        lists: {
                            selection: {
                                get: lists.getSelector,
                                setManual: lists.setManualSelector//{dataManipulation: lists.setManualSelector}
                            },
                            getItemSchema: lists.getType,
                            getDatabaseId: lists.getTypeName,
                            publish: _.noop,
                            getListName: lists.getDisplayName,
                            getListVersion: lists.getVersion,
                            rename: {dataManipulation: lists.rename},
                            getItems: lists.getItems,
                            getHiddenItems: lists.getHiddenItems,
                            generateTemplate: listTemplates.generateTemplate,
                            createFromTemplate: listTemplates.createListFromTemplate
                        },
                        databases: {
                            getItems: items.getAllItemsOfType,
                            loadDeleted: _.noop,
                            getSchemas: types.getAllTypes,
	                        cleanRepo: repoFixer.cleanRepoViews
                        }
                    },
                    migration: {
                        migrateList: migrationUtils.migrateList
                    }
                }
            }
        },
        initMethod: initializer.initialize
    };
});
