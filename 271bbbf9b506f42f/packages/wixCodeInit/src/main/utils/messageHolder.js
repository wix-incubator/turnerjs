define([], function() {
    'use strict';

    function getMessageHolder() {
        var messageQueue = [];
        var messageTargetCallback = null;
        return {
            sendOrHoldMessage: function(message) {
                if (!messageTargetCallback) {
                    messageQueue.push(message);
                } else {
                    messageTargetCallback(message);
                }
            },
            setMessageTarget: function(callback) {
                messageTargetCallback = callback;
                while (messageQueue.length > 0) {
                    messageTargetCallback(messageQueue.shift());
                }
            }
        };
    }

    return {
        get: getMessageHolder
    };
});
