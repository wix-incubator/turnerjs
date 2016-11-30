define(['lodash', 'documentServices/siteMetadata/siteMetadata'], function (_, siteMetadata) {
    'use strict';

    function getAppsData(privateServices) {
        return siteMetadata.getProperty(privateServices, siteMetadata.PROPERTY_NAMES.CLIENT_SPEC_MAP) || {};
    }

    function registerAppData(privateServices, newAppData) {
        var appsData = getAppsData(privateServices);
        appsData[newAppData.applicationId] = newAppData;
        siteMetadata.setProperty(privateServices, siteMetadata.PROPERTY_NAMES.CLIENT_SPEC_MAP, appsData);
    }

    function getAppData(privateservices, applicationId) {
        return getAppsData(privateservices)[applicationId] || {};
    }

    function getAppDataByAppDefinitionId(privateServices, appDefinitionId) {
        var appsData = getAppsData(privateServices);
        return _.find(appsData, {appDefinitionId: appDefinitionId});
    }

    function filterAppsDataByType(privateServices, type) {
        var appsData = getAppsData(privateServices);
        return _.filter(appsData, {type: type});
    }

    return {
        registerAppData: registerAppData,
        getAppData: getAppData,
        getAppDataByAppDefinitionId: getAppDataByAppDefinitionId,
        getAppsData: getAppsData,
        filterAppsDataByType: filterAppsDataByType
    };
});
