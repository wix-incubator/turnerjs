'use strict';

var urlUtils = require('./urlUtils');

function getAppConfig(widgets) {
  var widgetWithAppConfig = widgets.find(function(widgetDef) {
    return widgetDef.appConfig;
  });
  return widgetWithAppConfig.appConfig;
}

function getQueryParameters(scari) {
  var parameters = urlUtils.pickQueryParameters('viewMode', 'instance');
  parameters.scari = scari;

  return urlUtils.getParametersAsString(parameters);
}

function buildExternalParams(externals) {
  var params = {
    externals: externals.join()
  };
  externals.forEach(function(ex) {
    params[ex + '-global'] = ex === 'wix-sdk' ? 'wix' : ex;
  });
  return urlUtils.getParametersAsString(params);
}

function getScriptEntry(widget) {
  var userScriptDetails = widget.appConfig.userScript;
  var url = userScriptDetails.url;

  var hasQuery = url.indexOf('?') > -1;
  var urlWithSdkParameters = url + (hasQuery ? '&' : '?') + buildExternalParams(['wix-sdk', 'wix-location', 'wix-window', 'wix-site']);

  return {
    id: widget.id,
    url: urlWithSdkParameters,
    scriptName: userScriptDetails.scriptName,
    displayName: userScriptDetails.displayName,
    routerData: widget.routerData
  };
}

function getUserCodeUrlsDetails(widgets, rootId) {
  var urls = [];

  var pageWidget = widgets.find(function(widget) {
    return widget.id === rootId && widget.type !== 'masterPage';
  });

  var masterPageWidget = widgets.find(function(widget) {
    return widget.id === rootId && widget.type === 'masterPage';
  });

  if (masterPageWidget) {
    urls.push(getScriptEntry(masterPageWidget));
  }

  if (pageWidget) {
    urls.push(getScriptEntry(pageWidget));
  }

  return urls;
}

function getElementoryArguments(widgets, baseUrl) {
  return {
    baseUrl: baseUrl,
    queryParameters: getQueryParameters(getAppConfig(widgets).scari)
  };
}

module.exports = {
  getUserCodeUrlsDetails: getUserCodeUrlsDetails,
  getElementoryArguments: getElementoryArguments
};
