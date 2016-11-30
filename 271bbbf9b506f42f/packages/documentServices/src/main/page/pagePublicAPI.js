define([
    'lodash',
    'documentServices/page/page',
    'documentServices/page/pageData',
    'documentServices/page/videoBackgroundProxy',
    'documentServices/privateServices/idGenerator',
    'documentServices/utils/utils'
], function (
    _,
    page,
    pageData,
    videoBackground,
    idGenerator,
    dsUtils
) {
    'use strict';

    var exports = {
        initMethod: page.initialize,
        methods: {
            homePage: {
                set: {dataManipulation: page.homePage.set},
                get: page.homePage.get
            },
            pages: {
                add: {dataManipulation: page.add, getReturnValue: page.getPageIdToAdd, isUpdatingAnchors: true},
                duplicate: {
                    dataManipulation: page.duplicate,
                    getReturnValue: page.getPageIdToAdd,
                    isUpdatingAnchors: dsUtils.YES
                },
                remove: {dataManipulation: page.remove, isAsyncOperation: true, isUpdatingAnchors: true},
                navigateTo: {
                    dataManipulation: page.navigateTo,
                    allowInReadOnly: true,
                    waitingForTransition: page.willNavigateNavigateToPage,
                    noBatchingAfter: true
                },
                navigateToAndScroll: {
                    dataManipulation: page.navigateToPageAndScrollToAnchor,
                    allowInReadOnly: true,
                    waitingForTransition: page.willNavigateNavigateAndScroll,
                    noBatchingAfter: true
                },
                isRemovable: page.isRemovable,
                isDuplicable: page.isDuplicable,
                isContainsCompWithType: page.isPageContainsCompWithType,
                getReference: page.getReference,
                getLayout: page.getLayout,
                serialize: page.serializePage,
                doesPageExist: pageData.doesPageExist,
                data: {
                    update: {dataManipulation: page.data.set}, //should fix implementation
                    get: page.data.get,
                    pageUriSEO: {
                        isDuplicate: pageData.isDuplicatePageUriSeo,
                        isForbidden: pageData.isForbiddenPageUriSeo,
                        getValid: pageData.getValidPageUriSEO,
                        convertPageNameToUrl: pageData.convertPageNameToUrl
                    }
                },
                style: {
                    setId: {dataManipulation: page.style.setId},
                    getId: page.style.getId,
                    setCustom: {dataManipulation: page.style.setCustom, getReturnValue: idGenerator.getStyleIdToAdd}
                },
                background: {
                    get: page.background.get,
                    update: {dataManipulation: page.background.update},
                    video: {
                        isPlaying: videoBackground.isPlaying,
                        getReadyState: videoBackground.getReadyState,
                        play: videoBackground.playCurrent,
                        pause: videoBackground.pauseCurrent,
                        unregisterToPlayingChange: videoBackground.unregisterToPlayingChange,
                        registerToPlayingChange: videoBackground.registerToPlayingChange
                    }
                },
                anchors: {
                    getPageAnchors: page.getPageAnchors
                },
                /** @deprecated */
                getCurrentPageId: function (ps) {
                    return ps.siteAPI.getPrimaryPageId();
                },

                /** @deprecated */
                getCurrentPage: function (ps) {
                    var pageId = ps.siteAPI.getPrimaryPageId();
                    return page.getPage(ps, pageId);
                },

                getMasterPageId: function () {
                    return 'masterPage';
                },
                getFocusedPageId: function (ps) {
                    return ps.siteAPI.getFocusedRootId();
                },
                getFocusedPage: function (ps) {
                    var pageId = ps.siteAPI.getFocusedRootId();
                    return page.getPage(ps, pageId);
                },
                getPrimaryPageId: function (ps) {
                    return ps.siteAPI.getPrimaryPageId();
                },
                getCurrentUrlPageId: function (ps) {
                    return ps.siteAPI.getCurrentUrlPageId();
                },
                getPageBottomByComponents: function (ps, pageId) {
                    return page.getPageBottomByComponents(ps, pageId);
                },

                getSocialUrl: page.getSocialUrl,
                getPageUrl: page.getPageUrl,
                getPageTitle: page.getPageTitle,
                getPagesData: page.getPagesDataItems,
                getPageIdList: page.getPageIdList, ///???
                permissions: {
                    updatePassword: page.permissions.updatePassword,
                    removePassword: page.permissions.removePassword,
                    hasPassword: page.permissions.hasPassword,
                    isPagesProtectionOnServerOn: page.permissions.isPagesProtectionOnServerOn
                },
                properties: {
                    get: page.properties.get,
                    update: {dataManipulation: page.properties.update}
                },
                popupPages: {
                    add: {dataManipulation: page.popupPages.add, getReturnValue: page.popupPages.getPopupIdToAdd},
                    duplicate: {
                        dataManipulation: page.duplicate,
                        getReturnValue: page.popupPages.getPopupIdToAdd,
                        isUpdatingAnchors: true
                    },
                    open: {
                        dataManipulation: page.popupPages.open,
                        allowInReadOnly: true,
                        waitingForTransition: page.willNavigateNavigateToPage,
                        noBatchingAfter: true
                    },
                    close: {
                        dataManipulation: page.popupPages.close,
                        allowInReadOnly: true,
                        waitingForTransition: page.popupPages.isPopupOpened,
                        noBatchingAfter: true
                    },
                    getCurrentPopupId: page.popupPages.getCurrentPopupId,
                    getDataList: page.popupPages.getDataList,
                    isPopup: page.popupPages.isPopup,
                    isPopupOpened: page.popupPages.isPopupOpened
                }
            }
        }
    };

    return exports;
});
