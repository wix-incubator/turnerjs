define(['lodash', 'documentServices/siteMetadata/clientSpecMap'], function (_, clientSpecMap) {
	'use strict';

	function getAppBuilderClientSpecMap(ps) {
		return _.first(clientSpecMap.filterAppsDataByType(ps, 'appbuilder'));
	}

	function getInstanceId(ps) {
		return getAppBuilderClientSpecMap(ps).instanceId;
	}

	function getApplicationId(ps) {
		return getAppBuilderClientSpecMap(ps).applicationId;
	}

	return {
		getInstanceId: getInstanceId,
		getApplicationId: getApplicationId
	};
});
