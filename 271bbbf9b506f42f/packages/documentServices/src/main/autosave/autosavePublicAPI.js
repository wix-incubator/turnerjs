define(['documentServices/autosave/autosave'], function (autosave) {
    "use strict";

    return {
        methods: {
            /**
             * performs an autosave
             * @member documentServices
             * @param privateServices
             * @param {onSuccess} onSuccess
             * @param {onError} onError
             * @param {string} triggerName
             */
            autosave: autosave.autosave,

            /**
             * Checks if autosave should be performed
             * @member documentServices
             * @return {boolean}
             */
            canAutosave: autosave.canAutosave,

            /**
             * Returns documentServicesModel.autoSaveInfo
             * @member documentServices
             * @return {boolean}
             */
            getAutoSaveInfo: autosave.getAutoSaveInfo,

            /**
             * Initializes Auto-Save by passing configuration object
             * @member documentServices
             * @param {object} configuration object
             */
            initAutosave: autosave.init
        }
    };
});
