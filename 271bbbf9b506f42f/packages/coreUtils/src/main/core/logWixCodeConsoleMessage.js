define(['lodash', 'coreUtils/core/windowGlobal'], function (_, window) {
    'use strict';

    var WIX_CODE_INTENT = 'WIX_CODE';
    var WIX_CODE_CONSOLE_MESSAGE_TYPE = 'console';

    function isPreview() {
        return window.parent && window.parent !== window;
    }

    function isWixCodeConsoleMessage(msg) {
        return msg.intent === WIX_CODE_INTENT && msg.type === WIX_CODE_CONSOLE_MESSAGE_TYPE;
    }

    function convertToWixCodeConsoleMessage(msg) {
        return {
            intent: WIX_CODE_INTENT,
            type:WIX_CODE_CONSOLE_MESSAGE_TYPE,
            data: {
                logLevel: 'INFO',
                args: [msg]
            }
        };
    }

    function logWixCodeConsoleMessage(msg) {
        if (!msg) {
            return;
        }

        if (_.isString(msg)) {
            msg = convertToWixCodeConsoleMessage(msg);
        }

        if (isWixCodeConsoleMessage(msg) && isPreview()) {
            window.parent.postMessage(JSON.stringify(msg), '*');
        }
    }

    return logWixCodeConsoleMessage;
});
