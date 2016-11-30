define(['lodash'], function (_) {

    'use strict';

    /**
     * @type {!Object.<!Object>}
     */
    var viewDefCacheByComponentId = {};


    /**
     * @param {string} view
     * @param {string} type
     * @param {string} format
     * @returns {string}
     */
    function getViewDefKey(view, type, format) {
        return [view, type, format].join();
    }


    return {

        /**
         * @param {string} componentId
         * @param {string} view
         * @param {string} type
         * @param {string} format
         * @param {!Object} viewDef
         */
        setComponentViewDef: function (componentId, view, type, format, viewDef) {
            var viewDefKey = getViewDefKey(view, type, format);
            _.set(viewDefCacheByComponentId, [componentId, viewDefKey], viewDef);
        },


        /**
         * @param {string} componentId
         * @param {string} view
         * @param {string} type
         * @param {string} format
         * @returns {!Object|undefined}
         */
        getComponentViewDef: function (componentId, view, type, format) {
            var viewDefKey = getViewDefKey(view, type, format);
            return _.get(viewDefCacheByComponentId, [componentId, viewDefKey]);
        },


        /**
         * @param {string} componentId
         */
        removeComponentViewDefs: function (componentId) {
            delete viewDefCacheByComponentId[componentId];
        }

    };

});
