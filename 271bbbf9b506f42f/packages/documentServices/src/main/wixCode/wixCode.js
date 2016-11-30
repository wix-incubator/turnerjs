define([
    'lodash',
    'documentServices/wixCode/utils/pathUtils',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/wixCode/services/wixCodeFileCacheService',
    'documentServices/wixCode/services/kibanaReporterWrapper',
    'documentServices/platform/platform',
    'utils',
    'documentServices/wixCode/utils/constants',
    'documentServices/siteMetadata/clientSpecMap',
    'widgets',
    'wixCode',
    'experiment'
], function (_,
             pathUtils,
             wixCodeLifecycleService,
             wixCodeModelService,
             wixCodeFileCacheService,
             kibana,
             platform,
             utils,
             constants,
             clientSpecMap,
             widgets,
             wixCode,
             experiment) {
    'use strict';

    function getClientSpec(ps) {
        return _.first(clientSpecMap.filterAppsDataByType(ps, constants.WIX_CODE_SPEC_TYPE));
    }

    var joinURL = utils.urlUtils.joinURL;

    function initializeWixCode(ps) {
        pathUtils.initPaths(ps);

        wixCodeFileCacheService.init(ps);

        if (wixCodeLifecycleService.isProvisioned(ps) && !wixCodeModelService.getGridAppId(ps)) {
            // Backward compatibility code for sites that were not saved with the new wixCodeAppData info
            var clientSpec = getClientSpec(ps);
            wixCodeModelService.setGridAppId(ps, clientSpec.extensionId);
        }

        if (experiment.isOpen('sv_platform1')) {
            if (wixCodeLifecycleService.isProvisioned(ps)) {
                _tempInitDataBindingApp(ps); // TODO: replace once platform apps provision flow has been decided
            }
        }

        if (experiment.isOpen('sv_dpages')) {
            if (wixCodeLifecycleService.isProvisioned(ps)) {
                _tempInitWixCodeEditorApp(ps); // TODO: replace once platform apps provision flow has been decided
            }
        }

        // set the app as read only so it will be cloned on first write
        var pointer = ps.pointers.wixCode.getIsAppReadOnly();
        ps.dal.set(pointer, true);
    }

    function initWixCodeApp(ps) {
        var wixCodeWidgetAspect = ps.siteAPI.getSiteAspect('wixCodeWidgetAspect');
        wixCodeWidgetAspect.initApp();
    }

    function provision(ps, callbacks) {
        var traceEnd = kibana.trace(ps, {action: 'provision'});

        callbacks = _.defaults({}, callbacks, {onSuccess: _.noop, onError: _.noop});
        wixCodeLifecycleService.provision(ps)
            .then(initializeWixCodeWidget)
            .then(onSuccess)
            .catch(onError);

        function initializeWixCodeWidget(result) {
            initWixCodeApp(ps);
            if (experiment.isOpen('sv_platform1')) {
                _tempInitDataBindingApp(ps); // TODO: replace once platform apps provision flow has been decided
            }
            if (experiment.isOpen('sv_dpages')) {
                _tempInitWixCodeEditorApp(ps); // TODO: replace once platform apps provision flow has been decided
            }
            return result;
        }

        function onSuccess(result) {
            ps.setOperationsQueue.asyncSetOperationComplete();
            traceEnd({appId: result.extensionId});

            callbacks.onSuccess(result);
        }

        function onError(error) {
            ps.setOperationsQueue.asyncSetOperationComplete(new Error('Wix Code provision failed: ' + JSON.stringify(error)));
            traceEnd({level: wixCode.log.levels.ERROR, message: error});

            callbacks.onError(error);
        }
    }

    function generateRemoteModelInterface(ps, contextId, onUpdateCallback) {
        var isValidContextId = _(ps.pointers.page.getNonDeletedPagesPointers(false)).map('id').includes(contextId);
        if (!isValidContextId) {
            throw new Error('contextId - ' + contextId + ' is invalid');
        }
        var siteData = ps.siteDataAPI.siteData;
        var componentsFetcher = ps.siteAPI.getAllCompsUnderRoot.bind(ps.siteAPI);
        return widgets.modelBuilder.build(ps.siteAPI.getRuntimeDal(), siteData, [contextId], onUpdateCallback, componentsFetcher)[contextId];
    }

    function getFocusedRootRef(ps, compPointers) {
        var currentRootId = ps.siteAPI.getCurrentUrlPageId();
        var viewModes = utils.constants.VIEW_MODES;
        var viewMode = ps.siteAPI.isMobileView() ? viewModes.MOBILE : viewModes.DESKTOP;
        return compPointers.getPage(currentRootId, viewMode);
    }

    function getWidgetRef(ps, compRef) {
        var compPointers = ps.pointers.components;
        var compRootRef = compPointers.getPageOfComponent(compRef);
        if (!compRootRef) {
            return null;
        }
        if (compPointers.isMasterPage(compRootRef)) {
            return getFocusedRootRef(ps, compPointers);
        }
        return compRootRef;
    }

    function _tempInitDataBindingApp(ps) { // TODO: replace once platform apps provision flow has been decided
        platform.initApp(ps, _tempGetAppAppDef(ps, 'dbsm-viewer-app', 'dbsm-editor-app', 'dataBinding'));

    }

    function _tempInitWixCodeEditorApp(ps) { // TODO: replace once platform apps provision flow has been decided
        platform.initApp(ps, _tempGetAppAppDef(ps, '', 'wix-code-editor-app', 'wix-code'));
    }

    function _tempGetAppAppDef(ps, viewerAppName, editorAppName, appDefId) { // TODO: replace once platform apps provision flow has been decided
        function parseAppSources(appSources) {
            return _(appSources || '')
                .split(',')
                .map(function (appSource) {
                    return appSource.split(':');
                })
                .zipObject()
                .value();
        }

        function getArtifactUrl(serviceTopology, artifactName, version) {
            var artifactPath = joinURL(serviceTopology.scriptsDomainUrl, 'services', artifactName);
            if (version) {
                return joinURL(artifactPath, version);
            }

            return serviceTopology.scriptsLocationMap[artifactName];
        }

        if (wixCodeLifecycleService.isProvisioned(ps)) {
            var pointer = ps.pointers.general.getServiceTopology();
            var serviceTopology = ps.dal.get(pointer);
            var viewerAppVersion = parseAppSources(ps.dal.getByPath(['currentUrl', 'query', 'viewerPlatformAppSources']))[appDefId];
            var editorAppVersion = parseAppSources(ps.dal.getByPath(['currentUrl', 'query', 'editorPlatformAppSources']))[appDefId];
            var appData = {
                appDefinitionId: appDefId
            };
            if (viewerAppName) {
                appData.viewerUrl = joinURL(getArtifactUrl(serviceTopology, viewerAppName, viewerAppVersion), '/app.js');
            }
            if (editorAppName) {
                appData.editorUrl = joinURL(getArtifactUrl(serviceTopology, editorAppName, editorAppVersion), '/editorAppModule.js');
            }
            return appData;
        }
    }

    return {
        initializeWixCode: initializeWixCode,
        provision: provision,
        isProvisioned: wixCodeLifecycleService.isProvisioned,
        getClientSpec: getClientSpec,
        generateRemoteModelInterface: generateRemoteModelInterface,
        getWidgetRef: getWidgetRef
    };
});
