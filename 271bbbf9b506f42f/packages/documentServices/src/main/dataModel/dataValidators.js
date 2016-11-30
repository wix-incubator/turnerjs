define(['lodash',
    'documentServices/dataModel/dataValidatorsHelper'], function (_, dataValidatorsHelper) {
    "use strict";

    var dataSchemaValidators = {};
    var propsSchemaValidators = {};

    function validateItem(dataItem, schemaOrigin, options) {
        if (!dataItem) {
            throw new Error('Data is not set');
        }
        var schemaName = _.get(dataItem, 'type') || _.get(options, 'schemaName');
        if (!schemaName) {
            throw new Error("dataItem has no 'type' nor options has 'schemaName'");
        }
        dataValidatorsHelper.validate(schemaName, dataItem, schemaOrigin);
        var schemaValidators = {};
        if (dataValidatorsHelper.isPropertySchema(schemaOrigin)) {
            schemaValidators = propsSchemaValidators;
        } else if (schemaOrigin === 'data') {
            schemaValidators = dataSchemaValidators;
        }
        _.forOwn(schemaValidators[schemaName], function (validatorWrapper) {
            validatorWrapper.validator(validatorWrapper.schemaName, dataItem);
        });
    }

    function isItemValid(ps, dataItem, fieldName, fieldValue, origin) {
        var schemaName = dataItem && dataItem.type;
        if (!schemaName) {
            throw new Error("dataItem has no 'type' nor options has 'schemaName'");
        }
        var newValue = _.cloneDeep(dataItem);
        newValue[fieldName] = fieldValue;
        return dataValidatorsHelper.isValid(schemaName, newValue, origin);
    }

    function resolveDefaultItem(schemaName, emptyItem) {
        var validator = null;
        if (dataValidatorsHelper.validators.data.getSchema(schemaName)) {
            validator = dataValidatorsHelper.validators.data;
        } else if (dataValidatorsHelper.validators.props.getSchema(schemaName)) {
            validator = dataValidatorsHelper.validators.props;
        }
        if (validator) {
            emptyItem = emptyItem || {};
            validator.validate(schemaName, emptyItem);
        }
        return emptyItem;
    }

    function registerDataSchemaValidator(dataSchemaName, validator) {
        return registerSchemaValidator(dataSchemaValidators, dataSchemaName, validator);
    }

    function registerPropsSchemaValidator(propsSchemaName, validator) {
        return registerSchemaValidator(propsSchemaValidators, propsSchemaName, validator);
    }

    function registerSchemaValidator(schemaValidators, schemaName, validator) {
        if (schemaValidators && schemaName && validator) {
            var validators = schemaValidators[schemaName];
            if (!validators) {
                validators = [];
                schemaValidators[schemaName] = validators;
            }
            var validatorId = validators.length;
            validators.push({id: validatorId, validator: validator, schemaName: schemaName});
            return createValidatorUnregister(schemaValidators, schemaName, validatorId);
        }
        return null;
    }

    function createValidatorUnregister(schemaValidators, schemaName, validatorId) {
        if (schemaValidators && schemaName && validatorId) {
            var wasUsed = false;
            return function validatorRemoval() {
                if (wasUsed) {
                    return false;
                }
                var validators = schemaValidators[schemaName];
                var wasValidatorRemoved;
                if (validators) {
                    var i = 0;
                    wasValidatorRemoved = false;
                    while (i < validators.length && validators[i].id !== validatorId) {
                        i++;
                    }
                    if (i !== validators.length) {
                        validators.splice(i, 1);
                        wasValidatorRemoved = true;
                    }
                }
                wasUsed = true;
                return wasValidatorRemoved;
            };
        }
        return null;
    }

    return {
        validateDataBySchema: validateItem,
        validateItem: validateItem,
        resolveDefaultItem: resolveDefaultItem,
        isItemValid: isItemValid,
        registerDataSchemaValidator: registerDataSchemaValidator,
        registerPropsSchemaValidator: registerPropsSchemaValidator
    };
});
