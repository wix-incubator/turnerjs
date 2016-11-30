define([], function () {
    'use strict';

    return {
        Intents: {
            PLATFORM_WORKER: 'PLATFORM_WORKER'
        },
        AppIds: {
            EDITOR: 'editor'
        },
        MessageTypes: {
            WORKER_ALIVE: 'workerAlive',
            SDK_READY: 'sdkReady',
            SET_MANIFEST: 'setManifest',
            TRIGGER_EVENT: 'triggerEvent',
            ADD_APPS: 'addApps',
            VIEWER_INFO_CHANGED: 'viewerInfoChanged'
        },
        Controller: {
            DEFAULT_STATE: 'default'
        },
        APPS: {
            DATA_BINDING: {
                appDefId: 'dataBinding'
            },
            DYNAMIC_PAGES: {
                appDefId: 'wix-code'
            }
        }
    };
});
