define(['lodash', 'fonts', 'wixappsCore', 'documentServices/theme/theme'], function(_, fonts, wixappsCore, theme) {
    'use strict';

    var FONT_STYLE_VIEW_DEF_PROPS = { // TODO: unite with textProxy
        fontSize: {defaultValue: null, parsedStyleKey: 'size'},
        fontFamily: {defaultValue: null, parsedStyleKey: 'family'},
        bold: {defaultValue: false, parsedStyleKey: 'bold'},
        italic: {defaultValue: false, parsedStyleKey: 'italic'},
        underline: {defaultValue: false, parsedStyleKey: 'underline'},
        color: {defaultValue: null, parsedStyleKey: 'color'},
        backgroundColor: {defaultValue: null, parsedStyleKey: null},
        lineHeight: {defaultValue: null, parsedStyleKey: 'lineHeight'},
        lineThrough: {defaultValue: false, parsedStyleKey: null}
    };

    var NUMBER_KEYS = ['fontSize', 'lineHeight'];

    var ERROR_CANNOT_SET_FONT_CLASS_AND_ADDITIONAL_ATTRIBUTES = 'Cannot set "fontClass" together with additional attributes';
    var ERROR_CANNOT_SET_FONT_CLASS_TO_NULL = 'Cannot set fontClass to null';

    function parseFontClass(privateServices, fontClass) {
        var parsedFontEditorFormat = fonts.fontUtils.parseStyleFont(fontClass, theme.fonts.getAll(privateServices), theme.colors.getAll(privateServices));

        var parsedFontWixappsFormat = _.reduce(FONT_STYLE_VIEW_DEF_PROPS, function(parsedData, keyDef, key) {
            var parsedStyleValue = keyDef.parsedStyleKey && parsedFontEditorFormat[keyDef.parsedStyleKey];
            if (parsedStyleValue) {
                parsedData[key] = _.isString(parsedStyleValue) ? parsedStyleValue.replace(/[{}]/g, '') : parsedStyleValue;
            }
            return parsedData;
        }, {});

        return parsedFontWixappsFormat;
    }

    function intersectsWithFontClass(fieldProps) {
        var fieldPropsKeys = _.keys(fieldProps);
        var fontClassKeys = _.keys(FONT_STYLE_VIEW_DEF_PROPS);
        var propsOverridingStyle = _.intersection(fieldPropsKeys, fontClassKeys);
        return !_.isEmpty(propsOverridingStyle);
    }

    function parseNumbers(props) {
        _.forEach(NUMBER_KEYS, function(propName) {
            if (props[propName] && _.isString(props[propName])) {
                props[propName] = parseInt(props[propName], 10);
            }
        });
        return props;
    }

    function fixPropsAccordingToFontClass(privateServices, props) {
        if (props.fontClass) {
            var fontClassProps = parseFontClass(privateServices, props.fontClass);
            var propsOverrideClass = false;

            _.forOwn(fontClassProps, function (value, propName) {
                props[propName] = props[propName] || value;
                propsOverrideClass = propsOverrideClass || props[propName] !== value;
            });

            if (propsOverrideClass) {
                props.fontClass = null;
            }
        }

        return props;
    }

    function existingClassBeingOverridden(newFieldProps, existingFieldProps) {
        return _.isUndefined(newFieldProps.fontClass) &&
            !_.isEmpty(newFieldProps) &&
            existingFieldProps &&
            existingFieldProps.fontClass;
    }

    /**
     * @param newFieldProps new values for field props
     * @param existingFieldProps current field props values that are being changed
     * @returns {*}
     */
    function convertFieldPropsToViewDefProps(newFieldProps, existingFieldProps) {

        if (!_.isUndefined(newFieldProps.fontClass) && intersectsWithFontClass(newFieldProps)) {
            throw new Error(ERROR_CANNOT_SET_FONT_CLASS_AND_ADDITIONAL_ATTRIBUTES);
        }
        if (newFieldProps.fontClass === null) {
            throw new Error(ERROR_CANNOT_SET_FONT_CLASS_TO_NULL);
        }

        if (existingClassBeingOverridden(newFieldProps, existingFieldProps)) {
            newFieldProps = _.defaults(newFieldProps, existingFieldProps);
            newFieldProps.style = null;

        } else if (newFieldProps.fontClass) {
            var defaultValues = _.mapValues(FONT_STYLE_VIEW_DEF_PROPS, 'defaultValue');
            newFieldProps = _.defaults({}, defaultValues, newFieldProps);
            newFieldProps.style = wixappsCore.styleMapping.fontClassToStyle(newFieldProps.fontClass);
        }

        delete newFieldProps.fontClass;
        return parseNumbers(newFieldProps);
    }



    /**
     * @param privateServices
     * @param viewDefProps current view def props values
     * @returns {*}
     */
    function convertViewDefPropsToFieldProps(privateServices, viewDefProps) {
        viewDefProps.fontClass = wixappsCore.styleMapping.styleToFontClass(viewDefProps.style) || null;
        delete viewDefProps.style;

        if (viewDefProps.fontClass) {
            viewDefProps = fixPropsAccordingToFontClass(privateServices, viewDefProps);
        }

        return parseNumbers(viewDefProps);
    }

    return {
        convertFieldPropsToViewDefProps: convertFieldPropsToViewDefProps,
        convertViewDefPropsToFieldProps: convertViewDefPropsToFieldProps
    };
});