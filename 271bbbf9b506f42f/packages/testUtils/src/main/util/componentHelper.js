define(['siteUtils', 'react', 'reactDOM', 'lodash', 'testUtils/util/santaTypesBuilder'], function (siteUtils, React, ReactDOM, _, santaTypesBuilder) {
    "use strict";

    function getComponentProps(compDefOrClass, compProps){
        var props = _.clone(compProps);
        if (!props.skin) {
            props.skin = "skins.core.VerySimpleSkin";
        }
        if (!props.id) {
            props.id = "Test";
        }

        if (props.siteData && props.siteAPI) {
            return _.assign(santaTypesBuilder.getComponentProps(compDefOrClass, {}, props.siteData, props.siteAPI), props);
        }

        return props;
    }
    /**
     *
     * @param {string} compClassName fully qualified name of the component class
     * @param {object} compProps  map of properties
     * @param {HTMLElement} node The node you want to use for rendering the component
     * @returns {ReactCompositeComponent} React Component
     */
    function componentBuilder(compClassName, compProps, node, callback) {
        var compClass = siteUtils.compFactory.getCompReactClass(compClassName);
        var props = getComponentProps(compClass, compProps);
        var comp = React.createElement(compClass, props);
        if (node) {
            return ReactDOM.render(comp, node, callback);
        }
        return React.addons.TestUtils.renderIntoDocument(comp);
    }

    /**
     *
     * @param {Object} definition the definition of the component class
     * @param {Object} compProps the props to pass, don't pass skin unless you really want to
     * @returns {ReactCompositeComponent}
     */
    function getComponentFromDefinition(definition, compProps, node){
        var comp = getComponentReactElementFromDefinition(definition, compProps);
        if (node) {
            return ReactDOM.render(comp, node);
        }
        return React.addons.TestUtils.renderIntoDocument(comp);
    }

    function getComponentFromReactClass(compClass, compProps, node) {
        var comp = getComponentReactElementFromReactClass(compClass, compProps);
        if (node) {
            return ReactDOM.render(comp, node);
        }
        return React.addons.TestUtils.renderIntoDocument(comp);
    }

    function getComponentReactElementFromReactClass(compClass, compProps) {
        var props = getComponentProps(compClass, compProps);
        var comp = React.createElement(compClass, props);
        return comp;
    }

    function getComponentReactElementFromDefinition(definition, compProps){
        var props = getComponentProps(definition, compProps);
        var compClass = React.createClass(definition);
        var comp = React.createElement(compClass, props);
        return comp;
    }

    /**
     * Check if a given component instance is of a given class name
     * @param instance {object} React component
     * @param className {string} fully qualified name of the component class
     * @returns {boolean}
     */
    function isComponentOfType(instance, className) {
        var compClass = siteUtils.compFactory.getCompReactClass(className);
        return React.addons.TestUtils.isElementOfType(instance, compClass);
    }

    return {
        componentBuilder: componentBuilder,
        isComponentOfType: isComponentOfType,
        getComponentFromDefinition: getComponentFromDefinition,
        getComponentFromReactClass: getComponentFromReactClass,
        getComponentReactElementFromDefinition: getComponentReactElementFromDefinition
    };
});
