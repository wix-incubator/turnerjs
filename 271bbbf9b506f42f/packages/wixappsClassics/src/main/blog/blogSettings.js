define([
    'lodash',
    'utils',
    'wixappsCore',
    'wixappsClassics/core/transformAndSetMetaData'
], function (_,
             utils,
             wixappsCore,
             transformAndSetMetaData) {
    'use strict';

    var urlUtils = utils.urlUtils;
    var wixappsDataHandler = wixappsCore.wixappsDataHandler;

    function getRequest(siteData, compData, appService) {
        if (appService.packageName !== 'blog') {
            return [];
        }
        var PATH = ['wixapps', 'blog', 'hasSettingsRequested'];

        if (_.get(siteData, PATH)) {
            return [];
        }
        _.set(siteData, PATH, true);

        var url = urlUtils.baseUrl(siteData.getExternalBaseUrl()) + '/apps/lists/1/Query?consistentRead=false';

        var data = {
            collectionId: 'Settings',
            filter: {_iid: 'blogSettings'},
            storeId: appService.datastoreId
        };

        var transformFunc = function (responseData, currentValue) {
            currentValue.settings = _.get(responseData.payload, 'items[0].settingsObject', {});
            return currentValue;
        };

        return [{
            force: true,
            destination: wixappsDataHandler.getSiteDataDestination(appService.packageName),
            url: url,
            data: data,
            transformFunc: transformAndSetMetaData.bind(this, transformFunc, siteData, appService.packageName, compData.id)
        }];
    }

    function getBlogSettings(siteData) {
        var blogData = wixappsDataHandler.getPackageData(siteData, 'blog');
        var defaultSettings = {
            locale: 'en',
            email: false
        };

        return _.get(blogData, 'settings', defaultSettings);
    }

    return {
        getRequest: getRequest,
        get: getBlogSettings
    };
});
