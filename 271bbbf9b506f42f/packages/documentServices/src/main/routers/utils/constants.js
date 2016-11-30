define([], function () {
    'use strict';

    var ROUTERS_PATH = ['routers'];
    var ROUTERS_CONFIG_MAP_PATH = ROUTERS_PATH.concat('configMap');

    var paths = {
        ROUTERS_PATH: ROUTERS_PATH,
        ROUTERS_CONFIG_MAP: ROUTERS_CONFIG_MAP_PATH
    };

    return {
        paths: paths,
        routerPrefixPath: 'prefix',
        routerPagesPath: 'pages'
    };
});
