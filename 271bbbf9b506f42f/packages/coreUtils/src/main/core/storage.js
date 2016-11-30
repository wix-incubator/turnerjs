/**
 * Created by Dan_Shappir on 11/3/14.
 */
define([], function () {
    'use strict';

    /**
     *
     * @param win
     * @returns {{local: (.requestModel.localStorage|*|exports.browser.localStorage|defaultSiteModel.requestModel.localStorage|Storage|localStorage), session: (exports.browser.sessionStorage|*|Storage|defined.sessionStorage|sessionStorage)}}
     */
    function init(win) {
        win = win || {};

        function Storage() {
        }

        // Missing definitions for length and key
        Storage.prototype = {
            getItem: function (key) {
                return key in this ? this[key] : null;
            },
            setItem: function (key, value) {
                this[key] = value + '';
            },
            removeItem: function (key) {
                delete this[key];
            },
            clear: function () {
                for (var p in this) {
                    if (this.hasOwnProperty(p)) {
                        delete this[p];
                    }
                }
            }
        };

        function canUse(name) {
            var unique = 'testStorage' + Date.now();
            try {
                var storage = win[name];
                storage.setItem(unique, unique);
                var value = storage.getItem(unique);
                storage.removeItem(unique);
                if (value !== unique) {
                    throw "not equal";
                }
            } catch (e) {
                return false;
            }
            return true;
        }

        return {
            local: canUse('localStorage') ? win.localStorage : new Storage(),
            session: canUse('sessionStorage') ? win.sessionStorage : new Storage()
        };
    }

    /**
     *
     * @exports utils/util/storage
     */
    return init;
});
