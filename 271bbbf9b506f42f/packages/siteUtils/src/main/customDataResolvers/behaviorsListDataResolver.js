define(['lodash'], function (_) {
    'use strict';

    function behaviorsListDataResolver(data) {
        var items = _.get(data, 'items');
        if (_.isString(items)) {
            return _.assign({}, data, {items: JSON.parse(items)});
        }
        return data;
    }

    return {
        resolve: behaviorsListDataResolver
    };
});
