define(['lodash'],
    function (_) {
        'use strict';
        return {
            keyvalue: function (propertyName, stringifier) {
                return function (style, item) {
                    style[propertyName] = stringifier(item);
                    return style;
                };
            },

            map: function (map) {
                return function (style, item) {
                    return _(map)
                        .mapValues(function (stringifier) { return stringifier(item); })
                        .merge(style)
                        .value();
                };
            }
        };
    }
);
