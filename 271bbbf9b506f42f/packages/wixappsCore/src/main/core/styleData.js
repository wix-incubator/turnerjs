define(['wixappsCore/core/styleMap'], function (styleMap) {
    'use strict';

    function getDefaultSkinName(compName) {
        return styleMap[compName] && styleMap[compName].default && styleMap[compName].default.skin;
    }

    function getSkinAndStyle(allTheme, proxyName, styleNS, styleId, skin) {
        if (skin && styleId && allTheme[styleId]) {
            return {skin: skin, styleId: styleId};
        } else if (skin) {
            return {skin: skin};
        }

        var styleObj = styleMap[proxyName][styleNS] || styleMap[proxyName].default;
        styleId = styleId || styleObj.style;

        if (styleId && allTheme[styleId]) {
            return {
                styleId: styleId,
                skin: allTheme[styleId].skin
            };
        }

        return {
            styleId: styleObj.style,
            skin: styleObj.skin
        };
    }

    /**
     * @class wixappsCore.styleData
     */
    return {
        getDefaultSkinName: getDefaultSkinName,
        getSkinAndStyle: getSkinAndStyle
    };
});
