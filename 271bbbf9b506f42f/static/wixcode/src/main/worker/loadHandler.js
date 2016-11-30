'use strict';

var utils = require('../utils');
var bootstrapHandler = require('./bootstrapHandler');
var scriptsValidator = require('./scriptsValidator');
var platformUtilities = require('../platformUtilities/platformUtilities');

function importScriptsAsNpmModule(workerGlobalScope, url) {
  var module = workerGlobalScope.module = {};
  workerGlobalScope.module.exports = {};
  workerGlobalScope.exports = workerGlobalScope.module.exports;

  workerGlobalScope.importScripts(url);
  delete workerGlobalScope.module;

  return module.exports;
}

function setElementoryArguments(args) {
  if (!args.baseUrl || typeof args.baseUrl !== 'string') {
    throw new Error('Load message data must include baseUrl of type string');
  }
  if (!args.queryParameters || typeof args.queryParameters !== 'string') {
    throw new Error('Load message data must include queryParameters of type string');
  }

  self.elementorySupport.baseUrl = args.baseUrl;
  self.elementorySupport.queryParameters = args.queryParameters;
}

function loadScripts(scripts, storage) {
  var devConsole = console;  // eslint-disable-line no-console
  var modules = scripts.map(function(script) {
    try {
      if (devConsole.info) {
        devConsole.info('Loading the code for the ' + script.displayName + '. To debug this code, open ' + script.scriptName + ' in Developer Tools.');
      }

      self.$w = self.wix.getSelector(script.id, script.displayName);
      self.routerReturnedData = script.routerData;
      self.storage = storage;
      var module = importScriptsAsNpmModule(self, script.url);
      delete self.$w;
      delete self.routerReturnedData;

      return module;
    } catch (e) {
      devConsole.error('There was an error in your script');
      devConsole.error(e);
      return {};
    }
  });
  var mergedUserExports = utils.assign.apply(utils, [{}].concat(modules));
  self.wix.__INTERNAL__.setStaticEventHandlers(mergedUserExports);
}

function startApplications(apps, routersMap) {
  apps.forEach(function(appDef) {
    var app = bootstrapHandler.getApp(appDef.id);
    app.module.initAppForPage = app.module.initAppForPage || function() { };
    var initAppParam = {
      appInstanceId: appDef.id
    };
    if (appDef.routerData) {
      initAppParam.routerReturnedData = appDef.routerData;
    }
    var appStorage = self.wix.getStorage(appDef.id);
    app.ready = app.module.initAppForPage(initAppParam, platformUtilities.getApi(routersMap, appStorage)) || Promise.resolve();
  });
}

function handleLoad(messageData) {
  if (!Array.isArray(messageData.applications)) {
    throw new Error('Load message data must include applications property of type Array');
  }
  if (messageData.routersMap === null || typeof messageData.routersMap !== 'object') {
    throw new Error('Load message data must include routersMap of type object');
  }
  if (messageData.wixCode && messageData.wixCode[0] && messageData.wixCode[0].routerData) {
    self.routerData = messageData.wixCode[0].routerData;
  }
  scriptsValidator.validate(messageData.wixCode, ['id', 'url', 'scriptName', 'displayName']);

  setElementoryArguments(messageData.elementoryArguments);

  if (messageData.wixCode) {
    loadScripts(messageData.wixCode, self.wix.getStorage('wixCode'));
  }

  startApplications(messageData.applications, messageData.routersMap);
}

module.exports = {
  handleLoad: handleLoad
};
