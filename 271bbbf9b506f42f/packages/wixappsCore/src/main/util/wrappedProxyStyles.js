define(["lodash"], function (_) {
    'use strict';

    var propertiesToOmit = ["padding", "margin", "border", "top", "left", "right", "bottom", "visibility"];

    function shouldOmitProperty(key) {
        return _.some(propertiesToOmit, function (property) {
            return _.includes(key, property);
        });
    }

    /** @class wixappsCore.wrappedProxyStyles */
    return {
        getWrapperCssClass: function (wrapperStyles) {
            var isFlexed = _.some(wrapperStyles, function (value, key) {
                return _.includes(key, "flex");
            });
            return isFlexed ? "flex_display" : "";
        },

        getProxyStyles: function (wrapperStyles) {
            return _.mapValues(wrapperStyles, function (value, key) {
                if (shouldOmitProperty(key)) {
                    return null;
                }
                return value;
            });
        }
    };
});
