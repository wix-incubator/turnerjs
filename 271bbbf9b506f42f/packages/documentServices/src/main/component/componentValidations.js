define(['lodash',
    'documentServices/page/pageData',
    'documentServices/page/popupUtils',
    'documentServices/theme/theme',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/validation/validators/compPropValidator',
    'documentServices/constants/constants',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/componentDeprecation',
    'utils'
], function (_, pageData, popupUtils, theme, componentsDefinitionsMap, compPropValidator, constants, componentsMetaData, deprecation, utils) {
    'use strict';

    var ERRORS = {
        COMPONENT_DOES_NOT_EXIST: 'component param does not exist',
        COMPONENT_DOES_NOT_HAVE_TYPE: 'component does not have type',
        INVALID_COMPONENT_STRUCTURE: 'invalid component structure',
        INVALID_CONTAINER_STRUCTURE: 'invalid container structure',
        INVALID_CONTAINER_POINTER: 'invalid container pointer',
        CANNOT_ADD_COMPONENT_TO_MOBILE_PATH: 'cannot add component to mobile path',
        CANNOT_DELETE_MASTER_PAGE: 'cannot delete master page',
        SITE_MUST_HAVE_AT_LEAST_ONE_PAGE: 'site must have at least one page',
        CANNOT_DELETE_MOBILE_COMPONENT: 'cannot delete mobile component',
        CUSTOM_ID_MUST_BE_STRING: 'customId must be a string',
        COMPONENT_IS_NOT_CONTAINER: 'component is not a container',
        LAYOUT_PARAM_IS_INVALID: 'layout param is invalid',
        LAYOUT_PARAM_IS_NOT_ALLOWED: 'layout param is not allowed',
        LAYOUT_PARAM_MUST_BE_NUMERIC: 'layout param must be numeric',
        LAYOUT_PARAM_MUST_BE_BOOLEAN: 'layout param must be boolean',
        LAYOUT_PARAM_ROTATATION_INVALID_RANGE: 'rotationInDegrees must be a valid range (0-360)',
        LAYOUT_PARAM_CANNOT_BE_NEGATIVE: 'layout param cannot be a negative value',
        CANNOT_DELETE_HEADER_COMPONENT: 'cannot delete a header component',
        CANNOT_DELETE_FOOTER_COMPONENT: 'cannot delete a footer component',
        SKIN_PARAM_MUST_BE_STRING: 'skin name param must be a string',
        CANNOT_SET_BOTH_SKIN_AND_STYLE: 'skin cannot be set if style already exists',
        STYLE_ID_PARAM_MUST_BE_STRING: 'style id param must be a string',
        STYLE_ID_PARAM_DOES_NOT_EXIST: 'style id param does not exist and cannot be set',
        STYLE_ID_PARAM_ALREADY_EXISTS: 'style id param already exists and cannot be overridden with custom style',
        STYLE_PROPERTIES_PARAM_MUST_BE_OBJECT: 'style properties param must be an object',
        COMPONENT_IS_DEPRECATED: 'cannot add because component was deprecated'
    };

    var ALLOWED_MOBILE_COMPONENTS = ['wysiwyg.viewer.components.mobile.TinyMenu',
        'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton',
        'wysiwyg.viewer.components.mobile.ExitMobileModeButton'];

    var ALLOWED_LAYOUT_PARAMS = ['x', 'y', 'width', 'height', 'scale', 'rotationInDegrees', 'fixedPosition', 'docked', 'aspectRatio'];

    /**
     * @param ps
     * @param {jsonDataPointer} componentPointer
     * @param {Object} componentDefinition
     * @param {String} [optionalCustomId]
     * @returns {Object}
     */
    function validateComponentToSet(ps, componentPointer, componentDefinition, optionalCustomId, containerPointer, isPage) {
        if (!_.isUndefined(optionalCustomId) && !isValidCustomId(optionalCustomId)) {
            return {success: false, error: ERRORS.CUSTOM_ID_MUST_BE_STRING};
        }

        if (!isValidComponentDefinition(componentDefinition)) {
            return {success: false, error: ERRORS.INVALID_COMPONENT_STRUCTURE};
        }

        if (!isPage && (!containerPointer || !isValidContainerDefinition(ps, componentDefinition, containerPointer))){
            return {success: false, error: ERRORS.INVALID_CONTAINER_POINTER};
        }

        return {success: true};
    }

    function validateComponentToAdd(ps, componentPointer, componentDefinition, containerPointer, optionalIndex) {
        if (deprecation.isComponentDeprecated(componentDefinition.componentType)) {
            return {success: false, error: deprecation.getDeprecationMessage(componentDefinition.componentType)};
        }
        if (deprecation.shouldWarnForDeprecation(componentDefinition.componentType)) {
            if (ps.runtimeConfig.shouldThrowOnDeprecation) {
                return {success: false, error: deprecation.getDeprecationMessage(componentDefinition.componentType)};
            }
            utils.log.warnDeprecation(deprecation.getDeprecationMessage(componentDefinition.componentType));
        }
        if (ps.pointers.components.isMobile(componentPointer) && !_.includes(ALLOWED_MOBILE_COMPONENTS, componentDefinition.componentType)) {
            return {success: false, error: ERRORS.CANNOT_ADD_COMPONENT_TO_MOBILE_PATH};
        }
        if (!isValidContainerDefinition(ps, componentDefinition, containerPointer)){
            return {success: false, error: ERRORS.INVALID_CONTAINER_POINTER};
        }
        if (!isValidIndexOfChild(ps, containerPointer, optionalIndex)) {
            return {success: false, error: ERRORS.INVALID_CONTAINER_POINTER};
        }
        return {success: true};
    }

    function isValidIndexOfChild(ps, containerPointer, optionalIndex) {
        if (!_.isNumber(optionalIndex)) {
            return true;
        }
        var componentPointers = ps.pointers.components;
        var childrenPointers = componentPointers.getChildren(containerPointer);
        if (!_.isFinite(optionalIndex) || optionalIndex < 0 || optionalIndex > childrenPointers.length) {
            return false;
        }
        return true;
    }

    function isValidContainerDefinition(ps, componentDefinition, containerPointer) {
        if (!ps.dal.isExist(containerPointer)){
            return false;
        }

        if (!componentsMetaData.public.isContainableByStructure(ps, componentDefinition, containerPointer)){
            return false;
        }

        return true;
    }

    /**
     * Recursively perform component structure validation
     * @param {Object} componentDefinition
     * @returns {Object}
     */
    function isValidComponentDefinition(componentDefinition) {
        if (!isValidComponentStructure(componentDefinition)) {
            return false;
        }

        var childComponents = getChildComponents(componentDefinition);
        return !hasInvalidChildComponent(childComponents);
    }

    /**
     * @param {Array} childComponents
     * @returns {Boolean}
     */
    function hasInvalidChildComponent(childComponents) {
        return _.some(childComponents, function (childComponent) {
            return !isValidComponentStructure(childComponent);
        });
    }

    function validateSetSkinParams(ps, componentPointer, skinName) {
        if (!_.isString(skinName)) {
            return {success: false, error: ERRORS.SKIN_PARAM_MUST_BE_STRING};
        }
        if (theme.styles.get(ps, getComponentStyleId(ps, componentPointer))) {
            return {success: false, error: ERRORS.CANNOT_SET_BOTH_SKIN_AND_STYLE};
        }
        //todo Shimi_Liderman 12/14/14 18:58 should add a validation that the skin is compatible with the component when @moranw will add the relevant mapping

        return {success: true};
    }

    function validateSetStyleIdParams(ps, styleId) {
        if (!_.isString(styleId)) {
            return {success: false, error: ERRORS.STYLE_ID_PARAM_MUST_BE_STRING};
        }
        if (!theme.styles.get(ps, styleId)) {
            return {success: false, error: ERRORS.STYLE_ID_PARAM_DOES_NOT_EXIST};
        }

        return {success: true};
    }

    function validateExistingComponent(ps, componentPointer) {
        if (!ps.dal.isExist(componentPointer)){
            return {success: false, error: ERRORS.COMPONENT_DOES_NOT_EXIST};
        }
        return {success: true};
    }

    function validateComponentCustomStyleParams(ps, optionalSkinName, optionalStyleProperties, optionalStyleId) {
        function isUsed(value) {
            return !_.isNull(value) && !_.isUndefined(value);
        }

        if (isUsed(optionalStyleId) && !_.isString(optionalStyleId)) {
            return {success: false, error: ERRORS.STYLE_ID_PARAM_MUST_BE_STRING};
        }
        if (isUsed(optionalStyleId) && !!theme.styles.get(ps, optionalStyleId)) {
            return {success: false, error: ERRORS.STYLE_ID_PARAM_ALREADY_EXISTS};
        }
        if (isUsed(optionalSkinName) && !_.isString(optionalSkinName)) {
            //todo Shimi_Liderman 12/14/14 18:58 should add a validation that the skin is compatible with the component when @moranw will add the relevant mapping
            return {success: false, error: ERRORS.SKIN_PARAM_MUST_BE_STRING};
        }
        if (isUsed(optionalStyleProperties) && (!_.isObject(optionalStyleProperties) || _.isArray(optionalStyleProperties))) {
            return {success: false, error: ERRORS.STYLE_PROPERTIES_PARAM_MUST_BE_OBJECT};
        }

        return {success: true};
    }


    /**
     * @param {Object} componentStructure
     * @returns {Array}
     */
    function getChildComponents(componentStructure) {
        var childComponents = [];

        if (componentStructure.children && !_.isEmpty(componentStructure.children)) {
            return componentStructure.children;
        }
        if (componentStructure.components && !_.isEmpty(componentStructure.components)) {
            childComponents = childComponents.concat(componentStructure.components);
        }
        if (componentStructure.mobileComponents && !_.isEmpty(componentStructure.mobileComponents)) {
            childComponents = childComponents.concat(componentStructure.mobileComponents);
        }

        return childComponents;
    }

    function getComponentStyleId(ps, componentPointer) {
        var result = null;
        if (ps && componentPointer) {
            var compStylePointer = ps.pointers.getInnerPointer(componentPointer, 'styleId');
            result = ps.dal.get(compStylePointer);
        }
        return result;
    }


    /**
     * @param {Object} ps
     * @param {Array} componentPointer
     * @returns {Object}
     */
    function validateComponentToDelete(ps, componentPointer) {
        if (isMasterPage(componentPointer)) {
            return {success: false, error: ERRORS.CANNOT_DELETE_MASTER_PAGE};
        }

        var compType = ps.dal.get(ps.pointers.getInnerPointer(componentPointer, 'componentType'));
        var type = ps.dal.get(ps.pointers.getInnerPointer(componentPointer, 'type'));

        if (!compType){
            return {success: false, error: ERRORS.COMPONENT_DOES_NOT_HAVE_TYPE};
        }

        if (isPageComponent(type)) {
            if (popupUtils.isPopup(ps, componentPointer.id)) {
                return {success: true};
            } else if (siteHasOnlyOnePage(ps)) {
                return {success: false, error: ERRORS.SITE_MUST_HAVE_AT_LEAST_ONE_PAGE};
            }
            return {success: true};
        }

        if (isHeaderComponent(compType)) {
            return {success: false, error: ERRORS.CANNOT_DELETE_HEADER_COMPONENT};
        }

        if (isFooterComponent(compType)) {
            return {success: false, error: ERRORS.CANNOT_DELETE_FOOTER_COMPONENT};
        }

        return {success: true};
    }

    /**
     * @param {jsonDataPointer} componentPointer
     * @returns {Boolean}
     */
    function isMasterPage(componentPointer) {
        return componentPointer.id === 'masterPage';
    }

    /**
     * @param {string} compType
     * @returns {Boolean}
     */
    function isHeaderComponent(compType) {
        return compType && compType === constants.COMP_TYPES.HEADER;
    }

    /**
     * @param {string} componentType
     * @returns {Boolean}
     */
    function isFooterComponent(componentType) {
        return componentType === constants.COMP_TYPES.FOOTER;
    }

    /**
     * @param {Object} ps
     * @returns {Boolean}
     */
    function siteHasOnlyOnePage(ps) {
        return pageData.getNumberOfPages(ps) === 1;
    }

    /**
     * @param {Object} componentStructure
     * @returns {Boolean}
     */
    function isValidComponentStructure(componentStructure) {
        return compHasType(componentStructure) && compHasSkinOrStyle(componentStructure) &&
            compDataTypeFitsCompType(componentStructure) && compPropTypeFitsCompType(componentStructure);
    }

    /**
     * @param {Object} componentStructure
     * @returns {Boolean}
     */
    function compHasType(componentStructure) {
        return _.isObject(componentStructure) &&
            componentStructure.componentType &&
            _.includes(_.keys(componentsDefinitionsMap), componentStructure.componentType);
    }

    /**
     * @param {Object} componentStructure
     * @returns {Boolean}
     */
    function compDataTypeFitsCompType(componentStructure) {
        var compDefinitions = componentsDefinitionsMap[componentStructure.componentType];
        var compData = componentStructure.data;

        if (_.isArray(compDefinitions.dataTypes)){
            if (_.isPlainObject(compData)){
                return compData.type && _.includes(compDefinitions.dataTypes, compData.type);
            } else if (_.isString(compData)){
                return _.includes(compDefinitions.dataTypes, compData);
            }
            return _.includes(compDefinitions.dataTypes, '');
        }

        return !compData;
    }

    /**
     * @param {Object} componentStructure
     * @returns {Boolean}
     */
    function compPropTypeFitsCompType(componentStructure) {
        var componentType = componentStructure.componentType;
        var compProps = componentStructure.props;
        try {
            compPropValidator.validateProperties(componentType, compProps);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @param {Object} componentStructure
     * @returns {Boolean}
     */
    function compHasSkinOrStyle(componentStructure) {
        return !!componentStructure.skin || !!componentStructure.style;
    }

    /**
     * @param {String} customId
     * @returns {Boolean}
     */
    function isValidCustomId(customId) {
        return _.isString(customId);
    }

    /**
     * @param {Object} compType
     * @returns {Boolean}
     */
    function isPageComponent(compType) {
        return compType === 'Page';
    }

    /**
     * @param {String} param
     * @param {Number} value
     * @returns {Object}
     */
    function validateLayoutParam(param, value) {

        if (!_.includes(ALLOWED_LAYOUT_PARAMS, param)) {
            return {success: false, error: ERRORS.LAYOUT_PARAM_IS_NOT_ALLOWED};
        }

        if (param === 'fixedPosition' && _.isBoolean(value)) {
            return {success: true};
        }

        // TODO: Add validations for docking
        if (param === 'docked') {
            return {success: true};
        }

        if (!_.isNumber(value)) {
            return {success: false, error: ERRORS.LAYOUT_PARAM_MUST_BE_NUMERIC};
        }

        var nonNegativeParams = _.without(ALLOWED_LAYOUT_PARAMS, 'x', 'y');

        if (_.includes(nonNegativeParams, param) && value < 0) {
            return {success: false, error: ERRORS.LAYOUT_PARAM_CANNOT_BE_NEGATIVE};
        }

        // TODO evgenyb: refactor degrees validation
        if (param === 'rotationInDegrees' && value > 360) {
            return {success: false, error: ERRORS.LAYOUT_PARAM_ROTATATION_INVALID_RANGE};
        }

        return {success: true};
    }

    /** @exports documentServices.component.componentValidations */
    return {
        validateComponentToSet: validateComponentToSet,
        validateComponentToAdd: validateComponentToAdd,
        validateComponentToDelete: validateComponentToDelete,
        validateLayoutParam: validateLayoutParam,
        validateSetSkinParams: validateSetSkinParams,
        validateSetStyleIdParams: validateSetStyleIdParams,
        validateExistingComponent: validateExistingComponent,
        validateComponentCustomStyleParams: validateComponentCustomStyleParams,
        ALLOWED_LAYOUT_PARAMS: ALLOWED_LAYOUT_PARAMS,
        ERRORS: ERRORS
    };
});
