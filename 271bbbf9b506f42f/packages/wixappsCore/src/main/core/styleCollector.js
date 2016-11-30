define(['lodash', 'skins', 'wixappsCore/util/viewsUtils', 'wixappsCore/core/styleData', 'wixappsCore/core/styleMap'], function (_, skinsPackage, viewsUtils, /** wixappsCore.styleData */ styleData, styleMap) {
    'use strict';

    var skins = skinsPackage.skins;

    /**
     * Adds a the style if it wasn't loaded already
     * @param {string} styleId The style Id
     * @param {string} skinName The name of the skin
     * @param {data.themeData} themeData
     * @param {Object.<string, string>} loadedStyles
     */
    function addStyleIfNeeded(styleId, skinName, themeData, loadedStyles) {
        var styleDef = styleId && themeData[styleId] && skins[themeData[styleId].skin];
        var skinDef = skinName && skins[skinName];
        var key;
        if (styleDef) {
            key = styleId;
        } else {
            key = skinDef ? skinName : '';
        }
        if (key && !loadedStyles[key]) {
            loadedStyles[key] = 's' + _.size(loadedStyles);
        }
    }

    /**
     * Collect all the styles that are in use in this view definition and add it to the loadedStyles
     * @param {object} viewDef The view definition
     * @param {data.themeData} themeData
     * @param {Object.<string, string>} loadedStyles
     */
    function collectViewStyles(viewDef, themeData, loadedStyles) {
        function processViewDef(currViewDef) {
            var styleId = _.get(currViewDef, 'comp.style');
            var skinName = _.get(currViewDef, 'comp.skin') || (currViewDef.comp && styleData.getDefaultSkinName(currViewDef.comp.name));

            addStyleIfNeeded(styleId, skinName, themeData, loadedStyles);
        }

        viewsUtils.traverseViews(viewDef, processViewDef);
    }

    /**
     * Adds all the default styles that are set in StyleData
     * @param {data.themeData} themeData
     * @param {Object.<string, string>} loadedStyles
     */
    function addDefaultStyles(themeData, loadedStyles) {
        _.forEach(styleMap, function (compStyle) {
            _.forEach(compStyle, function (styleObj) {
                addStyleIfNeeded(styleObj.style, styleObj.skin, themeData, loadedStyles);
            });
        });
    }

    /**
     * @class wixappsCore.styleCollector
     */
    return {
        collectViewStyles: collectViewStyles,
        addStyleIfNeeded: addStyleIfNeeded,
        addDefaultStyles: addDefaultStyles
    };
});
