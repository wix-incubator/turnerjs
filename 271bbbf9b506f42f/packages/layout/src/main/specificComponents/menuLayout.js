define(['zepto', 'lodash', "layout/util/layout", "utils"], function ($, _, /** layout.layout */ layout, /** utils */ utils) {
    "use strict";

    var menuUtils = utils.menuUtils;

    function patchDropDownMenuItems(id, patchers, measureMap, menuItemsIdsWithMore, realWidths, menuHeight, extraPixels) {
        // go over all the items (not the more)
        var totalVisible = 0;
        var lastVisibleMenuId = null;
        var menuLineHeight = measureMap.custom[id].lineHeight;
        var menuItemHeight = menuHeight - extraPixels.height;

        for (var i = 0; i < menuItemsIdsWithMore.length; i++) {
            var activeWidth = realWidths[i];
            var isVisible = activeWidth > 0;
            var menuIndexOrMoreBecauseOfLegacyImplementation = menuItemsIdsWithMore[i];
            var menuId = id + menuIndexOrMoreBecauseOfLegacyImplementation;
            if (isVisible) {
                totalVisible++;
                lastVisibleMenuId = menuId;
                patchers.css(menuId, {
                    "width": activeWidth + "px",
                    "height": menuItemHeight + "px",
                    "position": "relative",
                    "box-sizing": "border-box",
                    "overflow": "visible"
                });
                measureMap.custom[id].labelNodes[menuIndexOrMoreBecauseOfLegacyImplementation].css({ //TODO: fix so that we use safe patchers if possible (remove dom nodes from measureMap)
                    'line-height': menuLineHeight
                });
            } else {
                patchers.css(menuId, {"height": "0px", "overflow": "hidden", "position": "absolute"});//,"height":"0px"
            }
        }
        if (totalVisible === 1) {
            patchers.data(id + "moreContainer", {
                listposition: "lonely"
            });
            patchers.data(lastVisibleMenuId, {
                listposition: "lonely"
            });
        }
    }

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param structureInfo
     * @param {core.SiteData} siteData
     */
    function patchDropDownMenu(id, patchers, measureMap, structureInfo, siteData) {

        // measure widths to find out if there should be "more" and what would be the real widths
        // based on the comp properties
        var menuHeight = measureMap.height[id];
        var menuItemsIds = menuUtils.nonHiddenPageIdsFromMainMenu(siteData);
        var menuItemsIdsWithMore = menuItemsIds.concat("__more__");
        var customMeasure = measureMap.custom[id];

        setDropModeData(id, patchers, customMeasure.needToOpenMenuUp);
        var extraPixels = customMeasure.menuItemContainerExtraPixels;

        if (customMeasure.originalGapBetweenTextAndBtn) {
            _.forEach(menuItemsIdsWithMore, function (item) {
                if (!customMeasure.hasOriginalGapData[item]) {
                    patchers.data(id + item, {
                        originalGapBetweenTextAndBtn: customMeasure.originalGapBetweenTextAndBtn[id + item]
                    });
                }
            });
        }
        patchers.css(id, {
            height: menuHeight
        });
        patchers.css(id + 'itemsContainer', {
            height: menuHeight - customMeasure.menuBorderY - customMeasure.ribbonExtra - customMeasure.ribbonEls + "px"
        });
        patchDropDownMenuItems(id, patchers, measureMap, menuItemsIdsWithMore, customMeasure.realWidths, menuHeight, extraPixels);
    }

    function checkForMarginMenu(itemsContainer) {
        var menuItem = itemsContainer.lastChild;
        var marginLeft = parseInt($(menuItem).css("margin-left"), 10) || 0;
        var marginRight = parseInt($(menuItem).css("margin-right"), 10) || 0;
        return marginLeft + marginRight;

    }

    function checkValidNumber(num) {
        var number = parseFloat(num);
        return isFinite(number) ? number : 0;
    }

    function getDivExtraPixels(div, includeMargin) {
        var divComputedStyle = $(div).css(["border-top-width", "border-bottom-width", "border-left-width", "border-right-width", "padding-top", "padding-bottom", "padding-left", "padding-right", "margin-top", "margin-bottom", "margin-left", "margin-right"]);
        var top = checkValidNumber(divComputedStyle['border-top-width']) + checkValidNumber(divComputedStyle['padding-top']);
        var bottom = checkValidNumber(divComputedStyle['border-bottom-width']) + checkValidNumber(divComputedStyle['padding-bottom']);
        var left = checkValidNumber(divComputedStyle['border-left-width']) + checkValidNumber(divComputedStyle['padding-left']);
        var right = checkValidNumber(divComputedStyle['border-right-width']) + checkValidNumber(divComputedStyle['padding-right']);
        if (includeMargin) {
            top += checkValidNumber(divComputedStyle['margin-top']);
            bottom += checkValidNumber(divComputedStyle['margin-bottom']);
            left += checkValidNumber(divComputedStyle['margin-left']);
            right += checkValidNumber(divComputedStyle['margin-right']);
        }
        return {top: top, bottom: bottom, left: left, right: right, height: top + bottom, width: left + right};
    }


    function setDropModeData(menuId, patchers, isUp) {
        patchers.data(menuId, {
            dropmode: isUp ? 'dropUp' : 'dropDown'
        });
    }

    function needToOpenDropDownUp(menuCompDom) {
        var menuClientRect = menuCompDom.getBoundingClientRect();
        var topRelativeToWindow = menuClientRect.top;
        return topRelativeToWindow > (window.innerHeight / 2);
    }

    function getChildrenIdToMeasure(siteData) {
        var visiblePageIds = menuUtils.nonHiddenPageIdsFromMainMenu(siteData).concat("__more__");
        var subChildren = [
            []
        ];
        var res = [
            ["moreContainer"], ["itemsContainer"]
        ];
        _.forEach(subChildren, function (childArr) {
            res = res.concat(_.map(visiblePageIds, function (menuItemId) {
                return [menuItemId].concat(childArr);
            }));
        });
        return res;
    }

    function getMenuItemsToPresent(id, measureMap, menuProperties, nodesMap, menuItemsIdsWithMore) {
        var menuWidth = measureMap.width[id];

        var customMeasure = measureMap.custom[id];
        customMeasure.hasOriginalGapData = {};
        customMeasure.originalGapBetweenTextAndBtn = {};
        var widths = _.map(menuItemsIdsWithMore, function (item) {
            var $menuItem = $(nodesMap[id + item]);
            var gapBetweenTextAndBtn;
            if (!$menuItem.data("originalGapBetweenTextAndBtn")) {
                customMeasure.hasOriginalGapData[item] = false;
                gapBetweenTextAndBtn = measureMap.width[id + item] - customMeasure.labelWidths[item];
                customMeasure.originalGapBetweenTextAndBtn[id + item] = gapBetweenTextAndBtn;
            } else {
                customMeasure.hasOriginalGapData[item] = true;
                gapBetweenTextAndBtn = parseInt($menuItem.data("originalGapBetweenTextAndBtn"), 10);
            }
            if (measureMap.width[id + item] > 0) {
                return customMeasure.labelWidths[item] + gapBetweenTextAndBtn;
            }
            return 0;

        });
        var moreWidth = widths.pop();
        var sameWidth = menuProperties.sameWidthButtons;
        var stretch = menuProperties.stretchButtonsToMenuWidth;
        var moreShown = false;
        var menuWidthToReduce = customMeasure.menuItemContainerMargins;
        var removeMarginFromAllChildren = customMeasure.menuItemMarginForAllChildren;
        var extraPixels = customMeasure.menuItemContainerExtraPixels;
        // check if it the menu can fit without "more"
        var maxWidth = menuUtils.getMaxWidth(widths);
        var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
        if (!realWidths) {
            // find the menu with most items that work
            for (var i = 1; i <= widths.length; i++) {
                realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths.slice(0, -1 * i).concat(moreWidth), menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                if (realWidths) {
                    moreShown = true;
                    break;
                }
            }
            if (!realWidths) { //found a case where the menu text was bigger then menu - more get the menu width
                moreShown = true;
                realWidths = [moreWidth];
            }
        }
        if (moreShown) {
            var widthMore = realWidths[realWidths.length - 1];
            realWidths = realWidths.slice(0, -1);
            while (realWidths.length < menuItemsIdsWithMore.length) {
                realWidths.push(0);
            }
            realWidths[realWidths.length - 1] = widthMore;
        }
        return {
            realWidths: realWidths,
            moreShown: moreShown
        };

    }

    function calculateLineHeight(menuHeight, customMeasure) {
        return utils.style.unitize(menuHeight - customMeasure.menuBorderY - customMeasure.labelPad - customMeasure.ribbonEls - customMeasure.menuButtonBorder - customMeasure.ribbonExtra);
    }

    function getLabelNodes(menuId, menuItemsIds, nodesMap) {
        return _.reduce(menuItemsIds, function (labelNodes, menuItemId) {
            labelNodes[menuItemId] = $(nodesMap[menuId + menuItemId]).find('p');
            return labelNodes;
        }, {});
    }

    function getLabelWidths(labelNodesMap) {
        return _.mapValues(labelNodesMap, function ($nodes) {
            var labelNodeComputedStyle = window.getComputedStyle($nodes[0]);
            return parseInt(labelNodeComputedStyle.width, 10) + parseInt(labelNodeComputedStyle.paddingLeft, 10) + parseInt(labelNodeComputedStyle.paddingRight, 10);
        });
    }

    function measureMenu(id, measureMap, nodesMap, siteData, structureInfo) {
        var $menu = $(nodesMap[id]);
        var itemsContainer = $('#' + id + "itemsContainer")[0];

        var customMeasure = measureMap.custom[id] = {
            menuBorderY: parseInt($menu.data('menuborder-y'), 10),
            ribbonExtra: parseInt($menu.data('ribbon-extra'), 10),
            ribbonEls: parseInt($menu.data('ribbon-els'), 10),
            labelPad: parseInt($menu.data('label-pad'), 10),
            menuButtonBorder: parseInt($menu.data('menubtn-border'), 10),
            menuItemContainerMargins: checkForMarginMenu(itemsContainer),
            menuItemContainerExtraPixels: getDivExtraPixels(itemsContainer, true),
            needToOpenMenuUp: needToOpenDropDownUp(nodesMap[id]),
            menuItemMarginForAllChildren: !structureInfo.propertiesItem.stretchButtonsToMenuWidth || itemsContainer.getAttribute("data-marginAllChildren") !== "false"
        };

        var menuHeight = measureMap.height[id];
        customMeasure.lineHeight = calculateLineHeight(menuHeight, customMeasure);

        var menuItemsIds = menuUtils.nonHiddenPageIdsFromMainMenu(siteData).concat("__more__");
        customMeasure.labelNodes = getLabelNodes(id, menuItemsIds, nodesMap);
        customMeasure.labelWidths = getLabelWidths(measureMap.custom[id].labelNodes);
        var arrayWidths = getMenuItemsToPresent(id, measureMap, structureInfo.propertiesItem, nodesMap, menuItemsIds);
        customMeasure.realWidths = arrayWidths.realWidths;
        customMeasure.isMoreShown = arrayWidths.moreShown;
        // var moreContainer = nodesMap[id + "moreContainer"];
        // measureMap.custom[id + "moreContainerBorderLeft"] = parseInt($(moreContainer).css("border-left"), 10);
    }

    layout.registerSAFEPatcher("wysiwyg.viewer.components.menus.DropDownMenu", patchDropDownMenu);
    layout.registerCustomMeasure("wysiwyg.viewer.components.menus.DropDownMenu", measureMenu);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.menus.DropDownMenu", getChildrenIdToMeasure);

    return {};
});
