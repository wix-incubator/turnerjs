define([
    'lodash',
    'core',
    'utils',
    'documentServices/hooks/hooks',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'documentServices/constants/constants',
    'documentServices/component/component',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/component/componentStylesAndSkinsAPI',
    'documentServices/dataModel/dataModel',
    'documentServices/page/pageUtils',
    'documentServices/page/popupUtils',
    'documentServices/page/pageData',
    'documentServices/page/pageProperties',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/tpa/constants',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/mobileConversion/mobileActions',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/siteMetadata/passwordProtected',
    'documentServices/page/blankPageStructure',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/documentMode/documentMode',
    'experiment',
    'documentServices/routers/routersGetters'
], function (_,
             core,
             utils,
             hooks,
             actionsAndBehaviors,
             constants,
             component,
             componentDetectorAPI,
             componentStylesAndSkinsAPI,
             dataModel,
             pageUtils,
             popupUtils,
             pageData,
             pageProperties,
             dataSchemas,
             tpaConstants,
             documentModeInfo,
             mobileActions,
             mobileConversion,
             passwordProtected,
             blankPageStructure,
             clientSpecMapService,
             documentMode,
             experiment,
             routersGetters) {
    'use strict';


    var TYPE_OF_MAIN_CONTAINER_INSIDE_POPUP = 'wysiwyg.viewer.components.PopupContainer';


    function initialize() {
        hooks.registerHook(hooks.HOOKS.ADD.AFTER, mapHiddenAnchorsForAnchorsMenu, 'mobile.core.components.Page');
    }

    function mapHiddenAnchorsForAnchorsMenu(ps, currentPagePointer, compDefinition, optionalCustomId, oldToNewIdMap) {
        var verticalAnchorComp = 'wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu';
        var anchorsMenusPointers = componentDetectorAPI.getComponentByType(ps, verticalAnchorComp, currentPagePointer);
        var pageId = currentPagePointer.id;
        _.forEach(anchorsMenusPointers, function (anchorsMenuPointer) {
            updateAnchorsMenuDataFromDuplicatedPage(ps, anchorsMenuPointer, pageId, oldToNewIdMap);
        });
    }

    function updateAnchorsMenuDataFromDuplicatedPage(ps, anchorsMenuPointer, targetPageId, oldToNewIdMap) {
        var sourcePageId = _.findKey(oldToNewIdMap, function (val) {
            return val === targetPageId;
        });
        var menuDataItem = component.data.get(ps, anchorsMenuPointer);
        var newHiddenAnchorIds;
        if (sourcePageId) {
            newHiddenAnchorIds = getNewHiddenAnchorIds(menuDataItem.hiddenAnchorIds[sourcePageId], oldToNewIdMap);
        } else {
            newHiddenAnchorIds = [];
        }
        menuDataItem.hiddenAnchorIds[targetPageId] = newHiddenAnchorIds;
        component.data.update(ps, anchorsMenuPointer, menuDataItem);
    }

    function getNewHiddenAnchorIds(oldHiddenAnchorIds, oldToNewIdMap) {
        return _.compact(_.map(oldHiddenAnchorIds, function (hiddenAnchorId) {
            return oldToNewIdMap[hiddenAnchorId];
        }).concat(_.includes(oldHiddenAnchorIds, 'PAGE_TOP_ANCHOR') ? 'PAGE_TOP_ANCHOR' : null));
    }

    initialize();

    var onAsyncSetOperationComplete = function (ps, err) {
        ps.setOperationsQueue.asyncSetOperationComplete(err);
    };

    function getPageAnchors(ps, pageId, pageTopLabel){
        var pageDataPointers = ps.pointers.data.getDataItemsWithPredicate({type: 'Anchor'}, pageId);
        var pageAnchorDataItems = pageDataPointers.map(ps.dal.get);
        var pageTopAnchor = utils.scrollAnchors.getPageTopAnchor(pageId, pageTopLabel);
        pageAnchorDataItems.push(pageTopAnchor);

        //TODO: should work on mobile comps..
        var pagePointer = ps.pointers.components.getPage(pageId, 'DESKTOP');
        var pageChildren = _.indexBy(ps.pointers.components.getChildren(pagePointer), 'id');

        return _.sortBy(pageAnchorDataItems, function (anchorDataItem) {
            var anchorTopPosition = utils.scrollAnchors.SCROLL_PAGE_TOP_Y_POS;
            var anchorCompPointer = pageChildren[anchorDataItem.compId];
            if (anchorCompPointer){
                var topPointer = ps.pointers.getInnerPointer(anchorCompPointer, 'layout.y');
                anchorTopPosition = ps.dal.get(topPointer);
            }

            return anchorTopPosition;
        });
    }

    function sanitizeHash(str) {
        if (!_.isString(str)) {
            throw Error("pageId to remove should be a string " + str);
        }
        return str.replace('#', '');
    }

    function getPageIdToAdd(ps) {
        var allPagesPointer = ps.pointers.page.getAllPagesPointer();
        var deletedPagesMapPointer = ps.pointers.general.getDeletedPagesMapPointer();

        var usedPageIds = ps.dal.getKeys(allPagesPointer).concat(ps.dal.getKeys(deletedPagesMapPointer));
        var newPageId = utils.guidUtils.generateNewPageId(usedPageIds);

        return ps.pointers.components.getNewPage(newPageId);
    }

    function getPopupIdToAdd(ps) {
        var allPagesPointer = ps.pointers.page.getAllPagesPointer(),
            deletedPagesMapPointer = ps.pointers.general.getDeletedPagesMapPointer(),
            allPageIds = ps.dal.getKeys(allPagesPointer),
            usedPageIds = allPageIds.concat(ps.dal.getKeys(deletedPagesMapPointer)),
            popupIds = _.filter(allPageIds, _.partial(popupUtils.isPopup, ps)),
            newPopupId = utils.guidUtils.generateNewPopupId(usedPageIds, popupIds);

        return ps.pointers.components.getNewPage(newPopupId);
    }

    /**
     * Add a page to the site
     *
     * @param {PrivateServices} ps
     * @param {String=} pageTitle page title. Defaults to title from structure
     * @param {object=} serializedPage page structure. Defaults to blank page
     * @param pagePointer
     */
    function addPage(ps, pageComponentPointer, pageTitle, serializedPage) {
        var newPageId = pageComponentPointer.id;
        var pageDataItem;

        serializedPage = serializedPage || blankPageStructure.getBlankPageStructure(ps, newPageId);
        serializedPage.data.title = pageTitle || serializedPage.data.title;

        pageDataItem = serializedPage.data;
        pageDataItem.id = newPageId;
        pageData.setPageData(ps, newPageId, pageDataItem);

        var pageObject = getPageStructure(serializedPage.data.title, serializedPage.data.pageUriSEO);
        var pagePointer = ps.pointers.page.getNewPagePointer(newPageId);
        ps.dal.full.set(pagePointer, pageObject);
        var originalToNewCompIdMap = serializedPage.mobileComponents && {};
        component.setComponent(ps, pageComponentPointer, null, serializedPage, newPageId, true, originalToNewCompIdMap);
        hooks.executeHook(hooks.HOOKS.ADD_ROOT.AFTER, serializedPage.componentType, [ps, pageComponentPointer]);
        if (serializedPage.mobileComponents) {
            setMobileHiddenComponentList(ps, serializedPage.id, pageComponentPointer.id, originalToNewCompIdMap);
        }
    }

    function checkStructureHasMainContainer(serializedPage) {
        if (!_.find(serializedPage.components, {"componentType": TYPE_OF_MAIN_CONTAINER_INSIDE_POPUP})) {
            throw new Error("Can't create a popup page. Main container inside the popup was not found");
        }
    }

    /**
     * Add a popup page to the site.
     *
     * @param {PrivateServices} ps
     * @param pageComponentPointer
     * @param {String=} pageTitle page title. Defaults to title from structure
     * @param {object=} serializedPage page structure. Defaults to blank popup
     */
    function addPopup(ps, pageComponentPointer, pageTitle, serializedPage) {
        if (serializedPage) {
            checkStructureHasMainContainer(serializedPage);
        } else {
            serializedPage = blankPageStructure.getBlankPopupPageStructure(ps);
        }

        serializedPage.data.pageUriSEO =
            serializedPage.data.pageUriSEO || utils.siteConstants.DEFAULT_POPUP_URI_SEO_PREFIX + pageComponentPointer.id;

        addPage(ps, pageComponentPointer, pageTitle, serializedPage);

        setOpenPopupBehavior(ps, pageComponentPointer);
    }

    function setOpenPopupBehavior(ps, popupPointer) {
        var primaryPagePointer = getPageComponentPointer(ps, ps.siteAPI.getPrimaryPageId());
        var masterPagePointer = getPageComponentPointer(ps, constants.MASTER_PAGE_ID);
        var actionDefinition = actionsAndBehaviors.getActionDefinition(ps, 'load');
        var behaviorDefinition = actionsAndBehaviors.getBehaviorDefinition(ps, 'openPopup');

        if (actionsAndBehaviors.hasBehavior(ps, primaryPagePointer, actionDefinition, null, behaviorDefinition)) {
            return;
        }

        if (actionsAndBehaviors.hasBehavior(ps, masterPagePointer, actionDefinition, null, behaviorDefinition)) {
            return;
        }

        actionsAndBehaviors.updateBehavior(ps,
            primaryPagePointer,
            actionDefinition,
            popupPointer,
            behaviorDefinition
        );
    }

    function setMobileHiddenComponentList(ps, originalPageId, newPageId, originalToNewIdMap) {
        var originalPageHiddenCompIds = mobileActions.hiddenComponents.get(ps, originalPageId);
        var newPageHiddenCompIds = _(originalToNewIdMap).pick(originalPageHiddenCompIds).values().value();
        mobileActions.hiddenComponents.set(ps, newPageId, newPageHiddenCompIds);
    }

    function removePage(ps, _pageId, completeCallback) {
        var pageId = sanitizeHash(_pageId);
        var canDeletePageInfo = isPageRemovableWithDescription(ps, pageId);
        if (!canDeletePageInfo.success) {
            throw new Error(canDeletePageInfo.description);
        }

        var pageComponentPointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);

        completeCallback = completeCallback || onAsyncSetOperationComplete;
        component.remove(ps, pageComponentPointer, function (privateServices, err) {
            if (!err) {
                removePageFromDal(ps, pageId);
            }
            completeCallback(privateServices, err);
        });
    }

    function removePageFromDal(ps, pageId) {
        var pageDataInMasterPagePointer = ps.pointers.data.getDataItemFromMaster(pageId);
        var pageNodePointer = ps.pointers.page.getPagePointer(pageId);
        pageData.removePageData(ps, pageDataInMasterPagePointer);
        ps.dal.full.remove(pageNodePointer);
        markPageAsDeleted(ps, pageId);
    }

    function markPageAsDeleted(ps, pageId) {
        var deletedPagesMapPointer = ps.pointers.general.getDeletedPagesMapPointer();
        var pageMap = {};
        pageMap[pageId] = true;
        ps.dal.merge(deletedPagesMapPointer, pageMap);
    }

    function serializePage(ps, pageId, maintainIdentifiers) {
        var pageComponentPointer = getPageComponentPointer(ps, pageId);
        var pageDataItemPointer = ps.pointers.data.getDataItemFromMaster(pageId);
        var ignoreChildren = false;
        maintainIdentifiers = maintainIdentifiers || false;
        var flatMobileStructuresMap = false;
        var serializedPage = component.serialize(ps, pageComponentPointer, pageDataItemPointer, ignoreChildren, maintainIdentifiers, flatMobileStructuresMap);
        serializedPage.data = pageData.getPageDataWithoutIds(ps, pageId);
        return serializedPage;
    }

    function isPageContainsCompWithType(ps, pageId, types) {
        var pageComponentPointer = getPageComponentPointer(ps, pageId);
        return component.isContainsCompWithType(ps, pageComponentPointer, types);
    }

    function duplicatePage(ps, newPagePointer, _pageId) {
        var pageId = sanitizeHash(_pageId);
        var pagePointer = ps.pointers.page.getPagePointer(pageId);
        if (!pagePointer) {
            throw new Error("page does not exist " + _pageId);
        }

        var canDuplicateInfo = isPageDuplicatableWithDescription(ps, _pageId);
        if (!canDuplicateInfo.success) {
            throw new Error(canDuplicateInfo.description);
        }

        var title = ps.dal.get(ps.pointers.getInnerPointer(pagePointer, 'title'));
        mobileConversion.convertMobileStructure(ps);
        var maintainIdentifiers = true;
        var serializedPage = serializePage(ps, pageId, maintainIdentifiers);

        serializedPage.data.pageUriSEO = pageData.getValidPageUriSEO(ps, '', serializedPage.data.pageUriSEO);

        addPage(ps, newPagePointer, title, serializedPage);
        if (experiment.isOpen('sv_dpages')) {
            hooks.executeHook(hooks.HOOKS.DUPLICATE.DUPLICATE_ROOT, serializedPage.componentType, [ps, pageId, newPagePointer.id]);
        }
    }

    function ensurePageInfo(pageIdOrPageInfo) {
        if (typeof pageIdOrPageInfo === 'string') {
             return {pageId: pageIdOrPageInfo};
        }

        return pageIdOrPageInfo;
    }

    function willNavigateNavigateToPage(privateServices, pageIdOrPageInfo){
        var pageInfo = ensurePageInfo(pageIdOrPageInfo);
        return privateServices.siteAPI.getFocusedRootId() !== pageInfo.pageId || pageInfo.routerDefinition;
    }

    function navigateToPage(privateServices, pageIdOrPageInfo, pageNavigationEndedCallback) {
        var pageInfo = ensurePageInfo(pageIdOrPageInfo);
        if (experiment.isOpen('sv_dpages')) {
            if (pageInfo.pageId && !pageInfo.routerDefinition) {
                var routerData = routersGetters.getRouterDataForPageIfExist(privateServices, pageInfo.pageId);
                if (routerData) {
                    pageInfo = _.assign(pageInfo, {
                        routerDefinition: routerData
                    });
                }
            }
        }

        if (!willNavigateNavigateToPage(privateServices, pageInfo)) {
            if (pageNavigationEndedCallback) {
                pageNavigationEndedCallback();
            }
            return;
        }

        if (pageNavigationEndedCallback) {
            privateServices.setOperationsQueue.waitForChangesApplied(pageNavigationEndedCallback);
        }

        privateServices.siteAPI.navigateToPage(pageInfo);
    }

    function willNavigateNavigateAndScroll(privateServices, pageId, anchorDataId){
        var isSpecialAnchor = utils.scrollAnchors.isSpecialAnchor(anchorDataId);
        return !isSpecialAnchor && willNavigateNavigateToPage(privateServices, pageId);
    }

    function navigateToPageAndScrollToAnchor(privateServices, pageId, anchorDataId, progressCallback) {
        var isSpecialAnchor = utils.scrollAnchors.isSpecialAnchor(anchorDataId);
        var callback = privateServices.siteAPI.scrollToAnchor.bind(privateServices.siteAPI, anchorDataId, progressCallback);

        if (isSpecialAnchor) {
            callback();
        } else {
            navigateToPage(privateServices, pageId, callback);
        }
    }

    function getPageStructure(title, pageUriSEO) {
        var res = {
            data: {
                component_properties: {},
                document_data: {},
                theme_data: {},
                behaviors_data: {},
                design_data: {}
            },
            pageUriSEO: pageUriSEO,
            structure: {},
            title: title
        };

        if (experiment.isOpen('connectionsData')) {
            res.data.connections_data = {};
        }

        return res;
    }

    function setHomepageId(ps, pageId) {
        pageId = sanitizeHash(pageId);

        if (!ps.dal.pointers.page.isExists(pageId)) {
            throw Error("pageId " + pageId + " does not exist. cannot set as home page.");
        }

        var siteStructureDataPointer = ps.pointers.data.getDataItemFromMaster(constants.MASTER_PAGE_ID);
        var homePagePointer = ps.pointers.getInnerPointer(siteStructureDataPointer, 'mainPage');
        var homePageIdPointer = ps.pointers.getInnerPointer(siteStructureDataPointer, 'mainPageId');

        ps.dal.set(homePagePointer, '#' + pageId);
        ps.dal.set(homePageIdPointer, pageId);
    }

    function getPageLayout(ps, pageId) {
        var pageComponentPointer = getPageComponentPointer(ps, pageId);
        var pageLayout = component.layout.get(ps, pageComponentPointer);
        var realPageWidth = ps.siteAPI.getSiteWidth();
        pageLayout.width = realPageWidth;
        return pageLayout;
    }

    function isPageRemovableWithDescription(ps, _pageId) {
        var pageId = sanitizeHash(_pageId);

        if (pageUtils.isMasterPage(ps, pageId)) {
            return {
                success: false,
                description: 'It is not allowed to remove masterPage'
            };
        }
        if (!pageData.doesPageExist(ps, pageId)) {
            return {
                success: false,
                description: 'Page with id "' + pageId + '" does not exist'
            };
        }
        if (pageUtils.isHomepage(ps, pageId)) {
            return {
                success: false,
                description: 'It is not allowed to delete homePage (' + pageId + '), please set a new page as homePage (page.setAsHomepage) and try again'
            };
        }
        if (ps.siteAPI.getPrimaryPageId() === pageId) {
            return {
                success: false,
                description: 'It is not allowed to delete current page (' + _pageId + '), please navigate to another page (page.navigateTo) and try again'
            };
        }
        if (ps.siteAPI.getCurrentPopupId() === pageId) {
            return {
                success: false,
                description: 'It is not allowed to delete open popup (' + pageId + '), please close the popoup nand try again'
            };
        }
        return {
            success: true,
            description: ''
        };
    }

    function isPageRemovable(ps, pageId) {
        return isPageRemovableWithDescription(ps, pageId).success;
    }

    function isPageDuplicatableWithDescription(ps, _pageId) {
        var pageId = sanitizeHash(_pageId);
        var data = pageData.getPageData(ps, pageId);
        var isTpaSection = isPageContainsCompWithType(ps, pageId, [tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.COMP_TYPES.TPA_SECTION]);
        //TODO: Change to internal method of DocumentServices
        var isBlog = data && data.appInnerID &&
            clientSpecMapService.getAppData(ps, data.appInnerID) && clientSpecMapService.getAppData(ps, data.appInnerID).packageName === 'blog';

        if (pageUtils.isMasterPage(ps, pageId)) {
            return {
                success: false,
                description: 'It is not allowed to duplicate masterPage'
            };
        }
        if (!pageData.doesPageExist(ps, pageId)) {
            return {
                success: false,
                description: 'Page with id "' + pageId + '" does not exist'
            };
        }
        if (isTpaSection) {
            return {
                success: false,
                description: 'It is not allowed to duplicate TPA pages'
            };
        }
        if (isBlog) {
            return {
                success: false,
                description: 'It is not allowed to duplicate Blog pages'
            };
        }

        return {
            success: true,
            description: ''
        };
    }

    function isPageDuplicatable(ps, pageId) {
        return isPageDuplicatableWithDescription(ps, pageId).success;
    }

    function setPageStyleId(ps, pageId, styleId) {
        var pageComponentPointer = getPageComponentPointer(ps, pageId);
        componentStylesAndSkinsAPI.style.setId(ps, pageComponentPointer, styleId);
    }

    function getPageStyleId(ps, pageId) {
        var pageComponentPointer = getPageComponentPointer(ps, pageId);
        return componentStylesAndSkinsAPI.style.getId(ps, pageComponentPointer);
    }

    function setPageCustomStyle(ps, newStyleId, pageId, skinName, styleProperties, styleId) {
        var pageComponentPointer = getPageComponentPointer(ps, pageId);
        componentStylesAndSkinsAPI.style.setCustom(ps, newStyleId, pageComponentPointer, skinName, styleProperties, styleId);
    }

    function getPageComponentPointer(ps, pageId) {
        return ps.pointers.components.getPage(pageId, documentModeInfo.getViewMode(ps));
    }

    function getSocialUrl(ps, urlFormat, forceMainPage) {
        var publicUrlPointer = ps.pointers.general.getPublicUrl();
        var publicUrl = ps.dal.get(publicUrlPointer);

        if (forceMainPage) {
            pageUtils.getMainPageUrl(ps, urlFormat, publicUrl);
        }
        return pageUtils.getCurrentUrl(ps, urlFormat, publicUrl);
    }

    function getPageUrl(ps, pageId, baseUrl, urlFormat) {
        var pageUriSEO = pageData.getPageUriSEO(ps, pageId);

        baseUrl = baseUrl || ps.dal.get(ps.pointers.general.getPublicUrl());

        return pageUtils.getPageUrl(ps, {pageId: pageId, title: pageUriSEO}, urlFormat, baseUrl);
    }

    function getPageTitle(ps, pageId) {
        var dataItemPointer = ps.pointers.data.getDataItemFromMaster(pageId);
        var titlePointer = ps.pointers.getInnerPointer(dataItemPointer, 'title');

        return ps.dal.get(titlePointer) || '';
    }

    function initializePage(ps) {
        var pagesData = getPageDataForAllSecuredPages(ps);
        updateRenderedModelWithPagesPassword(ps, pagesData);
        deletePagesPassword(ps, pagesData);
        fixHiddenTPAPagesIndexableValue(ps);
    }

    function fixHiddenTPAPagesIndexableValue(ps) {
        var pagesIds = pageData.getPagesList(ps);
        _.forEach(pagesIds, function (pageId) {
            var data = pageData.getPageData(ps, pageId);
            if (data.tpaApplicationId > 0 && data.tpaPageId) {
                var appData = clientSpecMapService.getAppData(ps, data.tpaApplicationId);
                var widgetData = clientSpecMapService.getWidgetDataFromTPAPageId(ps, appData.appDefinitionId, data.tpaPageId);
                if (_.isBoolean(_.get(widgetData, 'appPage.indexable')) && (_.get(widgetData, 'appPage.indexable') !== data.indexable)) {
                    pageData.setPageData(ps, data.id, {
                        'indexable': _.get(widgetData, 'appPage.indexable')
                    });
                }
            }
        });
    }

    function deletePagesPassword(ps, pagesData) {
        _.forEach(pagesData, function (data) {
            pageData.setPageData(ps, data.id, {
                'pageSecurity': {
                    requireLogin: false,
                    dialogLanguage: data.pageSecurity.dialogLanguage
                }
            });
        });
    }

    function getPageDataForAllSecuredPages(ps) {
        var pagesData = [];
        var pagesIds = pageData.getPagesList(ps);
        _.forEach(pagesIds, function (pageId) {
            var data = pageData.getPageData(ps, pageId);
            var passwordDigest = _.get(data, 'pageSecurity.passwordDigest');
            if (passwordDigest) {
                pagesData.push(data);
            }
        });
        return pagesData;
    }

    function updateRenderedModelWithPagesPassword(ps, pagesData) {
        _.forEach(pagesData, function (page) {
            passwordProtected.setPagePassword(ps, page.id, {
                value: page.pageSecurity.passwordDigest,
                isHashed: true
            });
        });
    }

    function updatePassword(ps, pageId, password) {
        if (_.isObject(password)) {
            passwordProtected.setPagePassword(ps, pageId, password);
        } else {
            passwordProtected.setPagePassword(ps, pageId, {
                value: password,
                isHashed: false
            });

        }
    }

    function removePassword(ps, pageId) {
        passwordProtected.setPageToNoRestriction(ps, pageId);
    }

    function hasPassword(ps, pageId) {
        return passwordProtected.isPageProtected(ps, pageId);
    }

    function isPagesProtectionOnServerOn(ps) {
        return passwordProtected.isPagesProtectionOnServerOn(ps);
    }

    function getPageBottomByComponents(ps, pageId) {
        return ps.siteAPI.getSiteMeasureMap().pageBottomByComponents[pageId];
    }

    /** @class documentServices.pages*/
    var exports = {
        initialize: initializePage,
        /**
         * @param {String} [pageId] id of the page
         * @returns {Number} the bounding minimum height that the page can be, according to height and position of its children
         */
        getPageBottomByComponents: getPageBottomByComponents,
        getPageIdToAdd: getPageIdToAdd,
        /*manipulations*/
        /**
         * Add a page to the site
         * @param {String} [pageTitle] page title. Defaults to title from structure
         * @param {Object} [serializedPage] page structure. Defaults to blank page
         */
        add: addPage,
        /**
         * Duplicate an existing page
         *
         * @param {String} pageId
         */
        duplicate: duplicatePage,
        /**
         * Remove a page from the site
         *
         * @param {String} pageId
         */
        remove: removePage,
        /**
         * Changes the site current page according to the passed page ID
         * @param {String} pageId the ID of the page to navigate to
         * @param {Function} callback a function to be called upon page navigation finished
         */
        navigateTo: navigateToPage,
        /**
         * Same as navigateTo, but also scrolls to anchor's location
         * @param {String} anchor id to scroll to
         */
        navigateToPageAndScrollToAnchor: navigateToPageAndScrollToAnchor,
        willNavigateNavigateAndScroll: willNavigateNavigateAndScroll,
        willNavigateNavigateToPage: willNavigateNavigateToPage,
        /**
         * Determines if it's allowed to remove a certain page from site
         *
         * @param {String} pageId
         */
        isRemovable: isPageRemovable,
        /**
         * Determines if it's allowed to duplicate a certain page in the site
         *
         * @param {String} pageId
         * @param {Function} callback a callbacks that executes with an object {result: boolean, reason: String}
         */
        isDuplicable: isPageDuplicatable,

        /**
         * returns true if one of the page components' type is included in the supplied types parameter.
         *
         * @param {String} pageId
         * @param {String/Array} {types} component types to check against.
         */
        isPageContainsCompWithType: isPageContainsCompWithType,

        getSocialUrl: getSocialUrl,
        getPageUrl: getPageUrl,
        getPageTitle: getPageTitle,
        getPage: getPageComponentPointer,
        /**
         * Return a list of all page ids in the site (both loaded and non loaded)
         *
         * @returns {String[]} page id array
         */
        getPageIdList: pageData.getPagesList,

        /**
         * Return the data of all the pages
         * @returns {Object} page id to page data map
         */
        getPagesDataItems: pageData.getPagesDataItems,

        /**
         * Gets the pa  ge's layout object
         * @param pageId
         */
        getLayout: getPageLayout,
        /**
         * @typedef {{
     *          pageId: string,
     *          knownPath: [string[]]
     *          }} PageReference
         */
        /**
         * Returns an object representing the page.<br>
         * This is useful when relating to page as a container.<br>
         * For example - when adding a component to a page, when changing a component container to page etc...
         * @param {String} pageId
         * @returns {PageReference}
         */
        getReference: getPageComponentPointer,
        serializePage: serializePage,
        /** @class documentServices.homePage*/
        homePage: {
            /**
             * Changes the site home page according to the passed page ID
             * @param {String} pageId of the page to set as home page
             */
            set: setHomepageId,
            /**
             * Gets the current home page id
             * @returns {String} home page id
             */
            get: pageUtils.getHomepageId
        },
        /** @class documentServices.pages.data*/
        data: {
            /**
             * Set page's data item
             *
             * @param {String} pageId
             * @param {Object} data object
             */
            set: pageData.setPageData,
            /**
             * Get page's data item
             *
             * @param {String} pageId
             * @returns {object} page data object
             */
            get: pageData.getPageData
        },
        /** @class documentServices.pages.style*/
        style: {
            /**
             * set a page's style
             * @param {String} pageId
             * @param {String} styleId
             */
            setId: setPageStyleId,

            /**
             * get the page's style id
             * @param {String} pageId
             * @returns {String} page's style id
             */
            getId: getPageStyleId,
            /**
             * set a new custom style for the page.
             * If no skin is given - tries to use the current skin.
             * If no styleProperties are given - style will use the current styleProperties.
             * If no styleId is given - generates a new one.
             * @param {String} pageId
             * @param {String} [skinName] the name of the skin the style will use
             * @param {String} [styleProperties] the skin parameters that the style wants to override
             * @param {String} [styleId] the requested id of the new custom style
             * @return {string} the id of the created custom style
             */
            setCustom: setPageCustomStyle
        },
        background: {
            /**
             * Get a page background data item
             * @param {string} pageId
             * @param {string} [device=desktop] desktop or mobile
             * @returns {BackgroundMediaDataItem}
             */
            get: pageData.getBgDataItem,
            /**
             * Update a page background
             * @param {string} pagId
             * @param {BackgroundMediaDataItem} bgData The data which defines the page background
             * @param {string} [device=desktop] desktop or mobile
             * @param {ImageDataItem|VideoDataItem} [mediaItemData] An optional media data which is referenced by the background
             * @param {ImageDataItem} [overlayImageData] An optional image data of the background overlay which is referenced by the background
             */
            update: pageData.updateBgDataItem
        },

        /**
         * @param {String} pageId is a page ID.
         * @param {String} [pageTopLabel] a name for the page top anchor, otherwise will be empty.
         * @returns {Array} An array of Anchor Data Items for a given Page sorted by their absolute Y position. First Anchor is always Page Top.
         */
        getPageAnchors: getPageAnchors,
        permissions: {
            hasPassword: hasPassword,
            updatePassword: updatePassword,
            removePassword: removePassword,
            isPagesProtectionOnServerOn: isPagesProtectionOnServerOn

        },
        properties: {
            get: pageProperties.getPageProperties,
            update: pageProperties.updatePageProperties
        }
    };

    exports.popupPages = {
        open: navigateToPage,

        close: function (ps, navigationCallback) {
            var rootNavInfo = ps.siteAPI.getRootNavigationInfo();
            if (rootNavInfo) {
                exports.navigateTo(ps, rootNavInfo.pageId, navigationCallback);
            }
        },

        getCurrentPopupId: function (ps) {
           return ps.siteAPI.getCurrentPopupId();
        },

        getCurrentMainContainer: function (ps, viewMode) {
           var root = {
                id: exports.popupPages.getCurrentPopupId(ps),
                type: viewMode || documentMode.getViewMode(ps)
            };

            return popupUtils.getPopupContainer(ps, root);
        },

        add: addPopup,

        getPopupIdToAdd: getPopupIdToAdd,

        getDataList: pageData.getPopupsDataItems,

        isPopup: function (ps, pageId) {
            return popupUtils.isPopup(ps, pageId);
        },

        isPopupOpened: function (ps) {
            return ps.siteAPI.isPopupOpened();
        }
    };

    return exports;
});
