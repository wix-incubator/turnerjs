define([
        'lodash',
        'pmrpc',
        'documentServices/platform/services/sdkAPIService',
        'documentServices/platform/core/workerFactory',
        'documentServices/platform/core/messageFormatter',
        'documentServices/platform/common/constants',
        'documentServices/platform/services/platformAppDataGetter'],
    function (_, rpc, sdkAPIService, workerFactory, messageFormatter, constants, platformAppDataGetter) {
        'use strict';

        var _appsContainer;
        var _editorAPI;

        var messageQueue = [];
        var isWorkerReadyToReceiveMessages = false;

        function didMessageArriveFromWorker(event) {
            return event.source === _appsContainer.contentWindow;
        }

        function handleMessageFromWorker(ps, event) {
            if (didMessageArriveFromWorker(event)) {
                switch (event.data.type) {
                    case constants.MessageTypes.WORKER_ALIVE:
                        rpc.api.set(constants.AppIds.EDITOR, sdkAPIService.getAPIForSDK(_editorAPI));
                        rpc.api.sendTo(constants.AppIds.EDITOR, _appsContainer);
                        break;
                    case constants.MessageTypes.SDK_READY:
                        isWorkerReadyToReceiveMessages = true;
                        _.forEach(messageQueue, sendMessageToWorker);
                        break;
                    case constants.MessageTypes.SET_MANIFEST:
                        var appDefinitionId = _.get(platformAppDataGetter.getAppDataByApplicationId(ps, event.data.applicationId), 'appDefinitionId');
                        var appManifestPointer = ps.pointers.platform.getAppManifestPointer(appDefinitionId);
                        ps.dal.full.set(appManifestPointer, event.data.manifest);
                        if (event.data.manifest.exports) {
                            _editorAPI.controllers.setTypes('', event.data.manifest.exports);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        function init(ps, api) {
            _editorAPI = api;

            var appsContainerUrl = workerFactory.getAppsContainerUrl(ps);
            _appsContainer = workerFactory.createWorkerIframe('workerIframe', appsContainerUrl, handleMessageFromWorker.bind(this, ps));
        }

        function sendMessageToWorker(message) {
            _appsContainer.contentWindow.postMessage(message, '*');
        }

        function sendMessageToWorkerWhenPossible(message) {
            if (isWorkerReadyToReceiveMessages) {
                sendMessageToWorker(message);
            } else {
                messageQueue.push(message);
            }
        }

        function triggerEvent(applicationId, options) {
            sendMessageToWorkerWhenPossible(messageFormatter.triggerEvent(applicationId, options));
        }

        function addApps(apps) {
            sendMessageToWorkerWhenPossible(messageFormatter.addApps(apps));
        }

        function addApp(app) {
            sendMessageToWorkerWhenPossible(messageFormatter.addApp(app));
        }


        return {
            init: init,

            triggerEvent: triggerEvent,
            addApp: addApp,
            addApps: addApps
        };
    });
