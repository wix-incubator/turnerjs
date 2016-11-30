define([], function () {
    'use strict';

    var BI_SRC_LIST_BUILDER = 59;
    var BI_ENDPOINT_DATABASE_EDITOR = 'listim2';

    return {
        BEFORE_SAVING_ITEMS: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 201,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string',
                item_ids_to_create: 'string',
                item_ids_to_update: 'string',
                item_ids_to_delete: 'string'
            }
        },

        SUCCESS_SAVING_ITEMS: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 202,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string',
                saved_item_ids: 'string'
            }
        },

        SKIPPED_SAVING_ITEMS: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 203,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string'
            }
        },

        BEFORE_SAVING_REPO: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 211,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string'
            }
        },

        SUCCESS_SAVING_REPO: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 212,
            fields: {
                app_instance_id: 'string',
                old_app_instance_version: 'string',
                new_app_instance_version: 'string'
            }
        },

        SKIPPED_SAVING_REPO: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 213,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string'
            }
        },

        BEFORE_PUBLISH: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 221,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string'
            }
        },

        SUCCESS_PUBLISH: {
            src: BI_SRC_LIST_BUILDER,
            endpoint: BI_ENDPOINT_DATABASE_EDITOR,
            evid: 222,
            fields: {
                app_instance_id: 'string',
                app_instance_version: 'string'
            }
        }
    };

});





