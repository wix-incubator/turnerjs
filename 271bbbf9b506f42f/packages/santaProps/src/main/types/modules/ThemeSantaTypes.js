define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var allTheme = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.getAllTheme();
    });

    var themeColor = applyFetch(React.PropTypes.array, function (state) {
        return state.siteData.getAllTheme().THEME_DATA.color;
    });

    var colorsMap = applyFetch(React.PropTypes.array, function (state) {
        return state.siteData.getColorsMap();
    });

    var THEME_DATA = applyFetch(React.PropTypes.array, function (state) {
        return state.siteData.getAllTheme().THEME_DATA;
    });

    return {
        all: allTheme,
        colors: themeColor,
        colorsMap: colorsMap,
        THEME_DATA: THEME_DATA
    };

});
