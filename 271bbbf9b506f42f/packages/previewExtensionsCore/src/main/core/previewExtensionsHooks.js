define(['lodash'], function (_) {
    'use strict';
    /**
     * @enum documentServices.componentHooks.HOOK_NAMES
     * @type {{ON_CLICK: string}}
     */
    var hookNames = {
        /**
         * @property
         */
        ON_CLICK: 'onClick'
    };

    var supportedHooks = {};
    var registeredHooks = {};

    return {
        /**
         * Register a list of hooks that are supported by a component class
         * @param {string} compType component type
         * @param {string[]} hooks supported hook names
         */
        registerSupportedHooks: function registerSupportedHooks(compType, hooks) {
            supportedHooks[compType] = hooks;
        },

        /**
         * Get a hook function
         * @param {string} compType component type
         * @param {string} hookName hook name
         * @returns {function|null} hook function
         */
        getHookFn: function getHookFn(compType, hookName) {
            return registeredHooks[compType] && registeredHooks[compType][hookName] || null;
        },

        HOOK_NAMES: hookNames,

        /**
         * @class documentServices.componentHooks
         */
        public: {
            /**
             * Sets a hook function for a component's specific hook
             * @param {string} compType component type
             * @param {string} hookName name of hook
             * @param {function} fn hook function
             * @throws Throws if component of compType doesn't support hooks or if hookName isn't supported for the compType
             */
            setHookFn: function setHookFn(compType, hookName, fn) {
                if (!supportedHooks[compType]) {
                    throw 'No supported hooks for component ' + compType;
                }
                if (!_.includes(supportedHooks[compType], hookName)) {
                    throw 'Unsupported hookName for component ' + compType + ': ' + hookName;
                }

                registeredHooks[compType] = registeredHooks[compType] || {};
                registeredHooks[compType][hookName] = fn;
            },

            /**
             * Gets a component's supported hooks
             * @param {string} compType component type
             * @returns {string[]|undefined} supported hook names
             */
            getSupportedHooksByCompType: function getSupportedHooksByCompType(compType) {
                return supportedHooks[compType];
            },

            HOOK_NAMES: hookNames
        }
    };
});