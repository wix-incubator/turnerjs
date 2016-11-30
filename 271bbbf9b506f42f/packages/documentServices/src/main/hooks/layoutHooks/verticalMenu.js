define(['lodash', 'documentServices/component/component', 'documentServices/component/componentStylesAndSkinsAPI', 'documentServices/theme/theme', 'documentServices/menu/menu'], function (_, component, componentStylesAndSkinsAPI, theme, menu) {
    'use strict';

    var separatorNotIncludedInLineHeight = [
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonFixedWidthSkin',
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin',
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSolidColorSkin'
    ];
    var borderNotIncludedInLineHeight = [
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonFixedWidthSkin',
        'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin'
    ];

    function getOriginalHeight(compHeight, separatorHeight, length, skinExports) {
        var ignoreBorder = skinExports && skinExports.borderNotIncludedInLineHeight;
        var ignoreSeparator = skinExports && skinExports.separatorNotIncludedInLineHeight;
        return compHeight - separatorHeight * (ignoreBorder ? 1 : length) - (ignoreSeparator ? 2 : 0);
    }

    function getSeparatorHeight(style) {
        return parseInt(style.style.properties.sepw || style.style.properties.separatorHeight || 0, 10);
    }

    function getSkinExports(style) {
        return {
            separatorNotIncludedInLineHeight: _.includes(separatorNotIncludedInLineHeight, style.skin),
            borderNotIncludedInLineHeight: _.includes(borderNotIncludedInLineHeight, style.skin)
        };
    }

    return function (ps, compPointer, newLayout) {
        if (_.isUndefined(newLayout.height)) {
            return;
        }
        var oldLayout = component.layout.get(ps, compPointer);
        if (oldLayout.height === newLayout.height) {
            return;
        }
        var styleId = componentStylesAndSkinsAPI.style.getId(ps, compPointer);
        var style = theme.styles.get(ps, styleId);

        var separatorHeight = getSeparatorHeight(style);
        var itemsCount = _.filter(menu.getMenu(ps), 'isVisible').length;
        var skinExports = getSkinExports(style);

        var originalHeight = getOriginalHeight(newLayout.height, separatorHeight, itemsCount, skinExports);

        component.properties.update(ps, compPointer, {originalHeight: originalHeight});
    };
});