define(['lodash'], function (_) {
    'use strict';

    var dataById = {};

    return {
        getAppPartCommonDataItem: function (id, key, defaultValue) {
            return _.get(dataById, [id, key], defaultValue);
        },

        setAppPartCommonDataItem: function (id, key, value) {
            return _.set(dataById, [id, key], value);
        },

        removeAppPartCommonData: function (id) {
            delete dataById[id];
        }
    };
});
