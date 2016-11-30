define([
    'lodash'], function (_) {
    "use strict";


    /******************************* Public Functions  *************************************/

    function getAllRouters(ps) {
        var routersConfigMapPointer = ps.pointers.routers.getRoutersConfigMapPointer();
        return ps.dal.get(routersConfigMapPointer) || {};
    }

    function getRouterByRef(ps, routerPtr) {
        var routerData = ps.dal.get(routerPtr);
        if (routerData && routerData.config) {
            routerData.config = JSON.parse(routerData.config);
        }
        return routerData || null;
    }

    function getRouterByPage(ps, pagePtr) {
        var pageId = _.get(ps.dal.get(pagePtr), 'id');
        var allRouters = getAllRouters(ps);
        var routerId = _.findKey(allRouters, function (router) {
            return router.pages && _.includes(_.values(router.pages), pageId);
        });
        return routerId && ps.pointers.routers.getRouterPointer(routerId);
    }

    function getRouterByPrefix(ps, routerPrefix) {
        var allRouters = getAllRouters(ps);
        var routerId = _.findKey(allRouters, {prefix: routerPrefix});
        return routerId && ps.pointers.routers.getRouterPointer(routerId);
    }

    function getRouterById(ps, routerId) {
        var routerPointer = ps.pointers.routers.getRouterPointer(routerId);
        return ps.dal.get(routerPointer);
    }

    function getRouterDataForPageIfExist(ps, pageId) {
        pageId = _.startsWith(pageId, '#') ? pageId.substr(1) : pageId;
        var allRouters = getAllRouters(ps);
        var routerId = _.findKey(allRouters, function (router) {
            return router.pages && _.includes(_.values(router.pages), pageId);
        });

        return routerId ? _.assign(getRouterById(ps, routerId), {routerId: routerId}) : null;
    }

    return {
        get: {
            all: getAllRouters,
            byRef: getRouterByRef,
            byId: getRouterById,
            byPrefix: getRouterByPrefix,
            byPage: getRouterByPage
        },
        getRouterDataForPageIfExist: getRouterDataForPageIfExist

    };
});
