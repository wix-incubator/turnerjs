define(['lodash', 'react', 'fonts', 'core/fonts/FontRulersContainer'], function (_, React, /** fonts */ fonts, FontRulersContainerClass) {
    'use strict';

    var fontRulersContainer = React.createFactory(FontRulersContainerClass);

    function getRulersNode(fontsList, siteData, onLoadCallback, ref){
        return fontRulersContainer({
            fontsList: fontsList,
            siteData: siteData,
            onLoadCallback: onLoadCallback,
            ref: ref,
            key: ref
        });
    }

    function getFontsLoaderNode(renderedRootIds, siteData, callBack, ref) {
        var renderedFonts = _.map(renderedRootIds, function(rootId){
            return fonts.fontUtils.getPageUsedFontsList(siteData, rootId);
        });
        return this.getRulersNode(_.union.apply(_, renderedFonts), siteData, callBack, ref);
    }

    return {
        getRulersNode: getRulersNode,
        getFontsLoaderNode: getFontsLoaderNode
    };
});
