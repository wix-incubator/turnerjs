define(['lodash',
    'documentServices/dataModel/dataModel',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/constants/constants'],
    function (_, dataModel, componentsMetaData, componentsDefinitionsMap, constants) {

    'use strict';


    function getDesktopComp(privateServices, mobileCompPointer){
        var componentPointers = privateServices.pointers.components;
        var pageId = componentPointers.getPageOfComponent(mobileCompPointer).id;
        var desktopPage = componentPointers.getPage(pageId, constants.VIEW_MODES.DESKTOP);
        return componentPointers.getComponent(mobileCompPointer.id, desktopPage);
    }

    function shouldGetDesktopComp(privateServices, mobileCompPointer){
        return !componentsMetaData.public.isMobileOnly(privateServices, mobileCompPointer);
    }

    /**
     * Resets the properties item for the mobile component.
     * @param privateServices
     * @param mobileCompPointer
     */
    function resetMobileComponentProperties(privateServices, mobileCompPointer) {
        if (privateServices && mobileCompPointer && shouldGetDesktopComp(privateServices, mobileCompPointer)) {
            var equivalentCompInDesktop = getDesktopComp(privateServices, mobileCompPointer);
            var desktopPropsItem = dataModel.getPropertiesItem(privateServices, equivalentCompInDesktop);

            dataModel.deletePropertiesItem(privateServices, mobileCompPointer);
            dataModel.updatePropertiesItem(privateServices, mobileCompPointer, desktopPropsItem);
        }
    }

    function splitMobileComponentProperties(privateServices, mobileCompPointer) {
        if (privateServices && mobileCompPointer && shouldGetDesktopComp(privateServices, mobileCompPointer)) {

            var equivalentCompInDesktopPointer = getDesktopComp(privateServices, mobileCompPointer);

            var clonedDesktopPropsItem = dataModel.getPropertiesItem(privateServices, equivalentCompInDesktopPointer);

            var mobilePropsItemId = dataModel.generateNewPropertiesItemId();

            dataModel.setPropertiesItem(privateServices, mobileCompPointer, clonedDesktopPropsItem, mobilePropsItemId);

            privateServices.dal.set(privateServices.pointers.getInnerPointer(mobileCompPointer, 'propertyQuery'), mobilePropsItemId);
        }
    }

    /**
     * Checks if component has split properties - mobile and desktop.
     * @param privateServices
     * @param mobileCompPointer
     * @returns {boolean} true if component has split properties
     */
    function isMobileComponentPropertiesSplit(privateServices, mobileCompPointer){
        if (componentsMetaData.public.isMobileOnly(privateServices, mobileCompPointer)) {
            return true;
        }

        var desktopComp = getDesktopComp(privateServices, mobileCompPointer);
        var mobileProps = dataModel.getPropertyItemPointer(privateServices, mobileCompPointer);
        var desktopProps = dataModel.getPropertyItemPointer(privateServices, desktopComp);

        var mobilePropsId = mobileProps && mobileProps.id;
        var desktopPropsId = desktopProps && desktopProps.id;

        return !_.isEqual(mobilePropsId, desktopPropsId);
    }

    /**
     * @param privateServices
     * @param componentType
     */
    function getComponentDataSchemasByType(privateServices, componentType) {
        if (privateServices && componentType) {
            var compDefinition = componentsDefinitionsMap[componentType];
            if (!compDefinition){
                throw new Error("component type: " + componentType + " is unsupported");
            }
            var dataTypes = compDefinition.dataTypes || [];
            return _.map(dataTypes, function(dataType){
                return dataModel.getDataSchemaByType(privateServices, dataType);
            });
        }
        return null;
    }


    /**
     * @param privateServices
     * @param componentType
     */
    function getComponentPropertiesByType(privateServices, componentType) {
        if (privateServices && componentType) {
            var compDefinition = componentsDefinitionsMap[componentType];
            if (!compDefinition){
                throw new Error("component type: " + componentType + " is unsupported");
            }
            var propType = compDefinition.propertyType;
            if (propType){
                return dataModel.getPropertiesSchemaByType(privateServices, propType);
            }
        }
        return null;
    }

    return {
        getComponentDataSchemasByType: getComponentDataSchemasByType,
        getComponentPropertiesByType: getComponentPropertiesByType,
        /**
         * Resets a separation of a component properties in mobile & desktop structures if exists.
         *
         * @function
         * @memberof documentServices.components.componentData
         *
         * @param {Object} mobileCompRef a reference to a Component in the Mobile structure.
         * @returns undefined
         *
         *      @example
         *      documentServices.components.properties.mobile.join(mobileComponentRef);
         */
        resetMobileComponentProperties: resetMobileComponentProperties,
        /**
         * Performs a separation of the properties of a component from its mobile structure and desktop.
         * (new properties data item will be created for the mobile structure, separated from the desktop's).
         *
         * @function
         * @memberof documentServices.components.componentData
         *
         * @param {Object} mobileCompRef a reference to a Component in the Mobile structure.
         * @returns undefined
         *
         *      @example
         *      documentServices.components.properties.mobile.fork(mobileComponentRef);
         */
        splitMobileComponentProperties: splitMobileComponentProperties,
        /**
         * Checks if separation exists between component Desktop & Mobile Properties (data) items.
         *
         * @function
         * @memberof documentServices.components.componentData
         *
         * @param {Object} mobileCompRef a reference to a Component in the Mobile structure.
         * @returns {Boolean} true iff the corresponding Component's Mobile Properties & Desktop Properties Items are different instances.
         */
        isMobileComponentPropertiesSplit: isMobileComponentPropertiesSplit
    };
});
