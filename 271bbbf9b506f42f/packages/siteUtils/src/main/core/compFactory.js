define(['react', 'lodash', 'loggingUtils'], function (React, _, loggingUtils) {
    'use strict';

    var compsDefinitions = {};
    var compsExtraMixins = {};
    var comps = {};
    var compClasses = {};

    /**
     * @class core.compFactory
     */
    return {

        /**
         * Gets the cached class definition of the component or instantiating it on-demand
         * @param name The component name
         * @returns {ReactComponent|undefined} The react component for the requested name
         */
        getCompClass: function (name) {
            var componentFactory = comps[name];
            if (componentFactory) {
                return componentFactory;
            }

            var compDef = compsDefinitions[name];
            if (!compDef) {
                loggingUtils.log.error("Component not implemented: [" + name + "]");
                return undefined;
            }

            var componentClass = React.createClass({ //eslint-disable-line react/display-name
                mixins: [compDef].concat(compsExtraMixins[name])
            });
            compClasses[name] = componentClass;
            componentFactory = React.createFactory(componentClass);
            comps[name] = componentFactory;
            return componentFactory;
        },

        getCompReactClass: function (name) {
            this.getCompClass(name);
            return compClasses[name];
        },

        /**
         * Invalidates the component class. This means that you can register a different
         * class and have a new class next time a component is rendered. This is for runtime change of the
         * class, and should be used mainly for debugging purposes
         * @param name The name of the component
         */
        invalidate: function (name) {
            delete comps[name];
        },

        /**
         * Allows extending the definition of a component class by extension packages. This
         * is used for enrichment of viewer component for preview, automation qa, editor decorations, etc.
         * @param name The name of the component to extend
         * @param compDefinitionExtension The overriding methods and properties of the component
         */
        extend: function (name, compDefinitionExtension) {
            if (!compsDefinitions.hasOwnProperty(name)) {
                loggingUtils.log.error("Trying to extend component [" + name + "] but the component is not defined");
                return;
            }
            compsExtraMixins[name] = _.union(compsExtraMixins[name].concat(compDefinitionExtension));
        },

        /**
         * Registers a component definition in the component factory
         * @param {string} name The name of the component
         * @param {comp.reactComponent} compDefinition The js object (dictionary) that defines the component. It will instantiated
         * when used for the first time. In order to change in runtime, use the invalidate method.
         */
        register: function (name, compDefinition) {
            compsDefinitions[name] = compDefinition;
            compsExtraMixins[name] = [];
            return this;
        },

        keys: function () {
            return _.keys(compsDefinitions);
        }

        /**
         * @typedef {ReactCompositeComponent} comp.reactComponent
         * @property {comp.properties} props
         */
    };
});



