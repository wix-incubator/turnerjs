define(['lodash'], function (_) {
    'use strict';

    function appControllerDataResolver(data) {
        if (!_.has(data, 'settings')) {
            return data;
        }
        return _.assign({}, data, {settings: JSON.parse(data.settings)});
    }

    return {
        resolve: appControllerDataResolver
    };
});
