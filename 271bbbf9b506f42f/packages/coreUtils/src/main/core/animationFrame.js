/**
 * Created by dansh on 10/9/14
 *
 * shim for window.requestAnimationFrame and window.cancelAnimationFrame
 */
define(function () {
    'use strict';

    // In case we're not running in the browser
    var win = typeof window !== 'undefined' ? window : {};

    var raf = win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame ||
        function(/* function */ callback) {
            return setTimeout(callback, 1000 / 60);
        };

    var caf = win.cancelAnimationFrame ||
        win.webkitCancelAnimationFrame ||
        win.mozCancelAnimationFrame ||
        win.oCancelAnimationFrame ||
        win.msCancelAnimationFrame ||
        clearTimeout;

    return {
        /**
         *
         * @param {function()} callback
         * @returns {number}
         */
        request: function () {
            return raf.apply(win, arguments);
        },
        /**
         * @param {number} id
         */
        cancel: function () {
            return caf.apply(win, arguments);
        }
    };
});
