/**
 * Created by eitanr on 6/17/14.
 */
define(['lodash', 'coreUtils/core/urlUtils'], function (_, urlUtils) {
    'use strict';
    var ajaxFn = function () {
        throw 'must register ajax function: zepto $.ajax for clientSide, or request() for serverSide';
    };

    function register(ajaxMethod) {
        if (typeof ajaxMethod !== 'function') {
            throw 'ajaxMethod must be a function';
        }
        ajaxFn = ajaxMethod;
    }


    var JSONPcallbacks;
    var counter = 0;

    function getCallbackName() {
        return 'jsonpcallback' + (++counter);
    }

    var JSONPcallbackMapName = 'JSONPcallbacks_' + (new Date().getTime()).toString(36);


    function jsonp(options) {
        var script = window.document.createElement('script');
        var callbackName = getCallbackName();

        JSONPcallbacks[callbackName] = function () {
            options.complete.apply(options.context, arguments);
            delete JSONPcallbacks[callbackName];
        };

        script.onerror = function() {
            if (_.isFunction(JSONPcallbacks[callbackName])) {
                JSONPcallbacks[callbackName](null, {success: false});
            }
        };

        var src = options.url + '?callback=' + JSONPcallbackMapName + '.' + callbackName + '&accept=jsonp' + (options.data && !_.isEmpty(options.data) ? '&' + urlUtils.toQueryString(options.data) : '');
        script.src = src;
        window.document.getElementsByTagName('head')[0].appendChild(script);
    }

    return {
        register: register,
        enableJsonpHack: function () {
            JSONPcallbacks = window[JSONPcallbackMapName] = {};
        },
        ajax: function (options) {
            if (options.type === 'POST' && options.dataType === 'json' && _.isObject(options.data)) {
                _.assign(options, {
                    data: JSON.stringify(options.data),
                    contentType: options.contentType || 'application/json; charset=utf-8',
                    processData: false
                });
            }
            return ajaxFn(options);
        },
        get: function (url, data, success, dataType) {
            if (typeof url === 'object') {
                return ajaxFn(url);
            }

            var options = {
                url: url
            };
            if (data) {
                options.data = data;
            }
            if (success) {
                options.success = success;
            }
            if (dataType) {
                options.dataType = dataType;
            }
            return ajaxFn(options);
        },
        temp_jsonp: function (options) {
            if (!JSONPcallbacks) {
                throw 'jsonp hack is not enabled!';
            }
            jsonp(options);
        }
    };
});
