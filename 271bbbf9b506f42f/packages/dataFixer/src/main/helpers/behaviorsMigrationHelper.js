define(['coreUtils'], function(coreUtils){
    'use strict';

    function createBehaviorsDataItem(behaviors) {
        var dataItem = {
            id: coreUtils.guidUtils.getUniqueId('behavior', '-'),
            type: 'ObsoleteBehaviorsList',
            items: behaviors
        };
        return dataItem;
    }

    return {
        createBehaviorsDataItem: createBehaviorsDataItem
    };
});
