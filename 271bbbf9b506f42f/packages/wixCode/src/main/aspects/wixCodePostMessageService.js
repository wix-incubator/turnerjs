define([
    'lodash',
    'pmrpc',
    'tpa',
    'utils',
    'wixCode/handlers/wixCodeHandlers',
    'wixCode/services/wixCodeAppsAPIService',
    'wixCode/utils/constants',
    'wixCode/utils/messageBuilder',
    'wixCode/utils/wixCodeWidgetService',
    'widgets'
], function(_,
            rpc,
            tpa,
            utils,
            wixCodeHandlers,
            wixCodeAppsAPIService,
            constants,
            messageBuilder,
            wixCodeWidgetService,
            widgets) {
    'use strict';

    function isWixCodeMessage(msgIntent) {
        return msgIntent === constants.MESSAGE_INTENT.WIX_CODE_MESSAGE;
    }

    function isWixCodeSiteAPIMessage(msgIntent) {
        return msgIntent === constants.MESSAGE_INTENT.WIX_CODE_SITE_API;
    }

    function isWixCodeAppAPI(msgIntent) {
        return msgIntent === constants.MESSAGE_INTENT.WIX_CODE_APP_API;
    }

    function getWidgetHandler(siteAPI) {
        return widgets.widgetService.getWidgetHandler(siteAPI);
    }

    function handleWixCodeMessage(siteAPI, msg, callback) {
        var widgetHandler = getWidgetHandler(siteAPI);
        switch (msg.type) {
            case constants.MESSAGE_TYPE.IFRAME_COMMAND:
                widgetHandler.onCommand(msg, callback); // TODO: use handleRemoteMessage instead
                break;
            case constants.MESSAGE_TYPE.CONSOLE:
                utils.logWixCodeConsoleMessage(msg);
                break;
            case constants.MESSAGE_TYPE.GOOGLE_ANALYTICS:
                utils.logger.reportGoogleAnalytics.apply(null, [siteAPI.getSiteData()].concat(msg.data));
                break;
            default:
                widgetHandler.handleRemoteMessage(msg);
                break;
        }
    }

    function handleAppAPIMessage(siteAPI, msg, callback) {
        var compId = _.get(msg.data, 'compId');
        var comp = siteAPI.getComponentById(compId);
        if (comp) {
            switch (msg.type) {
                case 'invokeAppFn':
                    wixCodeAppsAPIService.invokeAppFunctionFor(compId, msg.data.fn, msg.data.fnArgs, callback);
                    break;
                case 'getAppAPI':
                    rpc.api.get({
                        appId: compId, initiator: compId + 'iframe'
                    }).then(function (api) {
                        wixCodeAppsAPIService.setAppAPI(compId, api);
                        callback(Object.keys(api));
                    });

                    var iframe = comp.getIframe();
                    if (iframe) {
                        tpa.common.tpaPostMessageCommon.callPostMessage(iframe, {
                            getAPI: true, compId: compId
                        });
                    } else {
                        throw new Error('No iframe found for component', comp);
                    }
                    break;
                default:
                    break;
            }
        } else {
            throw new Error('No component found for message', msg.data);
        }

    }

    function onMessage(siteAPI, message, handler) {
        try {
            if (_.isString(message)) {
                message = JSON.parse(message);
            }
        } catch (e) {
            return;
        }

        if (message) {
            if (isWixCodeMessage(message.intent)) {
                handler(message, generateResponseFunction(message, getWidgetHandler(siteAPI)));
            } else if (isWixCodeSiteAPIMessage(message.intent)) {
                var handlers = _.assign({}, tpa.tpaHandlers, wixCodeHandlers);
                if (handlers[message.type]) {
                    handlers[message.type](siteAPI, message, generateResponseFunction(message, getWidgetHandler(siteAPI)));
                }
            } else if (isWixCodeAppAPI(message.intent)) {
                handleAppAPIMessage(siteAPI, message, generateResponseFunction(message, getWidgetHandler(siteAPI)));
            }
        }
    }

    function generateResponseFunction(msg, widgetHandler) {
        return function (data) {
            var message = {
                intent: 'WIX_CODE_RESPONSE',
                callbackId: msg.callbackId,
                type: msg.type,
                contextId: msg.contextId
            };

            if (isWixCodeSiteAPIMessage(msg.intent) || isWixCodeAppAPI(msg.intent)) {
                message = _.merge(message, {
                    result: data
                });
            } else {
                message = _.merge(message, {
                    result: {
                        compName: msg.compName,
                        command: msg.command
                    }
                });
            }
            try {
                widgetHandler.updateComponent(message);
            } catch (e) {
                //TODO - log the error
            }
        };
    }

    function handleMessage(siteAPI, message, handler) {
        onMessage(siteAPI, message, handler || _.partial(handleWixCodeMessage, siteAPI));
    }

    function modifyPostMessage(siteAPI, messageData) {
        var siteData = siteAPI.getSiteData();
        var wixCodeModel = siteData.rendererModel.wixCodeModel;
        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(siteData.rendererModel.clientSpecMap);

        return messageBuilder.getExtendedMessage(messageData, wixCodeModel, wixCodeSpec, siteData);
    }

    function registerMessageHandler(siteAPI, handler) {
        widgets.widgetService.registerWidgetMessageHandler(siteAPI, _.partial(handler, siteAPI));
    }

    function registerMessageModifier(siteAPI, modifier) {
        widgets.widgetService.registerWidgetMessageModifier(siteAPI, _.partial(modifier, siteAPI));
    }

    return {
        handleMessage: handleMessage,
        modifyPostMessage: modifyPostMessage,
        registerMessageHandler: registerMessageHandler,
        registerMessageModifier: registerMessageModifier
    };
});
