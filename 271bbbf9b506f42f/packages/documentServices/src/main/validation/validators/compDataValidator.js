define(['lodash',
        'documentServices/dataModel/dataValidators',
        'documentServices/dataModel/dataModel',
        'documentServices/component/componentsDefinitionsMap'
    ],
    function (_, dataValidator, dataModel, componentsDefinitionsMap) {
        'use strict';


        //temporarily taken from componentValidations.js and slightly modified
        function compDataTypeFitsCompType(componentType, componentData) {
            var compDefinitions = componentsDefinitionsMap[componentType];

            if (_.isArray(compDefinitions.dataTypes)) {
                if (_.isPlainObject(componentData)) {
                    return componentData.type && _.includes(compDefinitions.dataTypes, componentData.type);
                } else if (_.isString(componentData)) {
                    return _.includes(compDefinitions.dataTypes, componentData);
                }
                return _.includes(compDefinitions.dataTypes, '');
            }

            return !componentData;
        }

        function validateCompData(ps, compPointer) {
            var componentType = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'componentType'));
            var dataItemPointer = dataModel.getDataItemPointer(ps, compPointer);
            var data = dataItemPointer && ps.dal.get(dataItemPointer);
            if (!compDataTypeFitsCompType(componentType, data)) {
                throw new Error('Component data type [' + data && data.type + '] is not valid for component type [' + componentType + ']');
            }
            if (data) { //if we don't have data, and no error was thrown, there's nothing else to validate
                dataValidator.validateDataBySchema(data, 'data');
            }
        }

        return {
            validateCompData: validateCompData
        };
});
