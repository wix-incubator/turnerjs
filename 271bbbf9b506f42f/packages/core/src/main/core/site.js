define(['react', 'lodash', 'zepto', 'utils', 'core/siteRender/WixSiteReact',
        'core/siteRender/WixSiteHeadRenderer', 'core/core/siteBI', 'experiment'],
    function (React, _, $, /** utils */ utils, wixSiteReactClass,
              wixSiteHeadRenderer, siteBI, experiment) {

        'use strict';
        var urlUtils = utils.urlUtils;
        var wixSiteReact = React.createFactory(wixSiteReactClass);
        var hookTypes = {
            PAGE_LOADED_FIRST_RENDER: 'page_loaded_first_render',
            PAGE_LOADED: 'page_loaded'
        };
        var registeredHooks = {};

        var INTERNAL_ERROR_PAGE_INFO = {
            pageId: utils.errorPages.IDS.INTERNAL_ERROR
        };

        var relativeRedirectCounter = 0;

        function updateHistory(url, title, addToHistory) {
            if (typeof window !== 'undefined' && _.get(window, 'history.pushState') && addToHistory) {
                try {
                    window.history.pushState(null, title, url);
                } catch (e) {
                    /**
                     * Can throw an exception when the new URL is not the site origin:
                     * In certain cases the site is viewed through a different domain than wix, or users's premium domain (e.g. via Yandex Webvisor)
                     */
                }
            }
        }

        function handleRelativeUrlRedirect(siteData, relativeUrl, callback) {
            //router returned an internal redirect path
            var newUrl = siteData.getExternalBaseUrl() + relativeUrl;
            var pageInfo = utils.wixUrlParser.parseUrl(siteData, newUrl);

            //update the url
            var expectedUrl = utils.wixUrlParser.getUrl(siteData, pageInfo);
            updateUrl(expectedUrl, pageInfo.title, siteData);

            if (pageInfo.routerDefinition) {
                getDynamicPageRealPage(siteData, pageInfo, callback);
            } else {
                callback(pageInfo);
            }
        }

        function handleDynamicRedirectResponse(siteData, routerResponse, callback) {
            var redirectUrl = routerResponse.redirectUrl;

            if (urlUtils.isExternalUrl(redirectUrl)) {
                var isPreviewMode = !!siteData.documentServicesModel;
                if (isPreviewMode) {
                    return;
                }

                window.location = redirectUrl;
            } else if (urlUtils.isRelativeUrl(redirectUrl) && relativeRedirectCounter < 4) {
                relativeRedirectCounter++;
                handleRelativeUrlRedirect(siteData, redirectUrl, callback);
            } else {
                //unexpected redirectUrl, display error page
                callback(INTERNAL_ERROR_PAGE_INFO);
            }
        }

        function handleDynamicPageResponse(siteData, routerResponse, routerDefinition, callback) {
            //router returned page id
            var pageInfo = {
                pageId: routerResponse.pageId,
                title: routerResponse.title
            };

            siteData.addDynamicPageData(routerResponse.pageId, routerResponse.pageData, routerDefinition);

            callback(pageInfo);
        }

        function getDynamicPageRealPage(siteData, navInfo, callback) {
            var routerDefinition = navInfo.routerDefinition;
            var routerBackEndRequestParamObject = utils.routersBackEndRequests.makeParamObjFromSiteData(siteData, routerDefinition, navInfo.innerRoute);
            utils.routersBackEndRequests.getPage(routerBackEndRequestParamObject, function (routerResponse) {
                if (routerResponse.redirectUrl) {
                    handleDynamicRedirectResponse(siteData, routerResponse, callback);
                } else {
                    handleDynamicPageResponse(siteData, routerResponse, routerDefinition, callback);
                }

            }, function () {
            });
        }

        function replaceHistory(url, title, addToHistory) {
            if (typeof window !== 'undefined' && _.get(window, 'history.replaceState') && addToHistory) {
                try {
                    window.history.replaceState(null, title, url);
                } catch (e) {
                    /**
                     * Can throw an exception when the new URL is not the site origin:
                     * In certain cases the site is viewed through a different domain than wix, or users's premium domain (e.g. via Yandex Webvisor)
                     */
                }
            }
        }

        function registerHook(hookName, hookFunc) {
            registeredHooks[hookName] = registeredHooks[hookName] || [];
            registeredHooks[hookName].push(hookFunc);
        }

        function executeHooks(hookName, args) {
            _.forEach(registeredHooks[hookName], function (hook) {
                hook.apply(null, args);
            });
        }

        function shouldReportPageEvent(siteData, currentFullUrl, targetURL, rootNavigationInfo ){
            var loadedPageIsPopup = siteData.isPopupPage(rootNavigationInfo.pageId);
            var usingSlashUrlFormat = siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH);

            return !loadedPageIsPopup && targetURL !== currentFullUrl && usingSlashUrlFormat;
        }

        /**
         *
         * @param site
         * @param siteDataAPI
         * @param url
         * @param {site.rootNavigationInfo} rootNavigationInfo the additional data that can be added on the link element
         * @param {boolean} addToHistory
         * @returns {boolean} true if the navigation succeeded
         * @param leaveOtherRootsAsIs
         */
        function navigateTo(site, siteDataAPI, url, rootNavigationInfo, addToHistory, leaveOtherRootsAsIs, shouldReplaceHistory) {
            var siteData = site.props.siteData;
            if (siteData.getCurrentUrlPageId() !== rootNavigationInfo.pageId) {
                site.siteAPI.reportBeatStart(rootNavigationInfo.pageId); //this is a report for users, so only pages with urls
            }
            //we have anchors only on primary pages for now
            if (siteData.getPrimaryPageId() !== rootNavigationInfo.pageId && rootNavigationInfo.anchorData) {
                var actions = site.siteAPI.getSiteAspect('actionsAspect');
                actions.registerNextAnchorScroll(rootNavigationInfo.anchorData);
            }

            var firstPass = true;
            var currentFullUrl = siteData.currentUrl.full;

            var pageLoadedCallback = function () {

                executeHooks(hookTypes.PAGE_LOADED, [site.siteAPI, rootNavigationInfo]);

                if (firstPass) {

                    firstPass = false;
                    if (url.indexOf('#') === 0) {
                        siteData.currentUrl.hash = url;
                    } else {
                        siteData.currentUrl = urlUtils.parseUrl(url);
                    }

                    if (shouldReportPageEvent(siteData, currentFullUrl, url, rootNavigationInfo)) {
                        site.siteAPI.reportCurrentPageEvent(url);
                    }

                    siteData.setRootNavigationInfo(rootNavigationInfo, !leaveOtherRootsAsIs);
                    site.setState({
                        currentUrlPageId: siteData.getCurrentUrlPageId(),
                        currentPopupId: siteData.getCurrentPopupId()
                    });
                    if (siteData.isViewerMode()) {
                        if (shouldReplaceHistory) {
                            replaceHistory(url, rootNavigationInfo.title, shouldReplaceHistory);
                        } else {
                            updateHistory(url, rootNavigationInfo.title, addToHistory);
                        }
                    }
                    updatePageTitleAndMetaTags(siteData, rootNavigationInfo.pageId);
                    //if (rootNavigationInfo.anchorData) {
                    //    site.siteAPI.getSiteAspect('anchorChangeEvent').changeAnchorToClicked(siteData, rootNavigationInfo.pageId, rootNavigationInfo.anchorData);
                    //}
                } else {
                    site.forceUpdate();
                }
            };
            siteDataAPI.loadPage(rootNavigationInfo, pageLoadedCallback);
            return true;
        }

        function renderSiteWithData(siteData, viewerPrivateServices, props) {
            var wixSiteClasses = 'wixSiteProperties';

            if (experiment.isOpen('mobileNonOptimizedOverflow')) {
                wixSiteClasses += ' mobile-non-optimized-overflow';
            }

            return wixSiteReact(_.assign({}, props, {
                className: siteData.rendererModel.siteInfo.documentType === 'WixSite' ? wixSiteClasses : 'noop',
                siteData: siteData,
                viewerPrivateServices: viewerPrivateServices,
                rootId: "masterPage",
                navigateMethod: navigateTo,
                updateUrlIfNeededMethod: updateUrlIfNeeded,
                getDynamicPageRealPage: getDynamicPageRealPage,
                updateHeadMethod: updatePageHeadTags,
                getSiteContainer: getSiteContainer
            }));
        }

        function getSiteContainer() {
            return window;
        }

        function updatePageHeadTags(siteData, pageId) {
            updatePageTitleAndMetaTags(siteData, pageId);

            // Adding GTM to Wix sites
            if (siteData.rendererModel.siteInfo.documentType === 'WixSite') {
                $(_getDocumentHead()).append(wixSiteHeadRenderer.getGoogleTagManagerScript());
            }
        }

        function updatePageTitleAndMetaTags(siteData, pageId) {
            _updateCurrentPageTitle(siteData);
            _removeExistingMetaTags(siteData);
            _addPageSEOMetaTags(siteData, pageId);

            if (experiment.isOpen('sv_addJsonldToHeadForSEO')) {
                _updateJsonld(siteData, pageId);
            }
        }

        function _updateJsonld(siteData, pageId) {
            $('script[type="application/ld+json"]').remove();
            var jsonldTag = wixSiteHeadRenderer.getPageJsonldTag(siteData, pageId);

            if (jsonldTag) {
                $(_getDocumentHead()).append(jsonldTag);
            }
        }

        function _addPageSEOMetaTags(siteData, pageId) {
            var tags = wixSiteHeadRenderer.getPageMetaTags(siteData, pageId);
            _addTagsToHead(tags);
        }

        function _removeExistingMetaTags(siteData) {
            var header = _getDocumentHead();
            var selectorsOfTagsToRemove = [
                '[name=description]',
                '[property="og:description"]',
                '[name=keywords]'
            ];

            if (experiment.isOpen('sv_addRobotsIndexingMetaTag') && siteData.publicModel.indexable) {
                selectorsOfTagsToRemove.push('[name=robots]');
            }

            if (experiment.isOpen('sv_updatePageOgTags')) {
                selectorsOfTagsToRemove = selectorsOfTagsToRemove.concat([
                    '[property="og:title"]',
                    '[property="og:url"]',
                    '[property="og:keywords"]',
                    '[property="og:image"]'
                ]);
            }

            selectorsOfTagsToRemove.forEach(function (selector) {
                $(selector, header).remove();
            });
        }

        function _addTagsToHead(tags) {
            _.forEach(tags, function (tag) {
                this.append(tag);
            }, $(_getDocumentHead()));
        }

        function _getDocumentHead() {
            return window.document.head;
        }

        function _updateCurrentPageTitle(siteData) {
            window.document.title = siteData.getCurrentUrlPageTitle();
        }

        function updateUrl(newUrl, pageTitle, siteData) {
            replaceHistory(newUrl, pageTitle, true);
            siteData.currentUrl = urlUtils.parseUrl(newUrl);
        }

        function updateUrlIfNeeded(siteData, pageInfo) {
            if (experiment.isOpen('sv_dpages') && utils.errorPages.isErrorPage(pageInfo.pageId)) {
                return;
            }

            var expectedUrl = utils.wixUrlParser.getUrl(siteData, pageInfo);
            if (!pageInfo.routerDefinition && siteData.isViewerMode() && expectedUrl !== siteData.currentUrl.full) {
                updateUrl(expectedUrl, pageInfo.title, siteData);
            }
        }

        function renderSite(siteData, viewerPrivateServices, props, renderFunc) {
            function oncePageInfoIsAvailable(pageInfo) {
                siteData.setRootNavigationInfo(pageInfo);
                utils.logger.reportBeatEvent(siteData, 6, pageInfo.pageId);
                siteBI.init(siteData);

                var pageLoadedCallback = function () {
                    executeHooks(hookTypes.PAGE_LOADED_FIRST_RENDER, [siteData, props.wixCodeAppApi]);

                    /*
                     * We need to parse url becuase now that the master page data has lodaded, we can extract more info from url
                     * */
                    //todo if dynamicRouter we should know pageId by now, fix pageInfo so that this code may do exactly what it's doing for static pages
                    var inner_pageInfo = utils.wixUrlParser.parseUrl(siteData, siteData.currentUrl.full);
                    if (inner_pageInfo.pageId !== pageInfo.pageId) {
                        inner_pageInfo.pageId = pageInfo.pageId;
                        inner_pageInfo.title = pageInfo.title;
                    }

                    if (experiment.isOpen('sv_dpages')) {
                        utils.errorPages.setErrorPagesDataItemsIfNeeded(siteData);
                    }

                    siteData.setRootNavigationInfo(inner_pageInfo);
                    utils.mobileViewportFixer.fixViewportTag(siteData);
                    updateUrlIfNeeded(siteData, inner_pageInfo);
                    renderFunc(renderSiteWithData(siteData, viewerPrivateServices, props));
                };
                viewerPrivateServices.siteDataAPI.loadPage(pageInfo, pageLoadedCallback);
            }

            var pageInfo = utils.wixUrlParser.parseUrl(siteData, siteData.currentUrl.full);
            if (experiment.isOpen('sv_dpages') && pageInfo.routerDefinition) {
                relativeRedirectCounter = 0; //this is the first call for getDynamicPageRealPage, init the redirect counter to prevent loops

                getDynamicPageRealPage(siteData, pageInfo, function (navPageInfo) {
                    oncePageInfoIsAvailable(navPageInfo);
                });
                return;
            }
            //todo - no real need to return the siteData - no body is using it
            oncePageInfoIsAvailable(pageInfo);
            return siteData;
        }

        return {
            renderSite: renderSite,
            WixSiteReact: wixSiteReactClass,
            hooks: {
                types: hookTypes,
                registerHook: registerHook
            }
        };
    });
