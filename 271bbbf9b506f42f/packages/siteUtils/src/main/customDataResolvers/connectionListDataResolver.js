define(['lodash'], function (_) {
    'use strict';

    function connectionListDataResolver(data) {
        var resolveConnectionItems = _.map(_.get(data, 'items'), function(connectionItem){
            if (!_.has(connectionItem, 'config')) {
                return connectionItem;
            }
            return _.assign({}, connectionItem, {config: JSON.parse(connectionItem.config)});
        });
        return _.assign({}, data, {items: resolveConnectionItems});
    }

    return {
        resolve: connectionListDataResolver
    };
});
