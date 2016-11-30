define([
    'lodash',
    'utils',
    'tpa',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/siteMetadata/siteMetadata'
], function (_, utils, tpa, clientSpecMapService, siteMetadata) {
    'use strict';

    var getSettingsUrl = function (ps, applicationId, widgetId, origCompId, options) {
        var appData = clientSpecMapService.getAppData(ps, applicationId);

        var isNewVersion = _.get(options, 'isNewVersion', false);
        var baseEndPoint = appData.settingsUrl;
        var widgetData = appData.widgets && appData.widgets[widgetId];
        if (widgetData) {
            var widgetSettings = _.get(widgetData, 'settings');
            baseEndPoint = (isNewVersion ? _.get(widgetSettings, 'urlV2') : _.get(widgetSettings, 'url')) || baseEndPoint;
        }
        var locale = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE) || 'en';
        var settingsWidth = _.get(options, 'width') ? options.width : appData.settingsWidth;

        return new tpa.common.TPAUrlBuilder(baseEndPoint)
            .addInstance(appData.instance)
            .addLocale(locale)
            .addOrigCompId(origCompId)
            .addWidth(settingsWidth.toString())
            .addEndpointType('settings')
            .addViewMode('editor')
            .addCompId('tpaSettings')
            .build();
    };

    var getSettingsModalUrl = function(ps, urlParams, compId) {
        var appData = clientSpecMapService.getAppData(ps, urlParams.applicationId);
        var local = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE) || 'en';

        return new tpa.common.TPAUrlBuilder(urlParams.url)
            .addLocale(local)
            .addOrigCompId(urlParams.origCompId)
            .addCompId(compId)
            .addDeviceType(urlParams.deviceType)
            .addViewMode('editor')
            .addInstance(appData.instance)
            .addOrigin(urlParams.origin)
            .build();
    };

    var getSettingsModalParams = function (ps, urlParams, panelParams) {
        var compId = utils.guidUtils.getUniqueId();

        panelParams.compId = compId;
        panelParams.url = getSettingsModalUrl(ps, urlParams, compId);
        panelParams.title = panelParams.title || '';

        return panelParams;
    };

    return {
        getSettingsModalParams: getSettingsModalParams,
        getSettingsUrl: getSettingsUrl
    };
});
