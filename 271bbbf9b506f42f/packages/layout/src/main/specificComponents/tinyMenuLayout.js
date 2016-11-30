 define(['zepto', 'layout/util/layout', 'utils', 'layout/util/rootLayoutUtils', 'lodash'], function ($, /** layout.layout */ layout, utils, rootLayoutUtils, _) {
    "use strict";

    var MENU_CONTAINER_SKIN_PART_ID = "menuContainer";
    var MENU_BUTTON_SKIN_PART_ID = "menuButton";
    var MENU_ITEMS_SKIN_PART_ID = "menuItems";
    var MENU_BACKGROUND_SKIN_PART_ID = "menuBackground";
    var OVERLAY_SKIN_PART_ID = "fullScreenOverlay";
    var MENU_MARGIN = 20;
    var CLASSIC_SKIN = "wysiwyg.viewer.skins.mobile.TinyMenuSkin";

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param structureInfo
     * @param {core.SiteData} siteData
     */

    function patchTinyMenu(id, patchers, measureMap, structureInfo, siteData) {
        var siteWidth = rootLayoutUtils.getRootWidth(siteData, measureMap, structureInfo.rootId);
        var containerWidth = siteWidth - (MENU_MARGIN * 2);
        var containerLeft, tinyMenuLeft;

        var fixed = structureInfo.layout.fixedPosition;

        var wixAdsBottom = +_.get(measureMap, ['top', 'WIX_ADS'], 0) + _.get(measureMap, ['height', 'WIX_ADS'], 0);
        if (fixed) {
            tinyMenuLeft = 'calc(50% + ' + (structureInfo.layout.x - siteWidth / 2) + 'px)';
            containerLeft = -structureInfo.layout.x + MENU_MARGIN;
        } else {
            tinyMenuLeft = structureInfo.layout.x + 'px';
            containerLeft = -measureMap.custom[id].menuContainerLeft;
        }

        patchers.css(id, {
            left: tinyMenuLeft
        });

        if (fixed) {
            patchers.css(id + MENU_BUTTON_SKIN_PART_ID, {marginTop: wixAdsBottom + 'px'});
        }

        if (_.get(structureInfo, ['styleItem', 'skin'], CLASSIC_SKIN) === CLASSIC_SKIN) {
            var containerID = id + MENU_CONTAINER_SKIN_PART_ID;
            patchers.css(containerID, {
                maxHeight: (fixed ? measureMap.clientHeight - wixAdsBottom : measureMap.height.masterPage) - _.get(measureMap, ['custom', id, 'menuContainerTop'], 0)
            });
        } else {
            var maxHeight = measureMap.height[id + MENU_BACKGROUND_SKIN_PART_ID] - measureMap.top[id + MENU_CONTAINER_SKIN_PART_ID];
            patchers.css(id + MENU_CONTAINER_SKIN_PART_ID, {
                marginTop: wixAdsBottom + 'px',
                maxHeight: maxHeight + 'px'
            });
            patchers.css(id + OVERLAY_SKIN_PART_ID, {
                height: (measureMap.height.screen + 1) + 'px'}
            );
            return;
        }


        patchers.css(id + MENU_CONTAINER_SKIN_PART_ID, {
            width: containerWidth + 'px',
            left: containerLeft + 'px'
        });
    }

    function measureTinyMenu(id, measureMap, nodesMap) {
        var siteRootNode = $('#SITE_ROOT')[0];
        var nodeRect = utils.domMeasurements.getElementRect(nodesMap[id], siteRootNode);

        measureMap.custom[id] = {
            menuContainerTop: nodeRect.bottom,
            menuContainerLeft: nodeRect.left - MENU_MARGIN
        };

        measureMap.top[id + MENU_CONTAINER_SKIN_PART_ID] = utils.domMeasurements.getBoundingRect(nodesMap[id + MENU_CONTAINER_SKIN_PART_ID]).top;
        if (nodesMap[id + MENU_BACKGROUND_SKIN_PART_ID]) {
            measureMap.height[id + MENU_BACKGROUND_SKIN_PART_ID] = utils.domMeasurements.getElementRect(nodesMap[id + MENU_BACKGROUND_SKIN_PART_ID]).height;
        }
        measureMap.height[id] = measureMap.height[id + MENU_BUTTON_SKIN_PART_ID];

        var open = /_open\b/.test(nodesMap[id + MENU_BUTTON_SKIN_PART_ID].className);
        if (open) {
            var menuItemsRect = utils.domMeasurements.getElementRect(nodesMap[id + MENU_ITEMS_SKIN_PART_ID], siteRootNode);

            measureMap.minHeight.masterPage = Math.max(measureMap.minHeight.masterPage || 0,
                menuItemsRect.bottom);
        }

    }

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.mobile.TinyMenu", [[MENU_CONTAINER_SKIN_PART_ID], [MENU_BUTTON_SKIN_PART_ID], [MENU_ITEMS_SKIN_PART_ID], [OVERLAY_SKIN_PART_ID], [MENU_BACKGROUND_SKIN_PART_ID]]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.mobile.TinyMenu", measureTinyMenu);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.mobile.TinyMenu", patchTinyMenu);
});
