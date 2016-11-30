define(['zepto',
    'lodash',
    'utils',
    'tpa',
    'wixUrlParser',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/page/page',
    'documentServices/page/pageUtils',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/component/component',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/siteMetadata/seo',
    'documentServices/tpa/services/tpaDataService',
    'documentServices/structure/structure',
    'documentServices/tpa/services/installedTpaAppsOnSiteService'
], function ($, _, utils, tpa, wixUrlParser, tpaUtils, pageService, pageUtils, componentDetectorAPI, component, siteMetadata, seo, tpaDataService, structure, installedTpaAppsOnSiteService) {

    'use strict';

    var tpaPreviewEditorCommunicationService = tpa.services.tpaPreviewEditorCommunicationService;
    var viewerTPAHandlers = tpa.tpaHandlers;
    var tpads;

    var getAppPagesByCompId = function(ps, siteAPI, compId) {
        var comp = siteAPI.getComponentById(compId);
        var applicationId = parseInt(comp && comp.props.compData && comp.props.compData.applicationId, 10);

        var sitePages = pageService.getPagesDataItems(ps);
        return _.filter(sitePages, {tpaApplicationId: applicationId});
    };

    var getMainAppPage = function(appPages) {
        return _.find(appPages, {hidePage: false});
    };

    var getAppPageByTpaPageId = function (appPages, tpaPageId) {
      return _.find(appPages, {tpaPageId: tpaPageId});
    };

    var getSectionUrl = function (ps, siteAPI, msg, callback) {
        var isSiteSaved = !siteMetadata.generalInfo.isFirstSave(ps);
        if (!isSiteSaved) {
            callback({error: {message: 'Page was not found.'}});
            return;
        }

        var tpaPageId = msg.data.sectionIdentifier;
        var appPages = getAppPagesByCompId(ps, siteAPI, msg.compId);
        var appPage = getAppPageByTpaPageId(appPages, tpaPageId) || getMainAppPage(appPages);
        if (appPage) {
            callback({
                url: getPageUrl(ps, appPage)
            });
        } else {
            callback({error: {message: 'This app does not have any pages.'}});
        }
    };

    var getUrlForState = function(ps, appPage, state) {
        var baseUrl = siteMetadata.generalInfo.getPublicUrl(ps);
        return wixUrlParser.getUrl(ps.siteDataAPI.siteData, {pageId: appPage.id, title: appPage.pageUriSEO, pageAdditionalData: state}, false, true, baseUrl);
    };

    var getStateUrl = function(ps, siteAPI, msg, callback) {
        var isSiteSaved = !siteMetadata.generalInfo.isFirstSave(ps);
        if (!isSiteSaved) {
            callback({error: {message: 'Page was not found.'}});
            return;
        }
        var tpaPageId = msg.data.sectionId;
        var appPages = getAppPagesByCompId(ps, siteAPI, msg.compId);
        var appPage = getAppPageByTpaPageId(appPages, tpaPageId);
        if (appPage) {
            callback({
                url: getUrlForState(ps, appPage, msg.data.state)
            });
        } else {
            var mainAppPage = getMainAppPage(appPages);
            if (mainAppPage) {
                callback({
                    url: getPageUrl(ps, mainAppPage)
                });
            } else {
                callback({error: {message: 'This app does not have any pages.'}});
            }
        }
    };

    var siteInfo = function (ps, siteAPI, msg, callback) {
        var info = {};
        var pageData = pageService.data.get(ps, ps.siteAPI.getCurrentUrlPageId());
        pageData.siteTitle = getCurrentPageTitle(ps, pageData);

        if (tpa.common.utils.sdkVersionIsAtLeast(msg.version, '1.42.0')) {
            info.pageTitle = pageData.siteTitle || '';
        } else {
            info.siteTitle = pageData.siteTitle || '';
            info.pageTitle = pageData.title || '';
        }

        info.siteDescription = seo.description.get(ps);
        info.siteKeywords = seo.keywords.get(ps);

        if (!siteMetadata.generalInfo.isFirstSave(ps)) {
            var currentUrl = siteMetadata.generalInfo.getPublicUrl(ps) || '';
            var currentUrlParsed = currentUrl && utils.urlUtils.parseUrl(currentUrl) || '';
            info.baseUrl = (currentUrl && (currentUrlParsed.protocol + '//' + currentUrlParsed.host + currentUrlParsed.path)) || 'baseUrl is not available - site is saved but not published';
        } else {
            info.baseUrl = '';
        }
        info.url = 'http://editor.wix.com';
        info.referer = window.document.referrer;
        callback(info);
    };

    var getCurrentPageTitle = function (ps, pageData) {
        var title = seo.title.get(ps) || "";
        var pageName = pageData.title || "";
        var pageTitleSEO = pageData.pageTitleSEO || "";
        var urlPageId = ps.siteAPI.getCurrentUrlPageId();
        var isHomePage = pageUtils.isHomepage(ps, urlPageId);

        if (pageTitleSEO) {
            title = pageTitleSEO;
        } else if (!isHomePage) {
            title = title + ' | ' + pageName;
        }

        return title;
    };

    var getPageUrl = function (ps, appPage) {
        var basePublicUrl = siteMetadata.generalInfo.getPublicUrl(ps);
        return wixUrlParser.getUrl(ps.siteDataAPI.siteData, {pageId: appPage.id, title: appPage.pageUriSEO}, false, true, basePublicUrl);
    };

    var registerEventListener = function (ps, siteAPI, msg) {
        var eventKey = msg.data.eventKey;
        var compId = msg.compId;
        switch (eventKey) {
            case 'COMPONENT_DELETED':
                tpads.change.register.deleteCompHandler(ps, msg.compId, function () {
                    tpads.comp.postMessageBackToApp(compId, eventKey, {});
                });
                break;

            case 'EDIT_MODE_CHANGE':
                tpads.change.register.editModeChangeHandler(ps, msg.compId, function (mode) {
                    tpads.comp.postMessageBackToApp(compId, eventKey, {
                        editMode: mode
                    });
                });
                break;

            case 'SITE_PUBLISHED':
                tpads.change.register.sitePublishedHandler(ps, msg.compId, function () {
                    tpads.comp.postMessageBackToApp(compId, eventKey, {});
                });
                break;

            case 'SETTINGS_UPDATED':
                tpads.change.register.settingsUpdatedHandler(ps, msg.compId, function (data) {
                    tpads.comp.postMessageBackToApp(compId, eventKey, data);
                });
                break;

            case 'WINDOW_PLACEMENT_CHANGED':
                tpads.change.register.windowPlacementChangedHandler(ps, msg.compId, function (data) {
                    tpads.comp.postMessageBackToApp(compId, eventKey, data);
                });
                break;
            case 'THEME_CHANGE':
                tpads.change.register.themeChangeHandler(ps, compId, function (changedData) {
                    tpads.style.postBackThemeData(ps, siteAPI, compId, changedData);
                });
                break;
            case 'DEVICE_TYPE_CHANGED':
                tpads.change.register.deviceTypeChangeHandler(ps, msg.compId, function (device) {
                    tpads.comp.postMessageBackToApp(compId, eventKey, {
                        deviceType: device
                    });
                });
                break;
            case 'STYLE_PARAMS_CHANGE':
                break;
            case 'SITE_SAVED':
                tpads.change.register.siteSavedHandler(ps, msg.compId, function () {
                    tpads.comp.postMessageBackToApp(compId, eventKey);
                });
                break;
            case 'ON_MESSAGE_RESPONSE':
                siteAPI.reportBI(tpads.bi.errors.EVENT_TYPE_NOT_SUPPORTED);
                break;
            case 'PUBLIC_DATA_CHANGED':
                tpads.change.register.registerPublicDataChangedHandler(ps, msg.compId, function (data) {
                    tpads.comp.postMessageBackToApp(compId, eventKey, data);
                });
                break;
        }
    };

    var getSitePages = function (ps, siteAPI, msg, callback) {
        var options = {
            filterHideFromMenuPages: true,
            includePagesUrl: _.get(msg, 'data.includePagesUrl', false),
            baseUrl: siteMetadata.generalInfo.getPublicUrl(ps)
        };

        callback(tpa.sitePages.getSitePagesInfoData(ps.siteDataAPI.siteData, options));
    };

    var refreshApp = function (ps, siteAPI, msg) {
        var comps;
        if (_.isArray(msg.data.compIds)) {
            comps = tpaUtils.getRenderedReactCompsByCompIds(siteAPI, msg.data.compIds);
        } else {
            var applicationId = siteAPI.getComponentById(msg.compId).props.compData.applicationId;
            comps = tpads.app.getRenderedReactCompsByApplicationId(ps, applicationId);
        }

        tpads.app.refreshApp(ps, comps, msg.data.queryParams);
    };

    var openSettingsDialog = function (ps, siteAPI, msg, callback) {
        var handlerComp = siteAPI.getComponentById(msg.compId);
        var comps = tpads.app.getAllCompsByApplicationId(ps, handlerComp.props.compData.applicationId);
        var comp;
        if (msg.data && msg.data.compId) {
            comp = _.find(comps, {id: msg.data.compId});

            if (_.isUndefined(comp)) {
                callback({onError: 'comp not found'});
                return;
            }
        } else {
            comp = {
                id: handlerComp.props.id,
                pageId: handlerComp.props.rootId
            };
        }

        var params = {
            pageId: comp.pageId,
            compId: comp.id
        };

        tpaPreviewEditorCommunicationService.doPostMessage('openSettingsDialog', params, msg.compId);
    };

    var isSupported = function (ps, siteAPI, msg, callback) {
        callback(true);
    };

    var navigateToPage = function (ps, siteAPI, msg, callback) {
        viewerTPAHandlers.navigateToPage(siteAPI, msg, callback);
        tpaPreviewEditorCommunicationService.doPostMessage('deselectComponent');
    };

    var getExternalId = function (ps, siteAPI, msg, callback) {
        callback(tpads.comp.getExternalId(ps, componentDetectorAPI.getComponentById(ps, msg.compId)));
    };

    var getResultDataForUninstalledApp = function(){
        return {
            onError: true
        };
    };

    var getInstalledInstance = function(ps, siteAPI, msg, callback){
        var installedInstance = {};

        var doNotFilterDemoMode = false;
        var appData = tpads.app.getDataByAppDefId(ps, msg.data.appDefinitionId);
        if (_.isEmpty(appData)){
            installedInstance = getResultDataForUninstalledApp();
        } else {
            var isInstalled = tpads.app.isInstalled(ps, msg.data.appDefinitionId, doNotFilterDemoMode);
            if (isInstalled) {
                installedInstance = {
                    instanceId: appData.instanceId
                };
            } else {
                installedInstance = getResultDataForUninstalledApp();
            }
        }

        callback(installedInstance);
    };

    var revalidateSession = function(ps, siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var applicationId = comp.props.compData.applicationId;
        var metaSiteId = ps.dal.get(ps.pointers.general.getMetaSiteId());

        tpads.provision.refreshAppSpecMap(ps, applicationId, metaSiteId, function(appData) {
            callback({
                instance: appData.instance
            });
        }, function(error){
            callback({
                onError: true,
                error: {
                    errorCode: error.status,
                    errorText: error.statusText,
                    error: JSON.parse(error.response)
                }
            });
        });
    };

    var resizeComponent = function (ps, siteAPI, msg, callback) {
        var compId = msg.compId;
        var compPointer = componentDetectorAPI.getComponentById(ps, compId);
        tpads.comp.resize(ps, compPointer, msg.data.width, msg.data.height, callback);
    };

    var settingsResizeComponent = function(ps, siteAPI, msg, callback) {
        resizeComponent(ps, siteAPI, msg, callback);
    };

    var getOrigCompPointer = function(ps, siteAPI, compId) {
        var comp = siteAPI.getComponentById(compId);
        var origCompId = _.get(comp, 'props.compData.origCompId');
        if (origCompId) {
            return componentDetectorAPI.getComponentById(ps, origCompId);
        }

        return null;
    };

    var handleCompNotFound = function(callback) {
        callback({
            error: {
                'message': 'comp not found'
            }
        });
    };

    var getValue = function(ps, siteAPI, msg, callback) {
        var compId = msg.compId;
        if (msg.data.scope === tpads.data.SCOPE.APP) {
            var comp = siteAPI.getComponentById(compId);
            var applicationId = _.get(comp, 'props.compData.applicationId');
            if (!comp || !applicationId) {
                handleCompNotFound(callback);
            } else {
                tpads.data.app.get(ps, applicationId, msg.data.key, callback);
            }
        } else {
            var compPointer = componentDetectorAPI.getComponentById(ps, compId) || getOrigCompPointer(ps, siteAPI, compId);
            if (!compPointer) {
                handleCompNotFound(callback);
            } else {
                tpads.data.comp.get(ps, compPointer, msg.data.key, callback);
            }
        }
    };

    var getValues = function(ps, siteAPI, msg, callback) {
        var compId = msg.compId;
        if (msg.data.scope === tpads.data.SCOPE.APP) {
            var comp = siteAPI.getComponentById(compId);
            var applicationId = _.get(comp, 'props.compData.applicationId');
            if (!comp || !applicationId) {
                handleCompNotFound(callback);
            } else {
                tpads.data.app.getMulti(ps, applicationId, msg.data.keys, callback);
            }
        } else {
            var compPointer = componentDetectorAPI.getComponentById(ps, compId) || getOrigCompPointer(ps, siteAPI, compId);
            if (!compPointer) {
                handleCompNotFound(callback);
            } else {
                tpads.data.comp.getMulti(ps, compPointer, msg.data.keys, callback);
            }
        }
    };

    var setValue = function(ps, siteAPI, msg, callback) {
        var compPointer = componentDetectorAPI.getComponentById(ps, msg.compId);
        if (!compPointer) {
            handleCompNotFound(callback);
        } else {
            tpaDataService.set(ps, compPointer, msg.data.key, msg.data.value, msg.data.scope, callback);
        }
    };

    var removeValue = function(ps, siteAPI, msg, callback) {
        var compPointer = componentDetectorAPI.getComponentById(ps, msg.compId);
        if (!compPointer) {
            handleCompNotFound(callback);
        } else {
            tpads.data.remove(ps, compPointer, msg.data.key, msg.data.scope, callback);
        }
    };

    var getCurrentPageAnchors = function(ps, siteAPI, msg, callback){
        //we have anchors only on primary page for now
        //you should use some existing method for this, I'm sure we have one..
        var pageId = ps.siteAPI.getPrimaryPageId();
        var pagePointer = pageService.getPage(ps, pageId);
        var currentPageAnchors = componentDetectorAPI.getComponentByType(ps, 'wysiwyg.common.components.anchor.viewer.Anchor', pagePointer);
        var anchors = _.map(currentPageAnchors, function(anchorRef){
            return getAnchorInfo(ps, anchorRef);
        });

        var topPageAnchorName = tpa.common.utils.Constants.TOP_PAGE_ANCHOR_PREFIX + pageId;
        var topPageAnchor = utils.scrollAnchors.getPageTopAnchor(pageId, topPageAnchorName);
        var topPageAnchorInfo = {
            id: topPageAnchor.compId,
            title: topPageAnchor.name
        };
        anchors.push(topPageAnchorInfo);
        callback(anchors);
    };

    var getAnchorInfo = function(ps, anchorRef){
        var data = component.data.get(ps, anchorRef);
        return {
            id: data.compId,
            title: data.name
        };
    };

    var getComponentInfo = function(ps, siteAPI, msg, callback) {
        var compPointer = componentDetectorAPI.getComponentById(ps, msg.compId);
        var compData = component.data.get(ps, compPointer);
        var applicationId = compData.applicationId;
        var appData = tpads.app.getData(ps, applicationId);
        var showOnAllPages = structure.isShowOnAllPages(ps, compPointer);
        var widgetData = compData.widgetId ? appData.widgets[compData.widgetId] : tpads.app.getMainSectionWidgetDataFromApplicationId(ps, applicationId);

        var returnObj = {
            compId: msg.compId,
            showOnAllPages: showOnAllPages,
            pageId: showOnAllPages ? '' : ps.pointers.components.getPageOfComponent(compPointer).id,
            tpaWidgetId: _.get(widgetData, 'tpaWidgetId', ''),
            appPageId: _.get(widgetData, 'appPage.id', '')
        };

        callback(returnObj);
    };

    var settpads = function (tpaDocumentServices) {
        tpads = tpaDocumentServices;
    };

    var navigateToSectionPage = function (ps, siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var compData = _.get(comp, 'props.compData');
        var appData, appPages;

        if (compData) {
            appData = tpads.app.getData(ps, compData.applicationId);
            var applicationId = _.get(appData, 'applicationId');
            appPages = appData && installedTpaAppsOnSiteService.getAppPages(ps, applicationId);
        }

        viewerTPAHandlers.navigateToSection(siteAPI, appData, msg, appPages, callback);
    };

    return {
        registerEventListener: registerEventListener,
        siteInfo: siteInfo,
        getSitePages: getSitePages,
        refreshApp: refreshApp,
        refreshAppByCompIds: refreshApp,
        getSectionUrl: getSectionUrl,
        openSettingsDialog: openSettingsDialog,
        isSupported: isSupported,
        navigateToPage: navigateToPage,
        getExternalId: getExternalId,
        getInstalledInstance: getInstalledInstance,
        revalidateSession: revalidateSession,
        resizeComponent: resizeComponent,
        settingsResizeComponent: settingsResizeComponent,
        getValue: getValue,
        getValues: getValues,
        setValue: setValue,
        removeValue: removeValue,
        getCurrentPageAnchors: getCurrentPageAnchors,
        getComponentInfo: getComponentInfo,
        settpads: settpads,
        navigateToSectionPage: navigateToSectionPage,
        getStateUrl: getStateUrl
    };
});
