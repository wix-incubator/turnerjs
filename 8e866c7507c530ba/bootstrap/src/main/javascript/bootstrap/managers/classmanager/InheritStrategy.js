/**
 * @class bootstrap.managers.classmanager.InheritStrategy
 */
define.bootstrapClass('bootstrap.managers.classmanager.InheritStrategy', function () {
    'use strict';
    /** @constructor */
    function InheritStrategy() {}

    /**
     * @lends bootstrap.managers.classmanager.InheritStrategy
     */
    InheritStrategy.extendPrototype({

        STRATEGIES: {
            INHERIT: 'inherit',
            MERGE: 'merge',
            OVERRIDE: 'override'
        },

        /**
         * used as value for component schema to instruct the component to inherit from parent
         * @return {String} inherit instructions
         */
        inherit: function() {
            return {
                _strategy_: this.STRATEGIES.INHERIT
            };
        },

        /**
         * used as value for component schema to instruct the component to inherit from parent
         * and also include / exclude from parent schema
         * @param {object} include
         * @param {object} exclude
         *
         * @return {String} inherit instructions
         */
        merge: function(include, exclude) {
            return {
                _strategy_: this.STRATEGIES.MERGE,
                include: include,
                exclude: exclude
            };
        },

        /**
         * Returns the inherit strategy of a field
         * @param {Object} field - field to check
         * @return {String}
         */
        getInheritStrategy: function(field) {
            if(!field) {
                return this.STRATEGIES.OVERRIDE;
            } else {
                return field._strategy_ || this.STRATEGIES.OVERRIDE;
            }
        }
    });

    return InheritStrategy;
});