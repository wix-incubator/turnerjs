define([
    'lodash',
    'utils',
    'ajv',
    'fonts',
    'documentServices/dataModel/themeValidationHelper',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/dataModel/BehaviorsSchemas.json',
    'documentServices/dataModel/ConnectionSchemas.json',
    'documentServices/dataModel/CSSSchemas.json',
    'experiment'
],
function (
    _,
    utils,
    ajv,
    fonts,
    themeValidationHelper,
    DATA_SCHEMAS_TO_VALIDATE,
    DESIGN_SCHEMAS_TO_VALIDATE,
    PROPERTIES_SCHEMAS_TO_VALIDATE,
    BEHAVIORS_SCHEMAS_TO_VALIDATE,
    CONNECTION_SCHEMAS_TO_VALIDATE,
    CSS_SCHEMAS_TO_VALIDATE,
    experiment
) {
    'use strict';

    var dataValidator;
    var propsValidator;

    function isReference(value) {
        return !value || (_.isString(value) && _.startsWith(value, '#'));
    }

    var PSEUDO_TYPES_VALIDATIONS = {
        ref: isReference,
        weakRef: isReference,
        refList: function (value) {
            return _.every(value, isReference);
        },
        list: function (value) {
            return !value || _.isArray(value);
        },
        stringifyObject: function (value) {
            try {
                JSON.parse(value);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    var CUSTOM_FORMAT_VALIDATIONS = {
        color: function (value) {
            return _.isNull(value) || themeValidationHelper.validateColor(null, value);
        },
        hexColor: function (value) {
            return _.isNull(value) || themeValidationHelper.validateHexColor(null, value);
        },
        numeric: function (value) {
            return (/^\d+$/).test(value);
        },
        uri: function (value) {
            return _.isNull(value) ||
                (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/).test(value);
        },
        font: function (value) {
            return _.isNull(value) || themeValidationHelper.validateFont(value);
        },
        'font-family': function (value) {
            if (_.isEmpty(value)) {
                return true;
            }
            var fontDef = _.find(fonts.fontMetadata, {fontFamily: value});
            return fontDef && fontDef.permissions === 'all';
        },
        border: function (value) {
            return isValidBorderWithColor(value);
        },
        padding: function (value) {
            return isValidBorderOrPaddingOrRadius(value);
        },
        radius: function (value) {
            return isValidBorderOrPaddingOrRadius(value);
        },
        webThemeUrl: function (value) {
            return this.themeUrl(value);
        },
        themeUrl: function (value) {
            return _.isEmpty(value) || /^[\/\-|0-9|a-z|A-Z]*$/.test(value);
        }
    };

    var CUSTOM_KEYWORDS_VALIDATIONS = {
        pseudoType: {
            validate: function (pseudoTypeNames, value) {
                return _.some(pseudoTypeNames, function (pseudoTypeName) {
                    return PSEUDO_TYPES_VALIDATIONS[pseudoTypeName] ? PSEUDO_TYPES_VALIDATIONS[pseudoTypeName](value) : true;
                });
            }
        }
    };

    function isValidBorderWithColor(value) {
        if (_.isEmpty(value)) {
            return true;
        }
        value = value.toLowerCase();
        var borderSizeExp = "(0|([0-9]*([\.][0-9]+){0,1}(px|em)[\\s]*){1,4})";
        var borderStyleExp = "(solid|dashed|dotted|double|groove|inset|none|outset|ridge){0,1}[\\s]*";
        var borderColorExp = "(\{color_([0-9]{1,2}|100)\}|(#(([0-9|a-f]){3}){1,2}){0,1})";
        var expression = "^" + borderSizeExp + borderStyleExp + borderColorExp + "$";
        return new RegExp(expression).test(value);
    }

    function isValidBorderOrPaddingOrRadius(value) {
        if (_.isEmpty(value)) {
            return true;
        }
        value = value.split(" ");
        return _.includes([1, 2, 3, 4], value.length) && !_.includes(_.map(value, isValidCssSize), false);
    }

    function isValidCssSize(value, index, collection) {
        if (collection.length === 1) {
            return /^([0-9]*)(px|em){0,1}$/.test(value);
        }
        return /^([0-9]*)(px|em){1}$/.test(value);
    }

    function addKeywordToValidator(keywordDefinitionObject, keywordName) {
        this.addKeyword(keywordName, keywordDefinitionObject);
    }

    function addFormatToValidator(formatFunctionValidationFunction, formatName) {
        this.addFormat(formatName, formatFunctionValidationFunction);
    }

    function initialize() {
        dataValidator = ajv({useDefaults: true});
        propsValidator = ajv({useDefaults: true});
        _.forEach(CUSTOM_KEYWORDS_VALIDATIONS, addKeywordToValidator, dataValidator);
        _.forEach(CUSTOM_KEYWORDS_VALIDATIONS, addKeywordToValidator, propsValidator);

        _.forEach(CUSTOM_FORMAT_VALIDATIONS, addFormatToValidator, dataValidator);
        _.forEach(CUSTOM_FORMAT_VALIDATIONS, addFormatToValidator, propsValidator);

        _.forEach(DATA_SCHEMAS_TO_VALIDATE, dataValidator.addSchema);

        _.forEach(
            // because duplicate schema names are not tolerated
            // and data and design schemas have common schema names
            _.omit(DESIGN_SCHEMAS_TO_VALIDATE, _.keys(DATA_SCHEMAS_TO_VALIDATE)),
            dataValidator.addSchema
        );
        _.forEach(PROPERTIES_SCHEMAS_TO_VALIDATE, propsValidator.addSchema);

        _.forEach(BEHAVIORS_SCHEMAS_TO_VALIDATE, dataValidator.addSchema);

        _.forEach(CONNECTION_SCHEMAS_TO_VALIDATE, dataValidator.addSchema);

        _.forEach(CSS_SCHEMAS_TO_VALIDATE, dataValidator.addSchema);
    }

    /**
     * Validate an object against a schema name.
     * @param schemaName the schema name to validate against.
     * @param dataItem the dataItem to validate
     * @param schemaType data/props
     */
    function validate(schemaName, dataItem, schemaType) {
        var errors = validateDataItem(schemaName, dataItem, schemaType).errors;
        if (errors) {
            throw new Error(JSON.stringify(_.map(errors, function (e) {
                return _.pick(e, ['message', 'dataPath', 'keyword', 'schemaPath']);
            })));
        }
    }

    function isDataSchema(schemaOrigin) {
        var schemaTypes = ['data', 'style', 'behaviors', 'design'];
        if (experiment.isOpen('connectionsData')) {
            schemaTypes.push('connections');
        }
        return _.includes(schemaTypes, schemaOrigin);
    }

    function isPropertySchema(schemaOrigin) {
        return schemaOrigin === 'props' || schemaOrigin === 'properties';
    }

    function validateDataItem(schemaName, dataItem, validationType) {
        if (isDataSchema(validationType)) {
            return {isValid: dataValidator.validate(schemaName, dataItem), errors: dataValidator.errors};
        }
        if (isPropertySchema(validationType)) {
            return {isValid: propsValidator.validate(schemaName, dataItem), errors: propsValidator.errors};
        }
        return {isValid: false, errors: [new Error("Invalid validationType: '" + validationType + "'")]};
    }

    function isDataValid(schemaName, dataItem, origin) {
        return validateDataItem(schemaName, dataItem, origin).isValid;
    }

    function getDataSchemasToValidate() {
        return _.keys(DATA_SCHEMAS_TO_VALIDATE);
    }

    function getPropertiesSchemasToValidate() {
        return _.keys(PROPERTIES_SCHEMAS_TO_VALIDATE);
    }

    initialize();

    return {
        isDataSchema: isDataSchema,
        isPropertySchema: isPropertySchema,
        validate: validate,
        isValid: isDataValid,
        getDataSchemasToValidate: getDataSchemasToValidate,
        getPropertiesSchemasToValidate: getPropertiesSchemasToValidate,
        validators: {
            data: dataValidator,
            props: propsValidator
        },
        reset: initialize // only for tests
    };
});