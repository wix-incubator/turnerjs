var reporter = require('./reporter');

self.appsAPI = {};
var PLATFORM_INTENT = 'PLATFORM_WORKER';

function initialize() {
    //TODO - get sdk url from topology
    var libs = [
        'http://static.parastorage.com/services/js-platform-editor-sdk/1.44.0/lib/editorSDK.min.js'
        // 'http://localhost:3200/assets/editorSDK.js'
    ];

    libs.forEach(function (lib) {
        this.importScripts(lib);
    }, self);
    self.editorSDK
        .__init(onAPILoaded)
        .then(notifyWorkerReady.bind(self));
}

function notifyWorkerReady() {
    self.postMessage({
        type: 'workerAlive'
    });
    removeGlobalSDKModules.call(self);
}

function removeGlobalSDKModules() {
    delete self.editorSDK.editor;
    delete self.editorSDK.components;
    delete self.editorSDK.controllers;
    delete self.editorSDK.history;
    delete self.editorSDK.pages;
    delete self.editorSDK.panel;
    delete self.editorSDK.routers;
    delete self.editorSDK.vfs;
}

function onAPILoaded() {
    self.postMessage({
        type: 'sdkReady'
    });
}

function setManifest(applicationId, manifest) {
    if (manifest) {
        self.postMessage({
            type: 'setManifest',
            manifest: manifest,
            applicationId: applicationId
        });
    }
}

function importScriptsAsNpmModule(workerGlobalScope, appData) {
    workerGlobalScope._babelPolyfill = false;
    var module = workerGlobalScope.module = {};
    workerGlobalScope.module.exports = {};
    workerGlobalScope.exports = workerGlobalScope.module.exports;

    workerGlobalScope.importScripts(appData.editorUrl);

    delete workerGlobalScope.module;

    return module.exports;
}

function isPlatformMessage(messageData) {
    return messageData && messageData.intent === PLATFORM_INTENT;
}

initialize.call(self);

self.onmessage = function (message) {
    if (!isPlatformMessage(message.data)) {
        return;
    }
    var data = message.data;
    switch (data.type) {
        case 'addApps':
            var apps = message.data.apps.filter(function (app) {
                return app.editorUrl && app.applicationId && app.appDefinitionId;
            }, self);
            apps.forEach(function (appData) {
                if (this.appsAPI[appData.applicationId]) {
                    console.error('app already added', appData.applicationId);
                } else {
                    // if (appData.editorUrl === "http://static.parastorage.com/services/dbsm-editor-app/1.104.0/editorAppModule.js") {
                    //     appData.editorUrl = 'http://localhost:3200/assets/editorApp.js';
                    // }
                    this.appsAPI[appData.applicationId] = importScriptsAsNpmModule(this, appData);
                }
                var getAppManifest = this.appsAPI[appData.applicationId].getAppManifest;
                if (getAppManifest) {
                    setManifest(appData.applicationId, getAppManifest());
                }
                var editorReady = this.appsAPI[appData.applicationId].editorReady;
                if (editorReady) {
                    editorReady(self.editorSDK.getBoundedSDK(appData), appData.appDefinitionId);
                } else {
                    reporter.error('app did not export an onEditorReady function - thus did not get a bounded SDK app data:', appData);
                }
            }, self);

            break;
        case 'triggerEvent':
            self.appsAPI[data.applicationId].onEvent(data.args);
            break;
        default:
            break;
    }
};
