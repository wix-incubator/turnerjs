/**
 * Created by Dan_Shappir on 11/11/14.
 */
define(['lodash'], function(_) {
    'use strict';

    var PREFIXES = ['Webkit', 'Moz', 'ms'];

    function prefix(styles) {
        return _.reduce(styles, function(prefixed, value, key) {
            prefixed[key] = value;
            key = _.capitalize(key);
            return PREFIXES.reduce(function(prefixedSoFar, pre) {
                prefixedSoFar[pre + key] = value;
                return prefixedSoFar;
            }, prefixed);
        }, {});
    }

    function unitize(value, unit) {
        if (typeof value === 'number') {
            unit = unit || 'px';
            value += unit;
        }
        return value;
    }

    function assignStyle(elem, src) {
        if (elem) {
            return _.assign(elem.style, src, function (u, v) {
                return unitize(v);
            });
        }
    }

    return {
        MAX_Z_INDEX: Math.pow(2, 31) - 1,

        /**
         *
         * @param {Object} styles
         * @param {Object} target
         * @returns {Object}
         */
        prefix: prefix,

        /**
         *  Get the correct prefixed CSS transform attribute for the current browser
         *  Based on Modernizr
         *  @returns {String}
         */
        getPrefixedTransform: function() {

            if (!this._prefixedTransform) {
                // if we are on server side rendering, don't look for document
                var el = {style: {transform: ''}};
                if (typeof document !== 'undefined') {
                    el = window.document.createElement('fakeelement');
                }

                var transforms = ['transform', 'WebkitTransform', 'MSTransform'];
                this._prefixedTransform = _.find(transforms, function(transform) {
                    return el.style[transform] !== undefined;
                });

            }
            return this._prefixedTransform;
        },

        /**
         *
         * @param {{number|string}} value
         * @param {?string} unit
         * @returns {string}
         */
        unitize: unitize,

        /**
         * Assign new size to HTML element
         * @param {Object} elem
         * @param {{number|string}} width
         * @param {{number|string}} height
         */
        assignStyle: assignStyle
    };
});
