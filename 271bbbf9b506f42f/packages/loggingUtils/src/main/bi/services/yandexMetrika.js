define(['lodash'], function(_){
    'use strict';

    var YANDEX_CALLBACKS = "yandex_metrika_callbacks";
    var scriptLoaded = false;
    var yandexGlobalProp;

    function isValidAccountId(params) {
        return _.isArray(params) && _.isFinite(parseInt(params[0], 10));
    }

    function setYandexGlobalProp(id) {
        yandexGlobalProp = 'yaCounter' + id;
    }

    function addYandexCounterCallbacks (accountId) {
        (window[YANDEX_CALLBACKS] = window[YANDEX_CALLBACKS] || []).push(function() {
            try {
                window[yandexGlobalProp] = new window.Ya.Metrika(getYandexAccountParams(accountId));
            } catch (e) {
                // external Yandex code in try block
            }
        });
    }

    function loadScript() {
        if (!scriptLoaded) {
            var firstScriptElem = window.document.getElementsByTagName("script")[0];
            var newScriptElem = window.document.createElement("script");

            newScriptElem.type = "text/javascript";
            newScriptElem.async = true;
            newScriptElem.src = "https://mc.yandex.ru/metrika/watch.js";
            newScriptElem.addEventListener('load', function () {
                scriptLoaded = true;
            });

            firstScriptElem.parentNode.insertBefore(newScriptElem, firstScriptElem);
        }
    }

    function getYandexAccountParams (accountId) {
        return {
            id: parseInt(accountId, 10),
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            trackHash: true
        };
    }

    return {
        initialize: function (accountParams) {
            if (!isValidAccountId(accountParams)) {
                return;
            }

            setYandexGlobalProp(accountParams[0]);
            addYandexCounterCallbacks(accountParams[0]);
            loadScript();
        },

        reportPageHit: function (url) {
            if (!scriptLoaded) {
                return;
            }

            if (window[yandexGlobalProp] && _.isFunction(window[yandexGlobalProp].hit)) {
                window[yandexGlobalProp].hit(url);
            }
        }
    };
});
