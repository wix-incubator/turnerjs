define(['lodash', 'zepto', 'bluebird'], function (_, $, Promise) {
    'use strict';

    var MSG_FROM_COMP = 'sdk-ping-pong-from-comp';
    var MSG_FROM_TEST = 'sdk-ping-pong-from-test';
    var FUNCTION_PREFIX = 'argFunc';

    function PingPong(compId) {
        this.id = compId;
        this.contentWindow = this.getContentWindow();
        this.requestCounter = 0;
        this.callbacks = {};
        this.listen();
        this.onReadyDeferred = Promise.pending();
        this.onReady = function (callback) {
            if (this.ready) {
                callback();
            } else {
                this.onReadyDeferred.promise.then(function () {
                    callback();
                });
            }
        };
        this.request('ready');

        return this;
    }

    PingPong.prototype.listen = function () {
        var self = this;
        var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

        eventer(messageEvent, function (e) {
            self.handleEvent(e.data);
        }, false);
    };

    PingPong.prototype.getContentWindow = function () {
        var $iframe = $('#' + this.id + 'iframe');
        if ($iframe[0] && $iframe[0].contentWindow) {
            return $iframe[0].contentWindow;
        }
        return null;
    };

    PingPong.prototype.handleEvent = function (e) {
        var event;
        try {
            event = JSON.parse(e);
        } catch (error) {
            return;
        }

        if (!_.isString(event.origin) || event.origin !== MSG_FROM_COMP) {
            return;
        }

        if (event.compId !== this.id || _.isUndefined(event.requestId)) {
            return;
        }

        if (event.requestId === 'ready') {
            this.ready = true;
            this.contentWindow = this.contentWindow || this.getContentWindow();
            this.onReadyDeferred.resolve();
        } else if (this.callbacks[event.requestId]) {
            if (event.callbackFunction) {
                if (_.isFunction(this.callbacks[event.requestId][event.callbackFunction])) {
                    setTimeout(function () {
                        this.callbacks[event.requestId][event.callbackFunction].apply(this, event.res);
                    }.bind(this), 0);
                }
            } else {
                setTimeout(function () {
                    this.callbacks[event.requestId].return.resolve(event.res);
                }.bind(this), 100);
            }
        }
    };

    PingPong.prototype.request = function () {
        var deferred = Promise.pending();

        var requestId = this.requestCounter++;

        this.callbacks[requestId] = {
            return: deferred
        };

        var msg = {
            origin: MSG_FROM_TEST,
            compId: this.id,
            toInvoke: arguments[0],
            requestId: requestId,
            args: []
        };

        for (var i = 1; i < arguments.length; i++) {
            if (_.isFunction(arguments[i])) {
                this.callbacks[requestId][FUNCTION_PREFIX + i] = arguments[i];
                msg.args.push(FUNCTION_PREFIX + i);
            } else {
                msg.args.push(arguments[i]);
            }
        }

        if (this.contentWindow || msg.toInvoke === 'ready') {
            this.contentWindow.postMessage(JSON.stringify(msg), '*');
        } else {
            console.error('component not yet ready');
            deferred.reject();
        }

        return deferred.promise;
    };

    PingPong.prototype.getDOMNode = function (selector) {
        var commandsArray = [
            "$('" + selector + "').clone().wrap('<div/>').parent().html();"
        ];
        return this.request('eval', commandsArray.join('\n'));
    };

    PingPong.prototype.injectDOM = function (content, parent) {
        parent = parent || 'body';
        content = btoa(content || '');
        var commandsArray = [
            "var DOMNode = $(atob('" + content + "'));",
            "DOMNode.appendTo(document." + parent + ");"
        ];
        return this.request('eval', commandsArray.join('\n'));
    };

    PingPong.prototype.injectScript = function (scripts) {
        scripts = _.isArray(scripts) ? scripts : [scripts];
        var injectAsyncScripts = '' +
            '(function(d){\n' +
                'var scriptsArray = ' + JSON.stringify(scripts) + ';\n' +
                'function injectScriptsArray(scriptsArray, index) {\n' +
                    'var current = scriptsArray[index];\n' +
                    'if (!current) {return;}\n' +
                    'current = typeof current === "string" ? {src: current} : current;\n' +
                    'current.parent = current.parent || "head";\n' +
                    'current.inline = current.inline || false;\n' +
                    'var scriptElement = d.createElement("script");\n' +
                    'scriptElement.type = "text/javascript";\n' +
                    'if (current.inline) {\n' +
                        'scriptElement.innerHTML = current.src;' +
                    '} else {\n' +
                        'scriptElement.async = true;\n' +
                        'scriptElement.src = current.src;\n' +
                    '}\n' +
                    'scriptElement.onload = function(){\n' +
                        'injectScriptsArray(scriptsArray, ++index);\n' +
                    '}\n' +
                    'd.getElementsByTagName(current.parent)[0].appendChild(scriptElement);\n' +
                '}\n' +
                'injectScriptsArray(scriptsArray, 0);\n' +
            '}(document))'
        return this.request('eval', injectAsyncScripts);
    };

    return PingPong;
});
