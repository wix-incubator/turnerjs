define([
    'santaProps',
    'siteUtils'
], function (santaProps, siteUtils) {
    'use strict';

    return {

        /**
         * Registers a component definition in the component factory and the state handler
         * @param {string} name The name of the component
         * @param {comp.reactComponent} compDefinition The js object (dictionary) that defines the component. It will instantiated
         * when used for the first time. In order to change in runtime, use the invalidate method.
         */
        register: function (name, compDefinition) {
            siteUtils.compFactory.register(name, compDefinition);
            santaProps.propsSelectorsFactory.registerComponent(name, compDefinition);

            return this;
        }
    };
});
