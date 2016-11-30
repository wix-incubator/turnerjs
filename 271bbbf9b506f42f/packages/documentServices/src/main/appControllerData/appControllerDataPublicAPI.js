define(['documentServices/appControllerData/appControllerData'], function(appControllerData){
    'use strict';

    return {
        methods: {
            /** @class documentServices.platform*/
            platform: {
                /** @class documentServices.platform.controllers*/
                controllers: {
                    /** @class documentServices.platform.controllers.settings*/
                    settings: {
                        /**
                         * Sets the passed settings to the passed controller
                         * @member documentServices.platform.controllers.settings
                         * @param {AbstractComponent} controllerRef - the controller to set settings to
                         * @param {string} settingsItem - the settings to set to the controller
                         */
                        set: {dataManipulation: appControllerData.setSettings},
                        /**
                         * Gets the settings of the passed controller
                         * @member documentServices.platform.controllers.settings
                         * @param {AbstractComponent} controllerRef - the controller to get settings of
                         */
                        get: appControllerData.getSettings,
                        /**
                         * Sets the settings of the passed controller in the given path
                         * @member documentServices.platform.controllers.settings
                         * @param {AbstractComponent} controllerRef - the controller to set settings of
                         * @param {string} path - the path of the property to set
                         * @param {string} settingsItem - the value to set
                         */
                        setIn: {dataManipulation: appControllerData.setSettingsIn},
                        /**
                         * Gets the settings of the passed controller in the given path
                         * @member documentServices.platform.controllers.settings
                         * @param {AbstractComponent} controllerRef - the controller to get settings of
                         * @param {string} path - the path of the property to get.
                         */
                        getIn: appControllerData.getSettingsIn
                    },
                    /**
                     * Gets the name of the passed controller
                     * @member documentServices.platform.controllers
                     * @param {AbstractComponent} controllerRef - the controller to get the name of
                     */
                    getName: appControllerData.getName,
                    /**
                     * Sets the name of the passed controller
                     * @member documentServices.platform.controllers
                     * @param {AbstractComponent} controllerRef - the controller to set the name of
                     * @param {string} controllerName - the name to set
                     */
                    setName: {dataManipulation: appControllerData.setName},
                    /**
                     * Sets the state of the passed controller
                     * @member documentServices.platform.controllers
                     * @param {AbstractComponent} controllerRef - the controller to set the state of
                     * @param {string} state - the state to set
                     */
                    setState: {dataManipulation: appControllerData.setState}
                }
            }
        }
    };
});
