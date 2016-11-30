define(['lodash'], function (_) {
    'use strict';

    /**
     * @class core.postMessageCompMixin
     */
    return {
        componentWillMount: function () {
            this.handlers = {};
        },
        componentWillUnmount: function () {
            _.forEach(this.handlers, function (handler, name) {
                this.clearPostMessageHandlerNamed(name);
            }, this);
        },
        setPostMessageHandler: function (id, callback) {
            this.setPostMessageHandlerNamed('default', id, callback);
        },
        setPostMessageHandlerNamed: function (name, id, callback) {
            if (this.handlers.hasOwnProperty(name)) {
                this.clearPostMessageHandlerNamed(name);
            }
            var handlerWrap = function (msg) {
                var msgData;

                try { // error handling for good JSON
                    msgData = JSON.parse(msg.data);
                } catch (ee) {
                    return;
                }

                if (msgData.id === id || (id === null && msgData.id === undefined)) {
                    callback(msgData);
                }
            };

            window.addEventListener('message', handlerWrap, false);

            this.handlers[name] = handlerWrap;
        },
        clearPostMessageHandlerNamed: function (name) {
            if (this.handlers[name]) {
                window.removeEventListener('message', this.handlers[name], false);
                delete this.handlers[name];
            }
        }
    };
});
