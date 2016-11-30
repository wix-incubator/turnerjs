define(['documentServices/routers/routers', 'documentServices/routers/pointers/routersPointers'], function (routers) {
    "use strict";

    return {
        methods: {
            routers: {
                add: {dataManipulation: routers.add, getReturnValue: routers.getRouterPointer},
                remove: {dataManipulation: routers.remove},
                get: {
                    all: routers.get.all,
                    byRef: routers.get.byRef,
                    byId: routers.get.byId
                },
                getRouterRef: {
                    byPrefix: routers.getRouterRef.byPrefix,
                    byPage: routers.getRouterRef.byPage
                },
                update: {dataManipulation: routers.update},
                getRouterDataForPageIfExist: routers.getRouterDataForPageIfExist,
                getPageFromInnerRoute: routers.getPageFromInnerRoute,
                getRouterInnerRoutes: routers.getRouterInnerRoutes,
                getCurrentInnerRoute: routers.getCurrentInnerRoute,
                isValidPrefix: routers.isValidPrefix,
                pages: {
                    add: {dataManipulation: routers.pages.add, getReturnValue: routers.getPageToAddPointer},
                    connect: {dataManipulation: routers.pages.connect},
                    disconnect: {dataManipulation: routers.pages.disconnect},
                    listConnectablePages: routers.pages.listConnectablePages,
                    getDynamicPagesList: routers.pages.getDynamicPagesList
                }
            }
        }
    };
});
