/*eslint identifier:0*/
define(['lodash',
        'documentServices/saveAPI/lib/registry',
        'documentServices/saveAPI/lib/saveRunner',
        'documentServices/saveAPI/preSaveOperations/preSaveOperations',
        'documentServices/siteMetadata/generalInfo',
        'documentServices/bi/bi',
        'documentServices/bi/errors',
        'documentServices/errors/errors',
        'documentServices/constants/constants',
        'utils',
        'experiment'
], function (_, saveTaskRegistry, saveTaskRunner, preSaveOperations, generalInfo, bi, biErrors, documentServicesErrors, constants, utils, experiment) {
    'use strict';

    var SANTA_EDITOR = 'Editor1.4';

    function migrateFromOnBoardingIfNeeded(ps) {
        if (ps.config.origin === SANTA_EDITOR && generalInfo.isSiteFromOnBoarding(ps)) {
            generalInfo.setUseOnBoarding(ps, false);
        }
    }

    function getBiCallbacks(privateServices) {
        return {
            event: _.partial(bi.event, privateServices),
            error: _.partial(bi.error, privateServices)
        };
    }

    function saveAsTemplate(privateServices, onSuccess, onError){
        privateServices.setOperationsQueue.flushQueueAndExecute(function () {
            var args = [saveTaskRegistry.getSaveTasksConfig(), privateServices.dal, onSuccess, onError, getBiCallbacks(privateServices)];
            saveTaskRunner.runSaveAsTemplate.apply(saveTaskRunner, args);
        });
    }

    function hasSiteBeenSaved(privateServices) {
        return !privateServices.dal.get(privateServices.pointers.general.getNeverSaved());
    }

    function canUserPublish(ps) {
        if (!generalInfo.isFirstSave(ps) && !generalInfo.isOwner(ps)) {
            var permissions = generalInfo.getUserPermissions(ps);

            return _.includes(permissions, constants.PERMISSIONS.PUBLISH);
        }

        return true;
    }

    function isSaveValidationError(errorDescription){
        return _.get(errorDescription, ['document', 'errorCode']) === -10104;
    }

    function onPartialSaveError(ps, originalOnError, errorDescription){
        if (isSaveValidationError(errorDescription)) {
            var saveInvalidationPointer = ps.pointers.general.getSaveInvalidationCount();
            var currentSaveInvalidationCount = ps.dal.get(saveInvalidationPointer) || 0;
            ps.dal.set(saveInvalidationPointer, ++currentSaveInvalidationCount);
        }
        if (originalOnError) {
            originalOnError.apply(null, _.slice(arguments, 2));
        }
    }

    function onSaveSuccessWrapped(ps, originalOnSuccess){
        var saveInvalidationPointer = ps.pointers.general.getSaveInvalidationCount();
        ps.dal.set(saveInvalidationPointer, 0);
        if (originalOnSuccess) {
            originalOnSuccess.apply(null, _.slice(arguments, 2));
        }
    }

    function shouldBlockPartialSave(privateServices){
        var saveInvalidationCount = privateServices.dal.get(privateServices.pointers.general.getSaveInvalidationCount());
        return experiment.isOpen('block_after_third_invalid_save') && saveInvalidationCount >= 3;
    }

        /**
     * @exports documentServices/saveAPI/saveAPI
     */
    var saveAPI = {
        /**
         * performs a partial save
         * @instance
         * @param {onSuccess} onSuccess
         * @param {onError} onError
         * @param {boolean} isFullSave - whether to perform a full save or not
         * @param privateServices
         */
        save: function(privateServices, onSuccess, onError, isFullSave) {
            if (experiment.isOpen('sv_obMigrationFlow')) {
                migrateFromOnBoardingIfNeeded(privateServices);
            }

            privateServices.setOperationsQueue.flushQueueAndExecute(function(){
                var isFirstSave = !hasSiteBeenSaved(privateServices);

                try {
                    preSaveOperations.save(privateServices);
                } catch (e) {
                    if (onError) {
                        onError({
                            preSaveOperation: e
                        });
                        bi.error(privateServices, biErrors.SAVE_FAILED_DUE_TO_PRE_SAVE_OPERATION, {
                            stack: e.stack
                        });
                        utils.log.error('Save has failed due to a preSaveOperation, and no request has been sent to the server - please see the failure details below:', e);
                        return;
                    }
                }

                var biCallbacks = getBiCallbacks(privateServices);
                var onSaveSuccess = _.partial(onSaveSuccessWrapped, privateServices, onSuccess);
                if (isFirstSave){
                    saveTaskRunner.runFirstSaveTasks(saveTaskRegistry.getSaveTasksConfig(), privateServices.dal, onSaveSuccess, onError, biCallbacks);
                } else if (isFullSave){
                    saveTaskRunner.runFullSaveTasks(saveTaskRegistry.getSaveTasksConfig(), privateServices.dal, onSaveSuccess, onError, biCallbacks);
                } else {
                    if (shouldBlockPartialSave(privateServices)) {
                        onError({
                            documentServices: {
                                errorCode: -1,
                                errorType: documentServicesErrors.save.SAVE_BLOCKED_BY_DOCUMENT_SERVICES,
                                errorDescription: 'Save has failed 3 times due to invalidation error (-10104). This site is corrupt (in client!).' +
                                '\nPlease refresh the frame to reload to the last failed saved state.'
                            }
                        });
                        bi.error(privateServices, biErrors.SAVE_BLOCKED_BY_DOCUMENT_SERVICES);
                        return;
                    }
                    saveTaskRunner.runPartialSaveTasks(saveTaskRegistry.getSaveTasksConfig(), privateServices.dal, onSaveSuccess, _.partial(onPartialSaveError, privateServices, onError), biCallbacks);
                }
            });
        },

      /**
       * performs an autosave.
       * You should call autosave from the public autosave endpoint, which validates that you can actually autosave
       * @instance
       * @param privateServices
       * @param {onSuccess} onSuccess
       * @param {onError} onError
       */
        autosave: function(privateServices, onSuccess, onError) {
          var biCallbacks = getBiCallbacks(privateServices);

          privateServices.setOperationsQueue.flushQueueAndExecute(function () {
              saveTaskRunner.runAutosaveTasks(saveTaskRegistry.getSaveTasksConfig(), privateServices.dal, onSuccess, onError, biCallbacks);
          });
        },

        saveAsTemplate: function(privateServices, onSuccess, onError) {
            try {
                preSaveOperations.saveAsTemplate(privateServices);
            } catch (e) {
                if (onError) {
                    onError({
                        preSaveAsTemplateOperation: e
                    });
                    return;
                }
            }

            saveAPI.save(privateServices, function onSaveSuccess() {
                saveAPI.publish(privateServices, saveAsTemplate.bind(null, privateServices, onSuccess, onError), onError);
            }, onError, false);
        },
        /**
         * publishes the site
         * @instance
         * @param {onSuccess} onSuccess
         * @param {onError} onError
         * @param privateServices
         */
        publish: function(privateServices, onSuccess, onError) {
            privateServices.setOperationsQueue.flushQueueAndExecute(function(){
                var args = [saveTaskRegistry.getSaveTasksConfig(), privateServices.dal, onSuccess, onError, getBiCallbacks(privateServices)];
                saveTaskRunner.runPublishTasks.apply(saveTaskRunner, args);
            });

        },

        /**
         * Returns true if the user is allowed to publish according to server, false otherwise
         * @instance
         * @param privateServices
         * @returns {boolean}
         */
        canUserPublish: canUserPublish
    };

    return saveAPI;
}
);

/**
 * callback executed upon success
 * @callback onSuccess
 */

/**
 * callback executed upon error
 * @callback onError
 * @param {failInfo} failInfo
 */

/**
 * information about the failure of a specific service within the process
 * @typedef {Object} errorInfo
 * @property {string} errorType
 * @property {number} errorCode
 * @property {string} description
 */

/**
 * A map of 'serviceName: errorInfo'
 * @typedef {Object.<String, errorInfo>} failInfo
 */
