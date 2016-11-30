define(['wixappsCore', 'documentServices/theme/theme'], function (wixappsCore, theme) {
    'use strict';

    var COMPONENT_TYPE_RICH_TEXT = 'wysiwyg.viewer.components.WRichText';

    function getStyle(ps, compView) {
        if (getCompProxyClass(compView).componentType === COMPONENT_TYPE_RICH_TEXT) {
            return compView.comp.style;
        }

        return wixappsCore.styleData.getSkinAndStyle(
                theme.styles.getAll(ps),
                compView.comp.name,
                compView.comp.styleNS,
                compView.comp.style,
                compView.comp.skin
            ).styleId || null;
    }

    function getCompProxyClass(viewDef) {
        var proxyName = viewDef.comp.name;
        return wixappsCore.proxyFactory.getProxyClass(proxyName, true);
    }

    return {
        getStyle: getStyle,
        getCompProxyClass: getCompProxyClass
    };
});
