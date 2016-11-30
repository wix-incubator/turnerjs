define(['utils', 'lodash'], function (utils, _) {
	'use strict';
	var dataUtils = utils.dataUtils;

	var MASTER_PAGE_ID = 'masterPage';

    var checkerMap = {};
	var allCompsOfTypeCheckerMap = {};
    var appDefIdCheckerMap = {};

	var allCompsOfTypeMap = {};

	function getCompSkins(siteData, pageId, compStructure) {
        var styleItem = compStructure.styleId && siteData.getDataByQuery(compStructure.styleId, pageId, siteData.dataTypes.THEME);
        var skin = styleItem ? styleItem.skin : compStructure.skin;
        var res = [skin];
        if (compStructure.modes) {
            return res.concat(_(compStructure.modes.overrides).map(_.partial(getCompSkins, siteData, pageId)).flatten().compact().value());
        }
        return res;
    }

	function getCompInfo(siteData, pageId, compStructure) {
        return {
            data: compStructure.dataQuery ? siteData.getDataByQuery(compStructure.dataQuery, pageId) : null,
            properties: compStructure.propertyQuery ? siteData.getDataByQuery(compStructure.propertyQuery, pageId, siteData.dataTypes.PROPERTIES) : null,
            skins: getCompSkins(siteData, pageId, compStructure),
            id: compStructure.id,
            pageId: pageId
        };
	}

	function getRequestsForComponentInPage(siteData, urlData, pageId, compStructure) {
		var compInfo = getCompInfo(siteData, pageId, compStructure);

		var shouldAddToAllCompsOfTypesMap = _.has(allCompsOfTypeCheckerMap, compStructure.componentType);
		if (shouldAddToAllCompsOfTypesMap) {
			allCompsOfTypeMap[compStructure.componentType] = allCompsOfTypeMap[compStructure.componentType] || [];
			allCompsOfTypeMap[compStructure.componentType].push(compInfo);
		}

		var requestsGetter = checkerMap[compStructure.componentType];
        var requests = requestsGetter ? requestsGetter(siteData, compInfo, urlData) : [];

		//TODO: getChildrenData should get is mobile
		var children = dataUtils.getChildrenData(compStructure, siteData.isMobileView());
		return _.reduce(children, function (result, childCompStructure) {
			return result.concat(getRequestsForComponentInPage(siteData, urlData, pageId, childCompStructure));
		}, requests);
	}

	function getRequestsForZoomComponent(siteData, fullPagesData, urlData) {
		if (!urlData.pageItemId) {
			return [];
		}
		var pageData = fullPagesData.pagesData[MASTER_PAGE_ID];
		var permaLinkDataItem = pageData.data.document_data[urlData.pageItemId];
		if (!permaLinkDataItem || permaLinkDataItem.type !== "PermaLink") {
			return [];
		}
		var zoomDataItem = pageData.data.document_data[permaLinkDataItem.dataItemRef.replace(/^#/, "")];
		if (!zoomDataItem) {
			return [];
		}
		var zoomProperties = pageData.data.component_properties[permaLinkDataItem.dataItemRef.replace(/^#/, "")];
		var requestsGetter = checkerMap["Zoom:" + zoomDataItem.type];
		if (requestsGetter) {
			var compInfo = {
				data: zoomDataItem,
				properties: zoomProperties
			};
			return requestsGetter(siteData, compInfo, urlData);
		}
		return [];
	}

	function getRequestsForAllCompsOfTypes(siteData, urlData) {
        return _(allCompsOfTypeMap)
            .map(function (compInfoArr, compType) {
                var requestGetter = allCompsOfTypeCheckerMap[compType];
                return requestGetter(siteData, compInfoArr, urlData);
            })
            .flatten()
            .value();
	}

    function getRequestsForClientSpecMap(siteData, urlData) {
        return _(appDefIdCheckerMap)
            .map(function (requestGetter, appDefId) { //eslint-disable-line array-callback-return
                var appService = siteData.getClientSpecMapEntryByAppDefinitionId(appDefId);
                if (appService) {
                    return requestGetter(siteData, appService, urlData);
                }
            })
            .compact()
            .flatten()
            .value();
    }

	function getRequestsForComponents(siteData, fullPagesData, urlDataForPages) {
		var _urlDataForPages = _.isArray(urlDataForPages) ? urlDataForPages : [urlDataForPages];
		allCompsOfTypeMap = {};
		var requests = getRequestsForComponentInPage(siteData, _urlDataForPages[0], MASTER_PAGE_ID, fullPagesData.pagesData[MASTER_PAGE_ID].structure);

		_.forEach(_urlDataForPages, function(urlData){
			requests = requests.concat(getRequestsForComponentInPage(siteData, urlData, urlData.pageId, fullPagesData.pagesData[urlData.pageId].structure),
				getRequestsForZoomComponent(siteData, fullPagesData, urlData),
				getRequestsForAllCompsOfTypes(siteData, urlData),
				getRequestsForClientSpecMap(siteData, urlData));
		});

		return requests;
	}

	function isAllActiveRootsLoaded(activeRootsUrlData, fullPagesData) {
		return _.every(activeRootsUrlData, function(navInfo) {
			return !_.isEmpty(fullPagesData.pagesData[navInfo.pageId]);
		});
	}

	/**
	 * @class core.core.dataRequirementsChecker
	 */
	return {
		/**
		 * @name core.core.dataRequirementsChecker.compInfo
		 * @type{{
         *   data: object,
         *   properties: object
         *   skin: string
         *   id: string
         * }}
		 */

		/**
		 *
		 * @param {core.SiteData} siteData
		 * @param fullPagesData the full JSON containing pages data
         * @param urlData
		 * @returns {utils.Store.requestDescriptor[]} array of requests that needs to be done.
		 */
		getNeededRequests: function (siteData, fullPagesData, urlData) {
            siteData.santaBase = siteData.santaBase || siteData.serviceTopology.scriptsLocationMap.santa;
			var urlDataForAllActiveRoots = [urlData];

			if (siteData.isPopupPage(urlData.pageId)) {
				urlDataForAllActiveRoots.push(siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId()));
			}

			if (isAllActiveRootsLoaded(urlDataForAllActiveRoots, fullPagesData)) {
				return getRequestsForComponents(siteData, fullPagesData, urlDataForAllActiveRoots);
			}

			return utils.pageRequests(siteData, fullPagesData, urlDataForAllActiveRoots);
		},

		/**
		 *
		 * @param {string} type a component type name
		 * @param {function({object}, core.core.dataRequirementsChecker.compInfo): utils.Store.requestDescriptor[]} requestsGetter
		 */
		registerCheckerForCompType: function (type, requestsGetter) {
			checkerMap[type] = requestsGetter;
		},

		/**
		 *
		 * @param {string} type
		 * @param {function} requestGetter
		 */
		registerCheckerForAllCompsOfType: function (type, requestGetter) {
			allCompsOfTypeCheckerMap[type] = requestGetter;
		},

        /**
         *
         * @param {string} appDefId
         * @param {function} requestGetter
         */
        registerCheckerForAppDefId: function (appDefId, requestGetter) {
            appDefIdCheckerMap[appDefId] = requestGetter;
        }
	};
});
