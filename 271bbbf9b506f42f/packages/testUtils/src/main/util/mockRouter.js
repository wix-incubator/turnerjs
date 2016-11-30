define([], function() {
   'use strict';

    return {
        routerConfig: function(prefix, appDefinitionId, pages, config) {
            return {
                prefix: prefix,
                appDefinitionId: appDefinitionId,
                config: config || {
                    routerFunctionName: 'router_func_name',
                    siteMapFunctionName: 'site_map_func_name'
                },
                pages: pages || {}
            };
        }
    };
});
