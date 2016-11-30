define([
    'wixCodeInit/utils/urlBuilder',
    'wixCodeInit/utils/messageHolder',
    'wixCodeInit/utils/iFrameUtils',
    'wixCodeInit/utils/widgetsPreLoader',
    'wixCodeInit/utils/specMapUtils'
], function(urlBuilder, messageHolder, iFrameUtils, widgetPreLoader, specMapUtils) {
    'use strict';

    function isAppReadyMessage(message) {
        return message.intent === 'WIX_CODE' && message.type === 'wix_code_iframe_loaded';
    }

    function addIFrameToDOM(iFrame) {
        if (window.document.readyState !== 'loading') {
            window.document.body.appendChild(iFrame);
        } else {
            window.document.addEventListener('DOMContentLoaded', function() {
                window.document.body.appendChild(iFrame);
            });
        }
    }


    /**
     * @returns {{init: function, sendMessage: function, registerMessageHandler: function}}
     */
    function getAppApi() {
        var appMsgHandlers = [];
        var appMsgModifiers = [];
        var msgToAppHolder = messageHolder.get();
        var alreadyInitiated = false;
        var isFirstMessageToApp = true;
        var preLoadMessage = null;
        var preInitMessage = null;

        function handleIFrameMessages(iFrame, messageEvent) {
            if (!iFrameUtils.isIFrameEvent(iFrame, messageEvent)) {
                return;
            }
            // handle ready message
            if (isAppReadyMessage(messageEvent.data)) {
                msgToAppHolder.setMessageTarget(function(message) {
                    iFrame.contentWindow.postMessage(message, '*');
                });
            }
            // forward message to all registered handlers
            appMsgHandlers.forEach(function(handlerCallback) {
                handlerCallback(messageEvent.data);
            });
        }

        function init(siteModel, clientSpecMap, options) {
            if (alreadyInitiated) {
                console.warn('Wix code is already initiated'); //eslint-disable-line no-console
                return;
            }
            var wixCodeAppSpec = specMapUtils.getAppSpec(clientSpecMap);
            if (wixCodeAppSpec) {
                var appUrl = urlBuilder.buildUrl(siteModel, wixCodeAppSpec, options);
                var appIFrame = iFrameUtils.getIFrameForApp(appUrl, wixCodeAppSpec);
                var messageHandler = handleIFrameMessages.bind(null, appIFrame);
                window.addEventListener('message', messageHandler, false);
                addIFrameToDOM(appIFrame);
                alreadyInitiated = true;
            }
        }

        function registerMessageHandler(callback) {
            appMsgHandlers.push(callback);
        }

        function registerMessageModifier(callback) {
            appMsgModifiers.push(callback);
        }

        function applyMessageModifications(message) {
            var modifiedMessage = message;

            //no lodash, no reduce so back to mutating basics
            appMsgModifiers.forEach(function(modifier) {
                modifiedMessage = modifier(modifiedMessage);
            });

            return modifiedMessage;
        }

        function sendMessageToApp(message) {
            // TODO: add intent & scari
            if (isFirstMessageToApp) {
                message = preLoadMessage ? widgetPreLoader.filterPreLoadedWidgets(preLoadMessage, message) : message;
            }
            if (message) {
                msgToAppHolder.sendOrHoldMessage(applyMessageModifications(message));
            }
            isFirstMessageToApp = false;
        }

        function preLoadWidgets(siteModel, currentUrl) {
            var wixCodeAppSpec = specMapUtils.getAppSpec(siteModel.rendererModel.clientSpecMap);
            if (isFirstMessageToApp && !preLoadMessage && wixCodeAppSpec) {
                widgetPreLoader.asyncGetPreLoadMessage(siteModel, currentUrl, function (message) {
                    if (isFirstMessageToApp && !preLoadMessage) {
                        preLoadMessage = message;
                        msgToAppHolder.sendOrHoldMessage(preLoadMessage);
                    }
                });
            }
        }

        function preInitWidgets(siteData, currentUrl) {
            var wixCodeAppSpec = specMapUtils.getAppSpec(siteData.rendererModel.clientSpecMap);
            if (isFirstMessageToApp && !preInitMessage && wixCodeAppSpec) {
                widgetPreLoader.asyncGetPreInitMessage(siteData, currentUrl, function (message) {
                    if (isFirstMessageToApp && !preInitMessage) {
                        preInitMessage = message;
                        msgToAppHolder.sendOrHoldMessage(preInitMessage);
                    }
                });
            }
        }

        return {
            init: init,
            sendMessage: sendMessageToApp,
            registerMessageHandler: registerMessageHandler,
            registerMessageModifier: registerMessageModifier,
            preLoadWidgets: preLoadWidgets,
            preInitWidgets: preInitWidgets
        };
    }

    return {
        getApi: getAppApi
    };
});
