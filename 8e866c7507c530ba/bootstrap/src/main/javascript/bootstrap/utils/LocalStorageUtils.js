define.utils("LocalStorageUtils", function () {
    'use strict';

    var ls = null;
    /**
     * Surrounding with a try-catch because on some versions of IE, and in case third party cookies are blocked, localStorage may be unavailable.
     * window.sessionStorage is sometimes still accessible, and therefore assigned in case it breaks on window.localStorage.
     * In case they both break, a mock object is set as localStorage, just so that it doesn't break the rendering of the editor/viewer. The API will be useless in this case and will throw errors.
     */
    try {
        ls = window.localStorage;
    }

    catch (e) {
        var windowEnvironment = window && (window.self === window.top ? 'topframe' : 'iframe') || '"window" is undefined';

        try {
            ls = window.sessionStorage;

            LOG.reportError(wixErrors.NO_ACCESS_TO_LOCAL_STORAGE, '', '', {p1: windowEnvironment});
        }
        catch (e){
            LOG.reportError(wixErrors.NO_ACCESS_TO_LOCAL_AND_SESSION_STORAGE, '', '', {p1: windowEnvironment});
            ls = {};
        }

    }

    finally {
        return {
            /**
             * remove all key/value pairs from the local storage
             */
            clear: function () {
                ls.clear();
            },

            /**
             * returns the number of key/value pairs currently present in the local storage
             */
            getLength: function() {
                return ls.length;
            },

            /**
             * retrive a key from the local storage
             * @param {String} key
             * @returns {Object}
             */
            getItem: function (key) {
                if (!key) {
                    throw "LocalStorageUtils:: Invalid key provided.";
                }
                var raw = ls.getItem(key);
                return JSON.parse(raw);
            },

            /**
             * save an object to the local storage under the given key
             * @param {String} key
             * @param {Object} data
             */
            setItem: function (key, data) {
                if (!key) {
                    throw "LocalStorageUtils:: Invalid key provided.";
                }
                var raw = JSON.stringify(data);
                ls.setItem(key, raw);
            },

            /**
             * remove a key from the local storage
             * @param {String} key
             */
            removeItem: function (key) {
                if (!key) {
                    throw "LocalStorageUtils:: Invalid key provided.";
                }
                ls.removeItem(key);
            }
        };
    }

});
