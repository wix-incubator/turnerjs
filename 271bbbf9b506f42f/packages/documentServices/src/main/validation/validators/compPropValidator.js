define([
    'lodash',
    'utils',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/dataModel/dataValidators',
    'documentServices/dataModel/dataModel'
], function (_, utils, componentsDefinitionsMap, dataValidator, dataModel) {
    'use strict';

    /**
     * Validate the compProps of a component type for type correctness and schema correctness.
     * @param {String} componentType The type of the component the compProps are going to be used with
     * @param {object} compProps The compProps that are going to be set
     */
    function validateProperties(componentType, compProps) {
        var compDefinition = componentsDefinitionsMap[componentType];
        if (!compDefinition) {
            throw new Error(componentType + ' has no component definition.');
        }

        if (!compDefinition.propertyTypes && !compDefinition.propertyType && !compProps) {
            return;
        }

        var types = compDefinition.propertyTypes ? compDefinition.propertyTypes : [compDefinition.propertyType || utils.constants.BASE_PROPS_SCHEMA_TYPE];
        if (_.includes(types, '') || (_.isString(compProps) && _.includes(types, compProps))) {
            return;
        }

        var msg = componentType + ' must get a compProps of one of the types [' + types + ']';
        if (!compProps) {
            throw new Error(msg);
        }

        if (!_.includes(types, compProps.type)) {
            throw new Error(msg + ' but got ' + compProps.type);
        }

        dataValidator.validateDataBySchema(compProps, 'props');
    }

    function validateCompProps(ps, compPointer) {
        var componentType = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'componentType'));
        var propertyItemPointer = dataModel.getPropertyItemPointer(ps, compPointer);
        var properties = propertyItemPointer && ps.dal.get(propertyItemPointer);
        validateProperties(componentType, properties);
    }

    return {
        validateProperties: validateProperties,
        validateCompProps: validateCompProps
    };
});
