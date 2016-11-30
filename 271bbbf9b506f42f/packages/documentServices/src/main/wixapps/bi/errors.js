define([], function () {
    'use strict';

    var DOCUMENT_SERVICES_BI_SRC = 40;
    var DOCUMENT_SERVICES_BI_ERROR_ENDPOINT = 'trg';

    return {

        LIST_BUILDER_ERROR_SAVING_ITEMS: {
            src: DOCUMENT_SERVICES_BI_SRC,
            endpoint: DOCUMENT_SERVICES_BI_ERROR_ENDPOINT,
            errorName: 'list_builder_error_saving_items',
            errorCode: 101,
            params: {
                p1: 'app_instance_id',
                p2: 'app_instance_version',
                p3: 'error_code',
                p4: 'error_description'
            }
        },

        LIST_BUILDER_ERROR_SAVING_REPO: {
            src: DOCUMENT_SERVICES_BI_SRC,
            endpoint: DOCUMENT_SERVICES_BI_ERROR_ENDPOINT,
            errorName: 'list_builder_error_saving_repo',
            errorCode: 102,
            params: {
                p1: 'app_instance_id',
                p2: 'app_instance_version',
                p3: 'error_code',
                p4: 'error_description'
            }
        },

        LIST_BUILDER_ERROR_PUBLISH: {
            src: DOCUMENT_SERVICES_BI_SRC,
            endpoint: DOCUMENT_SERVICES_BI_ERROR_ENDPOINT,
            errorName: 'list_builder_error_publish',
            errorCode: 103,
            params: {
                p1: 'app_instance_id',
                p2: 'app_instance_version',
                p3: 'error_code',
                p4: 'error_description'
            }
        }

    };

});





