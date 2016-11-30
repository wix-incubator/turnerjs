/**
 * Created by avim on 30/10/2016.
 */
'use strict';

const _ = require('lodash');

module.exports = santaRequire => {
    const siteUtils = santaRequire('siteUtils');
    const testUtils = santaRequire('testUtils');
    const componentsDefinitionsMap = santaRequire('documentServices/component/componentsDefinitionsMap');
    const dataValidators = santaRequire('documentServices/dataModel/dataValidators');
    const compFactory = siteUtils.compFactory;
    const santaPropTypeComponents = compFactory.keys().filter((compType) => {
        try {
            return compFactory.getCompClass(compType).type.useSantaTypes && componentsDefinitionsMap[compType];
        } catch (e) {
            return false;
        }
    });


    function getComponentProps(compType, siteData) {

        const dataSchema = _.last(componentsDefinitionsMap[compType].dataTypes);
        const propSchema = componentsDefinitionsMap[compType].propertyType;
        const skin = _.values(componentsDefinitionsMap[compType].styles)[0];
        const compId = _.uniqueId(compType);


        return testUtils.santaTypesBuilder.getComponentProps(compFactory.getCompReactClass(compType), {
            compProp: propSchema ? dataValidators.resolveDefaultItem(propSchema) : {},
            compData: dataSchema ? dataValidators.resolveDefaultItem(dataSchema) : {},
            style: {
                top: 100,
                left: 100,
                width: 600,
                height: 200
            },
            skin: skin,
            structure: {
                componentType: compType,
                skin: skin,
                id: compId,
                layout: {
                    width: 600,
                    height: 200,
                    x: 100,
                    y: 100,
                    scale: 1,
                    rotationInDegrees: 0,
                    anchors: [],
                    fixedPosition: false
                },
                nickname: compId + 'nick'
            },
            id: compId
        }, siteData);
    }

    return {
        santaPropTypeComponents: santaPropTypeComponents,
        getComponentProps: getComponentProps
    };
};
