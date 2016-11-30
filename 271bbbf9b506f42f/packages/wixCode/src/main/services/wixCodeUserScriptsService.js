define([
    'lodash',
    'coreUtils'
], function(_, coreUtils) {
    'use strict';

    var urlUtils = coreUtils.urlUtils;

    var PAGES_ROOT = 'pages';

    function getCacheKiller(scriptName, siteData) {
        var cacheKillersMap = _.get(siteData, 'wixCode.fileCacheKillers', {});
        var defaultCacheKiller = _.get(siteData, 'wixCode.defaultFileCacheKiller');
        var fileId = 'public/' + PAGES_ROOT + '/' + scriptName;
        var cacheKiller = cacheKillersMap[fileId];
        if (cacheKiller) {
            return cacheKiller;
        }

        return defaultCacheKiller;
    }

    function getProtocol() {
      return 'http:'; // TODO: SSL support
    }

    function getEditorUserCodeUrl(scriptName, moduleName, wixCodeModel, wixCodeSpec, siteData) {
      var baseUrl = getProtocol() + '//' + wixCodeSpec.extensionId + '.' + siteData.serviceTopology.wixCloudBaseDomain;

      var userCodeUrl = urlUtils.joinURL(
        baseUrl,
        PAGES_ROOT,
        scriptName);

      return userCodeUrl +
        '?empty-if-missing=true' +
        '&module-name=' + moduleName +
        '&viewMode=' + siteData.viewMode +
        '&instance=' + wixCodeSpec.instance +
        '&scari=' + wixCodeModel.signedAppRenderInfo +
        '&cacheKiller=' + getCacheKiller(scriptName, siteData);
    }

    function getViewerUserCodeUrl(scriptName, moduleName, wixCodeModel, wixCodeSpec, siteData) {
      var platformVersion = 'v1';

      var baseUrl = getProtocol() + '//' + wixCodeSpec.extensionId + '.static.' + siteData.serviceTopology.wixCloudBaseDomain;

      var userCodeUrl = urlUtils.joinURL(
          baseUrl,
          'static',
          platformVersion,
          wixCodeModel.appData.codeAppId, // which is actually the gridAppId...
          wixCodeSpec.instanceId,
          PAGES_ROOT,
          scriptName);

      return userCodeUrl +
        '?empty-if-missing=true' +
        '&module-name=' + moduleName;
    }

    function getUserCodeUrl(scriptName, moduleName, wixCodeModel, wixCodeSpec, siteData) {
      return siteData.viewMode === 'site' ?
        getViewerUserCodeUrl(scriptName, moduleName, wixCodeModel, wixCodeSpec, siteData) :
        getEditorUserCodeUrl(scriptName, moduleName, wixCodeModel, wixCodeSpec, siteData);
    }

    function getWidgetDisplayName(widget) {
        return (widget.type === 'masterPage') ?
            'site' :
            widget.displayName + ' ' + (widget.type === 'Popup' ? 'popup' : 'page');
    }

    function getUserScript(widget, wixCodeModel, wixCodeSpec, siteData) {
        var moduleName = widget.type === 'masterPage' ? 'masterPage' : widget.id;
        var scriptName = moduleName + '.js';
        return {
          url: getUserCodeUrl(scriptName, moduleName, wixCodeModel, wixCodeSpec, siteData),
          displayName: getWidgetDisplayName(widget),
          scriptName: scriptName
        };
    }

    return {
        getUserScript: getUserScript
    };
});
