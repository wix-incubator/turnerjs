define(['lodash', 'siteUtils/core/linkRenderer', 'coreUtils', 'experiment', 'wixUrlParser'], function (_, linkRenderer, coreUtils, experiment, wixUrlParser) {
    'use strict';

    function getLinkObject(link, siteData, renderLinks, navInfo, resolvedSiteData) {
        if (!link) {
            return link;
        }
        if (_.isString(link)) {
            return {};
        }
        var linkObject = coreUtils.objectUtils.cloneDeep(link);
        if (renderLinks) {
            linkObject.render = linkRenderer.renderLink(linkObject, resolvedSiteData || siteData, navInfo);
        }
        return linkObject;
    }

    function getPageLinkObject(refId, siteData, renderLinks, navInfo, resolvedSiteData) {
        var linkObject = {
            type: 'PageLink',
            pageId: refId
        };
        if (renderLinks) {
            linkObject.render = linkRenderer.renderLink(linkObject, resolvedSiteData || siteData, navInfo);
        }

        return linkObject;
    }

    function getIsDynamicPage(siteData, pageId) {
        var allRouters = siteData.getRouters();
        var isDynamicPage = false;
        _.forEach(allRouters, function (routerData) {
            if (_.includes(_.values(routerData.pages), pageId)) {
                isDynamicPage = true;
            }
        });
        return isDynamicPage;
    }

    function getItems(dataItems, siteData, pagesOnly, renderLinks, navInfo, showDynamicPages, resolvedSiteData) {
        return _.reduce(dataItems, function (items, dataItem) {
            var linkObject = getLinkObject(dataItem.link, siteData, renderLinks, navInfo, resolvedSiteData);
            if (linkObject && linkObject.pageId && experiment.isOpen('sv_dpages')) {
                var pageId = _.isObject(linkObject.pageId) ? linkObject.pageId.id : linkObject.pageId;
                pageId = _.startsWith(pageId, '#') ? pageId.substring(1) : pageId;
                var isDynamicPage = linkObject.type === 'PageLink' ? getIsDynamicPage(siteData, pageId) : false;
                if (!showDynamicPages && isDynamicPage) {
                    return items;
                }
            }
            if (!pagesOnly || (pagesOnly && linkObject && linkObject.type === 'PageLink')) {
                items.push({
                    id: dataItem.id,
                    label: dataItem.label,
                    isVisible: dataItem.isVisible,
                    isVisibleMobile: dataItem.isVisibleMobile,
                    items: getItems(dataItem.items, siteData, pagesOnly, renderLinks, navInfo, showDynamicPages, resolvedSiteData),
                    link: linkObject
                });
            }

            return items;
        }, [], this);
    }

    function convertOldMenuToNewMenu(rawData, siteData, renderLinks, navInfo, resolvedSiteData) {
        var items = [], pageData;

        _.forEach(rawData, function (data) {
            pageData = siteData.getDataByQuery(data.refId);
            items.push({
                label: pageData.title,
                isVisible: !pageData.hidePage,
                isVisibleMobile: pageData.mobileHidePage !== undefined ? !pageData.mobileHidePage : !pageData.hidePage,
                items: convertOldMenuToNewMenu(data.items, siteData, renderLinks, navInfo, resolvedSiteData),
                link: getPageLinkObject(data.refId, siteData, renderLinks, navInfo, resolvedSiteData)
            });
        });

        return items;
    }

    /**
     * Retrieves all menu items
     *
     * @param siteData
     * @param [pagesOnly] should the function filter out menu items which are not of pages.
     * @returns {Array}
     */
    function getSiteMenu(siteData, pagesOnly, dontRenderLinks, navInfo, showDynamicPages) {
        var customSiteMenu = siteData.getDataByQuery('CUSTOM_MAIN_MENU');
        var mainMenu = siteData.getDataByQuery('MAIN_MENU');
        var resolvedSiteData;

        if (!dontRenderLinks) {
            resolvedSiteData = wixUrlParser.utils.getResolvedSiteData(siteData);
        }

        if (customSiteMenu && (!mainMenu || _.isEmpty(mainMenu.items))) {
            return getItems(customSiteMenu.items, siteData, pagesOnly, !dontRenderLinks, navInfo, showDynamicPages, resolvedSiteData);
        }

        return convertOldMenuToNewMenu(mainMenu.items, siteData, !dontRenderLinks, navInfo, resolvedSiteData);
    }

    function getSiteMenuWithRender(siteData, pagesOnly, navInfo) {
        return getSiteMenu(siteData, pagesOnly, false, navInfo);
    }

    function getSiteMenuWithoutRenderedLinks(siteData, pagesOnly, showDynamicPages) {
        return getSiteMenu(siteData, pagesOnly, true, {}, showDynamicPages);
    }

    function getMaxWidth(widths) {
        return ( _.reduce(widths, function (a, b) {
            return a > b ? a : b;
        }, -Infinity));
    }

    function removeAllElementsWithWidthZero(widths) {
        return _.filter(widths, function (num) {
            return num !== 0;
        });
    }

    function getMinWidth(widths) {
        return _.reduce(widths, function (a, b) {
            return a < b ? a : b;
        });
    }

    function nonHiddenPageIdsFromMainMenu(siteData) {
        var counter = 0;
        return _.reduce(getSiteMenuWithoutRenderedLinks(siteData, null, false), function (res, item) {
            if (item.isVisible) {
                res.push(counter.toString());
                counter++;
            }
            return res;
        }, []);
    }

    function getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels) {
        menuWidth -= menuWidthToReduce * (removeMarginFromAllChildren ? widths.length : widths.length - 1);
        menuWidth -= extraPixels.left + extraPixels.right;
        if (sameWidth) {
            // width same width, all widths should be as the max width (calculated for the whole items in the calling method)
            _.fill(widths, maxWidth);
        }

        // not first measure - want sizes without 0
        if (_.includes(widths, 0)) {
            return null;
        }
        var totalMenuItemsWidths = 0;
        var total = _.reduce(widths, function (a, b) {
            return a + b;
        }, 0);
        if (total > menuWidth) {
            // drop down should have less items
            return null;
        }

        // calculate the width of the items
        if (sameWidth) {
            if (stretch) {
                var width = Math.floor(menuWidth / widths.length);
                var stretchedAndSameItemWidths = _.times(widths.length, _.constant(width));
                totalMenuItemsWidths = width * widths.length;
                if (totalMenuItemsWidths < menuWidth) {
                    var totalRemnant = Math.floor(menuWidth - totalMenuItemsWidths);
                    _.forEach(widths, function (wdth, index) {
                        if (index <= totalRemnant - 1) {
                            stretchedAndSameItemWidths[index]++;
                        }
                    });

                }
                return stretchedAndSameItemWidths;
            }
            return widths;
        }

        // not same width
        if (stretch) {
            var toAdd = Math.floor((menuWidth - total) / widths.length);
            totalMenuItemsWidths = 0;
            var stretchItemsWidths = _.map(widths, function (itemWidth) {
                totalMenuItemsWidths += (itemWidth + toAdd);
                return itemWidth + toAdd;
            });
            if (totalMenuItemsWidths < menuWidth) {
                var remnant = Math.floor(menuWidth - totalMenuItemsWidths);
                _.forEach(widths, function (wdth, index) {
                    if (index <= remnant - 1) {
                        stretchItemsWidths[index]++;
                    }
                });
            }
            return stretchItemsWidths;
        }

        return widths;
    }


    function getActiveAnchorInPage(siteAPI, compDataVisiblePages, siteData) {
        var urlPageId = siteData.getCurrentUrlPageId();
        var activeAnchor = siteAPI.getSiteAspect('anchorChangeEvent').getActiveAnchor();
        if (!activeAnchor) {
            return null;
        }
        var activeAnchorId = activeAnchor.activeAnchorComp.id;
        var pageActiveAnchor = _(compDataVisiblePages)
            .filter(function (item) {
                return item.link && _.isObject(item.link.anchorDataId) && item.link.type === "AnchorLink" && _.has(item.link.pageId, 'id') && item.link.pageId.id === urlPageId;
            })
            .find({link: {anchorDataId: {id: activeAnchorId}}});

        return pageActiveAnchor ? pageActiveAnchor.link.anchorDataId.id : null;
    }

    function shouldHighlightAnchorInPage(siteData) {
        return siteData.browserFlags().highlightAnchorsInMenu;
    }

    return {
        getDropDownWidthIfOk: getDropDownWidthIfOk,
        getMaxWidth: getMaxWidth,
        getMinWidth: getMinWidth,
        removeAllElementsWithWidthZero: removeAllElementsWithWidthZero,
        nonHiddenPageIdsFromMainMenu: nonHiddenPageIdsFromMainMenu,
        getSiteMenuWithRender: getSiteMenuWithRender,
        getSiteMenuWithoutRenderedLinks: getSiteMenuWithoutRenderedLinks,
        getActiveAnchorInPage: getActiveAnchorInPage,
        shouldHighlightAnchorInPage: shouldHighlightAnchorInPage
    };

});
