define([
    'lodash',
    'utils',
    'documentServices/page/pageData',
    'documentServices/page/page',
    'documentServices/hooks/hooks',
    'documentServices/menu/menu',
    'documentServices/routers/routersGetters',
    'documentServices/routers/utils/routersUtils',
    'documentServices/wixCode/services/saveService',
    'documentServices/platform/platform'
], function (_, utils, pageData, page, hooks, menu, routersGetters, routersUtils, wixCodeSaveService, platform) {
    "use strict";


    /*****************************************  Private Functions  ****************************************************/
    function getMenuItemIfSubPage(menuItems, pageId) {
        var res = {isSubPage: false};
        _.forEach(menuItems, function (menuItem) {
            var subItems = menuItem.items || [];
            _.forEach(subItems, function (subItem) {
                var subItemPageId = subItem.link && subItem.link.pageId ? subItem.link.pageId.slice(1) : '';
                if (subItemPageId === pageId) {
                    res = {
                        isSubPage: true,
                        menuItemId: subItem.id
                    };
                }
            });
        });
        return res;
    }

    function getSubItems(menuItems, pageId) {
        var subItems = [];
        _.forEach(menuItems, function (menuItem) {
            var menuItemPageId = _.get(menuItem, 'link.pageId');
            if (menuItemPageId && menuItemPageId.slice(1) === pageId) {
                subItems = menuItem.items;
            }
        });
        return subItems;
    }

    function makeSubPageMainPage(ps, pageId) {
        var menuItems = menu.getMenu(ps);
        var subPage = getMenuItemIfSubPage(menuItems, pageId);
        if (subPage.isSubPage) {
            menu.moveItem(ps, subPage.menuItemId, null, menuItems.length);
        }
    }

    function removeSubPageForPage(ps, pageId) {
        var menuItems = menu.getMenu(ps);
        var subPages = getSubItems(menuItems, pageId);
        _.forEach(subPages, function (subPage, index) {
            menu.moveItem(ps, subPage.id, null, menuItems.length + index);
        });
    }

    function isPrefixExist(ps, prefix) {
        var allRoutersPrefixes = getAllRouterPrefixes(ps);
        return _.includes(allRoutersPrefixes, prefix);
    }

    function isPageUriSEOExist(ps, prefix) {
        var allPageIds = pageData.getPagesList(ps, true);
        var allPageUriSEO = _.map(allPageIds, function (pageId) {
            return pageData.getPageUriSEO(ps, pageId);
        });

        return _.includes(allPageUriSEO, prefix);
    }

    //todo: move to routersValidationsUtil
    function validateNewRouter(ps, router) {
        if (!router.prefix) {
            throw new Error('Router not valid - Missing prefix.');
        }

        if (!router.appDefinitionId) {
            throw new Error('Router not valid - Missing appDefinitionId.');
        }

        if (isPrefixExist(ps, router.prefix)) {
            throw new Error('Router not valid - Prefix: ' + router.prefix + ', already exist');
        }

        if (isPageUriSEOExist(ps, router.prefix)) {
            throw new Error('Router not valid - Page Uri SEO: ' + router.prefix + ', already exist.');
        }

        if (router.pages) {
            throw new Error('Router not valid - pages should not be on the router object');
        }
    }

    function getAllRouterPrefixes(ps) {
        var routersPointer = ps.pointers.routers.getRoutersConfigMapPointer();
        return _.map(ps.dal.get(routersPointer), 'prefix');
    }

    function initRoutersConfigMapIfNeeded(ps) {
        var allRouters = routersGetters.get.all(ps);

        if (_.isEmpty(allRouters)) {
            var routersPointer = ps.pointers.routers.getRoutersPointer();
            ps.dal.set(routersPointer, {
                configMap: {}
            });
        }
    }

    function generateRouterPages(pageRoles, pageId) {
        return _.transform(pageRoles, function (acc, role) {
            acc[role] = pageId;
        }, {});
    }

    /*****************************************  Public Functions  ****************************************************/

    function getRouterPointer(ps) {
        var allRouters = routersGetters.get.all(ps);
        var routerId = routersUtils.getNextId(allRouters).toString();
        initRoutersConfigMapIfNeeded(ps); // todo: change to getConfigMap - get or create config map if neede
        var routersConfigMapPointer = ps.pointers.routers.getRoutersConfigMapPointer();
        ps.pointers.getInnerPointer(routersConfigMapPointer, routerId);
        return ps.pointers.routers.getRouterPointer(routerId);
    }

    /*newRouterPointer - recived automatically from getRouterPointer*/
    function addRouter(ps, routerRef, newRouter) {
        var routerToAdd = _.clone(newRouter);
        //init config field to be an object is undefined
        if (routerToAdd.config) {
            if (_.isObject(routerToAdd.config)) {
                routerToAdd.config = JSON.stringify(routerToAdd.config);
            }
        } else {
            routerToAdd.config = '';
        }
        validateNewRouter(ps, routerToAdd);
        ps.dal.set(routerRef, routerToAdd);
        return routerRef;
    }

    function removeRouter(ps, routerRef) {
        var allRouters = routersGetters.get.all(ps);
        var routerData = routersGetters.get.byRef(ps, routerRef);
        var routerId = _.findKey(allRouters, {prefix: routerData.prefix});
        _.forEach(routerData.pages, function (pageId) {
            var pageRef = page.getReference(ps, pageId);
            disconnectPageFromRouter(ps, routerRef, pageRef);
        });

        delete allRouters[routerId];
        var routersConfigMapPointer = ps.pointers.routers.getRoutersConfigMapPointer();
        ps.dal.set(routersConfigMapPointer, allRouters);
    }

    function updateRouter(ps, routerPtr, updateData) {
        var routerData = ps.dal.get(routerPtr);
        if (updateData.prefix) {
            //todo: move to routersValidationsUtil
            if (isPrefixExist(ps, updateData.prefix)) {
                throw new Error('Router not valid - Prefix: ' + updateData.prefix + ', already exist');
            }

            if (isPageUriSEOExist(ps, updateData.prefix)) {
                throw new Error('Router not valid - Page Uri SEO: ' + updateData.prefix + ', already exist.');
            }
            routerData.prefix = updateData.prefix;
        }

        if (updateData.config) {
            if (_.isObject(updateData.config)) {
                routerData.config = JSON.stringify(updateData.config);
            } else {
                routerData.config = updateData.config;
            }
        }

        ps.dal.set(routerPtr, routerData);
    }

    function getPageFromInnerRoute(ps, routerId, innerRoute, callback) {
        var routerDefinition = ps.dal.get(ps.pointers.routers.getRoutersConfigMapPointer())[routerId];
        var routerBackEndParamObj = utils.routersBackEndRequests.makeParamObjFromPs(ps, routerDefinition, pageData);
        wixCodeSaveService.save(ps, false).then(function () {
            utils.routersBackEndRequests.getInnerRoutesSiteMap(routerBackEndParamObj, function (siteMap) {
                var currRoute = _.find(siteMap, {url: innerRoute});
                callback(currRoute ? currRoute.pageName : null);
            }, _.noop);
        });
    }

    function getRouterInnerRoutes(ps, routerId, pageId, callback) {
        var routerDefinition = ps.dal.get(ps.pointers.routers.getRoutersConfigMapPointer())[routerId];
        var routerBackEndParamObj = utils.routersBackEndRequests.makeParamObjFromPs(ps, routerDefinition, pageData);
        wixCodeSaveService.save(ps, false).then(function () {
            utils.routersBackEndRequests.getInnerRoutesSiteMap(routerBackEndParamObj, function (siteMap) {
                callback(_.filter(siteMap, {pageName: pageId}));
            }, _.noop);
        });
    }

    function getCurrentInnerRoute(ps) {
        var currentPageId = ps.siteAPI.getPrimaryPageId();
        var routerData = routersGetters.getRouterDataForPageIfExist(ps, currentPageId);
        if (!routerData) {
            return {isDynamic: false};
        }
        var pageInfo = ps.dal.getByPath(['_currentRootInfos', currentPageId]);
        if (pageInfo.routerDefinition) {
            if (!pageInfo.pageAdditionalData) {
                return {isDynamic: true};
            }
            var pageSuffix = pageInfo.pageAdditionalData.split('/');
            var innerRoute = _.drop(pageSuffix, 1).join('/');
            return {isDynamic: true, innerRoute: innerRoute};
        }
        return {isDynamic: false};
    }

    /****************************************** pages Functions ****************************/

    function getPageToAddPointer(ps) {
        var newItemPageRef = page.getPageIdToAdd(ps);
        return newItemPageRef;
    }

    function addNewRouterPage(ps, newItemPageRef, routerPtr, pageTitle, pageRoles) {
        page.add(ps, newItemPageRef, pageTitle);
        connectPageToRouter(ps, routerPtr, newItemPageRef, pageRoles);
        return newItemPageRef;

    }

    function connectPageToRouter(ps, routerPtr, pagePtr, pageRoles) {
        pageRoles = _.isArray(pageRoles) ? pageRoles : [pageRoles];
        var currentPageId = _.get(ps.dal.get(pagePtr), 'id');
        var routerData = ps.dal.get(routerPtr);
        var routerInUse = routersGetters.get.byPage(ps, pagePtr);

        //todo: move to routersValidationsUtil
        if (routerInUse && !ps.pointers.isSamePointer(routerPtr, routerInUse)) {
            throw new Error("page already exist on another router");
        } else if (page.homePage.get(ps) === pagePtr.id) {
            throw new Error("home page can't become dynamic page");
        }

        if (routerInUse) {
            routerData.pages = _(routerData.pages)
                .omit(function (pageId) {
                    return pageId === currentPageId;
                })
                .assign(generateRouterPages(pageRoles, currentPageId))
                .value();

        } else {

            //todo - if pages is empty obj by default so use assign instead of merge
            routerData.pages = _.merge(routerData.pages || {}, generateRouterPages(pageRoles, currentPageId));
        }
        makeSubPageMainPage(ps, pagePtr.id);
        removeSubPageForPage(ps, pagePtr.id);
        ps.dal.set(routerPtr, routerData);

    }

    function disconnectPageFromRouter(ps, routerPtr, pagePtr) {
        var currentPageId = _.get(ps.dal.get(pagePtr), 'id');
        var routerData = ps.dal.get(routerPtr);
        var isPageBelongsRouter = routerData.pages && _.includes(_.values(routerData.pages), currentPageId);

        if (!isPageBelongsRouter) {
            throw new Error("the page is not connected to this router");
        }

        routerData.pages = _.omit(routerData.pages, function (pageId) {
            return pageId === currentPageId;
        });
        var currPageData = pageData.getPageData(ps, currentPageId);
        var staticPageUriSeo = pageData.getValidPageUriSEO(ps, currentPageId, currPageData.title);
        pageData.setPageData(ps, currentPageId, {
            pageUriSEO: staticPageUriSeo
        });
        ps.dal.set(routerPtr, routerData);

    }

    function canBeDynamic(ps, currentPageData, homePageId, pageRef) {
        return (
            currentPageData.type === 'Page' &&                 //it is a page (and not AppPage for example)
            !(currentPageData.tpaApplicationId > 0) &&              //page is not a TPA page
            !routersGetters.get.byPage(ps, pageRef) &&  //page is not a dynamic page
            homePageId !== currentPageData.id                  //page is not the home page
        );
    }

    function listConnectablePages(ps) {
        var pageList = pageData.getPagesDataItems(ps);
        var homePageId = page.homePage.get(ps);

        return _.reduce(pageList, function (res, currentPageData) {
            var pageRef = page.getReference(ps, currentPageData.id);
            if (canBeDynamic(ps, currentPageData, homePageId, pageRef)) {
                res.push({pageRef: pageRef, pageData: currentPageData});
            }
            return res;
        }, []);
    }

    function getDynamicPagesList(ps) {

        return _.reduce(routersGetters.get.all(ps), function (result, router) {
            var pages = _(router.pages).values().uniq().value();
            result.push({
                appDefinitionId: router.appDefinitionId,
                prefix: router.prefix,
                pages: _.map(pages, function (pageId) {
                    return pageData.getPageData(ps, pageId);
                })
            });
            return result;
        }, []);
    }

    function buildIsValidPrefixReturnVal(isValid, message) {
        return {
            valid: isValid,
            message: message
        };
    }

    function isValidPrefix(ps, applicationId, prefix) {
        if (!prefix) {
            return buildIsValidPrefixReturnVal(false, 1);//'prefix can not be empty string'
        }
        if (pageData.isPageUriSeoTooLong(prefix)) {
            return buildIsValidPrefixReturnVal(false, 2);//prefix is too long
        }
        if (pageData.isDuplicatePageUriSeo(ps, null, prefix)) {
            return buildIsValidPrefixReturnVal(false, 3);//'prefix is duplicate of uriSeo "' + prefix + '"'
        }
        var invalidChars = /[^A-Za-z0-9-]/g;
        if (prefix.match(invalidChars)) {
            return buildIsValidPrefixReturnVal(false, 4);//'invalid characters in prefix "' + prefix + '"'
        }

        var forbiddenWordsPointer = ps.pointers.general.getForbiddenPageUriSEOs();
        var forbiddenWordsArr = ps.dal.get(forbiddenWordsPointer) || {};
        if (forbiddenWordsArr[prefix]) {
            return buildIsValidPrefixReturnVal(false, 5);//'prefix "' + prefix + '" is a forbidden word'
        }
        var appDefinitionId = _.get(platform.getAppDataByApplicationId(ps, applicationId), 'appDefinitionId');
        var isPrefixInUse = _(ps)
            .thru(routersGetters.get.all)
            .reject({appDefinitionId: appDefinitionId})
            .map('prefix')
            .includes(prefix);

        if (isPrefixInUse) {
            return buildIsValidPrefixReturnVal(false, 6);//'prefix "' + prefix + '" is in use by another application'
        }
        return buildIsValidPrefixReturnVal(true, '');
    }


    return {
        add: addRouter,
        remove: removeRouter,
        get: {
            all: routersGetters.get.all,
            byRef: routersGetters.get.byRef,
            byId: routersGetters.get.byId
        },
        getRouterRef: {
            byPrefix: routersGetters.get.byPrefix,
            byPage: routersGetters.get.byPage
        },
        update: updateRouter,
        getRouterDataForPageIfExist: routersGetters.getRouterDataForPageIfExist,
        getPageFromInnerRoute: getPageFromInnerRoute,
        getRouterInnerRoutes: getRouterInnerRoutes,
        getCurrentInnerRoute: getCurrentInnerRoute,
        isValidPrefix: isValidPrefix,
        pages: {
            add: addNewRouterPage,
            connect: connectPageToRouter,
            disconnect: disconnectPageFromRouter,
            listConnectablePages: listConnectablePages,
            getDynamicPagesList: getDynamicPagesList
        },
        getRouterPointer: getRouterPointer,
        getPageToAddPointer: getPageToAddPointer
    };
});
