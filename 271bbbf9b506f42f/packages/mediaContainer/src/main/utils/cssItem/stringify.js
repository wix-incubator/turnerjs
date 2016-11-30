define(['lodash', 'mediaContainer/utils/cssItem/cssToken'],
    function (_, CSSToken) {
        'use strict';

        var Stringify = {
            value: function (schema) {
                return function (cssItem) {
                    return _(cssItem)
                        .keys()
                        .filter(_.partial(_.has, schema))
                        .map(function (key) {
                            return stringifiers[schema[key]](cssItem[key], key);
                        })
                        .without('')
                        .join(' ');
                };
            },

            join: function (item) {
                return _(item).values().join(' ');
            },

            list: function (stringifier) {
                return function (items) {
                    return _.map(items, stringifier).join(', ');
                };
            }
        };

        var stringifiers = {};

        stringifiers[CSSToken.KEYWORD] = function (value, key) {
            if (value) {
                return key;
            }
            return '';
        };

        stringifiers[CSSToken.LENGTH_OR_PERCENTAGE] = function (measurement) {
            if (measurement.value === 0) {
                return '0';
            }
            return measurement.value.toString() + measurement.unit;
        };

        stringifiers[CSSToken.COLOR_RGBA] = function (color) {
            return 'rgba(' + color.red + ', ' + color.green + ', ' + color.blue + ', ' + color.alpha + ')';
        };

        stringifiers[CSSToken.BR_WIDTH] = function (width) {
            if (typeof width === 'string') {
                return width;
            }
            return stringifiers[CSSToken.LENGTH_OR_PERCENTAGE](width);
        };

        stringifiers[CSSToken.BORDER_WIDTH] = Stringify.value({
            top:    CSSToken.BR_WIDTH,
            right:  CSSToken.BR_WIDTH,
            bottom: CSSToken.BR_WIDTH,
            left:   CSSToken.BR_WIDTH
        });

        stringifiers[CSSToken.BORDER_STYLE] = Stringify.join;

        stringifiers[CSSToken.BORDER_COLOR] = Stringify.value({
            top:    CSSToken.COLOR_RGBA,
            right:  CSSToken.COLOR_RGBA,
            bottom: CSSToken.COLOR_RGBA,
            left:   CSSToken.COLOR_RGBA
        });

        return Stringify;
    }
);
