define(['lodash'], function (_) {
    'use strict';

    function getFixedHeight(originalHeight, separator, separatorNotIncluded, borderNotIncluded, menuItemsCount) {
        return originalHeight + (borderNotIncluded ? 1 : menuItemsCount) * separator + (separatorNotIncluded ? 2 : 0);
    }

    function getLineHeight(itemHeight, separator, border, skinExports) {
        var borderNotIncludedInLineHeight = skinExports && skinExports.borderNotIncludedInLineHeight;
        var separatorNotIncludedInLineHeight = skinExports && skinExports.separatorNotIncludedInLineHeight;

        var calcBorder = borderNotIncludedInLineHeight ? border * 2 : 0;
        var calcSeparator = separatorNotIncludedInLineHeight ? separator : 0;
        var lineHeight = itemHeight - calcBorder - calcSeparator;

        return lineHeight + 2;
    }

    function getItemHeight(compHeight, separatorHeight, length, skinExports) {
        var borderNotIncludedInLineHeight = skinExports && skinExports.borderNotIncludedInLineHeight;
        var separatorNotIncludedInLineHeight = skinExports && skinExports.separatorNotIncludedInLineHeight;

        return Math.floor((compHeight - separatorHeight * (borderNotIncludedInLineHeight ? 0 : length - 1) - (separatorNotIncludedInLineHeight ? 2 : 0)) / length);
    }

    function getVisibleItemsCount(siteMenu) {
        return _.filter(siteMenu, 'isVisible').length;
    }

    return {
        getFixedHeight: getFixedHeight,
        getLineHeight: getLineHeight,
        getItemHeight: getItemHeight,
        getVisibleItemsCount: getVisibleItemsCount
    };
});