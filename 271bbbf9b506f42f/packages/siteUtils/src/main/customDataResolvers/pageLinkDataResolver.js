define(['lodash'], function (_) {
    'use strict';

    function pageLinkDataResolver(data, getData) {
        return _.defaults({pageId: getData(data.pageId, 'masterPage')}, data);
    }

    return {
        resolve: pageLinkDataResolver
    };
});
