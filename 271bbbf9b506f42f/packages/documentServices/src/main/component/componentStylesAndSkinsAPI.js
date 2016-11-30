define(['lodash', 'skins',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/anchors/anchors',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/component/componentValidations',
    'documentServices/theme/theme'], function
    (_,
     skins,
     compDefinitionMap,
     anchors,
     metaDataUtils,
     componentValidations,
     theme) {
    'use strict';

    function getComponentStyleId(privateServices, componentPointer) {
        var result = null;
        if (privateServices && componentPointer) {
            result = privateServices.dal.get(privateServices.pointers.getInnerPointer(componentPointer, 'styleId'));
        }
        return result;
    }

    function setComponentStyleId(ps, componentPointer, styleId, callback) {
        var styleDef = theme.styles.get(ps, styleId);
        if (!styleDef) {
            styleId = createSystemStyle(ps, styleId, metaDataUtils.getComponentType(ps, componentPointer));
            styleDef = theme.styles.get(ps, styleId);
        }
        var validationResult = componentValidations.validateSetStyleIdParams(ps, styleId);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }
        var compStyleIdPointer = ps.pointers.getInnerPointer(componentPointer, 'styleId');
        ps.dal.set(compStyleIdPointer, styleId);

        ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
            if (callback) {
                callback({styleProperties: (theme.styles.get(ps, styleId)).style.properties});
            }
            theme.events.onChange.executeListeners({type: "STYLE", values: styleId});
        });

        // make sure compStructure.skin && the skin inside the style are aligned
        setComponentInnerPointerSkin(ps, componentPointer, styleDef.skin);
    }

    function createSystemStyle(ps, styleId, componentType) {
        var componentDefaults = compDefinitionMap[componentType];
        if (!componentDefaults) {
            throw new Error('Component of type - ' + componentType + ' is not listed in componentsDefinitionsMap');
        }
        var defaultSkin = componentDefaults.styles[styleId];
        if (!defaultSkin) {
            throw new Error('Style id - ' + styleId + ' is not a known system style id.');
        }
        var styleDef = createSystemStyleDef(ps, defaultSkin, componentType);
        return theme.styles.createItem(ps, styleDef, styleId);
    }

    function createSystemStyleDef(ps, skinName, compType) {
        return {
            compId: '',
            componentClassName: compType,
            pageId: "",
            styleType: "system",
            type: "TopLevelStyle",
            skin: skinName,
            style: {
                groups: {},
                properties: getDefaultSkinParams(ps, skinName),
                propertiesSource: {}
            }
        };
    }

    function getDefaultSkinParams(ps, skinName) {
        return _.mapValues(theme.skins.getSkinDefinition(ps, skinName), 'defaultValue');
    }

    function setComponentInnerPointerSkin(ps, componentPointer, skinName) {
        var compSkinPointer = ps.pointers.getInnerPointer(componentPointer, 'skin');
        ps.dal.set(compSkinPointer, skinName);
    }

    /**
     * set a new custom style for a component.
     * If no styleId is given - generates a new one.
     * If no skin is given - tries to use the current skin.
     * If no styleProperties are given - style will use the current styleProperties.
     * @param {Object} ps
     * @param componentPointer
     * @param {string} [optionalSkinName] the name of the skin the style will use
     * @param {Object} [optionalStyleProperties] the skin parameters that the style wants to override
     * @param {string} [optionalStyleId] the requested id of the new custom style
     * @return {string} the id of the created custom style
     * @param componentPointer
     * @param newStyleId
     */
    function setComponentCustomStyle(ps, newStyleId, componentPointer, optionalSkinName, optionalStyleProperties) {
        var validationResult = componentValidations.validateComponentCustomStyleParams(ps, optionalSkinName, optionalStyleProperties);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }
        if (!ps.dal.isExist(componentPointer)) {
            throw new Error("component param does not exist");
        }

        var compId = componentPointer.id;
        var componentClassName = metaDataUtils.getComponentType(ps, componentPointer);

        var newStyleProperties;
        var newStylePropertiesSource;

        if (optionalStyleProperties) {
            newStyleProperties = optionalStyleProperties;
            newStylePropertiesSource = generateStylePropertiesSource(ps, newStyleProperties);
        } else if (optionalSkinName) {
            // currentStyleProperties no longer relevant for the new skin
            newStyleProperties = {};
            newStylePropertiesSource = {};
        } else {
            var currentStyle = theme.styles.get(ps, getComponentStyleId(ps, componentPointer));
            // use the current, or a default empty object if no style is currently used
            newStyleProperties = _.get(currentStyle, 'style.properties', {});
            newStylePropertiesSource = _.get(currentStyle, 'style.propertiesSource', {});
        }

        var newStyle = {
            id: newStyleId,
            compId: compId,
            componentClassName: componentClassName,
            pageId: "",
            styleType: "custom",
            type: "TopLevelStyle",
            skin: optionalSkinName || getComponentSkin(ps, componentPointer),
            style: {
                groups: {},
                properties: newStyleProperties,
                propertiesSource: newStylePropertiesSource
            }
            //todo Shimi_Liderman 12/14/14 15:42 current custom style have metadata. Is it needed for new styles?
        };

        theme.styles.update(ps, newStyleId, newStyle);
        setComponentStyleId(ps, componentPointer, newStyleId);
    }


    /**
     * @param {Object} ps
     * @param {Object} properties style properties
     * @return {Object.<string, string>} the style properties mapped to a "value" or "theme" source
     */
    function generateStylePropertiesSource(ps, properties) {
        return _.mapValues(properties, function (value) {
            if (_.isNumber(value) || _.isBoolean(value) ||
                (_.isString(value) && (_.includes(value, '#') || _.includes(value, 'rgb')))) { //tpa change for ui-lib
                return "value";
            }
            if (theme.fonts.get(ps, value) || theme.colors.get(ps, value)) {
                return "theme";
            }
            return "value";
        });
    }

    function updateComponentStyle(ps, componentPointer, styleValue) {
        updateComponentStyleAndAdjustLayout(ps, componentPointer, styleValue);
        anchors.updateAnchors(ps, componentPointer);
    }

    function updateComponentStyleAndAdjustLayout(ps, componentPointer, styleValue) {
        var validationResult = componentValidations.validateExistingComponent(ps, componentPointer);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }

        var currentStyleId = getComponentStyleId(ps, componentPointer);
        theme.styles.update(ps, currentStyleId, styleValue);

        // make sure compStructure.skin && the skin inside the style are aligned
        setComponentInnerPointerSkin(ps, componentPointer, styleValue.skin);
    }

    /**
     * set a component's skin
     * @param ps
     * @param componentPointer
     * @param skinName
     */
    function setComponentSkin(ps, componentPointer, skinName) {
        var validationResult = componentValidations.validateSetSkinParams(ps, componentPointer, skinName);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }
        setComponentInnerPointerSkin(ps, componentPointer, skinName);
    }

    function getComponentSkin(privateServices, componentPointer) {
        var skinName = null;
        if (componentPointer) {
            var componentStyle = getComponentStyle(privateServices, componentPointer);
            if (componentStyle && componentStyle.skin) {
                skinName = componentStyle.skin;
            } else {
                // get skin name from structure.
                skinName = privateServices.dal.get(privateServices.pointers.getInnerPointer(componentPointer, 'skin'));
            }
        }
        return skinName;
    }

    function getComponentSkinExports(privateServices, componentPointer) {
        var skinName = getComponentSkin(privateServices, componentPointer);
        return skins.params.getSkinExports(skinName);
    }

    function getComponentSkinDefaults(privateServices, componentPointer) {
        var skinName = getComponentSkin(privateServices, componentPointer);
        return skins.params.getSkinDefaultParams(skinName);
    }

    function getCompSkinParamValue(privateServices, componentPointer, paramValue) {
        var compStyle = getComponentStyle(privateServices, componentPointer).style.properties || {};
        var skinDefaults = getComponentSkinDefaults(privateServices, componentPointer);
        if (_.isArray(skinDefaults[paramValue]) && skinDefaults[paramValue].length === 1) {
            return compStyle[skinDefaults[paramValue]];
        }
        return skinDefaults[paramValue];
    }

    function getComponentStyle(ps, componentPointer) {
        var compStyleId = getComponentStyleId(ps, componentPointer);
        if (compStyleId) {
            return theme.styles.get(ps, compStyleId);
        }
        return null;
    }

    return {
        style: {
            /**
             * set a component's style
             * @param {jsonDataPointer} componentReference
             * @param {String} styleId
             * @throws an exception if no corresponding component exists or invalid style name.
             */
            setId: setComponentStyleId,
            /**
             * get the component's style id
             * @param {jsonDataPointer} componentReference
             * @return {String} the Style ID of the corresponding component. 'null' otherwise.
             */
            getId: getComponentStyleId,
            /**
             * set a new custom style for a component.
             * If no styleId is given - generates a new one.
             * If no skin is given - tries to use the current skin.
             * If no styleProperties are given - style will use the current styleProperties.
             * @param {jsonDataPointer} componentReference
             * @param {string} [optionalSkinName] the name of the skin the style will use
             * @param {Object} [optionalStyleProperties] the skin parameters that the style wants to override
             * @param {string} [optionalStyleId] the requested id of the new custom style
             * @return {string} the id of the created custom style
             */
            setCustom: setComponentCustomStyle,
            /**
             * The function updates a component's style definition value
             * @param {jsonDataPointer} componentReference
             * @param {object} styleValue style objects we want to update
             * @throws an exception if no corresponding component exists or invalid style value.
             */
            update: updateComponentStyle,
            /**
             * The function updates a component's style definition value without updating anchors
             * @param {jsonDataPointer} componentReference
             * @param {object} styleValue style objects we want to update
             * @throws an exception if no corresponding component exists or invalid style value.
             */
            updateAndAdjustLayout: updateComponentStyleAndAdjustLayout,

            createSystemStyle: createSystemStyle
        },
        /** @class documentServices.components.skin*/
        skin: {
            /**
             * set a component's skin
             * @param {jsonDataPointer} componentReference
             * @param {String} skinName
             * @example documentServices.components.skin.set(photoCompRef, "wysiwyg.viewer.skins.photo.RoundPhoto");
             */
            set: setComponentSkin,
            /**
             * gets the skin name from style if exists, otherwise - from structure
             * @param {jsonDataPointer} componentReference
             * @return {String} the name of the Skin corresponding the Component Reference. 'null' otherwise.
             */
            get: getComponentSkin,

            getComponentSkinExports: getComponentSkinExports,
            getComponentSkinDefaults: getComponentSkinDefaults,
            getCompSkinParamValue: getCompSkinParamValue
        }

    };
});
