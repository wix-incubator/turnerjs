define(['lodash', 'santaProps/utils/santaTypesUtils', 'santaProps/types/modules/ComponentSantaTypes'], function (_, santaTypesUtils, ComponentSantaTypes) {
    'use strict';

    var COMP_SANTA_TYPES_TO_PASS = {
        theme: true,
        compDesign: true
    };

    var compDefs = {};
    var propTypesForComponents = {};
    var extensionsForComponents = {};
    var propsSelectorForComponent = {};

    function registerComponent(name, compDefinition) {
        compDefs[name] = compDefinition;
    }

    function registerComponentExtension(name, extension) {
        extensionsForComponents[name] = extensionsForComponents[name] || [];
        extensionsForComponents[name].push(extension);
    }

    function isComponentSantaType(propType) {
        return _.some(ComponentSantaTypes, function (componentPropType, propName) {
            return !COMP_SANTA_TYPES_TO_PASS[propName] && componentPropType === propType;
        });
    }

    function getDefinition(name) {
        if (!compDefs[name]) {
            return {};
        }
        return {
            mixins: [compDefs[name]].concat(extensionsForComponents[name] || [])
        };
    }

    function getPropTypesOfComp(name) {
        if (!propTypesForComponents[name]) {
            var propTypes = santaTypesUtils.getPropTypesByDefinition(getDefinition(name));
            propTypesForComponents[name] = _.pick(propTypes, function (propType) {
                return _.isFunction(propType.fetch);
            });
        }

        return propTypesForComponents[name];
    }

    function getPropTypesForChildComponent(name) {
        return _.omit(getPropTypesOfComp(name), isComponentSantaType);
    }

    function getPropsSelectorForComponent(name) {
        var compDef = compDefs[name];
        if (!compDef) {
            return _.noop;
        }

        propsSelectorForComponent[name] = propsSelectorForComponent[name] || function (state, props) {
            var santaPropTypes = getPropTypesOfComp(name);

            return _.mapValues(santaPropTypes, function (propType) {
                return propType.fetch(state, props);
            });
        };

        return propsSelectorForComponent[name];
    }

    function isSantaTypedComponentByName(name) {
        return _.get(compDefs, [name, 'statics', 'useSantaTypes'], false);
    }

    function isSantaTypedComponentReactElement(element) {
        return _.get(element, ['constructor', 'useSantaTypes'], false);
    }

    return {
        isSantaTypedComponentByName: isSantaTypedComponentByName,
        isSantaTypedComponentReactElement: isSantaTypedComponentReactElement,
        registerComponent: registerComponent,
        registerComponentExtension: registerComponentExtension,
        getPropTypesForChildComponent: getPropTypesForChildComponent,
        getPropsSelectorForComponent: getPropsSelectorForComponent
    };
});
