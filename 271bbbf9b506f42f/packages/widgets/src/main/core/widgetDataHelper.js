define(['lodash'], function (_) {
    'use strict';

    return {
        /**
         * @param {string} contextId
         * @param {Object} widgetHandler
         */
        registerWidgetHandler: function (widgetsStore, widgetHandler) {
            _.set(widgetsStore, 'widgetHandler', widgetHandler);
        },

        /**
         * Gets the widget handler registered under the passed handlerId
         * @param {string} handlerId
         * @returns {object} the registered widget handler
         */
        getWidgetHandler: function (widgetsStore) {
            return _.get(widgetsStore, 'widgetHandler');
        }
    };
});
