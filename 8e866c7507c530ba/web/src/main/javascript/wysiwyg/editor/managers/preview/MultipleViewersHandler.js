define.Class('wysiwyg.editor.managers.preview.MultipleViewersHandler', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('core.events.EventDispatcher');

    def.utilize([
        'wysiwyg.editor.layoutalgorithms.LayoutAlgorithms',
        'wysiwyg.editor.managers.preview.SiteStructureSerializer',
        'wysiwyg.editor.managers.preview.SecondaryViewDeletedComponentList'
    ]);

    def.resources(['W.Commands', 'W.Utils', 'W.Config']);

    def.binds(['_onCompDeleted', '_onSecondarySiteReady', '_onSiteLoaded', '_onSingleAnchorEnforced', '_onPageChange']);


    def.methods(/** @lends wysiwyg.editor.managers.preview.MultipleViewersHandler */
        {
            /**
             * @constructs
             * @param preview
             */
            initialize: function (preview) {
                this._previewManager = preview;
                this._layoutAlgorithms = new this.imports.LayoutAlgorithms();
                this._viewersInfo = null;
                this._secondaryViewerLocked = false;
                this._deletedPages = [];
                this._registerCommands();
            },

            /**
             *
             * @private
             */
            _registerCommands: function() {
                this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._initViewersInfo, null, true);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ReorderCurrentMobilePageLayout", this, this.reorderCurrentPageSecondaryComponentsBasedOnMainStructureOrder);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.DiscardReorderCurrentMobilePageLayout", this, this.discardReorderCurrentPageSecondaryComponentsBasedOnMainStructureOrder);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.RegenerateWholeMobileStructureLayout", this, this.regenerateWholeMobileStructureLayout);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.DiscardRegenerateWholeMobileStructureLayout", this, this.discardRegenerateWholeMobileStructureLayout);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ReaddDeletedMobileComponent", this, this.readdDeletedMobileComponent);
                this.resources.W.Commands.registerCommand("WEditorCommands.SecondaryPreviewNotReady");
                this.resources.W.Commands.registerCommand("WEditorCommands.SecondaryPreviewReady");
                this.resources.W.Commands.registerCommandListenerByName('EditorCommands.SiteLoaded', this, this._onSiteLoaded);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.AddExitMobileModeButton", this, this._addExitMobileModeButton);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.AddBackToTopButton", this, this._addBackToTopButton);
                this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.DeletePageCompleted', this, this._updateDeletedPagesList);
            },

            /**
             *
             * @private
             */
            _onSiteLoaded: function () {
                W.Preview.getPreviewManagers().Layout.addEvent('singleAnchorEnforced', this._onSingleAnchorEnforced);
            },

            /**
             *
             * @param anchor
             * @private
             */
            _onSingleAnchorEnforced: function (anchor) {
                if (W.Config.env.isViewingDesktopDevice()) {
                    return;
                }
                var pushingComponent = anchor.fromComp;
                if (pushingComponent.$className === "wysiwyg.viewer.components.WRichText") {
                    pushingComponent.setHeight(pushingComponent.getPhysicalHeight());
                }
            },

            /**
             *
             * @private
             */
            _addExitMobileModeButton: function () {
                var viewerName = this.resources.W.Config.env.$viewingDevice;
//            var mainSerializedStructure = this._viewersInfo[Constants.ViewerTypesParams.TYPES.DESKTOP].siteStructureSerializer._getSerializedStructure();
                var secondarySerializedStructure = this.getSerializedStructure(viewerName);
//            var deletedComponentList = this._viewersInfo[viewerName].deletedComponents.getList();

                this._layoutAlgorithms.addMobileOnlyComponentToStructure('EXIT_MOBILE', secondarySerializedStructure.masterPage);
                this._updateViewer(Constants.ViewerTypesParams.TYPES.MOBILE, secondarySerializedStructure);
            },

            /**
             *
             * @returns {Node|*|null}
             * @private
             */
            _getBackToTopButton: function () {
                var button = W.Preview.getCompByID("BACK_TO_TOP_BUTTON");
                return button || null;
            },


            /**
             *
             * @private
             */
            _addBackToTopButton: function () {
                var btn = this._getBackToTopButton();
                if (btn) {
                    return;
                }

                var viewerName = this.resources.W.Config.env.$viewingDevice;
                var secondarySerializedStructure = this._viewersInfo[viewerName].siteStructureSerializer._getSerializedStructure();

                this._layoutAlgorithms.addMobileOnlyComponentToStructure('BACK_TO_TOP_BUTTON', secondarySerializedStructure.masterPage);
                this._updateViewer(Constants.ViewerTypesParams.TYPES.MOBILE, secondarySerializedStructure);
            },

            /**
             *
             * @param eventData
             * @private
             */
            _updateDeletedPagesList: function(eventData){
                var pageId = eventData.page.get('id');
                this._deletedPages.push(pageId);
            },

            /**
             *
             * @returns {Array}
             */
            getDeletedPageIds: function() {
                return this._deletedPages;
            },

            /**
             *
             * @private
             */
            _initViewersInfo: function () {
                if (this._viewersInfo) {
                    return;
                }
                this._viewersInfo = {};
                var viewer = this._previewManager.getPreviewManagers().Viewer;

                var mainStructureFromServer = viewer._getDataResolver_()._getSerializedStructureForSingleView_(Constants.ViewerTypesParams.TYPES.DESKTOP);

                _.forOwn(Constants.ViewerTypesParams.TYPES, function (viewerName) {
                    var isMain = (viewerName === Constants.ViewerTypesParams.TYPES.DESKTOP);
                    var structureFromServer = (!isMain) ? viewer._getDataResolver_()._getSerializedStructureForSingleView_(viewerName) : null;
                    var deletedComponents = (!isMain && structureFromServer) ? this._getInitializedDeletedComponentList(viewerName, mainStructureFromServer, structureFromServer, true) : null;

                    this._viewersInfo[viewerName] = {
                        isMain: isMain,
                        siteStructureSerializer: new this.imports.SiteStructureSerializer(viewerName, this._previewManager),
                        structureFromServer: structureFromServer,
                        lastStructure: _.cloneDeep(structureFromServer), //not sure clone DEEP is needed
                        deletedComponents: deletedComponents,
                        discardRegenerateData: (!isMain) ? {lastStructure: null, deletedComponents: new this.imports.SecondaryViewDeletedComponentList(viewerName, this._layoutAlgorithms)} : null,
                        discardReorderPageData: (!isMain) ? {} : null
                    };
                }, this);

                this._previewManager.getPreviewManagers().Viewer.addEvent('pageTransitionEnded', this._onPageChange);
                if (this._viewersInfo[Constants.ViewerTypesParams.TYPES.MOBILE].lastStructure) {
                    this._createMasterPageDeletedComponentList(mainStructureFromServer);
                }
                this._previewManager.getPreviewManagers().Commands.registerCommandAndListener('WPreviewCommands.BundledPageLoaded', this, this._onPageLoaded);
            },

            /**
             *
             * @param mainStructureFromServer
             * @param secondarySerializedStructure
             * @private
             */
            _createMasterPageDeletedComponentList: function(mainStructureFromServer, secondarySerializedStructure) {
                var mobileViewerInfo = this._viewersInfo[Constants.ViewerTypesParams.TYPES.MOBILE];
                var mobileDeletedComponents = mobileViewerInfo.deletedComponents;
                secondarySerializedStructure = secondarySerializedStructure || mobileViewerInfo.lastStructure;
                mobileDeletedComponents.populateListByPageWithStructureDifferences('masterPage', mainStructureFromServer, secondarySerializedStructure, true);
            },

            /**
             *
             * @param pageId
             * @private
             */
            _onPageChange: function(pageId) {
                LOG.reportEvent(wixEvents.PAGE_NAVIGATION_COMPLETED_EDITOR, {c1: pageId, c2: this._getCurrentViewerName()});
                var deletedComponents = this._viewersInfo[Constants.ViewerTypesParams.TYPES.MOBILE].deletedComponents;

                if (deletedComponents && !deletedComponents.getListByPage(pageId)) {
                    this._onPageLoaded(pageId);
                }
                this.trigger('pageChanged');
            },

            _onPageLoaded: function(pageId) {
                this.resources.W.Commands.executeCommand('PageLoaded', pageId);
                this._updateDeletedCompListOnFirstPageLoad(pageId);
            },

            /*
             Deleted comp list should be updated on first page load only!! (otherwise, the merge algo will get wrong information)
             */
            _updateDeletedCompListOnFirstPageLoad: function(pageId) {
                var deletedComponents = this._viewersInfo[Constants.ViewerTypesParams.TYPES.MOBILE].deletedComponents;
                var viewerTypes = Constants.ViewerTypesParams.TYPES;
                var desktopSerializedStructure = this.getSerializedStructure(viewerTypes.DESKTOP);
                var mobileSerializedStructure = this.getSerializedStructure(viewerTypes.MOBILE);
                deletedComponents.populateListByPageWithStructureDifferences(pageId, desktopSerializedStructure, mobileSerializedStructure, true);
            },

            /**
             *
             * @param editMode
             */
            switchToMainPreview: function (editMode) {
                var previewManager = this._previewManager.getPreviewManagers(),
                    viewer = previewManager.Viewer,
                    compLifecycle = previewManager.ComponentLifecycle;

                viewer.switchViewer(Constants.ViewerTypesParams.TYPES.DESKTOP);
                compLifecycle.forceRender(1);
                viewer.siteHeightChanged();
                W.Editor.removeEvent('onComponentDelete', this._onCompDeleted);
                W.UndoRedoManager.clear();
            },

            /**
             *
             * @param viewerName
             * @returns {*}
             */
            getSerializedStructure: function (viewerName) {
                var currentSerializedStructure = this._mergeCurrentStructureWithTheLastSaved(viewerName);

                if (_.isEmpty(currentSerializedStructure)) {
                    return null;
                }
                var missingSerializedPages = this._getMissingSerializedPages(viewerName, currentSerializedStructure);
                currentSerializedStructure.pages = _.merge(missingSerializedPages, currentSerializedStructure.pages);
                return currentSerializedStructure;
            },

            _mergeCurrentStructureWithTheLastSaved: function(viewerName) {
                var mergedStructure = {};
                var viewersInfo = this._viewersInfo[viewerName];
                var lastSavedStructure = _.clone(viewersInfo.lastStructure) || {};
                var currentSerializedStructure = viewersInfo.siteStructureSerializer._getSerializedStructure();

                if (currentSerializedStructure) {
                    mergedStructure.masterPage = currentSerializedStructure.masterPage;
                    mergedStructure.pages = _.merge(lastSavedStructure.pages || {}, currentSerializedStructure.pages, function(lastSavedPage, serializedPage) {return serializedPage});
                }
                else {
                    mergedStructure = viewersInfo.lastStructure;
                }
                return mergedStructure;
            },

            /**
             *
             * @param currentViewerName
             * @param currentSerializedStructure
             * @returns {Object}
             * @private
             */
            _getMissingSerializedPages: function(currentViewerName, currentSerializedStructure) {
                var missingSerializedPages = [];
                var dataResolver = this._getDataResolver();
                var missingPageIds = this._getMissingPageIdsFromViewer(currentViewerName, currentSerializedStructure);
                var missingPageIdsClone = _.clone(missingPageIds);

                _.forEach(missingPageIds, function(pageId) {
                    var serializedPageStructure = dataResolver.getSerializedPageStructureSync(currentViewerName, pageId);
                    if (serializedPageStructure) {
                        missingSerializedPages.push(serializedPageStructure);
                    }
                    else if (this.isMainPreview(currentViewerName)) {
                        LOG.reportError(wixErrors.PAGE_EXISTS_IN_MOBILE_BUT_NOT_IN_DESKTOP, 'MultipleViewerHandler', '_getMissingSerializedPages', pageId);
                        throw new Error('Page ' + pageId + ' exists in mobile structure but not in desktop');
                    }
                    else {
                        missingPageIdsClone.splice(missingPageIdsClone.indexOf(pageId), 1);
                    }
                }, this);
                return _.zipObject(missingPageIdsClone, missingSerializedPages);
            },

            _getDataResolver: function(){
                return this._previewManager.getPreviewManagers().Viewer._getDataResolver_();
            },

            _getMissingPageIdsFromViewer: function(currentViewer, currentSerializedStructure) {
                var missingPageIds = [];
                var currentViewerPageIds = _.keys(currentSerializedStructure.pages);
                var otherViewerNames = _.without(_.values(Constants.ViewerTypesParams.TYPES), currentViewer);

                _.forEach(otherViewerNames, function(viewerName) {
                    var otherViewerPageIds = this._getViewerLoadedPageIds(viewerName);
                    otherViewerPageIds = this._filterOutDeletedPages(otherViewerPageIds);
                    var missingPageIdsRelativeToOther = _.difference(otherViewerPageIds, currentViewerPageIds);
                    missingPageIds = _.union(missingPageIdsRelativeToOther, missingPageIds);
                }, this);
                return missingPageIds;
            },

            _getViewerLoadedPageIds: function(viewerName) {
                var siteView = this._previewManager.getPreviewManagers().Viewer.getSiteView(viewerName);
                if (!siteView) {
                    return [];
                }
                var lastStructure = this._viewersInfo[viewerName].lastStructure;
                var lastSavedStructurePageIds = lastStructure ? _.keys(lastStructure.pages) : [];
                return _.union(lastSavedStructurePageIds, _.keys(siteView.getPageManager().getLoadedPages()));
            },

            _filterOutDeletedPages: function(viewerSerializedPageIds) {
                return _.reject(viewerSerializedPageIds, function(pageId){
                    return this._deletedPages.contains(pageId);
                }, this);
            },

            /**
             *
             * @param viewerName
             * @returns {*}
             * @private
             */
            _getStructureFromServer_: function (viewerName) {
                return this._viewersInfo[viewerName].structureFromServer;
            },

            /**
             *
             * @param viewerName
             * @returns {*|classLogic._viewersInfo.DESKTOP.isMain}
             */
            isMainPreview: function (viewerName) {
                return this._viewersInfo[viewerName].isMain;
            },

            /**
             *
             * @param editMode
             * @param viewerMode
             */
            switchToSecondaryPreview: function (editMode, viewerMode) {
                viewerMode = viewerMode || Constants.ViewerTypesParams.TYPES.MOBILE;
                var commands = this._previewManager.getPreviewManagers().Commands;

                this._saveSecondaryStructure_(viewerMode);
                var serialized = this.getUpdatedSecondarySerializedStructure(viewerMode);
                this._updateViewer(viewerMode, serialized);

                W.Editor.addEvent('onComponentDelete', this._onCompDeleted);
                W.UndoRedoManager.clear();

//            commands.executeCommand('WPreviewCommands.ViewerStateChanged', {editMode: editMode, viewerMode: viewerMode});
            },

            isSecondaryViewerLocked: function () {
                return this._secondaryViewerLocked;
            },

            _updateViewer: function (viewerName, serializedStructure) {
                if (this._secondaryViewerLocked) {
                    return;
                }
                this._secondaryViewerLocked = true;
                var viewer = this._previewManager.getPreviewManagers().Viewer;
                viewer._getDataResolver_().setViewerStructure(viewerName, serializedStructure);

                window.setPreloaderState('secondarySiteLoading');

                this.resources.W.Commands.executeCommand("WEditorCommands.SecondaryPreviewNotReady", viewerName);
                viewer.switchViewer(viewerName, true, Constants.ViewerTypesParams.DOC_WIDTH[viewerName]);

                viewer._activeViewer_.addEvent('SiteReady', this._onSecondarySiteReady);

                viewer._activeViewer_.initiateSite();
            },

            _onSecondarySiteReady: function (eventInfo) {

                var viewer = this._previewManager.getPreviewManagers().Viewer;
                viewer._activeViewer_.removeEvent('SiteReady', this._onSecondarySiteReady);
                var currentPage = viewer.getCurrentPageNode().$logic;
                var self = this;
                var readyCallback = function () {
                    currentPage.removeEvent('pageContentReady', readyCallback);
                    self._secondaryViewerLocked = false;
                    self.resources.W.Commands.executeCommand("WEditorCommands.SecondaryPreviewReady", eventInfo.viewerName);

                    window.setPreloaderState('ready');
                };
                if (!currentPage.isContentReady()) {
                    currentPage.addEvent('pageContentReady', readyCallback);
                } else {
                    readyCallback();
                }

            },

            /**
             *
             * @param viewerName
             * @private
             */
            _saveSecondaryStructure_: function (viewerName) {
                var viewerInfo = this._viewersInfo[viewerName];
                viewerInfo.lastStructure = this.getSerializedStructure(viewerName);
            },

            _onCompDeleted: function (event) {
                var viewerName = this._getCurrentViewerName();
                //Do not track Desktop mode deleted components
                if (viewerName === Constants.ViewerTypesParams.TYPES.DESKTOP || event.omitDeletedListUpdate) {
                    return;
                }
                var compPageId = event.isMasterPageComp ? 'masterPage' : W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                this._viewersInfo[viewerName].deletedComponents.updateListByPage(compPageId, event.componentData);
            },

            _getCurrentViewerName: function() {
                return this.resources.W.Config.env.$viewingDevice;
            },

            getViewerModePageDeletedComponents: function(pageId, viewerName) {
                var deletedComponents = this._viewersInfo[viewerName].deletedComponents;
                if (!deletedComponents) {
                    return [];
                }
                return deletedComponents.getListByPage(pageId);
            },

            isMobileOnlyComponent: function(compId) {
                return this._layoutAlgorithms.isMobileOnlyComponent(compId);
            },

            /**
             *
             * @param viewerName
             * @param mainSerializedStructure
             * @returns {*}
             */
            getUpdatedSecondarySerializedStructure: function (viewerName, mainSerializedStructure) {
                mainSerializedStructure = mainSerializedStructure || this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);
                var SecondarySerialized;

                if (!this.isValidDesktopStructure()) {
                    LOG.reportError(wixErrors.MOBILE_STRUCTURE_NOT_SAVED_DUE_TO_CORRUPTION, 'getUpdatedSecondarySerializedStructure', '', '');
                    return null;
                }

                var secondaryViewerInfo = this._viewersInfo[viewerName];
                if (!secondaryViewerInfo.lastStructure) {
                    SecondarySerialized = this._convertMainStructureToSecondary(mainSerializedStructure, viewerName);
                } else {
                    SecondarySerialized = this._mergeLastSecondaryStructureWithMain(mainSerializedStructure, viewerName, true);
                }
                return SecondarySerialized;
            },

            isValidDesktopStructure: function () {
                var masterPage = this._getDesktopStructure().masterPage;
                var ids = ['SITE_HEADER', 'SITE_FOOTER', 'PAGES_CONTAINER'];
                for (var i = 0; i < masterPage.children.length; i++) {
                    var current = masterPage.children[i].id;
                    var index = ids.indexOf(current);
                    if (index > -1) {
                        ids.splice(index, 1);
                    }
                }
                if (ids.length != 0) {
                    return false;
                }
                return true;
            },

            /**
             *
             * @param mainSerializedStructure
             * @param viewerName
             * @returns {*}
             * @private
             */
            _convertMainStructureToSecondary: function (mainSerializedStructure, viewerName) {
                var secondarySerializedStructure = this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);

                this._convertSpecificMainStructurePageToSecondary(secondarySerializedStructure, [], 'masterPage');
                Object.forEach(secondarySerializedStructure.pages, function (pageStructure) {
                    this._convertSpecificMainStructurePageToSecondary(secondarySerializedStructure, [], pageStructure.id);
                }, this);

                this._viewersInfo[viewerName].deletedComponents = this._getInitializedDeletedComponentList(viewerName, mainSerializedStructure, secondarySerializedStructure, false);


                return secondarySerializedStructure;
            },

            /**
             *
             * @param mainSerializedStructure
             * @param deletedComponentIdList
             * @param specificPageToConvert
             * @private
             */
            _convertSpecificMainStructurePageToSecondary: function (mainSerializedStructure, deletedComponentIdList, specificPageToConvert) {
                if (specificPageToConvert == "masterPage") {
                    this._layoutAlgorithms.runMobileConversionAlgorithm(mainSerializedStructure.masterPage, deletedComponentIdList);
                }
                else {
                    this._layoutAlgorithms.runMobileConversionAlgorithm(mainSerializedStructure.pages[specificPageToConvert], deletedComponentIdList);
                }
            },

            /**
             *
             * @param mainSerializedStructure
             * @param viewerName
             * @param ignoreNotRecommendedComponents
             * @returns {*}
             * @private
             */
            _mergeLastSecondaryStructureWithMain: function(mainSerializedStructure, viewerName, ignoreNotRecommendedComponents){
                var mainSerializedStructureClone = this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);
                var secondaryViewerInfo = this._viewersInfo[viewerName];
                var deletedComponentList = secondaryViewerInfo.deletedComponents.getMap();
                var updatedSecondarySerializedStructure =  this._layoutAlgorithms.runMobileMergeAlgorithm(mainSerializedStructureClone, secondaryViewerInfo.lastStructure, deletedComponentList, ignoreNotRecommendedComponents);

                if(updatedSecondarySerializedStructure){
                    secondaryViewerInfo.deletedComponents.populateMapWithStructureDifferences(mainSerializedStructure, updatedSecondarySerializedStructure, true);
                }

                return updatedSecondarySerializedStructure;
            },

            _getInitializedDeletedComponentList: function(secondaryViewerName, mainSerializedStructure, secondarySerializedStructure, onMerge) {
                var newDeletedComponents = new this.imports.SecondaryViewDeletedComponentList(secondaryViewerName, this._layoutAlgorithms);
                newDeletedComponents.populateMapWithStructureDifferences(mainSerializedStructure, secondarySerializedStructure, onMerge);
                return newDeletedComponents;
            },
            /**
             *
             * @param params
             */
            regenerateWholeMobileStructureLayout: function (params) {
                var viewerName = this._getCurrentViewerName();
                var mainSerializedStructureClone = this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);
                var originalSecondarySerializedStructureClone = this.getSerializedStructure(viewerName);
                var secondarySerializedStructure = this._convertMainStructureToSecondary(mainSerializedStructureClone, viewerName);

                this._viewersInfo[viewerName].discardRegenerateData.originalSecondarySerializedStructure = originalSecondarySerializedStructureClone;
                this._viewersInfo[viewerName].discardRegenerateData.deletedComponents.setMap(_.cloneDeep(this._viewersInfo[viewerName].deletedComponents.getMap()));

                this._resetMobileBg();
                this._updateViewer(viewerName, secondarySerializedStructure);

                W.Editor.clearSelectedComponent();
                W.UndoRedoManager.clear();
            },

            _resetMobileBg: function () {
                W.Preview.getPreviewManagers().Theme.getDataByQuery('#THEME_DATA').set('mobileBg', '[siteBg]');
            },

            discardRegenerateWholeMobileStructureLayout: function () {
                var viewerName = this._getCurrentViewerName();
                if (!this._viewersInfo[viewerName].discardRegenerateData.originalSecondarySerializedStructure) {
                    return;
                }

                this._updateViewer(viewerName, this._viewersInfo[viewerName].discardRegenerateData.originalSecondarySerializedStructure);

                this._viewersInfo[viewerName].deletedComponents.setMap(this._viewersInfo[viewerName].discardRegenerateData.deletedComponents.getMap());

                W.Editor.clearSelectedComponent();
            },

            /**
             *
             * @param params
             */
            reorderCurrentPageSecondaryComponentsBasedOnMainStructureOrder: function (params) {
                var currentPageId = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                var viewerName = this._getCurrentViewerName();
                var secondarySerializedStructure = this.getSerializedStructure(viewerName);

                this._viewersInfo[viewerName].discardReorderPageData[currentPageId] = _.cloneDeep(secondarySerializedStructure.pages[currentPageId]);

                var mainSerializedStructure = this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);

                secondarySerializedStructure.pages[currentPageId] = _.cloneDeep(mainSerializedStructure.pages[currentPageId]);

                this._convertSpecificMainStructurePageToSecondary(secondarySerializedStructure, this._viewersInfo[viewerName].deletedComponents.getListByPage(currentPageId), currentPageId);

                this._viewersInfo[viewerName].deletedComponents.populateMapWithStructureDifferences(mainSerializedStructure, secondarySerializedStructure, true);

                this._updateViewer(viewerName, secondarySerializedStructure);

                W.Editor.clearSelectedComponent();

                this.resources.W.Commands.getCommand("WEditorCommands.DiscardReorderCurrentMobilePageLayout").enable();
            },

            discardReorderCurrentPageSecondaryComponentsBasedOnMainStructureOrder: function (param) {
                var currentPageId = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                var viewerName = this.resources.W.Config.env.$viewingDevice;

                var secondarySerializedStructure = this.getSerializedStructure(viewerName);
                secondarySerializedStructure.pages[currentPageId] = this._viewersInfo[viewerName].discardReorderPageData[currentPageId];

                this._updateViewer(viewerName, secondarySerializedStructure);

                W.Editor.clearSelectedComponent();

                this.resources.W.Commands.getCommand("WEditorCommands.DiscardReorderCurrentMobilePageLayout").disable();
            },

            readdDeletedMobileComponent: function (params) {
                if (this._secondaryViewerLocked) {
                    return;
                }

                var viewerName = this._getCurrentViewerName();

                this._saveSecondaryStructure_(viewerName);

                this._viewersInfo[viewerName].deletedComponents.removeFromListByPage([params.id], params.pageId);

                var serialized = this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);
                serialized = this._mergeLastSecondaryStructureWithMain(serialized, viewerName, false);

                this._viewersInfo[viewerName].deletedComponents.setLastReaddedComponent(params.id);

                this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SecondaryPreviewReady", this, this._selectReaddedComponent);
                this._updateViewer(viewerName, serialized);
            },

            _selectReaddedComponent: function () {
                //TODO: change the ugly timeout for a proper event listener, or when WEditorCommands.SecondaryPreviewReady is fired on the right time
                setTimeout(function () {
                    var viewerName = this.resources.W.Config.env.$viewingDevice;
                    var readdCompId = this._viewersInfo[viewerName].deletedComponents.getLastReaddedComponent();

                    W.Editor.setSelectedComp(W.Preview.getCompByID(readdCompId).getLogic());
                    var cmd = this.resources.W.Commands.getCommand("WEditorCommands.SecondaryPreviewReady");
                    cmd.unregisterListener(this);
                    W.UndoRedoManager.clear();
                }.bind(this), 500);
            },

            _getDesktopStructure: function () {
                return this.getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);
            },

            /**
             *
             * @param viewerName
             * @returns {*|classLogic._viewersInfo.MOBILE.lastStructure|classLogic._viewersInfo.DESKTOP.lastStructure|viewersInfoObject.lastStructure}
             */
            getViewerStructure: function (viewerName) {
                return this._viewersInfo[viewerName].lastStructure;
            }
        });
});