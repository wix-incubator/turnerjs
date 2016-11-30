define(["lodash", "utils", "skins"], function (_, utils, skinsPackage) {
    'use strict';

    var skins = skinsPackage.skins;

    var classBasedStyleCollector = {};

    function getCompInfo(siteData, pageId, compStructure) {
        var styleItem = compStructure.styleId && siteData.getDataByQuery(compStructure.styleId, pageId, siteData.dataTypes.THEME);
        return {
            dataItem: compStructure.dataQuery && siteData.getDataByQuery(compStructure.dataQuery, pageId),
            propertiesItem: compStructure.propertyQuery && siteData.getDataByQuery(compStructure.propertyQuery, pageId, siteData.dataTypes.PROPERTIES),
            styleItem: styleItem,
            structure: compStructure
        };
    }

    function addLoadedStyle(loadedStyles, key) {
        if (key && !loadedStyles[key]) {
            loadedStyles[key] = "s" + _.size(loadedStyles);
        }
    }

    function styleHasSkin(themeData, styleId) {
        return themeData[styleId] && skins[themeData[styleId].skin];
    }

    function addStructureStylesAndSkins(structure, themeData, loadedStyles) {
        if (structure.styleId && styleHasSkin(themeData, structure.styleId)) {
            addLoadedStyle(loadedStyles, structure.styleId);
        } else if (structure.skin && skins[structure.skin]) {
            addLoadedStyle(loadedStyles, structure.skin);
        }
    }

    function addClassBasedStyles(structure, themeData, siteData, loadedStyles, pageId) {
        if (structure.componentType && classBasedStyleCollector[structure.componentType]) {
            var compInfo = getCompInfo(siteData, pageId, structure);
            classBasedStyleCollector[structure.componentType](compInfo, themeData, siteData, loadedStyles, pageId);
        }
    }

    function addOverrideStyles(structure, themeData, loadedStyles) {
        if (structure.modes && structure.modes.overrides) {
            _.forEach(structure.modes.overrides, function(override) {
                if (override.styleId && styleHasSkin(themeData, override.styleId)) {
                    addLoadedStyle(loadedStyles, override.styleId);
                }
            });
        }
    }

    function collectStyleIdsFromFullStructure(structure, themeData, siteData, loadedStyles, pageId, collectFromMobile) {
        addStructureStylesAndSkins(structure, themeData, loadedStyles);
        addOverrideStyles(structure, themeData, loadedStyles);
        addClassBasedStyles(structure, themeData, siteData, loadedStyles, pageId);

        var children = utils.dataUtils.getChildrenData(structure, !!collectFromMobile);
        _(children).compact().forEach(function(child) {
            collectStyleIdsFromFullStructure(child, themeData, siteData, loadedStyles, pageId);
        }).commit();
    }

    /**
     * adds styles to the loaded styles
     * @param structure
     * @param themeData
     * @param {core.SiteData} siteData
     * @param loadedStyles
     * @param {string} pageId
     * @param {boolean} collectFromMobile
     */
    function collectStyleIdsFromStructure(structure, themeData, siteData, loadedStyles, pageId, collectFromMobile) {
        addStructureStylesAndSkins(structure, themeData, loadedStyles);
        addClassBasedStyles(structure, themeData, siteData, loadedStyles, pageId);

        var children = utils.dataUtils.getChildrenData(structure, !!collectFromMobile);
        _(children).compact().forEach(function(child) {
            collectStyleIdsFromStructure(child, themeData, siteData, loadedStyles, pageId);
        }).commit();
    }

    /**
     *
     * @param {string} className
     * @param {function(data.compStructure, data.themeData, core.SiteData, Object.<string, string>, string)} collector
     */
    function registerClassBasedStyleCollector(className, collector) {
        classBasedStyleCollector[className] = collector;
    }

    /**
     * @class core.styleCollector
     */
    return {
        collectStyleIdsFromStructure: collectStyleIdsFromStructure,
        collectStyleIdsFromFullStructure: collectStyleIdsFromFullStructure,
        registerClassBasedStyleCollector: registerClassBasedStyleCollector
    };
});
