define([
    'lodash',
    'bluebird',
    'jquery',
    'tpaIntegrationEditor/driver/driverDom'
], function(_, Promise, $, driverDom) {
    'use strict';

    var ORIGIN;

    var editorAPI;
    var callbacks = [];
    var callId = 1;
    var tpa, util, savePublish, panels;

    var SDK_LATEST = '1.66.0';
    var SDK_CDN_URL_TPL = 'http://static.parastorage.com/services/js-sdk/{VERSION}/js/wix.min.js';


    var init = function (_tpa, _util, _savePublish, _panels) {
        tpa = _tpa;
        util = _util;
        savePublish = _savePublish;
        panels = _panels;
        editorAPI = _tpa.getEditorAPI();
        window.addEventListener('message', receiver, false);
        ORIGIN = util.serviceTopology.htmlEditorRootUrl ?
                 util.serviceTopology.htmlEditorRootUrl.replace(/\/html\/editor\/?/, '') :
                'http://editor.wix.com';
    };

    var openBillingPage = function (appDefId, type, msg) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.openBillingPage(editorAPI, msg);
        return waitForDomElement('.' + type, 10, 1000, type + ' was not opened in 10*1000 milsec');
    };

    var getWixUpgradeUrl = function (appDefId, callback) {
        selectComp(appDefId);
        tpa.editorSuperAppsHandlers.getWixUpgradeUrl(editorAPI, {}, callback);
    };

    var resizeComponent = function (params, compId, callback) {
        selectCompByCompId(compId);
        callPostMessage('resizeComponent', params, compId, callback);
    };

    var resizeComponentManual = function(appDefId, layout) {
        return new Promise(function(resolve){
            var data = editorAPI.tpa.app.getFirstAppCompPageId(appDefId);
            var compRef = editorAPI.components.get.byId(data.compId, data.pageId);
            editorAPI.components.layout.updateRelativeToScreen([compRef], layout, true);
            editorAPI.waitForChangesApplied(function(){
                driverDom.waitForDomElementWithinPreview('#' + data.compId + 'iframe', 3, 1000, 'failed').then(function(domElement) {
                    resolve(domElement);
                });
            });
        });
    };

    var setExternalId = function (msg) {
        return new Promise(function (resolve) {
            tpa.editorTPAHandlers.setExternalId(editorAPI, msg, function (response) {
                resolve(response);
            });
        });
    };

    var addComponent = function (appDefId, msg, callback) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.addComponent(editorAPI, msg, callback);
    };

    var addWidget = function (appDefId) {
        return new Promise(function (resolve) {
            var compRef = editorAPI.tpa.widget.add(appDefId);
            editorAPI.waitForChangesApplied(function () {
                driverDom.waitForDomElementWithinPreview('#' + compRef.id + 'iframe', 3, 1000, 'failed').then(function(domElement) {
                    resolve(domElement);
                });
            });
        });
    };

    var addWidgetWithOptions = function (appDefId, widgetId, position, options) {
        return new Promise(function (resolve) {
            tpa.superApps.addWidget(appDefId, widgetId, position, options);
            editorAPI.waitForChangesApplied(function () {
                driverDom.waitForSelectedComponent(editorAPI, 3, 1000, 'failed').then(function (result) {
                    resolve(result);
                });
            });
        });
    };

    var addSection = function (appDefId, options) {
        return new Promise(function (resolve) {
            var compRef = editorAPI.tpa.section.add(appDefId, options);
            editorAPI.waitForChangesApplied(function () {
                navigateToPage(compRef.id).then(function () {
                    driverDom.waitForDomElementWithinPreview('#' + compRef.sectionId + 'iframe', 3, 1000, 'failed').then(function (domElement) {
                        var results = domElement;
                        results.compRef = compRef;
                        resolve(results);
                    });
                });
            });
        });
    };

    var isInDemoMode = function (appDefId) {
        return editorAPI.tpa.app.getDataByAppDefId(appDefId).demoMode;
    };

    var getDataByAppDefId = function (appDefId) {
        return editorAPI.tpa.app.getDataByAppDefId(appDefId);
    };

    var selectComp = function(appDefId) {
        var data = editorAPI.tpa.app.getFirstAppCompPageId(appDefId);
        var compRef = editorAPI.components.get.byId(data.compId, data.pageId);
        editorAPI.selection.selectComponentByCompRef(compRef);
    };

    var selectCompByCompId = function (compId) {
        var compRef = editorAPI.components.get.byId(compId);
        editorAPI.selection.selectComponentByCompRef(compRef);
    };

    var gfppOpenSettingsClick = function (appDefId) {
        selectComp(appDefId);
        tpa.settings.open(editorAPI);
    };

    var openManageProducts = function (appDefId, options) {
        selectComp(appDefId);
        tpa.superApps.openDashboardUrl(appDefId, 500, 500, options);
        return driverDom.waitForDomElement('.tpa-settings-modal', 10, 1000, 'tpa manage panel did not open');
    };

    var getWidgetPageId = function (compId) {
        return new Promise(function (resolve) {
            callPostMessage('getCurrentPageId', '', compId, function (response) {
                resolve(response);
            });
        });
    };

    var deleteComponent = function (appDefId, callback) {
        selectComp(appDefId);
        editorAPI.selectedComponent.remove(callback);
    };

    var deleteComponentByCompId = function (compId, callback) {
        selectCompByCompId(compId);
        editorAPI.selectedComponent.remove(callback);
    };

    var getDashboardAppURL = function(appDefId, compId) {
        var msg = {
            compId: compId,
            deviceType: 'desktop',
            intent: 'TPA2',
            type: 'getDashboardAppUrl'
        };
        selectComp(appDefId);
        return new Promise(function(resolve) {
            tpa.editorTPAHandlers.getDashboardAppUrl(editorAPI, msg, function(response) {
                resolve(response);
            });
        });
    };

    var appIsAlive = function(appDefId, callback) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.appIsAlive(editorAPI, {}, callback);
    };

    var getCurrentPageId = function () {
        return editorAPI.pages.getCurrentPageId();
    };

    var getSitePages = function (compId,options) {
        return new Promise(function (resolve) {
            callPostMessage('getSitePages', {includePagesUrl:options}, compId, function (response) {
                resolve(response);
            });
        });
    };

    var getSiteInfo = function (compId) {
        return new Promise(function (resolve) {
            callPostMessage('siteInfo', '', compId, function (response) {
                resolve(response);
            });
        });
    };

    var getStateUrl = function (compId,sectionId,state,callback) {

            callPostMessage('getStateUrl', {sectionId:sectionId ,state: state}, compId, callback);
    };

    var getExternalId = function (compId) {
        return new Promise(function (resolve) {
            callPostMessage('getExternalId', '', compId, function (response) {
                resolve(response);
            });
        });
    };

    var getBoundingRectAndOffsets = function (compId) {
        return new Promise(function (resolve) {
            callPostMessage('boundingRectAndOffsets', '', compId, function (response) {
                resolve(response);
            });
        });
    };

    var openMediaDialog = function(msg, callback) {
        tpa.editorTPAHandlers.openMediaDialog(editorAPI, msg, callback);
        return waitForMediaDialogAndReturnUrl();
    };

    var getSectionUrl = function (compId, tpaPageId) {
        return new Promise(function (resolve) {
            callPostMessage('getSectionUrl', {
                sectionIdentifier: tpaPageId
            }, compId, function (response) {
                resolve(response);
            });
        });
    };

    var navigateToPage = function (pageId) {
        return new Promise(function (resolve) {
            editorAPI.pages.navigateTo(pageId, function () {
                resolve();
            });
        });
    };

    var openSettingsDialog = function (compId, options) {
        callPostMessage('openSettingsDialog', options, compId);
        return waitForDomElement('.tpa-settings-panel-frame', 10, 1000, 'settings panel was not opened in 10*1000 milsec', {
            delay: 2000
        });
    };

    var settingsOpenModal = function (appDefId, msg) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.settingsOpenModal(editorAPI, msg);
        return waitForDomElement('.tpa-settings-modal', 10, 1000, 'failed to open settings modal.');
    };

    var openMarketPanel = function (appDefId, type) {
        var appMarketUrl = editorAPI.tpa.appMarket.getPermissionsUrl({
            origin: ORIGIN
        }, appDefId);
        tpa.appMarketUtils.openAppMarketModal(type, {url: appMarketUrl});
        return waitForDomElement('.focus-panel-frame', 10, 1000, 'failed to open ' + type + ' panel.');
    };

    var openAppMarketModal = function (msg) {
        tpa.appMarketHandlers.openAppMarketModal(editorAPI, msg);
    };

    var getPendingValue = function () {
        return waitForDomElement('.left-bar-item.app-market-panel', 10, 1000, 'failed to get left bar panel market');
    };

    var waitForMarketAndReturnUrl = function () {
        return waitForDomElement('[class^=app-market-frame]', 10, 1000, 'app market modal was not opened in 10*1000 milsec');
    };

    var waitForMediaDialogAndReturnUrl = function () {
        return waitForDomElement('#mediaGalleryFrame', 10, 2000, 'media gallery dialog was not opened in 10*1000 milsec');
    };

    var waitForDomElement = function (selector, tries, timeout, errorMessage, options) {
        return new Promise(function (resolve, reject) {
            var checkSelector = setInterval(function () {
                tries--;
                if ($(selector).length) {
                    if (options && options.delay) {
                        _.delay(function () {
                            resolve({
                                result: 'ok',
                                dom: $(selector)
                            });
                        }, options.delay);
                    } else {
                        resolve({
                            result: 'ok',
                            dom: $(selector)
                        });
                    }
                    clearInterval(checkSelector);
                } else if (tries === 0) {
                    reject({
                        result: errorMessage
                    });
                    clearInterval(checkSelector);
                }
            }, timeout);
        });
    };

    var callPostMessage = function (msgType, params, compId, callback, originFrame) {
        var blob = getBlob(msgType, params, compId, callback, originFrame);
        var previewFrame = $('#preview')[0].contentWindow;
        previewFrame.postMessage(JSON.stringify(blob), '*');
    };

    var getBlob = function (msgType, params, compId, onResponseCallback, originFrame) {
        var blob = {
            intent: 'TPA2',
            callId: callId++,
            type: msgType,
            compId: compId,
            data: params
        };

        if (originFrame) {
            _.merge(blob, {
                originFrame: originFrame
            });
        }


        if (onResponseCallback) {
            callbacks[blob.callId] = onResponseCallback;
        }

        return blob;
    };

    var receiver = function (event) {
        if (!event || !event.data) {
            return;
        }

        var data = {};
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            return;
        }

        switch (data.intent) {
            case 'TPA_RESPONSE':
                if (data.callId && callbacks[data.callId]) {
                    callbacks[data.callId](data.res);
                    delete callbacks[data.callId];
                }
                break;

        }
    };

    var switchToPreviewPromise = function () {
        if (editorAPI.getPreviewMode() === false) {
            editorAPI.togglePreview();
        }

        return new Promise(function (resolve, reject) {
            var previewModeInterval = setInterval(function(){
                if (editorAPI.getPreviewMode() === true) {
                    clearInterval(previewModeInterval);
                    clearTimeout(testTimeout);
                    resolve();
                }
            }, 100);

            var testTimeout = setTimeout(function () {
                clearInterval(previewModeInterval);
                reject('Error: switchToPreview did not succeed');
            }, 2000);
        });
    };

    var switchToEditor = function () {
        if (editorAPI.getPreviewMode()) {
            editorAPI.togglePreview();
        }
    };

    var closeSettingsPanel = function () {
        $('.close').click();
    };

    var waitForWindowPlacementChange = function(placement, compId){
        var msg = {
            compId: compId,
            data: {
                compId: compId
            }
        };

        return new Promise(function (resolve, reject) {
            var checkWindowPlacement = setInterval(function () {
                getWindowPlacement(msg).then(function (data) {
                    if (data.placement && data.placement === placement) {
                        clearInterval(checkWindowPlacement);
                        clearTimeout(testTimeout);
                        resolve();
                    }
                });
            }, 100);

            var testTimeout = setTimeout(function () {
                clearInterval(checkWindowPlacement);
                reject('Error: setWindowPlacement did not succeed');
            }, 2000);
        });
    };

    var waitForCondition = function(checkCondition, errorMessage){
        return new Promise(function (resolve, reject) {
            var checkWindowPlacement = setInterval(function () {
                if (checkCondition()) {
                    clearInterval(checkWindowPlacement);
                    clearTimeout(testTimeout);
                    resolve();
                }
            }, 100);

            var testTimeout = setTimeout(function () {
                clearInterval(checkWindowPlacement);
                reject(errorMessage);
            }, 2000);
        });
    };

    var setWindowPlacement = function(msg){
        tpa.editorTPAHandlers.setWindowPlacement(editorAPI, msg);
        return waitForWindowPlacementChange(msg.data.placement, msg.compId);
    };

    var getWindowPlacement = function(msg){
        return new Promise(function (resolve) {
            tpa.editorTPAHandlers.getWindowPlacement(editorAPI, msg, function (response) {
                resolve(response);
            });
        });
    };

    var setStyleParam = function (msg, callback) {
        tpa.editorTPAHandlers.setStyleParam(editorAPI, msg, callback);
    };

    var getStyleProperties = function(compId) {
        var compRef = editorAPI.components.get.byId(compId);
        var styleId = editorAPI.components.style.getId(compRef);
        var style = editorAPI.theme.styles.get(styleId);
        return style.style.properties;
    };

    var closePanelByName = function (name) {
        editorAPI.panelManager.closePanelByName(name);
    };

    var closeAllPanels = function () {
        editorAPI.panelManager.closeAllPanels();
    };

    var openSettingsPanel = function(appDefId){
        var data = editorAPI.tpa.app.getFirstAppCompPageId(appDefId);
        var compPointer = editorAPI.components.get.byId(data.compId, data.pageId);
        editorAPI.selection.selectComponentByCompRef(compPointer);
        tpa.settings.open(editorAPI, compPointer);
        return waitForDomElement('#tpaSettingsFrame', 10, 3000, 'tpa settings panel did not open');
    };

    var getCacheKiller = function(compId){
        var iframeSrc = $('#preview')[0].contentWindow.document.querySelector('#' + compId).querySelector('iframe').src;
        var regex = /cacheKiller=(.*?)&/;
        return regex.exec(iframeSrc)[1];
    };

    var refreshApp = function(compId, params){
        var blob = {
            intent: 'TPA2',
            callId: callId++,
            type: 'refreshApp',
            compId: 'tpaSettings',
            deviceType: 'desktop',
            data: params
        };

        var initialCacheKiller = getCacheKiller(compId);

        window.postMessage(JSON.stringify(blob), '*');

        var isAppRefreshed = function(){
            return getCacheKiller(compId) !== initialCacheKiller;
        };

        return waitForCondition(isAppRefreshed, 'Error: app did not refresh');
    };

    var waitForPageTransition = function(pageId){
        return getCurrentPageId() === pageId;
    };

    var navigateToPageHandler = function (compId, pageId) {
        callPostMessage('navigateToPage', {pageId: pageId}, compId);
        return waitForCondition(waitForPageTransition.bind({}, pageId))
            .then(function(){
                return true;
            });
    };

    var getInstalledInstance = function(compId, appDefinitionId, onSuccess, onError){
        return new Promise(function (resolve) {
            var callback = function (data) {
                if (data.onError) {
                    if (onError) {
                        onError();
                        resolve();
                    }
                } else {
                    onSuccess.apply(this, arguments);
                    resolve();
                }
            };

            var args = {appDefinitionId: appDefinitionId};
            callPostMessage('getInstalledInstance', args, compId, callback);
        });
    };

    var revalidateSession = function (compId) {
        return new Promise(function(resolve) {
            callPostMessage('revalidateSession', {}, compId, resolve, 'editor');
        });
    };

    var findCompNodeInPreviewByCompId = function(compId) {
        return $('#preview').contents().find('#' + compId);
    };

    var openAppMarketPanel = function() {
        tpa.appMarketTabService.openAppMarketTab();
    };

    var getViewMode = function(compId, callback) {
        callPostMessage('getViewMode', {}, compId, callback);
    };

    var openModal = function(compId) {
        callPostMessage('openModal', {width: 200, height: 200, url: 'http://sslstatic.wix.com/services/js-sdk/1.61.0/html/modal.html'}, compId, _.noop);
    };

    var closeAppMarketModal = function(id){
        var msg = {
            params: {
                id: id
            }
        };

        tpa.appMarketHandlers.closeAppMarketModal(editorAPI, msg);
    };


    var getOpenPanels = function(){
        return editorAPI.panelManager.getOpenPanels();
    };

    var copyAndPasteComp = function(compId) {
        return new Promise(function (resolve) {
            var compRef = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
            editorAPI.components.copy(compRef);
            editorAPI.components.paste(compRef);
            driverDom.waitForSelectedComponent(editorAPI, 3, 1000, 'failed').then(function (result) {
                resolve(result);
            });
        });
    };

    var cutComponent = function(compId) {
        return new Promise(function(resolve) {
            var compRef = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
            selectCompByCompId(compId);
            editorAPI.components.cut([compRef]);
            editorAPI.waitForChangesApplied(function(){
                resolve(compRef);
            });
        });
    };

    var pasteComponent = function(compRef) {
        return new Promise(function (resolve) {
            editorAPI.components.paste(compRef);
            driverDom.waitForSelectedComponent(editorAPI, 3, 1000, 'failed').then(function (result) {
                resolve(compRef);
            });
        });
    };

    var duplicateComp = function(compId) {
        return new Promise(function (resolve) {
            var compRef = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
            editorAPI.components.duplicate(compRef);
            driverDom.waitForSelectedComponent(editorAPI, 3, 1000, 'failed').then(function (result) {
                resolve(result);
            });
        });
    };

    var setPublicDataValue = function(compId, key, value, scope, callback) {
        var compPointer = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
        editorAPI.tpa.data.set(compPointer, key, value, scope, callback);
    };

    var setPublicDataValues = function(compId, valuesMap, scope, callback) {
        var compPointer = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
        var setPromises = _.map(valuesMap, function(value, key) {
            return setValuePromise(compPointer, key, value, scope);
        });

        Promise.all(setPromises).then(function(results) {
            callback(results);
        });

    };

    var getPublicDataValue = function(compId, key, scope, callback) {
        callPostMessage('getValue', {key: key, scope: scope}, compId, callback);
    };

    var removePublicDataValue = function(compId, key, scope, callback) {
        var compPointer = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
        editorAPI.tpa.data.remove(compPointer, key, scope, callback);
    };

    var getPublicDataValues = function(compId, keys, scope, callback) {
        callPostMessage('getValues', {keys: keys, scope: scope}, compId, callback);
    };

    var getCompData = function(compId) {
        var compPointer = editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId());
        return editorAPI.components.data.get(compPointer);
    };

    var setValuePromise = function(compPointer, key, value, scope) {
        return new Promise(function (resolve) {
            editorAPI.tpa.data.set(compPointer, key, value, scope, resolve);
        });
    };

    var save = function(onSuccess, onError) {
        savePublish.saveInBackground(editorAPI, onSuccess, onError);
    };

    var publish = function () {
        savePublish.publish(editorAPI);
    };

    var openWixStoresMenuInStorePagesTab = function() {
        panels.panelManager.openPanel('wixStore.panels.wixStorePanel', {selectedTabName: 'Pages'}, true);
        return driverDom.waitForDomElement('.wix-store-pages-panel', 10, 1000, 'store pages tab did not open in WixStores menu');
    };

    var openApp = function (msg) {
        tpa.appMarketHandlers.openApp(editorAPI, msg);
    };

    var setFullWidth = function(appDefId, msg, callback) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.setFullWidth(editorAPI, msg, callback);
    };

    var postMessage = function (appDefId, msg) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.postMessage(editorAPI, msg);
    };

    var addPendingApp = function(appDefId){
        var msg = {
            cmd:  "ADD_PENDING_APP",
            compId: "MarketPanel",
            intent: "APP_MARKET",
            params: {id: appDefId}
        };
        tpa.appMarketHandlers.addPendingApp(editorAPI, msg);
    };

    var removePendingApp =  function(appDefId){
        var msg = {
            cmd:  "REMOVE_PENDING_APP",
            compId: "MarketPanel",
            intent: "APP_MARKET",
            params: {id: appDefId}
        };
        tpa.appMarketHandlers.removePendingApp(editorAPI, msg);
    };

    var editModeChange = function (isPreviewMode) {
        tpa.editModeChange(editorAPI, isPreviewMode);
    };

    var changeDeviceType = function (deviceType) {
        editorAPI.tpa.change.deviceType(deviceType);
    };

    var getStyleId = function(compId){
        var comp = editorAPI.components.get.byId(compId);
        return  editorAPI.components.style.getId(comp);
    };

    var openReviewInfo = function (appDefId, type) {
        selectComp(appDefId);
        tpa.editorTPAHandlers.openReviewInfo(editorAPI);
        return waitForDomElement('.app-market-app-modal-container', 10, 1000, type + ' was not opened in 10*1000 milsec');
    };

    var setHelpArticle = function (articleId, type) {
        tpa.editorSuperAppsHandlers.setHelpArticle(editorAPI, {
            data: {
                articleId: articleId,
                type: type
            }
        });
    };

    var spyOnAppIsAlive= function(){
        return spyOn(tpa.editorTPAHandlers, 'appIsAlive').and.callThrough();
    };

    var gePagesCount = function() {
        return _.size(editorAPI.pages.getPagesData());
    };

    var getSDKUrl = function (version) {
        version = version || SDK_LATEST;
        return SDK_CDN_URL_TPL.replace('{VERSION}', version);
    };


    var getRunnerDependenciesPath = function () {
        if (_.contains(decodeURIComponent(location.href), 'ReactSource=http://localhost')) {
            return 'http://localhost:4578/tpaIntegrationEditor/src/main/dependencies/'
        } else {
            return 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/runners/tpaIntegrationEditor/src/main/dependencies/'
        }
    };

    return {
        init: init,
        openBillingPage: openBillingPage,
        closeAllPanels: closeAllPanels,
        closePanelByName: closePanelByName,
        addComponent: addComponent,
        appIsAlive: appIsAlive,
        getWidgetPageId: getWidgetPageId,
        getCurrentPageId: getCurrentPageId,
        getSitePages: getSitePages,
        getSiteInfo: getSiteInfo,
        waitForMarketAndReturnUrl: waitForMarketAndReturnUrl,
        waitForMediaDialogAndReturnUrl: waitForMediaDialogAndReturnUrl,
        openMarketPanel: openMarketPanel,
        getSectionUrl: getSectionUrl,
        navigateToPage: navigateToPage,
        openMediaDialog: openMediaDialog,
        getPendingValue: getPendingValue,
        openSettingsDialog: openSettingsDialog,
        switchToPreviewPromise: switchToPreviewPromise,
        switchToEditor: switchToEditor,
        closeSettingsPanel: closeSettingsPanel,
        settingsOpenModal: settingsOpenModal,
        resizeComponent: resizeComponent,
        resizeComponentManual: resizeComponentManual,
        getBoundingRectAndOffsets: getBoundingRectAndOffsets,
        deleteComponent: deleteComponent,
        deleteComponentByCompId: deleteComponentByCompId,
        getDashboardAppURL: getDashboardAppURL,
        setExternalId: setExternalId,
        getExternalId: getExternalId,
        gfppOpenSettingsClick: gfppOpenSettingsClick,
        openManageProducts: openManageProducts,
        waitForDomElement: waitForDomElement,
        setWindowPlacement: setWindowPlacement,
        getWindowPlacement: getWindowPlacement,
        selectComp: selectComp,
        selectCompByCompId: selectCompByCompId,
        refreshApp: refreshApp,
        openSettingsPanel: openSettingsPanel,
        navigateToPageHandler: navigateToPageHandler,
        getInstalledInstance: getInstalledInstance,
        findCompNodeInPreviewByCompId: findCompNodeInPreviewByCompId,
        revalidateSession: revalidateSession,
        addWidget: addWidget,
        addSection: addSection,
        openAppMarketPanel: openAppMarketPanel,
        isInDemoMode: isInDemoMode,
        setStyleParam: setStyleParam,
        getStyleProperties: getStyleProperties,
        getViewMode: getViewMode,
        openAppMarketModal: openAppMarketModal,
        closeAppMarketModal: closeAppMarketModal,
        getOpenPanels: getOpenPanels,
        waitForCondition: waitForCondition,
        copyAndPasteComp: copyAndPasteComp,
        duplicateComp: duplicateComp,
        setPublicDataValue: setPublicDataValue,
        getPublicDataValue: getPublicDataValue,
        removePublicDataValue: removePublicDataValue,
        getPublicDataValues: getPublicDataValues,
        getCompData: getCompData,
        setPublicDataValues: setPublicDataValues,
        save: save,
        publish: publish,
        openWixStoresMenuInStorePagesTab: openWixStoresMenuInStorePagesTab,
        addWidgetWithOptions: addWidgetWithOptions,
        openModal: openModal,
        openApp: openApp,
        openReviewInfo: openReviewInfo,
        setFullWidth: setFullWidth,
        addPendingApp: addPendingApp,
        removePendingApp: removePendingApp,
        getDataByAppDefId: getDataByAppDefId,
        getWixUpgradeUrl: getWixUpgradeUrl,
        editModeChange: editModeChange,
        postMessage: postMessage,
        changeDeviceType: changeDeviceType,
        getStyleId: getStyleId,
        cutComponent: cutComponent,
        pasteComponent: pasteComponent,
        gePagesCount: gePagesCount,
        setHelpArticle: setHelpArticle,
        spyOnAppIsAlive: spyOnAppIsAlive,
        getStateUrl:getStateUrl,
        getSDKUrl: getSDKUrl,
        getRunnerDependenciesPath: getRunnerDependenciesPath
    };
});


