define(['lodash',
        'tpa',
        'documentServices/component/componentStylesAndSkinsAPI',
        'documentServices/componentDetectorAPI/componentDetectorAPI',
        'documentServices/component/componentsDefinitionsMap',
        'documentServices/component/component',
        'documentServices/theme/theme'], function (_, tpa, componentStylesAndSkinsAPI, componentDetectorAPI, componentsDefinitionsMap, component, theme) {

    'use strict';

    var COLOR_PARAM_KEY_PREFIX = 'param_color_',
        NUMBER_PARAM_KEY_PREFIX = 'param_number_',
        BOOLEAN_PARAM_KEY_PREFIX = 'param_boolean_',
        FONT_PARAM_KEY_PREFIX = 'param_font_';

    var setStyleParam = function (ps, compId, data, callback) {

        var compPointer = componentDetectorAPI.getComponentById(ps, compId);

        var currentStyle = getCurrentStyle(ps, compPointer);

        setStyleParamData(currentStyle, data);

        var newStyleId = getStyleIdByDef(ps, currentStyle, component.getType(ps, compPointer));

        componentStylesAndSkinsAPI.style.setId(ps, compPointer, newStyleId, function (styleProperties) {
            callback(styleProperties);
        });
    };

    var mapWixParamsToCssValues = function (ps, wixParams, callback) {
        var tpaStyleUtils = tpa.tpaStyleUtils;
        tpaStyleUtils.getValueForWixParams(theme.styles.getAll(ps).THEME_DATA, wixParams, callback);
    };

    var getCompStyle = function (ps, compRef) {
        var styleId = componentStylesAndSkinsAPI.style.getId(ps, compRef);
        return theme.styles.get(ps, styleId);
    };

    var setStyleParamData = function (currentStyle, data) {
        if (_.isArray(data)) {
            _.forEach(data, function (item) {
                setStyleParamDataItem(currentStyle, item);
            });
        } else {
            setStyleParamDataItem(currentStyle, data);
        }
    };

    var setStyleParamDataItem = function (currentStyle, data) {
        var key = data.key;
        switch (data.type) {
            case 'color':
                key = COLOR_PARAM_KEY_PREFIX + key;
                setColorParam(currentStyle, key, data);
                break;
            case 'font':
                key = FONT_PARAM_KEY_PREFIX + key;
                setFontParam(currentStyle, key, data);
                break;
            case 'number':
                key = NUMBER_PARAM_KEY_PREFIX + key;
                setNumberParam(currentStyle, key, data);
                break;
            case 'boolean':
                key = BOOLEAN_PARAM_KEY_PREFIX + key;
                setBooleanParam(currentStyle, key, data);
                break;
        }
    };

    var getCurrentStyle = function (ps, compPointer) {
        var currentStyle = getCompStyle(ps, compPointer);
        _.defaults(currentStyle, {
            style: {
                groups: {},
                properties: {},
                propertiesSource: {}
            }
        });
        if (currentStyle) {
            currentStyle.styleType = 'custom';
        }
        return currentStyle;
    };

    function getAllStyles(ps) {
        var styleIds = theme.styles.getAllIds(ps);
        return _.map(styleIds, theme.styles.get.bind(null, ps));
    }

    function getStylesBySkin(ps, skinName) {
        var styleObjects = getAllStyles(ps);
        return _.filter(styleObjects, {skin: skinName});
    }

    var getStyleIdByDef = function (ps, styleDef, compType) {
        if (styleDef.styleType === 'system') {
            return styleDef.id;
        }
        var filteredStyles = getStylesBySkin(ps, styleDef.skin);
        var styleWithSameProperties = _.find(filteredStyles, function (styleProps) {
            if (_.isUndefined(styleProps.style) && styleDef.style) {
                return false;
            } else if (styleProps.style && styleDef.style) {
                var themeCompIds = componentsDefinitionsMap[compType] ? _.keys(componentsDefinitionsMap[compType].styles) : [];
                if (_.includes(themeCompIds, styleProps.id) || styleProps.componentClassName === compType) {
                    return areStylePropertiesEqual(styleProps.style.properties, styleDef.style.properties);
                }
                return false;
            }
            return true;
        });
        return styleWithSameProperties ? styleWithSameProperties.id : createNewStyleByDef(ps, styleDef, styleDef.componentClassName);
    };

    var createNewStyleByDef = function (ps, styleDef, compType) {
        var clonedStyleProperties = _.cloneDeep(styleDef);
        clonedStyleProperties.styleType = 'custom';
        clonedStyleProperties.componentClassName = clonedStyleProperties.componentClassName || compType;
        return theme.styles.createItem(ps, clonedStyleProperties);
    };

    var areStylePropertiesEqual = function(firstProps, secondProps) {
        return _.isEqual(firstProps, secondProps);
    };

    var setBooleanParam = function (currentStyle, key, data) {
        var value = data.param.value;
        currentStyle.style.properties[key] = value;
        currentStyle.style.propertiesSource = _.get(currentStyle, 'style.propertiesSource', {});
        currentStyle.style.propertiesSource[key] = 'value';
    };

    var setNumberParam = function (currentStyle, key, data) {
        var value = data.param.value;
        currentStyle.style.properties[key] = value;
        currentStyle.style.propertiesSource = _.get(currentStyle, 'style.propertiesSource', {});
        currentStyle.style.propertiesSource[key] = 'value';
    };

    var setColorParam = function (currentStyle, key, data) {
        var isColorFromTheme = data.param.value.color && typeof data.param.value.color === 'object';
        var value = isColorFromTheme ? data.param.value.color.name : (data.param.value.rgba || data.param.value.cssColor);

        currentStyle.style.properties[key] = value;
        currentStyle.style.propertiesSource = _.get(currentStyle, 'style.propertiesSource', {});
        currentStyle.style.propertiesSource[key] = isColorFromTheme ? 'theme' : 'value';

        if (data.param.value.hasOwnProperty('opacity')) {
            currentStyle.style.properties['alpha-' + key] = data.param.value.opacity;
        }
    };

    var setFontParam = function (currentStyle, key, data) {
        var value = data.param.value;
        if (currentStyle && currentStyle.style) {
            currentStyle.style.properties[key] = JSON.stringify(value);
            currentStyle.style.propertiesSource = _.get(currentStyle, 'style.propertiesSource', {});
            currentStyle.style.propertiesSource[key] = 'value';
        }
    };

    var getTpaColorsToSiteColors = function() {
        var COLOR_PREFIX = 'color';
        var PRIME_COLORS_REFERENCES = ['white/black', 'black/white', 'primery-1', 'primery-2', 'primery-3'];
        var colorNamesByColorReferences = _.reduce(PRIME_COLORS_REFERENCES, function(result, value, key) {
            result[value] = COLOR_PREFIX + '_' + (++key);
            return result;
        }, {});

        var arr = _.range(1, 26);
        return _.reduce(arr, function(result, value) {
            result[COLOR_PREFIX + '-' + value] = COLOR_PREFIX + '_' + (value + 10);
            return result;
        }, colorNamesByColorReferences);
    };

    return {
        setStyleParam: setStyleParam,
        mapWixParamsToCssValues: mapWixParamsToCssValues,
        getTpaColorsToSiteColors: getTpaColorsToSiteColors
    };
});
