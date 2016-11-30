define([], function () {
   'use strict';

	function getAppVersion(immutableSiteData) {
		return immutableSiteData.getIn(['wixapps', 'appbuilder', 'descriptor', 'applicationInstanceVersion']);
    }

	function getAppInstanceId(immutableSiteData) {
		var appbuilderService = immutableSiteData.getIn(['rendererModel', 'clientSpecMap']).find(function (service) {
			return service.get('type') === 'appbuilder';
		});
		return appbuilderService && appbuilderService.get('instanceId');
    }

    function getAppInstance(siteData) {
        return {
            applicationInstanceId: getAppInstanceId(siteData),
            applicationInstanceVersion: getAppVersion(siteData)
        };
    }

    return {
        getAppInstance: getAppInstance,
        getAppInstanceId: getAppInstanceId,
        getAppVersion: getAppVersion
    };
});
