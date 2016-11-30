/**
 * Created by avim on 8/27/2014.
 */
define(['lodash'], function (_) {
    'use strict';

    /*TODO : REMOVE ONCE SERVER CHANGE THWE ROUTER TABLE SCHEMA*/
    function migrateRouterTable(siteModel) {
        var allRouters = siteModel.routers.configMap;
        _.forEach(allRouters, function (router) {
            if (router.appId === -1) {
                router.appDefinitionId = 'dataBinding';
            } else if (router.hasOwnProperty('appId')) {
                router.appDefinitionId = 'wix-code';
            }
            delete router.appId;
        });
    }

    return migrateRouterTable;

});
