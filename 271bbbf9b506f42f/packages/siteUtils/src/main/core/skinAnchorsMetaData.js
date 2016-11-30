define(['lodash'], function(_){
    'use strict';


    //this is non-anchorable height for containers, meaning the size of the skin outside the 'inlineContent'
    var NON_ANCHORABLE_HEIGHT = {
        "wysiwyg.viewer.skins.area.BubbleArea": 30,
        "wysiwyg.viewer.skins.area.BubbleLeftArea": 30,
        "wysiwyg.viewer.skins.area.RibbonAreaSkin": function(style){
            var styleProperties = _.get(style, 'style.properties');
            var nonAnchorableHeight = 10;
            if (styleProperties) {
                nonAnchorableHeight += parseInt(styleProperties.els, 10) || 0;
            }
            return nonAnchorableHeight;
        },
        "wysiwyg.viewer.skins.area.SloopyArea": 6,
        "wysiwyg.viewer.skins.area.BubbleAreaLeft": 10,
        "wysiwyg.viewer.skins.area.LeftTriangleArea": 5,
        "wysiwyg.viewer.skins.area.RightTriangleArea": 5,
        "wysiwyg.viewer.skins.area.BubbleAreaRight": 10,
        "wysiwyg.viewer.skins.page.SloopyPageSkin": 3,
        "wysiwyg.viewer.skins.page.BasicPageSkin": 20,
        "wysiwyg.viewer.skins.page.LiftedBottomPageSkin": 20,
        "wysiwyg.viewer.skins.page.LiftedTopPageSkin": 20,
        "wysiwyg.viewer.skins.page.BorderPageSkin": 20,
        "wysiwyg.viewer.skins.page.LiftedShadowPageSkin": 20,
        "wysiwyg.viewer.skins.page.ShinyIPageSkin": 20
    };

    function getNonAnchorableHeightForSkin(compSkin, compStyle){
        if (_.isFunction(NON_ANCHORABLE_HEIGHT[compSkin])) {
            return NON_ANCHORABLE_HEIGHT[compSkin](compStyle);
        }
        return NON_ANCHORABLE_HEIGHT[compSkin] || 0;
    }

    return {
        getNonAnchorableHeightForSkin: getNonAnchorableHeightForSkin
    };
});
