define([
    'lodash',
    'zepto',
    'tpa',
    'documentServices/theme/theme',
    'documentServices/component/component',
    'documentServices/component/componentStylesAndSkinsAPI',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/page/page',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/provisionService',
    'documentServices/tpa/services/appStoreService',
    'documentServices/tpa/services/tpaWidgetService',
    'documentServices/tpa/services/tpaSectionService',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/appMarketService',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/constants',
    'documentServices/tpa/services/tpaEventHandlersService'
],
    function(
        _,
        $,
        tpa,
        theme,
        component,
        componentStylesAndSkinsAPI,
        componentDetectorAPI,
        page,
        clientSpecMapService,
        provisionService,
        appStoreService,
        tpaWidgetService,
        tpaSectionService,
        pendingAppsService,
        installedTpaAppsOnSiteService,
        appMarketService,
        tpaUtils,
        tpaConstants,
        tpaEventHandlersService) {

        'use strict';

        var provisionApp = function (ps, componentToAddPointer, type, appDefinitionId, params, onSuccess, onError) {
            params = params || {};
            var existingAppData = clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefinitionId);
            appMarketService.requestAppMarketDataToBeCached(ps, appDefinitionId);

            if (params.sourceTemplateId && !existingAppData) {
                appStoreService.provisionAppFromSourceTemplate(ps, appDefinitionId, params.sourceTemplateId, onProvisionSuccess.bind(undefined, ps, componentToAddPointer, type, params, onSuccess), onError);
                return;
            }

            if (!existingAppData ||
                existingAppData.demoMode
            ) {
                appStoreService.preSaveAddApp(ps, appDefinitionId, onProvisionSuccess.bind(undefined, ps, componentToAddPointer, type, params, onSuccess), onError);
            } else {
                if (pendingAppsService.isPending(ps, existingAppData)) {
                    pendingAppsService.add(existingAppData);
                }
                // no provisioning necessary
                onProvisionSuccess(ps, componentToAddPointer, type, params, onSuccess, existingAppData, onError);
            }

        };

        var onProvisionSuccess = function (privateServices, componentToAddPointer, type, params, onComplete, resultAppDefinitionData, onError) {
            try {
                getAddCompFunctionByType(type)(privateServices, componentToAddPointer, params, resultAppDefinitionData, onComplete, onError);
            } catch (e) {
                onComplete(privateServices, e);
            }
        };

        var getAddCompFunctionByType = function (type) {
            var compTpaAddFunctions = {
                TPAWidget: tpaWidgetService.addWidgetAfterProvision,
                TPASection: tpaSectionService.addSectionAfterProvision
            };

            return compTpaAddFunctions[type];
        };

        var settingsUpdated = function (ps, applicationId, targetCompId, message) {
            if (targetCompId === '*') {
                var comps = installedTpaAppsOnSiteService.getAllAppCompsByAppId(ps, applicationId);
                _.forEach(comps, function (comp) {
                    tpaEventHandlersService.callSettingsUpdateCallback(comp.id, message);
                });
            } else {
                tpaEventHandlersService.callSettingsUpdateCallback(targetCompId, message);
            }
        };

        var refreshApp = function (comps, queryParams) {
            queryParams = _.merge(queryParams || {}, {
                cacheKiller: _.now() + ''
            });
            _.invoke(comps, 'setQueryParams', queryParams);
        };

        var isSection = function (ps, compPointer) {
            var compType = component.getType(ps, compPointer);
            return compType === tpaConstants.COMP_TYPES.TPA_SECTION || compType === tpaConstants.TPA_COMP_TYPES.TPA_SECTION;
        };

        var getSectionRefByPageId = function (ps, pageId) {
            var pagePointers = page.getPage(ps, pageId);
            var tpaChildrenPointers = component.getTpaChildren(ps, pagePointers);
            return _.find(tpaChildrenPointers, function (pointer) {
                return isSection(ps, pointer);
            });
        };

        var setExternalId = function (ps, compPointer, externalId, callback) {
            if (isGUID(externalId)) {
                component.data.update(ps, compPointer, {
                    referenceId: externalId
                });
                callback('ExternalId: ' + externalId + ' will be saved when the site will be saved');
            } else {
                callback({onError: 'The given externalId: ' + externalId + ' is not a valid UUID.'});
            }
        };

        var getExternalId = function (ps, compPointer) {
            var compData = component.data.get(ps, compPointer);
            return compData && compData.referenceId;
        };

        var postBackThemeData = function (ps, siteAPI, compId, changedData) {
            var compStyleId = componentStylesAndSkinsAPI.style.getId(ps, componentDetectorAPI.getComponentById(ps, compId));
            //make sure to register theme once per iframe
            if ( changedData.type !== 'STYLE' ||
                (changedData.type === 'STYLE' && compStyleId === changedData.values)) {
                //post changes only to the relevant iframe
                var data = getStyleDataToPassIntoApp(ps, siteAPI, compId);
                postMessageBackToApp(compId, 'THEME_CHANGE', data);
            }
        };

        var getStyleDataToPassIntoApp = function (ps, siteAPI, compId) {
            var comp = siteAPI.getComponentById(compId);
            return tpa.tpaHandlers.getStyleDataToPassIntoApp(siteAPI, comp);
        };

        var isGUID = function (str, version) {
            var uuid = {
                '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
                '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
                '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
                all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
            };
            var pattern = uuid[version ? version : 'all'];
            return pattern && pattern.test(str);
        };

        var postMessageBackToApp = function (compId, eventKey, params) {
            var iframe = $('#' + compId).find('iframe')[0];
            try {
                tpa.common.tpaPostMessageCommon.callPostMessage(iframe, {
                    intent: 'addEventListener',
                    eventType: eventKey,
                    params: params
                });
            } catch (e) {
                // empty
                //TODO add bi event on post back to app error
            }
        };

        var getDefaultLayout = function (ps, applicationId, widgetId) {
            var widgetData;
            if (_.isUndefined(widgetId) || _.isNull(widgetId)) {
                widgetData = clientSpecMapService.getMainSectionWidgetDataFromApplicationId(ps, applicationId);
            } else {
                widgetData = clientSpecMapService.getWidgetData(ps, applicationId, widgetId);
            }

            return {
                height: _.get(widgetData, 'defaultHeight') || 500,
                width: _.get(widgetData, 'defaultWidth') || 980,
                x: 0
            };
        };

        return {
            provisionApp: provisionApp,
            settingsUpdated: settingsUpdated,
            refreshApp: refreshApp,
            getSectionRefByPageId: getSectionRefByPageId,
            setExternalId: setExternalId,
            getExternalId: getExternalId,
            postBackThemeData: postBackThemeData,
            postMessageBackToApp: postMessageBackToApp,
            getDefaultLayout: getDefaultLayout
        };
    });
