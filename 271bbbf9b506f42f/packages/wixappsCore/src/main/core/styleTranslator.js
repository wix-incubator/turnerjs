define(['lodash'], function (_) {
    'use strict';
    var flexDirectionMap = {
        'horizontal': 'row',
        'vertical': 'column'
    };

    var alignDirectionMap = {
        'start': 'flex-start',
        'end': 'flex-end'
    };

    var invertedAlignDirectionMap = _.invert(alignDirectionMap);

    var alignPropMap = {
        'top': 'start',
        'middle': 'center',
        'bottom': 'end',
        'left': 'start',
        'right': 'end'
    };

    var justifyContentMap = {
        'start': 'flex-start',
        'end': 'flex-end'
    };

    function translateFlexDirection(value) {
        return {
            'WebkitBoxOrient': value,
            'WebkitFlexDirection': flexDirectionMap[value] || value,
            'msFlexDirection': flexDirectionMap[value] || value,
            'flexDirection': flexDirectionMap[value] || value
        };
    }

    function getFlexValue(value, orientation) {
        var isOnlyFlexGrow = String(value).split(' ').length === 1;

        // make sure no flex always returns none
        if (value === 'none' || value === '0' || value === 0 || value === '') {
            return 'none';
        } else if (isOnlyFlexGrow && orientation === 'vertical') {
            // in IE the default basis for flex is 0px.
            // IE needs 0px for children of HBoxes
            // when orientation is horizontal use the default to get IE to use 0px and other to keep the auto
            // add shrink:1 because it's the default value in all browsers
            return value + ' 1 auto';
        }

        return value;
    }

    function translateBoxFlex(value, orientation) {
        var flex = getFlexValue(value, orientation);
        return {
            //'-webkit-box-flex': value === 'none' ? 0 : value,
            //'-moz-box-flex': value === 'none' ? 0 : value,
            'minWidth': 0,
            'WebkitFlex': flex,
            'msFlex': flex,
            'flex': flex
        };
    }

    var propMap = {
        'flex-direction': translateFlexDirection,
        'box-orient': translateFlexDirection,

        'box-flex': translateBoxFlex,
        'flex': translateBoxFlex,

        'align-items': function (value) {
            return {
                'WebkitAlignItems': alignDirectionMap[value] || value,
                'msFlexAlign': invertedAlignDirectionMap[value] || value,
                'align-items': alignDirectionMap[value] || value,
                'align-self': alignDirectionMap[value] || value
            };
        },

        'box-align': function (value) {
            value = alignPropMap[value] || value;

            return {
                'WebkitBoxAlign': alignDirectionMap[value] || value,
                'WebkitAlignItems': alignDirectionMap[value] || value,
                'MozBoxAlign': alignDirectionMap[value] || value,
                'msFlexAlign': value,
                'alignItems': alignDirectionMap[value] || value,
                'boxAlign': alignDirectionMap[value] || value
            };
        },

        'justify-content': function (value) {
            return {
                'justifyContent': justifyContentMap[value] || value,
                'WebkitJustifyContent': justifyContentMap[value] || value,
                'MozJustifyContent': justifyContentMap[value] || value,
                'msFlexPack': value,
                'msJustifyContent': justifyContentMap[value] || value
            };
        },

        'box-shadow': function (value) {
            return {
                'WebkitBoxShadow': value,
                'MozBoxShadow': value,
                'boxShadow': value
            };
        },

        'border-radius': function (value) {
            return {
                'WebkitBorderRadius': value,
                'MozBorderRadius': value,
                'borderRadius': value
            };
        }
    };

    function capitalizeCssKey(cssKey) {
        return cssKey.replace(/-([a-z])/ig, function (all, letter) {
            return letter.toUpperCase();
        });
    }

    function translateStyle(style, orientation) {
        return _.transform(style, function (result, value, cssKey) {
            var rec = propMap[cssKey];
            if (rec) {
                _.merge(result, rec(value, orientation));
            } else {
                result[capitalizeCssKey(cssKey)] = value;
                result[capitalizeCssKey(cssKey)] = value;
            }
        }, {});
    }

    /**
     * @class wixappsCore.styleTranslator
     */
    return {
        translate: translateStyle
    };
});
