define(['lodash'], function (_) {
    'use strict';
    var loadedFonts = [];

    return {
        set: function (fonts) {
            loadedFonts = _.union(loadedFonts, fonts);
        },
        get: function () {
            return _.clone(loadedFonts);
        }
    };
});
