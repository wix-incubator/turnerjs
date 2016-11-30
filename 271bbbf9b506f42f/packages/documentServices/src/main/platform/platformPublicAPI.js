define([
    'lodash',
    'documentServices/platform/platform',
    'documentServices/platform/serialization',
    'documentServices/platform/services/viewerInfoChangedEmitter',
    'documentServices/platform/common/constants'
], function(_, platform, serialization, viewerInfoChangedEmitter, constants){
    'use strict';

    return {
        methods: {
            platform: {
                init: platform.init,
                initApp: platform.initApp,
                notifyApplication: platform.notifyApplication,
                getAPIForSDK: platform.getAPIForSDK,
                getInstalledAppsData: platform.getInstalledAppsData,
                getAppManifest: platform.getAppManifest,
                getAppDataByAppDefId: platform.getAppDataByAppDefId,
                getAppDataByApplicationId: platform.getAppDataByApplicationId,
                editorApps: constants.APPS,
                serialization: {
                    /**
                     * Returns controller serialized data with the passed connectedComponents info (i.e connections from other components to the serialized controller)
                     * @member documentServices.platform.serialization
                     * @param {Object} serializedController - a serialized data of an appController component
                     * @param {Object} connectedComponents - a serialized connections data of components connected to the serialized controller
                     * @returns {Object} the serializedController data with the passed connectedComponents
                     */
                    setConnectedComponents: serialization.setConnectedComponents,
                    /**
                     * Returns controller serialized connectedComponents info (i.e connections from other components to the serialized controller)
                     * @member documentServices.platform.serialization
                     * @param {Object} serializedController - a serialized data of an appController component
                     * @returns {Object} a map from component id to an array containing the component connections to the serialized controller
                     */
                    getConnectedComponents: serialization.getConnectedComponents
                },
                registerToViewerInfoChanged: viewerInfoChangedEmitter.register
            }
        }
    };
});
