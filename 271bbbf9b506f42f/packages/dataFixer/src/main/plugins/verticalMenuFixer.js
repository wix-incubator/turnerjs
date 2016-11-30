define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    var masterPageLoaded = false;
    var masterPageThemeData = {};
    var menuItemsCount = 0;
    var pagesPendingMasterPage = [];
    var separatorNotIncludedInLineHeight = [
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonFixedWidthSkin',
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin',
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSolidColorSkin'
    ];
    var borderNotIncludedInLineHeight = [
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonFixedWidthSkin',
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin'
    ];

    function isMasterPage(pageJson) {
        return !!pageJson.data.theme_data.THEME_DATA;
    }

    function saveMasterPageThemeData(pageJson) {
        masterPageThemeData = pageJson.data.theme_data;
    }

    function saveMenuItemsCount(pageJson) {
        var documentData = pageJson.data.document_data;
        var menuItems = documentData.CUSTOM_MAIN_MENU || {items:[]};
        menuItemsCount = _.filter(menuItems.items, function (item) {
            return documentData[item.replace('#', '')].isVisible;
        }).length;
    }

    function updateHeights(pageJson, comp, oldHeight, newHeight) {
        var props = getCompProps(pageJson, comp);

        comp.layout.height = newHeight;
        props.originalHeight = oldHeight;
    }

    function isAlreadyFixed(pageJson, comp) {
        var props = getCompProps(pageJson, comp);

        return !_.isUndefined(props.originalHeight);
    }

    function isFixNeeded(pageJson, comp) {
        return comp.componentType === 'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu' && !isAlreadyFixed(pageJson, comp);
    }

    function getCompProps(pageJson, comp) {
        return pageJson.data.component_properties[comp.propertyQuery.replace('#', '')];
    }

    function getCompStyle(pageJson, comp) {
        return pageJson.data.theme_data[comp.styleId] || masterPageThemeData[comp.styleId];
    }

    function fixVerticalMenu(pageJson, comp) {
        var style = getCompStyle(pageJson, comp);
        if (!style) {
            coreUtils.log.error("cannot find style");
        }
        var separator = parseInt(style.style.properties.sepw || style.style.properties.separatorHeight || 0, 10);
        var separatorNotIncluded = _.includes(separatorNotIncludedInLineHeight, style.skin);
        var borderNotIncluded = _.includes(borderNotIncludedInLineHeight, style.skin);
        var oldHeight = comp.layout.height;
        var newHeight = coreUtils.verticalMenuCalculations.getFixedHeight(oldHeight, separator, separatorNotIncluded, borderNotIncluded, menuItemsCount);

        updateHeights(pageJson, comp, oldHeight, newHeight);
    }

    function fixComps(pageJson, comps) {
        _.forEach(comps, function (comp) {

            if (isFixNeeded(pageJson, comp)) {
                fixVerticalMenu(pageJson, comp);
            }

            if (comp.components) {
                fixComps(pageJson, comp.components);
            }
            /*if (comp.mobileComponents) {
             fixComps(pageJson, comp.mobileComponents);
             }*///todo ask moram
        });
    }

    function fixPage(pageJson) {
        var structureData = pageJson.structure;
        if (!structureData) {
            return;
        }
        if (structureData.components) {
            fixComps(pageJson, structureData.components);
        }
        if (structureData.mobileComponents) {
            fixComps(pageJson, structureData.mobileComponents);
        }
        if (structureData.children) {
            fixComps(pageJson, structureData.children);
        }
    }

    /**
     * @exports utils/dataFixer/plugins/verticalMenuFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            // note that master page is used in patching, so we will hold any non master-page
            // fixes until we reached the master-page. There might be a difference in load order
            // between debug mode and non debug
            if (isMasterPage(pageJson)) {
                saveMasterPageThemeData(pageJson);
                saveMenuItemsCount(pageJson);
                masterPageLoaded = true;
                while (pagesPendingMasterPage.length > 0) {
                    fixPage(pagesPendingMasterPage.pop());
                }
                return;
            }

            if (masterPageLoaded) {
                fixPage(pageJson);
            } else {
                pagesPendingMasterPage.push(pageJson);
            }
        }
    };

    return exports;
});
