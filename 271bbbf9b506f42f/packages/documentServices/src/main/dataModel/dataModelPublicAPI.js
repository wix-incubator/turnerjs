define(['documentServices/dataModel/dataModel'], function(dataModel){
    "use strict";
    return {
        methods: {
            components: {
                data: {
                    update: {dataManipulation: dataModel.updateDataItem, singleComp: dataModel.shouldUpdateDataWithSingleComp},
                    get: dataModel.getDataItem,
                    remove: {dataManipulation: dataModel.removeComponentDataItem}
                },
                design: {
                    update: {dataManipulation: dataModel.updateDesignItem, singleComp: function () { return true; }},
                    get: dataModel.getDesignItem,
                    getByModes: dataModel.getDesignItemByModes,
                    remove: {dataManipulation: dataModel.removeComponentDesignItem},
                    behaviors: {
                        update: {dataManipulation: dataModel.updateDesignItemBehaviors},
                        remove: {dataManipulation: dataModel.removeDesignItemBehaviors}
                    }
                }
            },
            data: {
                /**
                 * Creates a link and adds it to the data of the Master Page.
                 * @member documentServices.data
                 * @param {string} linkType the type of the link to create.
                 * @param {Object} optionalLinkData optional data to set upon creation.
                 * @returns {Object} a reference to the Link Data Item.
                 */
                addLink: dataModel.addLink,
                /**
                 * Retrieves a data item according to its unique id, and the page containing it (assuming the page was loaded)
                 * if no page was specified, the searched page will be master page
                 * @member documentServices.data
                 * @param {string} dataItemId
                 * @param {string} [pageId] optional parameter
                 * @returns {Object} data item with the given id or null if doesn't exist
                 */
                getById: dataModel.getDataItemById,
                /**
                 * Creates a Data Item corresponding a data type.
                 * @member documentServices.data
                 * @param {String} dataType a type of data to create corresponding data item. {String}
                 * @returns {Object}
                 */
                createItem: dataModel.createDataItemByType,
                /***
                 * @member documentServices.data
                 * @param {String} dataSchemaType
                 * @returns {Object}
                 */
                getSchema: dataModel.getDataSchemaByType,
                isItemValid: dataModel.isDataItemValid
            },
            properties: {
                /**
                 * Creates a Properties Item according to a given type.
                 * @member documentServices.properties
                 * @param {String} propertiesType
                 * @returns {Object}
                 */
                createItem: dataModel.createPropertiesItemByType,
                /**
                 * Retrieves a properties item according to its unique id, and the page containing it (assuming the page was loaded)
                 * if no page was specified, the searched page will be master page
                 * @member documentServices.properties
                 * @param {string} dataItemId
                 * @param {string} [pageId] optional parameter
                 * @returns {Object} properties item with the given id or null if doesn't exist
                 */
                getById: dataModel.getPropertiesItemById,
                /**
                 * @member documentServices.properties
                 * @param {String} propertiesSchemaType
                 * @returns {Object}
                 */
                getSchema: dataModel.getPropertiesSchemaByType,
                isItemValid: dataModel.isPropertiesItemValid
            },
            design: {
                createItem: dataModel.createDesignItemByType,
                getById: dataModel.getDataItemById
            }
        }
    };
});
