define(['documentServices/connections/connections'], function(connections){
    'use strict';

    return {
        methods: {
            /** @class documentServices.platform*/
            platform: {
                /** @class documentServices.platform.controllers*/
                controllers: {
                    /** @class documentServices.platform.controllers.connections*/
                    connections: {
                        /**
                         * Connects the passed component to the passed controller with the passed role
                         * @member documentServices.platform.controllers.connections
                         * @param {AbstractComponent} fromRef - the component to connect to controllerRef
                         * @param {AbstractComponent} controllerRef - the controller to connect the component to
                         * @param {string} role - the role this component is connected to the controller with
                         */
                        connect: connections.connect,
                        /**
                         * Disconnects the component role from the passed controller
                         * @member documentServices.platform.controllers.connections
                         * @param {AbstractComponent} fromRef - the component to disconnect from controllerRef and role
                         * @param {AbstractComponent} controllerRef - the controller to disconnect the component from
                         * @param {string} role - the role to disconnect the component from
                         */
                        disconnect: connections.disconnect,
                        /**
                         * Returns the component connection array
                         * @member documentServices.platform.controllers.connections
                         * @param {AbstractComponent} compRef - the component whose connections are requested
                         * @returns {ConnectionItem[]} - an array of all component connections
                         */
                        get: connections.getPlatformAppConnections
                    }
                }
            }
        }
    };
});
