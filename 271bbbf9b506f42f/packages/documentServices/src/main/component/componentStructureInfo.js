define(['lodash',
        'documentServices/componentsMetaData/componentsMetaData',
        'documentServices/dataModel/dataModel',
        'documentServices/hooks/hooks',
        'documentServices/tpa/utils/tpaUtils',
        'documentServices/constants/constants'],
    function (_, componentsMetaData, dataModel, hooks, tpaUtils, constants) {
        'use strict';

        var DEFAULT_COMP_LAYOUT = {
            width: 100,
            height: 100,
            x: 0,
            y: 0
        };

        function getComponentType(privateServices, componentPointer) {
            var result = null;
            if (privateServices && componentPointer) {
                result = privateServices.pointers.components.isMasterPage(componentPointer) ?
                    'wysiwyg.viewer.components.WSiteStructure' :
                    componentsMetaData.getComponentType(privateServices, componentPointer);
            }
            return result;
        }

        function getComponentProperties(ps, componentPointer) {
            var propQueryPointer = ps.pointers.getInnerPointer(componentPointer, 'propertyQuery');
            var propQuery = propQueryPointer && ps.dal.get(propQueryPointer);
            var propPointer = propQuery && ps.pointers.data.getPropertyItem(propQuery);
            return propPointer && ps.dal.get(propPointer);
        }

        function getSiblings(ps, compPointer) {
            var parentComp = ps.pointers.components.getParent(compPointer);
            var siblings = getChildComponents(ps, parentComp);
            _.remove(siblings, {id: compPointer.id});
            return siblings;
        }

        function getContainerToAddComponentTo(ps, containerPointer) {
            var type = getComponentType(ps, containerPointer);
            var values = hooks.executeHooksAndCollectValues(hooks.HOOKS.ADD_ROOT.GET_CONTAINER_TO_ADD_TO, type, [ps, containerPointer]);
            if (values.length > 1) {
                throw new Error("you can't have more that one hook returning a container");
            }
            return values[0] || containerPointer;
        }

        function getParent(ps, componentPointer) {
            return ps.pointers.components.getParent(componentPointer);
        }

        function getAllJsonChildren(privateServices, parentCompPointer) {
            return privateServices.pointers.components.getChildren(parentCompPointer);
        }

        function getTpaChildComponents(privateServices, parentCompPointer) {
            var childrenArr = privateServices.pointers.components.getChildrenRecursively(parentCompPointer);
            return _.filter(childrenArr, function (childComp) {
                var componentType = getComponentType(privateServices, childComp);
                return tpaUtils.isTpaByCompType(componentType);
            });
        }

        function getBlogChildComponents(privateServices, parentCompPointer) {
            var childrenArr = privateServices.pointers.components.getChildrenRecursively(parentCompPointer);
            return _.filter(childrenArr, function (childComp) {
                var componentType = getComponentType(privateServices, childComp);
                return componentType === 'wixapps.integration.components.AppPart';
            });
        }

        function isPageComponent(privateServices, compPointer) {
            return privateServices.pointers.components.isPage(compPointer);
        }

        function getChildComponents(privateServices, parentCompPointer, isRecursive) {
            return isRecursive ?
                privateServices.pointers.components.getChildrenRecursively(parentCompPointer) :
                privateServices.pointers.components.getChildren(parentCompPointer);
        }

//TODO: remove this when you can!!
        function getChildrenArrayKey(containerReference, viewMode) {
            if (!isPageComponent(undefined, containerReference)) {
                return 'components';
            }
            switch (viewMode) {
                case constants.VIEW_MODES.MOBILE:
                    return '`mobileComponents';
                case constants.VIEW_MODES.DESKTOP:
                    return containerReference.id === 'masterPage' ? 'children' : 'components';
            }
        }

        function isRenderedOnSite(privateServices, componentPointer) {
            return privateServices.siteAPI.isComponentRenderedOnSite(componentPointer.id);
        }

        function isContainsCompWithType(privateServices, parentCompPointer, types) {
            types = _.isArray(types) ? types : [types];
            var childrenArr = privateServices.pointers.components.getChildrenRecursively(parentCompPointer);
            for (var i = 0, childCompType; i < childrenArr.length; i++) {
                childCompType = getComponentType(privateServices, childrenArr[i]);
                if (_.includes(types, childCompType)) {
                    return true;
                }
            }
            return false;
        }

        function isComponentExist(privateServices, compPointer) {
            return privateServices.dal.isExist(compPointer);
        }

        function createComponentDefaultStructureBuilder(componentDefinitions) {
            return function buildDefaultComponentStructure(ps, componentType) {
                var compDefinition = componentDefinitions[componentType];
                if (!_.isString(componentType)) {
                    throw new Error('Must pass componentType as string');
                }

                if (!compDefinition) {
                    throw new Error('Component type "' + componentType + '" is not supported');
                }

                var styleId = _.first(_.keys(compDefinition.styles));
                var defaultDataItemType = _.includes(compDefinition.dataTypes, '') ? '' : _.first(compDefinition.dataTypes);
                var defaultDataItem = dataModel.createDataItemByType(ps, defaultDataItemType);
                var defaultPropertiesItem = compDefinition.propertyType && dataModel.createPropertiesItemByType(ps, compDefinition.propertyType);

                return {
                    layout: _.clone(DEFAULT_COMP_LAYOUT),
                    componentType: componentType,
                    data: defaultDataItem,
                    props: defaultPropertiesItem,
                    style: styleId
                };
            };
        }

        return {
            createComponentDefaultStructureBuilder: createComponentDefaultStructureBuilder,
            /**
             * returns the type/"class" of a component.
             *
             * @function
             * @memberof documentServices.components.component
             *
             * @param {jsonDataPointer} componentReference the reference to the component to get its type.
             * @returns {string} the name of the component Type/"class". 'null' if no corresponding component was found.
             *
             *      @example
             *      var photoType = documentServices.components.getType(myPhotoReference);
             */
            getType: getComponentType,
            /**
             *
             */
            getPropertiesItem: getComponentProperties,
            /**
             * Returns the parent Component of a component.
             *
             * @returns {jsonDataPointer} the page the the component is in
             * @throws an error in case the '<i>componentReference</i>' is invalid.
             *
             *      @example
             *      var buttonContainerCompRef = documentServices.components.layout.getParent(buttonComponentRef);
             * @param {jsonDataPointer} compPointer
             */
            getPage: function (ps, compPointer) {
                return ps.pointers.components.getPageOfComponent(compPointer);
            },
            /**
             * this should be used in every method that adds a component to a container,
             * some containers have other containers in them that the component should be added to
             * @param {privateServices} privateServices
             * @param {jsonDataPointer} containerPointer the container that we want to add a component to
             * @returns {jsonDataPointer} a pointer to the container
             */
            getContainerToAddComponentTo: getContainerToAddComponentTo,
            /**
             * Returns the parent Component of a component.
             *
             * @param {jsonDataPointer} componentReference a Component Reference corresponding a Component in the document.
             * @returns {jsonDataPointer} the Component Reference of the parent component, or null if no parent component (example - for page)
             * @throws an error in case the '<i>componentReference</i>' is invalid.
             *
             *      @example
             *      var buttonContainerCompRef = documentServices.components.layout.getParent(buttonComponentRef);
             */
            getContainer: getParent,
            /**
             * Returns the Siblings array of a component.
             *
             * @param {jsonDataPointer} compReference a Component Reference corresponding a component in the document.
             * @returns {jsonDataPointer[]} an array of <i>'ComponentReference'</i>s of the Component's siblings.
             * @throws an Error in case the compReference isn't valid.
             */
            getSiblings: getSiblings,
            /**
             * returns the children components of a parent component, that should be displayed on render.
             * If a site exists, these are the currently rendered children.
             *
             * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
             * taken from the parent's reference or from the current view mode of the document.
             * @returns {jsonDataPointer[]} an array of the Component's Children (Component) References.
             * @throws an error in case the <i>parentCompReference</i> is invalid.
             *
             *      @example
             *      var mainPageChildren = documentServices.components.getChildren(mainPageRef);
             */
            getChildren: getChildComponents,
            /**
             * returns the children components of a parent component.
             *
             * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
             * taken from the parent's reference or from the current view mode of the document.
             * @returns {jsonDataPointer[]} an array of the Component's Children (Component) References.
             * @throws an error in case the <i>parentCompReference</i> is invalid.
             *
             *      @example
             *      var mainPageChildren = documentServices.components.getAllJsonChildren(mainPageRef);
             */
            getAllJsonChildren: getAllJsonChildren,
            /**
             * returns the children tpa components recurse of a parent component.
             *
             * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
             * @param {string} [viewMode] is the view mode of the document (DESKTOP|MOBILE), if not specified will be
             * taken from the parent's reference or from the current view mode of the document.
             * @returns {jsonDataPointer[]} an array of the Component's Children (Component) References.
             * @throws an error in case the <i>parentCompReference</i> is invalid.
             *
             *      @example
             *      var viewMode = 'DESKTOP'; // This is optional
             *      var mainPageChildren = documentServices.components.layout.getChildComponents(mainPageRef, viewMode);
             */
            getTpaChildren: getTpaChildComponents,
            getBlogChildren: getBlogChildComponents,
            getChildrenArrayKey: getChildrenArrayKey,
            isRenderedOnSite: isRenderedOnSite,
            isContainsCompWithType: isContainsCompWithType,
            isExist: isComponentExist,
            isPageComponent: isPageComponent
        };
    });
