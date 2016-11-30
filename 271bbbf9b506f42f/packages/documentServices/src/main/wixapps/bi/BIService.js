define(['lodash', 'documentServices/wixapps/bi/events', 'documentServices/wixapps/bi/errors', 'utils'], function (_, EVENTS, ERRORS, utils) {
    'use strict';

    function BIService(eventCallback, errorCallback) {
        this._eventCallback = eventCallback;
        this._errorCallback = errorCallback;
    }

    BIService.prototype = {

        sendEvent: function(event, eventProps) {
            try {
                this._eventCallback(event, eventProps);
            } catch (e) {
                utils.log.error('Error sending BI event', e);
            }
        },

        sendError: function(error, errorProps) {
            try {
                this._errorCallback(error, errorProps);
            } catch (e) {
                utils.log.error('Error sending BI error event', e);
            }
        },

        // -- Saving Items

        beforeSavingItems: function(appInstance, dataItems) {
            this.sendEvent(EVENTS.BEFORE_SAVING_ITEMS, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion,
                item_ids_to_create: _.pluck(dataItems.created, '_iid').join(','),
                item_ids_to_update: _.pluck(dataItems.updated, '_iid').join(','),
                item_ids_to_delete: dataItems.deleted.join(',')
            });
        },

        successSavingItems: function(appInstance, responseData) {
            var savedIds = [];
            if (_.get(responseData, 'payload.results')) {
                var savedObjects = _.isArray(responseData.payload.results) ? _.pluck(responseData.payload.results, 'payload') : [responseData.payload.results.payload];
                savedIds = savedObjects && _.pluck(savedObjects, 'id');
            }

            this.sendEvent(EVENTS.SUCCESS_SAVING_ITEMS, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion,
                saved_item_ids: savedIds.join(',')
            });
        },

        skippedSavingItems: function(appInstance) {
            this.sendEvent(EVENTS.SKIPPED_SAVING_ITEMS, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion
            });
        },

        errorSavingItems: function(appInstance, responseData, err) {
            this.sendError(ERRORS.LIST_BUILDER_ERROR_SAVING_ITEMS, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion,
                error_code: responseData ? responseData.errorCode : err,
                error_description: responseData && responseData.errorDescription
            });
        },


        // -- Saving Repo

        beforeSavingRepo: function(appInstance) {
            this.sendEvent(EVENTS.BEFORE_SAVING_REPO, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion
            });
        },

        successSavingRepo: function(appInstance, responseData) {
            this.sendEvent(EVENTS.SUCCESS_SAVING_REPO, {
                app_instance_id: appInstance.applicationInstanceId,
                old_app_instance_version: appInstance.applicationInstanceVersion,
                new_app_instance_version: _.get(responseData, 'payload.applicationInstanceVersion')
            });
        },

        skippedSavingRepo: function(appInstance) {
            this.sendEvent(EVENTS.SKIPPED_SAVING_REPO, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion
            });
        },

        errorSavingRepo: function(appInstance, responseData, err) {
            this.sendError(ERRORS.LIST_BUILDER_ERROR_SAVING_REPO, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion,
                error_code: responseData ? responseData.errorCode : err,
                error_description: responseData && responseData.errorDescription
            });
        },


        // -- Publish

        beforePublish: function(appInstance) {
            this.sendEvent(EVENTS.BEFORE_PUBLISH, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion
            });
        },

        successPublish: function(appInstance) {
            this.sendEvent(EVENTS.SUCCESS_PUBLISH, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion
            });
        },

        errorPublish: function(appInstance, responseData, err) {
            this.sendError(ERRORS.LIST_BUILDER_ERROR_PUBLISH, {
                app_instance_id: appInstance.applicationInstanceId,
                app_instance_version: appInstance.applicationInstanceVersion,
                error_code: responseData ? responseData.errorCode : err,
                error_description: responseData && responseData.errorDescription
            });
        }

    };

    return BIService;
});


