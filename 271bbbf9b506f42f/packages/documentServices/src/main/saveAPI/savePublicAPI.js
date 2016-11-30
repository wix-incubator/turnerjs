define(['documentServices/saveAPI/saveAPI'], function (savePublish) {
    "use strict";
    return {
        methods: {
            /**
             * Saves the site
             * @member documentServices
             * @param {onSuccess} [onSuccess]
             * @param {onError} [onError]
             * @param {boolean} isFullSave - whether to perform a full save or not
             * @return {Promise} a promise that the save will be performed. This is for syntactic sugar for success/error.
             */
            save: savePublish.save,
            /**
             * Publishes the last saved version of the site. If you want to save the site first, you should call save and then publish.
             * @member documentServices
             * @param {onSuccess} [onSuccess]
             * @param {onError} [onError]
             * @param {boolean} isFullSave - whether to perform a full save or not
             * @return {Promise} a promise that the save will be performed. This is for syntactic sugar for success/error.
             */
            publish: savePublish.publish,

            saveAsTemplate: savePublish.saveAsTemplate,

            /**
             * Returns true if the user is allowed to publish according to server, false otherwise
             * @instance
             * @param privateServices
             * @returns {boolean}
             */
            canUserPublish: savePublish.canUserPublish
        }
    };
});
