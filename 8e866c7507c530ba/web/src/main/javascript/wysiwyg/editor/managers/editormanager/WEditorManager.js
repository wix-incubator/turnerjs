define.Class('wysiwyg.editor.managers.editormanager.WEditorManager', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('core.editor.managers.editormanager.EditorManagerBase');

    def.utilize(['wysiwyg.editor.managers.WCommandRegistrar',
        'wysiwyg.editor.managers.WEditorStatusAPI',
        "wysiwyg.editor.utils.PageConfigurationFactory",
        "wysiwyg.editor.managers.AddMenuDataGenerator",
        'wysiwyg.editor.managers.WCommentsManager',
        'wysiwyg.editor.managers.UserPreferencesHandler',
        'wysiwyg.editor.managers.preview.ComponentDataProvider',
        'core.managers.serverfacade.RESTClient'
    ]);

    def.resources(['W.Resources', 'W.Data', 'W.Utils', 'W.Preview', 'W.Commands', 'W.CompSerializer', 'W.Config', 'fnvHash', 'BrowserUtils', 'W.EditorDialogs']);

    def.binds(['_processTemplatePagesData', '_onPageTransitionStarted', '_onPageTransitionEnded', '_addDataPanels',
        'setEditMode', "_actualDeletePage", "_setSecondaryEditorInterface", 'postMessageCallback']);

    def.statics({
        FORCE_PROPERTY_PANEL_VISIBILITY: true,
        EDIT_MODE: {
            "CURRENT_PAGE": "CURRENT_PAGE",
            "MASTER_PAGE": "MASTER_PAGE",
            "PREVIEW": "PREVIEW"
        },
        EDITOR_READY: "editorready",
        EDITOR_LOAD_FINISHED: Constants.EditorEvents.EDITOR_LOAD_FINISHED,
        Z_INDEX_CHANGE_TYPES: {
            "BACK": "BACK",
            "FORWARD": "FORWARD",
            "TOP": "TOP",
            "BOTTOM": "BOTTOM"
        }
    });

    def.fields({
        _compMetaDataHandlers: {}
    });

    def.methods({
        initialize: function() {
            this._transitionLockTimer = {};
            this._commandRegistrar = new this.imports.WCommandRegistrar();
            this._editorStatusAPI = new this.imports.WEditorStatusAPI();
            this.parent();
            this._editMode = this.EDIT_MODE.CURRENT_PAGE;
            this._editorUI = null;
            this._editorStatusAPI.setSaveInProcess(false);

            this._curGridScale = 1;
            //        window.addEvent(Constants.CoreEvents.KEY_DOWN, this._hideMouseEventCatcher);
            //        window.addEvent(Constants.CoreEvents.KEY_UP, this._unhideMouseEventCatcher);

            this.resetNumOfNewComponentsWithoutComponentMovement();
            this.disableEditCommands();

            this.resources.W.Data.getDataByQuery('#STYLE_DEFAULT_SKIN', function(styleDefaultSkinData) {
                this._styleDefaultSkinData = styleDefaultSkinData;
            }.bind(this));
            this._showAgainSaveSuccessDialog = true;
            this._bindQuickActionsDataToSocialLinksData();

            this._pageConfigurationFactory = new this.imports.PageConfigurationFactory();

            this._addMenuData = {};
            this._AddMenuDataGenerator = new this.imports.AddMenuDataGenerator();
            this.Comments = new this.imports.WCommentsManager(this);
            this.userPreferencesHandler = new this.imports.UserPreferencesHandler();
            this._pagesToDelete = [];
            this._compDataProviders = {'default': this.imports.ComponentDataProvider};
            this._restClient = new this.imports.RESTClient();
        },

        registerComponentDataProviderClass: function(className, classInstance) {
            this._compDataProviders[className] = classInstance;
        },

        getComponentDataProvider: function(className) {
            className = this.resources.W.Preview.getPreviewManagers().Components.getNameOverride(className);
            return this._compDataProviders[className] || new this._compDataProviders['default'](className);
        },

        registerEditorComponent: function(name, logic) {
            this._editorComponents = this._editorComponents || {};
            this._editorComponents[name] = logic;
        },

        getPageConfigurationFactory: function() {
            return this._pageConfigurationFactory;
        },

        getPageConfigPromise: function(pageData) {
            return this._pageConfigurationFactory.getPageConfigPromise(pageData);
        },

        getShowAgainSaveSuccessDialogFlag: function() {
            return this._showAgainSaveSuccessDialog;
        },

        setShowAgainSaveSuccessDialogFlag: function(showAgain) {
            this._showAgainSaveSuccessDialog = showAgain;
        },

        getNumOfNewComponentsWithoutComponentMovement: function() {
            return this._numOfNewComponentsWithoutComponentMovement;
        },

        resetNumOfNewComponentsWithoutComponentMovement: function() {
            this._numOfNewComponentsWithoutComponentMovement = 0;
        },

        incrementNumOfNewComponentsWithoutComponentMovement: function() {
            this._numOfNewComponentsWithoutComponentMovement++;
        },

        getEditorStatusAPI: function() {
            return this._editorStatusAPI;
        },

        /**
         * going to die please use Config.env
         * @returns {*}
         */
        getEditMode: function() {
            return this._editMode;
        },

        getStateBarSize: function() {
            return this._editorUI.getStateBarSize();
        },

        /*TODO: get rid of one of these two (getEdited/getSelected)*/
        getEditedComponent: function() {
            return this._editedComponent;
        },

        getSelectedComp: function() {
            return this.getEditedComponent();
        },

        getPropertyPanel: function() {
            return (this._editorComponents && this._editorComponents.propertyPanel) || null;
        },

        getFloatingPanel: function() {
            return (this._editorComponents && this._editorComponents.floatingPanel) || null;
        },

        getComponentEditBox: function() {
            return (this._editorComponents && this._editorComponents.editingFrame) || null;
        },

        registerComponentMetaDataManager: function(compClassNames, getComponentMetaDataFunc) {
            Array.forEach(compClassNames, function(compType) {
                this._compMetaDataHandlers[compType] = getComponentMetaDataFunc;
            }.bind(this));
        },

        getComponentMetaData: function(editedComponent, translatedClickPosition) {
            var compClassName = editedComponent.getOriginalClassName();
            if (compClassName in this._compMetaDataHandlers) {
                return this._compMetaDataHandlers[compClassName](editedComponent, translatedClickPosition);
            }
            return editedComponent.EDITOR_META_DATA;
        },

        setEditingFrameVisible: function(visibility) {
            this._editorComponents.editingFrame.getViewNode().setCollapsed(!visibility);
        },

        isForcePropertyPanelVisible: function() {
            return !!this._forcePPVisibility;
        },

        setForcePropertyPanelVisible: function(force) {
            this._forcePPVisibility = (force !== false);
        },

        arePageCompsDraggableToFooter: function() {
            return false;
        },

        _getPageGroup: function() {
            return this.resources.W.Preview.getPageGroup();
        },

        /**
         * sets the editing mode between master page to page
         * (in the future will also handle other edting scopes)
         * @param {string} mode
         */
        setEditMode: function(mode) {
            if (!this._isValidEditorMode(mode)) {
                return;
            }

            var oldEditMode = this._editMode;
            this._editMode = mode;

            switch (mode) {
                case Constants.EditorStates.EDIT_MODE.CURRENT_PAGE:
                    var viewer = this.resources.W.Preview.getPreviewManagers().Viewer;
                    this.setEditingScope(viewer.getCurrentPageId());
                    this.setKeysEnabled(true);
                    break;
                case Constants.EditorStates.EDIT_MODE.MASTER_PAGE:
                    this.setEditingScope("SITE_STRUCTURE");
                    this.setKeysEnabled(true);
                    break;
                case Constants.EditorStates.EDIT_MODE.PREVIEW:
                    this.clearSelectedComponent();
                    this.setKeysEnabled(false);
                    break;
            }

            var pageComp = this._getPageGroup();
            pageComp.editModeChange(mode);

            this._fireEditorModeChanged(mode, oldEditMode);
        },

        _isValidEditorMode: function(mode) {
            return Object.contains(this.EDIT_MODE, mode);
        },

        _fireEditorModeChanged: function(newEditMode, oldEditMode) {
            var previewCommands = this.resources.W.Preview.getPreviewManagers().Commands;
            var editorCommands = this.resources.W.Commands;

            var cmdViewer = this._getCommandAndRegisterIfNotExists(previewCommands, 'WPreviewCommands.WEditModeChanged');
            cmdViewer.execute(newEditMode, oldEditMode);

            var cmdEditor = this._getCommandAndRegisterIfNotExists(editorCommands, 'WPreviewCommands.WEditModeChanged');
            cmdEditor.execute(newEditMode, oldEditMode);
        },

        _getCommandAndRegisterIfNotExists: function(commandManager, commandName) {
            var command = commandManager.getCommand(commandName);
            if (!command) {
                command = commandManager.registerCommand(commandName);
            }
            return command;
        },

        _siteLoadedExtra: function(siteStructureData) {

            this._loadCustomThemeFromTemplateMixer(siteStructureData);

            W.Data.getDataByQuery('#PROPERTY_PANELS', this._addDataPanels);

            // Get the main page htmlId and set the editing scope accordingly
            W.Preview.getPreviewManagers().Data.getDataByQuery(siteStructureData.get("mainPage"), function(mainPageData) {
                this.setEditingScope(mainPageData.get("id"));
            }.bind(this));

            W.Data.getDataByQuery("#PAGE_TRANSITIONS", this._processTransitions);

            W.Data.getDataByQueryList(["#PAGE_TYPES", '#SKINS'], this._processTemplatePagesData);

            //Set keyboard event listeners
            this._commandRegistrar.setKeyboardEvents();

            this._editorUI.createComponentPart("pagesPanel", true);

            this._registerPreviewCommands();

            W.Preview.getPreviewManagers().Viewer.addEvent("pageTransitionStarted", this._onPageTransitionStarted);
            W.Preview.getPreviewManagers().Viewer.addEvent("pageTransitionEnded", this._onPageTransitionEnded);
            W.Preview.getPreviewManagers().Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._onViewerStateChanged);
            this.resources.W.Commands.registerCommand('WEditorCommands.DeletePageCompleted');

            //Fire editor ready event
            this.fireEvent(this.EDITOR_READY);

            //report BI event
            var stateStr = this.resources.W.Utils.getFullStateString();
            var stateHash = this.resources.fnvHash.hash(stateStr);
            var runningExperiments = W && W.Experiments && W.Experiments.getRunningExperimentIds && W.Experiments.getRunningExperimentIds() && W.Experiments.getRunningExperimentIds().sort().join(',');

            LOG.reportEvent(wixEvents.EDITOR_READY, {c2: stateHash, g1: runningExperiments});

            // fire editor all loading finished event.
            this.fireEvent(this.EDITOR_LOAD_FINISHED);

            this._addMenuData = this._AddMenuDataGenerator.getAddMenuData();

            if(W.Experiments.isExperimentOpen('EditorSupportForMarketingBanner')) {
                setTimeout(function(){
                    this.getCampaignInfo();
                }.bind(this), 5000);
            }

            if(W.Experiments.isExperimentOpen('MusicCampaignActive')) {
                setTimeout(function(){
                    this.getPostRegCategory();
                    this.registerForPostMessageFromIframe();
                }.bind(this), 1000);
            }

            if(W.Experiments.isExperimentOpen('GoToNewEditor') && editorVersionsInfo.isEligibleForSwitch) {
                LOG.reportEvent(wixEvents.SHOW_NEW_EDITOR_MIGRATION_BANNER);
                this.createGoToNewEditorFrame();
                this.registerForPostMessageFromIframe();
            }
        },

        registerForPostMessageFromIframe: function() {
            var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
            var event = window[eventMethod];
            var messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';
            event(messageEvent, this.postMessageCallback, false);
        },

        postMessageCallback: function (e){
            var self = this;
            try {
                if(e.data === 'close music popup') {
                    LOG.reportEvent(wixEvents.music_campaign_popup_closed);
                    document.getElementById('musicPR').style.display = 'none';
                }
                if(e.data === 'submit music video') {
                    LOG.reportEvent(wixEvents.music_campaign_popup_submit_clicked);
                }

                if(e.data === 'show all') {
                    document.getElementById('editorPR').setAttribute('height', '200');
                }
                if(e.data === 'show less') {
                    document.getElementById('editorPR').setAttribute('height', '50');
                }
                if(e.data === 'close') {
                    LOG.reportEvent(wixEvents.CLOSE_NEW_EDITOR_MIGRATION_BANNER);
                    document.getElementById('editorPR').style.display = 'none';
                }
                if(e.data === 'try new editor') {
                    var cookie = self.getCookie('petri_ovr');
                    if(!cookie) {
                        cookie = 'petri_ovr=';
                    }

                    if(cookie.indexOf('specs.SantaEditorUserOverride') === -1) {
                        cookie += cookie.length > 10 ? '|specs.SantaEditorUserOverride#new' : 'specs.SantaEditorUserOverride#new';
                        document.cookie = cookie + '; domain=wix.com; path=/';
                    }
                    else if(cookie.indexOf('specs.SantaEditorUserOverride#old') !== -1) {
                        var replacedCookie = cookie.replace('specs.SantaEditorUserOverride#old', 'specs.SantaEditorUserOverride#new');
                        document.cookie = 'petri_ovr=' + replacedCookie + '; domain=wix.com; path=/';
                    }

                    LOG.reportEvent(wixEvents.TRY_NEW_EDITOR_CLICKED);
                    if(self.resources.W.Config.siteNeverSavedBefore()) {
                        self.reloadEditor();
                    } else {
                        self.resources.W.Commands.executeCommand('WEditorCommands.Save');
                        setTimeout(self.reloadEditor, 2000).bind(self);
                    }
                }
            } catch(e){}
        },

        reloadEditor: function () {
            window.location.search += '&leavePagePopUp=false';
            window.location.reload();
        },

        getCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },

        createGoToNewEditorFrame: function () {
            var iframe = document.createElement('iframe');
            iframe.src = 'http://assets.parastorage.com/apples/editor/editor-campaign/editorPR.html?' + editorModel.languageCode;
            iframe.setAttribute('id', 'editorPR');
            iframe.setAttribute('height', '50');
            iframe.setAttribute('width', '252');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('style', 'position: fixed; bottom: 0; right: 18px;');
            iframe.onload = function() {
                //console.log('campaign display here');
            };
            document.body.appendChild(iframe);
        },

        // get User Profile for Music Campaign
        getPostRegCategory: function() {
            this._restClient.get('http://' + window.location.host + '/_api/wix-bi-profile-server/userprofile?fields=post_reg_category,post_reg_sub_category&accept=json', {}, {
                'onSuccess': function (post_reg_category) {
                    this._postRegCategory = _.find(post_reg_category.payload.fields, {name: 'post_reg_category'});
                    this.initMusicCampaign();
                }.bind(this),
                onError: function(){
                    // console.log('failed to get userprofile');
                }.bind(this)
            });
        },

        shouldShowMusicLightbox: function () {
            var templateId = editorModel.siteHeader.originalTemplateId,
                isMusicTemplate = _.contains(Constants.WEditManager.MUSIC_PROMO.TEMPLATE_IDS, templateId),
                postRegValue = this._postRegCategory.value ? this._postRegCategory.value.toLowerCase() : '',
                isMusicCategory = postRegValue === 'music',
                isMusicAppInstalled = W.TPAEditorManager ? W.TPAEditorManager._installedAppsOnSiteService.isAppInstalledBy(Constants.WEditManager.MUSIC_PROMO.APP_DEFINITION_ID) : false;

            return isMusicTemplate || isMusicCategory || isMusicAppInstalled;
        },

        initMusicCampaign: function() {
            if(this.shouldShowMusicLightbox()) {
                LOG.reportEvent(wixEvents.music_campaign_popup_opened);
                !document.getElementById('musicPR') ? this.createMusicCampaignIframe(): document.getElementById('musicPR').style.display = 'block';
            }
        },

        createMusicCampaignIframe: function () {
            var iframe = document.createElement('iframe');
            iframe.src = 'http://assets.parastorage.com/apples/editor/music-campaign/musicPR.html';
            iframe.setAttribute('height', '100%');
            iframe.setAttribute('width', '100%');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('style', 'position: fixed; top: 0;');
            iframe.setAttribute('id', 'musicPR');
            iframe.onload = function() {
                //console.log('campaign display here');
            };
            document.body.appendChild(iframe);
        },

        getCampaignInfo: function() {
            this._restClient.get('http://' + window.location.host + '/_api/wix/salesSystemResolver', {}, {
                'onSuccess': function (saleData) {
                    this._campaignInfo = saleData.data.campaignId;
                }.bind(this),
                onError: function(){
                    // console.log('failed to get salesSystemResolver')
                }.bind(this)
            });
        },

        _loadCustomThemeFromTemplateMixer: function(siteStructureData) {
            var keyName = this.resources.W.Utils.getQueryParam('wix-insta-template');
            if (keyName) {
                var that = this;
                this.resource.getResourceValue("scriptLoader", function(scriptLoader){
                    scriptLoader.loadScript(
                        {
                            url: window.serviceTopology.publicStaticBaseUri + '/bower_components/xdLocalStorage/dist/scripts/xdLocalStorage.min.js'
                        },
                        {onLoad: function () {
                            xdLocalStorage.init(
                                {
                                    iframeUrl: window.serviceTopology.publicStaticBaseUri + '/xd-local-storage.html',
                                    initCallback: function () {
                                        xdLocalStorage.getItem(keyName, function (data) {
                                            var theme = that.resources.W.Preview.getPreviewManagers().Theme;
                                            var overrides = JSON.parse(data.value);
                                            for (var property in overrides) {
                                                theme.setProperty(property, overrides[property]);
                                            }
                                        });
                                    }
                                }
                            );
                        }
                        });
                });
            }
        },

        getAddMenuData: function() {
            return this._addMenuData;
        },

        //Experiment PanelsData.New was promoted to feature on Mon Aug 20 18:16:22 IDT 2012
        _addDataPanels: function(panelsData) {
            var panels = panelsData.get('items');
            panels.forEach(function(panelData) {
                this.addDataPanel(panelData.dataType, panelData.compType,
                    { 'logic': panelData.panelCompType, 'skin': panelData.panelSkinType });
            }, this);
        },

        highlightParentContainer: function(container) {
            this._editorComponents.parentContainerHighlight.highlightComponent(container);
        },

        //TODO go recoursively and change skin=null in first skin of that shit
        _processTemplatePagesData: function(dataMap) {
            // Get data
            var pageTypes = dataMap['#PAGE_TYPES'].get('items');
            var i;
            this._compSkinList = dataMap['#SKINS'].get('components');
            // filter to only take paged with serialized data
            pageTypes = _.filter(pageTypes, function(pageType) {
                return pageType.hasOwnProperty("serializedPageData");
            });
            // Iterate over serialized pages
            for (i = 0; i < pageTypes.length; ++i) {
                var compList = pageTypes[i].serializedPageData.components;

                //go over the components in the componentList. put default skin for each component and for their children (if present)
                this._recursivelyDefineDefaultSkinForComponentList(compList, this._compSkinList);

            }
        },

        getDefaultSkinForComp: function(compName) {
            var componentInfo = this.resources.W.Preview.getPreviewManagers().Components.getComponentInformation(compName);
            if (!componentInfo) {
                return null;
            }
            var skinMap = componentInfo.get('skins');
            if (!skinMap) {
                throw new Error(compName + " skin map is missing. Try running grunt.");
            }
            var compDefaultSkin = componentInfo && this.getComponentDefaultSkin(skinMap);
            return (compDefaultSkin || this._compSkinList[compName][0]);
        },

        getComponentDefaultSkin: function(skinMap) {
            var getMinSkinIndex = _(skinMap)
                .filter(function(skinParams) {
                    return !_.isEmpty(skinParams);
                })
                .min(function(skinParams) {
                    return (typeof skinParams.index === 'number') ? skinParams.index : 100;
                });
            return _.findKey(skinMap, getMinSkinIndex) || _(skinMap).keys().first();
        },

        waitForMasterComponentPanel: function() {
            return this._editorUI.getMasterComponentPanelPromise().promise;
        },

        getDefaultSkinForStyle: function(styleId) {
            var styleSkinDefaultMap = this._styleDefaultSkinData.get('items');
            if (styleSkinDefaultMap[styleId]) {
                return styleSkinDefaultMap[styleId];
            }
            return null;
        },

        /**
         * go over the components in the componentList. put default skin for each component and for their children (if present)
         * @param componentList
         * @param compSkinList
         */
        _recursivelyDefineDefaultSkinForComponentList: function(componentList, compSkinList) {
            var j;
            for (j = 0; j < componentList.length; j++) {
                var compName = componentList[j].componentType;
                if (compSkinList[compName]) {
                    componentList[j].skin = compSkinList[compName][0];
                }
                else {
                    compName = this.define.Class.$nameOverrides[compName];
                    if (compName && compSkinList[compName]) {
                        componentList[j].skin = compSkinList[compName][0];
                    }
                    else {
                        //check if the skin is for a component from an APE
                        this._defineSkinForComponentWithOwnSkinMap(compSkinList, componentList[j]);
                    }
                }
                if (componentList[j].components) {
                    this._recursivelyDefineDefaultSkinForComponentList(componentList[j].components, compSkinList);
                }
            }
        },

        _defineSkinForComponentWithOwnSkinMap: function(compSkinList, currentComponent){
            var compType = currentComponent.componentType;
            var compClassName = compType.substring(compType.lastIndexOf(".") + 1);

            this.resource.getResourceValue(compClassName.toLowerCase() + 'SkinMap', function(skinMap) {
                if (!skinMap || typeof skinMap !== 'object') {
                    LOG.reportError(wixErrors.NO_DEFAULT_SKIN_FOUND, 'WEditManager', '_recursivelyDefineDefaultSkinForComponentList', componentList[j].componentType);
                    return;
                }
                var skinList = Object.keys(skinMap);
                compSkinList[compType] = skinList;
                if (!currentComponent.skin || !_.contains(skinList, currentComponent.skin)) {
                    currentComponent.skin = skinList[0];
                }
            });
        },

        _registerPreviewCommands: function() {
            var previewCommands = this.resources.W.Preview.getPreviewManagers().Commands,
                siteLoadedCmd;

            previewCommands.registerCommandAndListener("CustomPreviewBehavior.interact", this, this._onCustomPreviewInteraction, null);
            previewCommands.registerCommandAndListener("linkableComponent.navigateSameWindow", this, this._onPreviewLink, null);
            previewCommands.registerCommandAndListener("socialWidget.interact", this, this._onSocialWidgetInteraction, null);
            previewCommands.registerCommandAndListener("adminLogin.submitAttempt", this, this._onAdminLoginSubmit, null);
            previewCommands.registerCommandAndListener("WEditorCommands.ShowAnchorDialog", this, this._openAnchorDialog);
            previewCommands.registerCommandAndListener("WEditorCommands.UpdateRotatableProperties", this, this._onUpdateRotateProperties);
            previewCommands.registerCommand("WPreviewCommands.WEditModeChanged");
            siteLoadedCmd = previewCommands.registerCommand("EditorCommands.SiteLoaded");
            siteLoadedCmd.execute();
        },
        _onUpdateRotateProperties : function (params){
            var EditededComp = W.Editor.getEditedComponent();
            if (!EditededComp) {
                return;
            }
            var editedCompPanel = W.Editor.getPropertyPanel();
            editedCompPanel.updateRotatbleState();
        },
        _openAnchorDialog: function(params) {
            var icon = {x: 0, y: 0, width: 172, height: 155, url: 'icons/scroll_anchor_dialog_icon.gif'};
            this.resources.W.EditorDialogs.openNotificationDialog("Anchor", 'Anchor_NOTIFICATION_TITLE', "Anchor_NOTIFICATION_TEXT", 566, 90, icon, true, '/node/21781', 1);
        },

        _onCustomPreviewInteraction: function(params) {
            if (!params || !params.tooltipId || !params.component) {
                return;
            }

            this.resources.W.Commands.executeCommand('Tooltip.ShowTip', { id: params.tooltipId }, params.component);
        },

        _onPreviewLink: function(params) {
            this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: "link_on_same_page_ttid"}, params.component);
        },

        _onSocialWidgetInteraction: function(params) {
            var className = params.component.className;
            this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: "Social_Widgets_Only_On_Public"}, params.component);
        },

        _onAdminLoginSubmit: function(params) {
            this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: "login_only_in_public_ttid"}, params.component);
        },

        setEditingScope: function(htmlId) {
            this._editingScope = this.resources.W.Preview.getCompByID(htmlId);
        },

        getEditingScope: function() {
            return this._editingScope;
        },

        getScopeNode: function(editMode) {
            var nodeId;
            if (editMode === this.EDIT_MODE.MASTER_PAGE) {
                nodeId = "SITE_STRUCTURE";
            }
            else {
                nodeId = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
            }
            return this.resources.W.Preview.getCompByID(nodeId);
        },

        _getSitePagesContainer: function() {
            return this.resources.W.Preview.getPageGroupElement().getLogic().getInlineContentContainer();
        },

        _sitePageChangeHandlerExtra: function(pageId, saveSite) {
            resource.getResources(['W.Editor'], function(resources) {
                resources.W.Editor.clearSelectedComponent();
                if (this._editMode === this.EDIT_MODE.CURRENT_PAGE) {
                    this.setEditingScope(pageId);
                }
            }.bind(this));
        },

        /** Function _setEditorWiring
         * Called after all components in editor HTML have been wixified.
         * Save reference to all parts of the editor and configures events for them.
         */
        _setEditorWiring: function() {
            /*
             TODO: Moved all this._editorComponents properties to the components (see registerEditorComponent),
             this makes _setEditorWiring function cleaner but now you can't know what values there are in
             _editorComponents. use with caution till we solve this issue.
             */

            this._editorUI = this._editorComponents.editorPresenter;
            var componentEditBox = this._editorUI.getEditLayer().getComponentEditBox();

            componentEditBox.addEvent("componentEditBoxMoved", function() {
                this.resetNumOfNewComponentsWithoutComponentMovement();
            }.bind(this));

            this.setForcePropertyPanelVisible(this.FORCE_PROPERTY_PANEL_VISIBILITY);

            this.resources.W.Data.getDataByQuery("#COMPONENT_TYPES", this._onComponentData.bind(this));

            // yet another hack, safari on mac has render problems when flash 11 is installed
            if (!Browser.safari) {
                this._createFlash();
            }
        },

        getParentContainerHighLight: function() {
            return this._editorComponents.parentContainerHighlight;
        },

        getEditingFrame: function() {
            return this._editorComponents.editingFrame;
        },

        getComponentScope: function(comp) {
            var pageNode = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
            var viewNode = comp.getViewNode ? comp.getViewNode() : comp;
            if (pageNode.contains(viewNode)) {
                return this.EDIT_MODE.CURRENT_PAGE;
            }
            return this.EDIT_MODE.MASTER_PAGE;
        },

        areComponentsInSameScope: function(comp1, comp2) {
            var comp1Scope = this.getComponentScope(comp1);
            var comp2Scope = this.getComponentScope(comp2);
            return (comp1Scope == comp2Scope);
        },

        handleComponentClicked: function(component, event) {
            // Handle no component selected
            if (!component || component === this._editedComponent) {
                this.clearSelectedComponent();
            }
            else
            //Handle single component selected
            if (this._isNotMultiSelectable(event)) {
                //this.clearSelectedComponent();
                this.setSelectedComp(component, true, event);
            }
            else
            // Handle multi selection if ctrl is pressed and there is already a component selected
            if (component.isMultiSelectable() && this._editedComponent && this._editedComponent.isMultiSelectable()) {
                // Check if clicked component is in the same scope as the other selected component(s)
                if (!this.resources.W.Utils.getIsSibling(component.getViewNode(), this._editedComponent.getViewNode())) {
                    return;
                }
                // Create multi selection proxy OR add / remove to it if exist
                var selectedComponent = component;
                var selectedComps;
                this.hideFloatingPanel();
                if (this._editedComponent.isMultiSelect) {
                    selectedComponent = this._editedComponent;
                    selectedComps = this._editedComponent.getSelectedComps();
                    // Set adding and removing from selection
                    if (selectedComps.contains(component)) {
                        selectedComps.erase(component);
                    }
                    else {
                        selectedComps.push(component);
                    }
                    // Check if only one selected component remains
                    if (selectedComps.length == 1) {
                        // Remove multiple selection proxy and go back to single component mode
                        selectedComponent = selectedComps[0];
                    }
                    else {
                        // Refresh selected components
                        selectedComponent.setSelectedComps(selectedComps);
                    }
                    this.setSelectedComp(selectedComponent, false, event);
                    this.openComponentPropertyPanels(event.page, true, this.isForcePropertyPanelVisible());
                }
                else {
                    this.setSelectedComps([this._editedComponent, component], event);
                    this.openComponentPropertyPanels(event.page, true, this.isForcePropertyPanelVisible());
                }
            }
        },

        _isNotMultiSelectable: function(event) {
            return !(event.control || event.shift) && !event.event.metaKey;
        },

        setSelectedComps: function(selectedArr, event) {
            // Create multi selection proxy and add second component to it
            resource.getResources(['W.Classes'], function(resources) {
                resources.W.Classes.get('wysiwyg.editor.managers.wedit.MultiSelectProxy', function(MultiSelectCls) {
                    var selectedComponent = new MultiSelectCls();
                    selectedComponent.setSelectedComps(selectedArr);
                    if (selectedComponent.getSelectedComps().length == 1) {
                        this.setSelectedComp(selectedComponent.getSelectedComps()[0], false, event);
                    }
                    else {
                        this.setSelectedComp(selectedComponent, false, event);
                    }
                }.bind(this));
            }.bind(this));
        },

        /**
         * Show the property panels
         * by default shows only the floating panel
         *
         * @param {Object} floatingPanelPosition
         * Set a new position for the floating panel, expects an object with 'x' and 'y' properties.
         * if null, keeps the old position
         *
         * @param {Boolean} showFloatingPanel
         * Show the floating property panel (default: true)
         *
         * @param {Boolean} showPropertyPanel
         *  Show the full component property panel {default: false}
         */
        openComponentPropertyPanels: function(floatingPanelPosition, showFloatingPanel, showPropertyPanel) {
            if (showPropertyPanel !== false) {
                this.resources.W.Commands.executeCommand(Constants.EditorUI.OPEN_PROPERTY_PANEL);
            }
            else {
                this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_PROPERTY_PANEL);
            }

            if (showFloatingPanel) {
                this.resources.W.Commands.executeCommand(Constants.EditorUI.OPEN_FLOATING_PANEL, floatingPanelPosition);
            }
            else {
                this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_FLOATING_PANEL);
            }
        },

        setSelectedComp: function(comp, startDrag, event, isHiddenElement) {
            var compScope = this.getComponentScope(comp);
            var compParent;

            this.setEditedComponentHidden(isHiddenElement);

            // If component is in different edit scope
            if (this._editMode != compScope) {
                this.resources.W.Commands.executeCommand("WEditorCommands.WSetEditMode", { editMode: this.EDIT_MODE[compScope] });
                this.setSelectedComp(comp, startDrag, event);
                return;
            }

            // If component is not selectable
            if (!comp.isSelectable()) {
                compParent = comp.getParentComponent();
                if (compParent) {
                    this.setSelectedComp(compParent, startDrag, event);
                }
                return;
            }
            this._editedComponent = comp;
            this.enableEditCommands();
            this._enableCopy(this._editedComponent.isDuplicatable());
            this._editorComponents.editingFrame.cleanPreviousEditState();
            this.resources.W.Commands.executeCommand("WEditorCommands.SelectedComponentChange", { comp: comp });
            this._editorComponents.editingFrame.editComponent(startDrag, event);
        },

        openComponentPropertyPanel: function(componentLogic) {
            var cpanel = this._editorComponents.componentPanel;
            if (cpanel) {
                cpanel.editComponent(componentLogic);
                this._editorUI.showPropertyPanel(cpanel, true);
            }
        },

        clearSelectedComponent: function() {
            this._editedComponent = null;
            if (this._editorComponents && this._editorComponents.editingFrame) {
                this._editorComponents.editingFrame.exitEditMode();
            }
            this.hidePropertyPanel();
            this.hideFloatingPanel();
            this.disableEditCommands();
            this.resources.W.Commands.executeCommand("WEditorCommands.SelectedComponentChange", { comp: null });
        },

        enableEditCommands: function() {
            this._commandRegistrar.enableEditCommands(true);
            this._enableCopy(this._editedComponent && this._editedComponent.isDuplicatable());
        },

        disableEditCommands: function() {
            this._commandRegistrar.enableEditCommands(false);
        },

        hideComponentEditBox: function() {
            this._editorComponents.editingFrame.exitEditMode();
        },

        hidePropertyPanel: function() {
            if (this._editorComponents.propertyPanel) {
                this._editorComponents.propertyPanel.exitEditMode();
            }
        },

        hideFloatingPanel: function() {
            if (this._editorComponents.floatingPanel) {
                this._editorComponents.floatingPanel.hidePanel();
            }
        },

        highlightContainer: function(container) {
            this._editorComponents.containerHighlight.highlightComponent(container);
        },

//        saveHtmlContent:function (html) {
//            this.resources.W.ServerFacade.saveHtmlComponentData(siteHeader.id, html, function () {
//            }, function () {
//            });
//        },

        //    openThemeDialog:function(coordinates, updateAnchors) {
        //        W.EditorDialogs.openThemeDialog();
        //    },
        updatePageHeight: function(allowShrink, draggedComponent) {
            var pageComp = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().getLogic();
            var pageHeight = this.resources.W.Preview.getPreviewManagers().Layout.getComponentMinResizeHeight(pageComp);
            var prevHeight = pageComp.getHeight();

            //in case we drag a comp which its parent is another container (which is the child of page_
            //in that case, in the page height calculations, we need to take into considerations not only
            //the direct children of page, but also the draggedComp.
            var draggedComponentBottomRelativeToPage = 0;
            if (draggedComponent && this.getComponentScope(draggedComponent) == this.EDIT_MODE.CURRENT_PAGE) {
                var draggedComponentYRelativeToPage = this.resources.W.Preview.getGlobalRefNodePositionInEditor(draggedComponent).y - this.resources.W.Preview.getGlobalRefNodePositionInEditor(pageComp).y;
                draggedComponentBottomRelativeToPage = draggedComponentYRelativeToPage + draggedComponent.getBoundingHeight();
            }

            if (!allowShrink) {
                pageHeight = Math.max(pageHeight, prevHeight, draggedComponentBottomRelativeToPage);
            }
            pageComp.setHeight(pageHeight, true);

            this.fireEvent('draggedComponentUpdatedPageHeight', {
                pageComp: pageComp,
                draggedComponentBottom: draggedComponentBottomRelativeToPage
            });
        },

        onComponentChanged: function(allowShrink, draggedComponent) {
            this.updatePageHeight(allowShrink, draggedComponent);
            //}else{
            var siteComp = this.resources.W.Preview.getPreviewManagers().Viewer.getSiteNode().getLogic();
            var siteHeight = this.resources.W.Preview.getPreviewManagers().Layout.getComponentMinResizeHeight(siteComp);
            siteComp.setHeight(siteHeight);

            if (this._editedComponent && this._editorComponents.propertyPanel) {
                this._editorComponents.propertyPanel.updatePanelFields();
            }

            if (allowShrink){
                W.Editor.getEditingFrame().fitToComp();
            }
        },

        getAvailableTypes: function(compName) {
            var res = {};
            var types = this._componentData;
            var groupType, addCompKey;
            var type;

            for (addCompKey in types) {
                type = types[addCompKey];
                if (type.comp === compName) {
                    groupType = type.groupType;
                    break;
                }
            }

            // TODO check that we didn't find it
            for (addCompKey in types) {
                type = types[addCompKey];
                if (type.groupType === groupType) {
                    res[type.comp] = addCompKey;
                }
            }
            return res;

        },

//        replaceCurrentComponent:function (compPanel, targetCompKey) {
//            var targetDef = this._componentData[targetCompKey];
//            var comp = this._editedComponent;
//
//            // collect all the information
//            var targetCompName = targetDef.comp; // 'wysiwyg.viewer.components.SliderGallery';
//            var targetSkinName = targetDef.skin; // 'wysiwyg.viewer.skins.SliderGallerySkin';
//            var targetDataQuery = "#" + comp.getDataItem().get('id');
//            var targetProperties = targetDef.props;
//            var targetHtmlId = comp.getViewNode().get('id');
//            var targetWidth = comp.getWidth();
//            var targetHeight = comp.getHeight();
//            var targetX = comp.getX();
//            var targetY = comp.getY();
//            var container = comp.getViewNode().getParent();
//
//            // remove current component
//            this.doDeleteSelectedComponent();
//
//            // create new component
//            this.resources.W.CompDeserializer.createAndAddComponent(container, {
//                comp:targetCompName,
//                skin:targetSkinName,
//                htmlId:targetHtmlId,
//                uID:targetDataQuery,
//                props:targetProperties,
//                layout:{
//                    x:targetX,
//                    y:targetY,
//                    width:targetWidth,
//                    height:targetHeight
//                }
//            }, true); //this is for useGivenPositioning, which will place the new component in the coordinates provided here
//            // TODO assert that we've got a container in our hand, otherwise, careate a method that returns the container
//        },

        canDeleteSelectedComponent: function() {
            if (!this._editedComponent || !this._editedComponent.isDeleteableRecurse()) {
                return false;
            }
            return (this._editMode == this.getComponentScope(this._editedComponent));
        },

        doDeleteSelectedComponent: function(omitTransactionRecording, omitDeletedListUpdate) {

//            if (this.resources.W.Preview.getViewerMode()!==Constants.ViewerTypesParams.TYPES.DESKTOP) {
//                omitTransactionRecording = true;
//            }

            if (!this._editedComponent.isDeleteableRecurse()) {
                return;
            }
            omitTransactionRecording = omitTransactionRecording || !!this._editedComponent.IS_DEAD;

            var oldParentComp = this._editedComponent.getParentComponent();
            var deletedComponentLayoutData = {
                height: this._editedComponent.getPhysicalHeight(),
                y: this._editedComponent.getY()
            };

            var changedComponents = this.injects().Editor.getAllSelectedComponents();
            var changedComponentNodes = changedComponents.map(function(comp) {
                return comp.getViewNode();
            });
            var changedComponentData = this.injects().CompSerializer.serializeComponents(changedComponentNodes, true);

            var changedComponentIds = changedComponents.map(function(changedComp) {
                return changedComp.getComponentId();
            });

            var oldChildIdList = oldParentComp.getChildComponents().map(function(component) {
                return component.getLogic().getComponentId();
            });

            // Mark all custom styles data items as clean (not dirty)
            var changedComponentsWithCustomStyles = this._getComponentsWithCustomStyles(changedComponents);
            var compsAndCustomStyleIdLists = this._getCompsAndCustomStyleIdLists(changedComponentsWithCustomStyles);
            var currentStyle;

            for (var i = 0, j = changedComponentsWithCustomStyles.length; i < j; i++) {
                currentStyle = changedComponentsWithCustomStyles[i].getStyle();
                currentStyle.getDataItem().markDataAsClean();
            }

            var styleData = {
                data: {
                    subType: 'StyleChangeByDelete',
                    changedComponentIds: compsAndCustomStyleIdLists.componentIds,
                    oldState: {style: compsAndCustomStyleIdLists.styleIds},
                    newState: {style: null}
                }
            };

            var zOrderData = {
                subType: 'zOrderChangeByDelete',
                changedComponentIds: changedComponentIds,
                oldState: {children: oldChildIdList},
                newState: {children: oldChildIdList}
            };

            var addDeleteData = {
                //This is the line added by ViewerRefactor.New
                componentData: changedComponentData,
                data: {
                    changedComponentIds: changedComponentIds,
                    oldState: {
                        parentId: oldParentComp._compId,
                        changedComponentData: changedComponentData
                    },
                    newState: {parentId: null,
                        changedComponentData: null
                    }
                }
            };

            if (omitDeletedListUpdate || (this._editedComponent.EDITOR_META_DATA && this._editedComponent.EDITOR_META_DATA.mobile && this._editedComponent.EDITOR_META_DATA.mobile.dontOpenPanelOnDelete === true)) {
                addDeleteData.omitDeletedListUpdate = true;
            }

            if (this.getComponentScope(this._editedComponent) === this.EDIT_MODE.MASTER_PAGE) {
                addDeleteData.isMasterPageComp = true;
            }

            var animationState = this._getAllSelectedComponentsBehaviors(changedComponents);

            var animationData = {
                data: {
                    subType: 'AnimationChangeByDelete',
                    changedComponentIds: changedComponentIds,
                    oldState: animationState,
                    newState: animationState
                }

            };

            if (!omitTransactionRecording) {
                this.injects().UndoRedoManager.startTransaction();
            }

            this.injects().Commands.executeCommand('WEditorCommands.ComponentStyleChanged', styleData);
            this.injects().Commands.executeCommand('WEditorCommands.ComponentBehaviorsChanged', animationData);

            this.injects().Preview.getPreviewManagers().Commands.executeCommand('WViewerCommands.ComponentZIndexChanged', {editedComponent: this._editedComponent, urmData: zOrderData});

            this._editedComponent.dispose();

            this.injects().Preview.getPreviewManagers().Layout.reportDeleteComponent(oldParentComp, true);
            this.clearSelectedComponent();

            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                this._adjustPageComponentsToFillDeletedComponentSpace(oldParentComp, deletedComponentLayoutData);
            }

            this.fireEvent('onComponentDelete', addDeleteData);

            if (!omitTransactionRecording) {
                this.injects().UndoRedoManager.endTransaction();
            }

            if (!this.arePageCompsDraggableToFooter()) {
                this.onComponentChanged(true);
            }

        },
        /**
         * return behaviors from component list using compIds as keys
         * @param changedComponents
         * @returns {Object|null}
         * @private
         */
        _getAllSelectedComponentsBehaviors: function(changedComponents) {
            var actionsManager = this.resources.W.Preview.getPreviewManagers().Actions;
            var allActions = {};
            var compId;
            var compActions;
            for (var i = 0; i < changedComponents.length; i++) {
                compId = changedComponents[i].getComponentId();
                compActions = actionsManager.getActionsForComponent(compId);
                allActions = _.extend(allActions, compActions, function(source, target) {
                    return (source) ? source.concat(target) : target;
                });
            }
            return allActions;
        },

        _adjustPageComponentsToFillDeletedComponentSpace: function(oldParentComp, deletedComponentLayoutData) {
            var deletedCompTopY = deletedComponentLayoutData.y;
            var deletedCompBottomY = deletedCompTopY + deletedComponentLayoutData.height - 1;
            var i = 0;

            var deletedComponentSiblings = _.map(oldParentComp.getChildren(), function(view) {
                return(view.getLogic());
            });

            var yOverlappingDeletedComponentSiblings = _.filter(deletedComponentSiblings, function(comp) {
                var curCompTopY = comp.getY();
                var curCompBottomY = curCompTopY + comp.getPhysicalHeight() - 1;
                return W.Utils.Math.inRange(curCompTopY, deletedCompTopY, deletedCompBottomY) || W.Utils.Math.inRange(deletedCompTopY, curCompTopY, curCompBottomY);
            });

            var lengthToPullUpLowerComponents = deletedComponentLayoutData.height;

            //TODO take the const from LayoutAlgorithm
            //check if to shrink the gap of the deleted component with extra COMPONENT_MOBILE_MARGIN_X
            var COMPONENT_MOBILE_MARGIN_X = 10;
            var isMarginAboveDeletedComponentClearOfOtherComponents = this._isMarginAboveDeletedComponentClearOfOtherComponents(deletedCompTopY, COMPONENT_MOBILE_MARGIN_X, deletedComponentSiblings);
            if (isMarginAboveDeletedComponentClearOfOtherComponents) {
                lengthToPullUpLowerComponents += COMPONENT_MOBILE_MARGIN_X;
            }

            //in case the deleted component exceeded the container:
            if (deletedCompBottomY > oldParentComp.getHeight()) {
                var lengthOfDeletedComponentExceededParent = deletedCompBottomY - oldParentComp.getHeight();
                lengthToPullUpLowerComponents = lengthToPullUpLowerComponents - lengthOfDeletedComponentExceededParent;
            }

            for (i = 0; i < yOverlappingDeletedComponentSiblings.length; i++) {
                var curSiblings = yOverlappingDeletedComponentSiblings[i];
                var curSiblingsBottomY = curSiblings.getY() + curSiblings.getPhysicalHeight() - 1;
                if (curSiblingsBottomY > deletedCompBottomY) {
                    lengthToPullUpLowerComponents = 0;
                }
                else {
                    lengthToPullUpLowerComponents = Math.min(lengthToPullUpLowerComponents, deletedCompBottomY - curSiblingsBottomY);
                }
            }

            var affectedComponents = [];
            for (i = 0; i < deletedComponentSiblings.length; i++) {
                var curSibling = deletedComponentSiblings[i];
                if (lengthToPullUpLowerComponents && curSibling.getY() > deletedComponentLayoutData.y + deletedComponentLayoutData.height - 1) {
                    curSibling.setY(curSibling.getY() - lengthToPullUpLowerComponents);
                    affectedComponents.push(curSibling);
                }
            }

            if (affectedComponents.length > 0) {
                this.resources.W.Preview.getPreviewManagers().Layout.enforceAnchors(affectedComponents);
                this.resources.W.Preview.getPreviewManagers().Layout.reportMove(affectedComponents);
            }

            else if (lengthToPullUpLowerComponents > 0) { //no siblings were modified, but still need to resize the parent
                if (oldParentComp.getChildren().length > 0) {
                    oldParentComp.setHeight(oldParentComp.getPhysicalHeight() - lengthToPullUpLowerComponents);
                }
                else {
                    var CONTAINER_HEIGHT_IF_HAS_NO_CHILDREN = 50;
                    oldParentComp.setHeight(CONTAINER_HEIGHT_IF_HAS_NO_CHILDREN);
                }

                this.resources.W.Preview.getPreviewManagers().Layout.enforceAnchors([oldParentComp]);
                this.resources.W.Preview.getPreviewManagers().Layout.reportResize([oldParentComp]);
            }
        },

        _isMarginAboveDeletedComponentClearOfOtherComponents: function(deletedCompTopY, COMPONENT_MOBILE_MARGIN_X, deletedComponentSiblings) {
            var isTopMarginExist = true;
            if (deletedCompTopY < COMPONENT_MOBILE_MARGIN_X) {
                isTopMarginExist = false;
            } else {
                for (var i = 0; i < deletedComponentSiblings.length; i++) {
                    var curSibling = deletedComponentSiblings[i];
                    var curSiblingTopY = curSibling.getY();
                    var curSiblingBottomY = curSiblingTopY + curSibling.getPhysicalHeight() - 1;
                    if (W.Utils.Math.inRange(deletedCompTopY - 1, curSiblingTopY, curSiblingBottomY) || W.Utils.Math.inRange(deletedCompTopY - COMPONENT_MOBILE_MARGIN_X, curSiblingTopY, curSiblingBottomY)) {
                        isTopMarginExist = false;
                        break;
                    }
                }
            }
            return isTopMarginExist;
        },

        areRulersVisible: function() {
            return this._editorUI.areRulersVisible();
        },

        /**
         * Get components that have custom styles
         * @param changedComponents
         * @return {Array}
         * @private
         */
        _getComponentsWithCustomStyles: function(changedComponents) {
            var componentsWithCustomStylesList = changedComponents.filter(function(comp) {
                var style = comp.getStyle();
                return style && style.getIsCustomStyle();
            });

            return componentsWithCustomStylesList;
        },

        /**
         * Get component ids and style ids from components
         * @param components
         * @return {{styleIds: Array, componentIds: Array}}
         * @private
         */
        _getCompsAndCustomStyleIdLists: function(components) {
            var returnObj = {
                styleIds: [],
                componentIds: []
            };

            var currentStyle;

            for (var i = 0, j = components.length; i < j; i++) {
                currentStyle = components[i].getStyle();

                returnObj.styleIds.push(currentStyle.getId());
                returnObj.componentIds.push(components[i].getComponentId());
            }

            return returnObj;
        },

        moveCurrentComponentToOtherScope: function(event) {
            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                return;
            }
            event = event || {};
            if (!this._editedComponent.canMoveToOtherScope()) {
                return;
            }

            var scope = this.getSelectedComp().getParentComponent();
            var scopeId;
            if (scope) {
                scopeId = scope.getComponentId() || null;
            }

            //            var moveToMode = this._editMode == this.EDIT_MODE.CURRENT_PAGE ? this.EDIT_MODE.MASTER_PAGE : this.EDIT_MODE.CURRENT_PAGE;
            var currentEditMode = this.getComponentScope(this._editedComponent);
            var moveToMode = (currentEditMode == this.EDIT_MODE.CURRENT_PAGE) ? this.EDIT_MODE.MASTER_PAGE : this.EDIT_MODE.CURRENT_PAGE;
            var moveToScopeNode = this.getScopeNode(moveToMode);
            var globalPosition = this.resources.W.Preview.getGlobalRefNodePositionInEditor(this._editedComponent);

            //            this._editorComponents.editingFrame.removeEditedComponentFromContainer();

            var geometry = this._editorComponents.editingFrame.getContainersGeometry(moveToScopeNode, moveToMode == this.EDIT_MODE.MASTER_PAGE);
            var containerGeometry = this._editorComponents.editingFrame.getEditedComponentContainerInPosition(globalPosition.x, globalPosition.y, geometry);

            var isPanelOpen = this._editorComponents.propertyPanel.isEnabled();

            this._editorComponents.editingFrame.addEditedComponentToContainer(containerGeometry ? containerGeometry.htmlNode : moveToScopeNode, globalPosition, event.page, isPanelOpen, true);
            this._editorComponents.editingFrame._updateAnchorGuides();

            if (moveToMode == this.EDIT_MODE.MASTER_PAGE) {
                //report bi event
                LOG.reportEvent(wixEvents.SHOW_IN_ALL_PAGES_SELECTED, {c1: this._editedComponent.className});
            }

            var selectedComps = this.getAllSelectedComponents();
            this.resources.W.Preview.getPreviewManagers().Layout.reportMove(selectedComps);

            this._editedComponent.saveCurrentCoordinates();
            this._editedComponent.saveCurrentDimensions();
        },

        getAllSelectedComponents: function() {
            if (!this._editedComponent) {
                return [];
            }

            var changedComps;
            if (this._editedComponent.isMultiSelect) {
                changedComps = this._editedComponent.getSelectedComps();
            }
            else {
                changedComps = [this._editedComponent];
            }
            return changedComps;
        },

        _getNecessarySiteLoadedData: function() {
            return ['#SITE_STRUCTURE'];
        },

        /**
         * override
         */
        //TODO - this is ugly. maybe we don't need that override at all. check if unnecessary, if not  - remove the MF
        _saveCurrentDocument: function() {
            this._commandRegistrar._saveCommandRegistrar._saveCurrentDocument();
        },

        _onComponentData: function(dataObject) {
            this._componentData = {};
            var listData = dataObject && dataObject.get("items");

            if (!listData) {
                LOG.reportError(wixErrors.NO_ITEMS_IN_ADD_COMPONENT,
                    "WEditorManager",
                    "_onComponentData");
                return this.resources.W.Utils.debugTrace("WEditor: missing component data or data list");
            }
            for (var key in listData) {
                var rec = listData[key];
                var compDef = rec.component;
                if (typeof compDef === 'function') {
                    compDef = compDef();
                }
                this._componentData[key] = compDef;
            }
        },

        setKeysEnabled: function(isEnabled) {
            resource.getResources(['W.InputBindings'], function(resources) {
                resources.W.InputBindings.setKeysEnabled(isEnabled);
            });
        },

        getKeysEnabled: function() {
            resource.getResources(['W.InputBindings'], function(resources) {
                return resources.W.InputBindings.getKeysEnabled();
            });
        },

        getKeysEnabledPromise: function() {
            var res = Q.defer();
            resource.getResources(['W.InputBindings'], function(resources) {
                res.resolve(resources.W.InputBindings.getKeysEnabled());
            });
            return res.promise;
        },

        /**
         * Register editor commands. Called by the EditorManagerBase initialize.
         */
        _registerCommands: function() {
            this.parent(); // register commands of super classes.
            this._commandRegistrar.registerCommands();
        },

        //adds uId and htmlId for each component Data
        _createDataItemsForPageComponents: function(itemName, componentList, pageHtmlId) {
            var i;
            for (i = 0; i < componentList.length; i++) {
                var compDefData = componentList[i];

                if (compDefData.data) {
                    var addedDataId = this._addPreviewDataItem(itemName, compDefData.data, compDefData.dataRefs);
                    // Set component unique id to match data
                    compDefData.uID = addedDataId;
                }
                var compName = componentList[i].componentType.substr(componentList[i].componentType.lastIndexOf('.'));
                compDefData.htmlId = W.Preview.getPreviewManagers().Utils.getUniqueId();

                if (compDefData.components) {
                    this._createDataItemsForPageComponents(itemName, compDefData.components, pageHtmlId);
                }
            }
        },

        _processTransitions: function(data) {
            try {
                var pageGroup = W.Preview.getPreviewManagers().Viewer.getPageGroup();
                var trans = pageGroup.getComponentProperty("transition");
                var items = data.get('items');
                var changed = false;
                if (items && items.length) {
                    var i;
                    for (i = items.length - 1; i >= 0; --i) {
                        var item = items[i];
                        var selected = (item.value == trans);
                        if (selected != item.selected) {
                            changed = true;
                            item.selected = selected;
                        }
                    }
                }
                if (changed) {
                    data.setData(data.getData());
                }
            }
            catch (e) {

            }
        },

        getPageWidth: function() {
            return W.Preview.getPreviewManagers().Viewer.getPageGroup().getWidth();
        },

        _lockEditorBeforeTransition: function() {
            window.setPreloaderState('invisibleLockEditor');
            this._transitionLockTimer = window.setTimeout(function() {
                window.setPreloaderState('ready');
            }, 5000);
        },
        _unlockEditorAfterTransition: function() {
            window.clearTimeout(this._transitionLockTimer);
            window.setTimeout(function() {
                window.setPreloaderState('ready');
            }, 200);
        },
        //Experiment HourGlass.New was promoted to feature on Wed Oct 24 12:08:57 IST 2012
        _onPageTransitionStarted: function() {
            this._lockEditorBeforeTransition();
            this.setKeysEnabled(false);
            this._editorUI.setState('progress', 'cursor');
        },

        //Experiment HourGlass.New was promoted to feature on Wed Oct 24 12:08:57 IST 2012
        _onPageTransitionEnded: function() {
            window.scrollTo(0, 0); // fix scrolling issue of transition
            this.setKeysEnabled(true);
            this._editorUI.setState('normal', 'cursor');
            this._unlockEditorAfterTransition();
        },
        isComponentVisibleInViewport: function(comp) {
            return (!this._isComponentAboveViewport(comp) && !this._isComponentBelowViewport(comp));
        },
        toggleSnapToObject: function(toggleValue) {
            if (toggleValue) { //on the first time we call this function with default value
                this._snapToObjectEnabled = toggleValue;
            }
            else {
                this._snapToObjectEnabled = !this._snapToObjectEnabled;
                LOG.reportEvent(wixEvents.SNAP_TO_TOGGLE, {i1: !!this._snapToObjectEnabled});
            }
        },
        isSnapToObjectEnabled: function() {
            return this._snapToObjectEnabled;
        },
        getGridScale: function() {
            return this._curGridScale;
        },

        setGridScale: function(value) {
            this._curGridScale = value;
        },
        getEditorUI: function() {
            //bbb.bbb
            return this._editorUI;
        },

        _setMetaSiteData: function() {
            if (window.editorModel && window.editorModel.metaSiteData) {
                var metaSiteData = window.editorModel.metaSiteData;

                var dataItem = {
                    "type": 'SiteSettings',
                    "siteName": metaSiteData.siteName,
                    "siteTitleSEO": metaSiteData.title,
                    "thumbnail": metaSiteData.thumbnail,
                    "favicon": metaSiteData.favicon,
                    "allowSEFindSite": metaSiteData.indexable,
                    "suppressTrackingCookies": metaSiteData.suppressTrackingCookies
                };

                if (metaSiteData.metaTags) {
                    var i;
                    for (i = 0; i < metaSiteData.metaTags.length; i++) {
                        var tag = metaSiteData.metaTags[i];
                        if (tag.name == "keywords") {
                            dataItem.keywordsSEO = tag.value;
                        }
                        else if (tag.name == "description") {
                            dataItem.siteDescriptionSEO = tag.value;
                        }
                        else if (tag.name == "fb_admins_meta_tag") {
                            dataItem.fbAdminsUserId = tag.value;
                        }
                    }
                }

                W.Data.addDataItem('SITE_SETTINGS', dataItem);
            }
            else {
                W.Data.addDataItem('SITE_SETTINGS', {type: 'SiteSettings'});
            }

            this._handleMultipleStructureOffering();
        },

        _handleMultipleStructureOffering: function() {
            var dataItem;
            if (!W.Config.getEditorModelProperty('metaSiteData')) {
                dataItem = this.resources.W.Data.addDataItem('MULTIPLE_STRUCTURE', {"type": 'MultipleStructureOffering'});
                return;
            }

            var multipleStructureOfferingData = {
                "type": "MultipleStructureOffering"
            };
            var hasMobileStructure = W.Config.getEditorModelProperty('metaSiteData').adaptiveMobileOn;

            multipleStructureOfferingData['hasMobileStructure'] = hasMobileStructure;

            dataItem = this.resources.W.Data.addDataItem('MULTIPLE_STRUCTURE', multipleStructureOfferingData);

            dataItem.on(Constants.DataEvents.DATA_CHANGED, this, function(eventInfo) {
                var oldValue = eventInfo.data.oldValue;
                var newValue = eventInfo.data.newValue;
                var changedDataField = eventInfo.data.field;
                if (changedDataField !== 'hasMobileStructure') {
                    return;
                }
                if (_.isEqual(newValue, oldValue) || !_.isObject(newValue)) {
                    return;
                }
                var eventSender = (eventInfo.data.dataItem) ? eventInfo.data.dataItem.get('origin') : null;
                if(eventSender){
                    eventSender = (eventSender.toLowerCase().indexOf('publish')>-1) ? 'publish_page' : 'mobile_editor';
                }
                this._handleChangeInMobileOptimizedFlag(newValue, eventSender);
            });
        },

        _handleChangeInMobileOptimizedFlag: function(newValue, eventSender) {
            var contactDataItem = this.resources.W.Data.getDataByQuery('#CONTACT_INFORMATION');

            if (newValue.hasMobileStructure === true){
                LOG.reportEvent(wixEvents.MOBILE_EDITOR_MOBILE_VIEW_ON, {"c1":eventSender});
                this._handleMobileOptimizedOn(contactDataItem);

            } else if (newValue.hasMobileStructure === false){
                LOG.reportEvent(wixEvents.MOBILE_EDITOR_MOBILE_VIEW_OFF, {"c1":eventSender});
                this._handleMobileOptimizedOff(contactDataItem);
            }
        },

        _gotoSitePage: function(pageId) {
            this._sitePageChangeHandler(null, pageId, true);
        },

        _isComponentBelowViewport: function(comp) {
            var compTopGlobalPosition = comp.getGlobalPosition().y;
            var previewOffset = this.resources.W.Preview.getPreviewPosition().y;
            var bottomOfViewport = window.innerHeight + window.getScroll().y - previewOffset;
            return (compTopGlobalPosition > bottomOfViewport);
        },
        _isComponentAboveViewport: function(comp) {
            var compTopGlobalPosition = comp.getGlobalPosition().y;
            var compBottomGlobalPosition = compTopGlobalPosition + comp.getHeight();
            var topOfViewport = window.getScroll().y;
            return (compBottomGlobalPosition < topOfViewport);
        },
        isEditedComponentVisibleInViewport: function() {
            return this.isComponentVisibleInViewport(this._editedComponent);
        },

        showEditedComponentInViewPort: function() {
            if (this.isEditedComponentVisibleInViewport()) {
                return;
            }

            var compGlobalPosition = this._editedComponent.getGlobalPosition();
            var compTopGlobalPosition = compGlobalPosition.y;
            if (typeof this._editedComponent.shouldBeFixedPosition === 'function' && this._editedComponent.shouldBeFixedPosition()) {
                return;
            }
            window.scroll(window.getScroll().x, compTopGlobalPosition - 50);
        },

        /**
         * A better disable, using clearTimeout instead of a flag condition
         */
        disableAutoSave: function() {
            if (this._autoSaveTimeoutTimer) {
                clearTimeout(this._autoSaveTimeoutTimer);
            }
        },
        /**
         * If set to a numerical value larger than 0, will postpone the auto save by the
         * time in millisecond passed to the function
         *
         * Important: there is no break condition for the timeout, you must either use cancelPostponeAutoSave or disableAutoSave
         * @param millisec
         */
        setPostponeAutoSave: function(millisec) {
            this._postponeAutoSaveBy = (typeof millisec === 'number' && millisec > 0) ? millisec : 0;
        },

        /**
         * Continue with autosave
         */
        cancelPostponeAutoSave: function() {
            this.setPostponeAutoSave(0);
        },

        _initAutoSaveTimeout: function(timeout) {
            timeout = (typeof timeout === 'number') ? timeout : this.MILLISECONDS_TO_POP_UP_AUTO_FIRST_SAVE;
            this._postponeAutoSaveBy = (typeof this._postponeAutoSaveBy === 'number') ? this._postponeAutoSaveBy : 0;

            this._autoSaveTimeoutTimer = setTimeout(function() {
                if (this._postponeAutoSaveBy > 0) {
                    this._initAutoSaveTimeout(this._postponeAutoSaveBy);
                }
                else {
                    W.Commands.executeCommand('WEditorCommands.Save');
                }
            }.bind(this), timeout);
        },

        _enableCopy: function(isEnabled) {
            var cpyCommand = W.Commands.getCommand('EditCommands.Copy');
            if (isEnabled) {
                cpyCommand.enable();
            }
            else {
                cpyCommand.disable();
            }
        },

        roundToGrid: function(x, isControlPressed) {
            var gridScale = this.getGridScale();
            if (isControlPressed) {
                gridScale = (gridScale == 1) ? this.DEFAULT_GRID_SCALE : 1;
            }
            return x - (x % gridScale);
        },

        getArrayOfSelectedComponents: function() {
            var changedComps;
            if (this._editedComponent.isMultiSelect) {
                changedComps = this._editedComponent.getSelectedComps();
            }
            else {
                changedComps = [this._editedComponent];
            }
            return changedComps;
        },

        deletePage: function(pageData) {
            var self = this;
            this.getPageConfigPromise(pageData.getData()).then(function(config) {
                if (config.handleDeletePage) {
                    config.handleDeletePage(pageData, self._actualDeletePage); //_actualDeleteMultiplPages
                }
                else {
                    // If this is the last page, provide an error message
                    if (self.getSiteStructure().get('pages').length == 1) {
                        W.EditorDialogs.openPromptDialog(
                            W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_LASTPAGE_DIALOG_TITLE'),
                            W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_LASTPAGE_DIALOG_TEXT'),
                            undefined,
                            W.EditorDialogs.DialogButtonSet.OK,
                            function() {
                            }
                        );
                        return;
                    }

                    // Find page node and remove it
                    var pageNode = self.resources.W.Preview.getCompByID(pageData.get('id'));


                    var tpaPageComponents = pageNode.getLogic().getPageComponents().filter(function (component) {
                        return component.isTpa && component.isPage;
                    });

                    if (tpaPageComponents.length > 0) {
                        self._handleDeleteTpaPage(pageData, tpaPageComponents);

                    } else {
                        var tpaPageComponents = pageNode.getLogic().getPageComponents().filter(function(component) {
                            return component.isTpa;
                        });

                        var dialogText = 'DELETE_PAGE_DIALOG_TEXT';
                        if (tpaPageComponents.length > 0) {
                            var premiumComponents = tpaPageComponents.filter(function(tpaComponent) {
                                return tpaComponent.isPremiumApp();
                            });

                            if (premiumComponents.length > 0) {
                                dialogText = 'DELETE_PAGE_CONTAINING_TPA_COMPONENTS_TEXT';
                            }
                        }

                        // Using error dialog because it should be general dialog..
                        self.resources.W.EditorDialogs.openPromptDialog(
                            self.resources.W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_DIALOG_TITLE'),
                                self.resources.W.Resources.get('EDITOR_LANGUAGE', dialogText) + ' "' + pageData.get('title') + '"?',
                            undefined,
                            self.resources.W.EditorDialogs.DialogButtonSet.DELETE_CANCEL,
                            function(response) {
                                if (response.result == "DELETE") {
                                    self._actualDeletePage(pageData);
                                }
                            })
                        ;
                    }
                }
            });
        },

        _handleDeleteTpaPage: function (pageData, tpaPageComponents) {
            var self = this;
            this.getPageConfigPromise(pageData.getData()).then(function (config) {
                if (config.handleDeletePage) {
                    config.handleDeletePage(pageData, self._actualDeletePage);
                }
                else {
                    // If this is the last page, provide an error message
                    if (self.getSiteStructure().get('pages').length == 1) {
                        W.EditorDialogs.openPromptDialog(
                            W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_LASTPAGE_DIALOG_TITLE'),
                            W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_LASTPAGE_DIALOG_TEXT'),
                            undefined,
                            W.EditorDialogs.DialogButtonSet.OK,
                            function () {
                            }
                        );
                        return;
                    }

                    var dialogTextPostfix = 'DELETE_PAGE_WITH_APP_DIALOG_TEXT_POSTFIX';
                    var premiumComponents = tpaPageComponents.filter(function (tpaComponent) {
                        return tpaComponent.isPremiumApp();
                    });
                    if (premiumComponents.length > 0) {
                        dialogTextPostfix = 'DELETE_PAGE_WITH_PREMIUM_APP_DIALOG_TEXT_POSTFIX';
                    }

                    // Using error dialog because it should be general dialog..
                    self.resources.W.EditorDialogs.openPromptDialog(
                        self.resources.W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_WITH_APP_DIALOG_TITLE'),
                            self.resources.W.Resources.get('EDITOR_LANGUAGE', 'DELETE_PAGE_WITH_APP_DIALOG_TEXT_PREFIX') + ' "' + pageData.get('title') + '" ' + self.resources.W.Resources.get('EDITOR_LANGUAGE', dialogTextPostfix),
                        undefined,
                        self.resources.W.EditorDialogs.DialogButtonSet.DELETE_CANCEL,
                        function (response) {
                            if (response.result == "DELETE") {
                                this.resources.W.Commands.executeCommand(
                                    'WEditorCommands.DeletePageAppCompleted',
                                    {tpaApplicationId: pageData.getData().tpaApplicationId,
                                        pageId: pageData.getData().id,
                                        compId: tpaPageComponents[0]._compId
                                    }
                                );
                                self._actualDeletePage(pageData);
                            }
                        });
                }
            });
        },
        _actualDeleteSinglePage: function(pageData, deferred){
            var previewManager = this.resources.W.Preview.getPreviewManagers();
            var pageId = pageData.get('id');
            var pageToDelete = this.resources.W.Preview.getCompLogicById(pageId);
            var mainMenuData = previewManager.Data.getDataByQuery('#MAIN_MENU');
            this.resources.W.Commands.executeCommand("WEditorCommands.BeforeDeletePage", pageData);

            this._reportTPAPageDeletion(pageToDelete);
            mainMenuData.deleteNavigationItem('#' + pageToDelete.getComponentId());

            pageToDelete.delayedDispose(function() {
                previewManager.Data.flagDataChange();
                this._cleanReferencesToDeletedPage(previewManager, pageToDelete);
                this.resources.W.Commands.executeCommand(
                    'WEditorCommands.DeletePageCompleted',
                    {page: pageData});
                deferred.resolve(pageId);
            }.bind(this));

        },

        _actualDeletePage: function(pagesData, pageDeletedCallback, shouldNotGotoOtherPage){
            var pageDataArray = _.isArray(pagesData) ? pagesData : [pagesData];
            var orderedPageIdsArray;
            var pageIdsToDelete = _.map(pageDataArray, function(pageData){
                return pageData.get('id');
            });
            var previewManager = this.resources.W.Preview.getPreviewManagers();

            orderedPageIdsArray = this._getOrderedPageIdsExcludingDeletedPages(previewManager, pageIdsToDelete);

            var completeDelete = function(){
                this._updateHomePage(previewManager, pageIdsToDelete, orderedPageIdsArray);

                var promises = [];
                _.forEach(pageDataArray, function(pageData){
                    var deferred = Q.defer();
                    this._actualDeleteSinglePage(pageData, deferred);
                    promises.push(deferred.promise);
                }, this);

                function onAllResolved(){
                    if (pageDeletedCallback){
                        var pagesData = pageDataArray.length === 1 ? pageDataArray[0] : pageDataArray;
                        pageDeletedCallback(pagesData);
                    }
                }
                function onAnyRejected(){
                    var failedIndex = _.findIndex(promises,function(promise){
                        //if it's resolved, the promise is switched with the resolved value, which in our case is a string - the pageId.
                        //meaning if it's not a string, it's a rejected promise object.
                        return typeof promise !== 'string';
                    });
                    LOG.reportError(wixErrors.ERROR_WHILE_DELETING_PAGES, 'WEditorManager.LandingPages', '_actualDeletePage', pageIdsToDelete[failedIndex]);
                }
                Q.all(promises).then(onAllResolved, onAnyRejected).done();
            }.bind(this);

            if (!shouldNotGotoOtherPage) {
                var pageChangeCompleteCommand = previewManager.Commands.getCommand("WViewerCommands.PageChangeComplete");
                pageChangeCompleteCommand.registerListener(this, function(){
                    pageChangeCompleteCommand.unregisterListener(this);
                    completeDelete();
                });

                //navigate to new page
                this.resources.W.Commands.executeCommand("EditorCommands.gotoSitePage", _.first(orderedPageIdsArray));
            } else {
                completeDelete();
            }
        },

        _reportTPAPageDeletion: function(pageToDelete) {
            var tpaPageComponents = pageToDelete.getPageComponents().filter(function(component) {
                return component.isTpa;
            });

            var isTpaPage = (pageToDelete.isThirdPartyApplicationPage()) ? 1 : 0;
            LOG.reportEvent(wixEvents.REMOVE_PAGE, {i1: isTpaPage, c2: pageToDelete.getComponentId()});

            tpaPageComponents.forEach(function(tpaComponent) {
                var appData = tpaComponent.getAppData();
                var eventParams = {c1: appData.appDefinitionName, g1: appData.appDefinitionId, c2: tpaComponent.getComponentId()};
                if (appData.demoMode) {
                    eventParams.i2 = 'template-app';
                }
                LOG.reportEvent(wixEvents.APPS_FLOW_APP_REMOVED_FROM_STAGE, eventParams);
            });
        },

        _deletePageOnPageChangeCompleted: function(pageToDelete, pageDeletedCallback){
            var previewManager = this.resources.W.Preview.getPreviewManagers();
            var pageData = pageToDelete.getDataItem();

            //please keep this before dispose
            var mainMenuData = previewManager.Data.getDataByQuery('#MAIN_MENU');
            mainMenuData.deleteNavigationItem('#' + pageToDelete.getComponentId());

            pageToDelete.delayedDispose(function() {
                previewManager.Data.flagDataChange();
                this._cleanReferencesToDeletedPage(previewManager, pageToDelete);
                this.resources.W.Commands.executeCommand(
                    'WEditorCommands.DeletePageCompleted',
                    {page: pageData});

                if (pageDeletedCallback) {
                    pageDeletedCallback(pageData);
                }
            }.bind(this));
        },

        _cleanReferencesToDeletedPage: function(previewManager, deletedPage){
            var pageIndex;
            previewManager.Viewer.removePage(deletedPage);
            previewManager.Viewer.indexPages();
            previewManager.Viewer.updatePagesData();
            pageIndex = this._pagesToDelete.indexOf(deletedPage.getComponentId());
            if (pageIndex > -1) {
                this._pagesToDelete.slice(pageIndex, 1);
            }
        },

        _getOrderedPageIdsExcludingDeletedPages: function(previewManager, pageIdsToDelete){
            var pageIds = _.invoke(previewManager.Data.getDataByQuery('#SITE_STRUCTURE').get('pages'), 'slice', 1); //removing the # from the page ids
            return _.xor(pageIds, pageIdsToDelete);
        },

        /**
         *
         * @param previewManager
         * @param {String} deletedPageId
         * @param {String[]} possiblePageIds
         * @private
         */
        _updateHomePage: function(previewManager, deletedPageIds, possiblePageIds){
            if (_.contains(deletedPageIds, previewManager.Viewer.getHomePageId())){
                var pagesData = previewManager.Viewer.getPagesData();
                var dataOfPossibleHomePages = _.map(possiblePageIds, function(pageId){
                    return pagesData[pageId];
                });
                var nextHomePageData = _.find(dataOfPossibleHomePages, {_data: {hidePage: false}}) || dataOfPossibleHomePages[0];

                this.resources.W.Commands.executeCommand("WEditorCommands.SetHomepage", {
                    currentPageId: nextHomePageData.get('id')
                });
            }
        },

        isPageComponent: function(componentClassName) {
            return componentClassName === 'mobile.core.components.Page' ||
                componentClassName === 'core.components.Page' ||
                componentClassName === 'wixapps.integration.components.AppPage';
        },

        _bindQuickActionsDataToSocialLinksData: function() {
            var that = this;
            this.resources.W.Data.getDataByQuery('#SOCIAL_LINKS', function(socialLinksData) {
                that.resources.W.Data.getDataByQuery('#QUICK_ACTIONS', function(quickActionsData) {
                    that.resources.W.Data.getDataByQuery('#CONTACT_INFORMATION', function(contactInformationData) {
                        var phoneContactInformationDataWasNotEnteredYet = true;
                        var emailContactInformationDataWasNotEnteredYet = true;
                        var addressContactInformationDataWasNotEnteredYet = true;
                        var socialLinksDataWasNotEnteredYet = true;
                        contactInformationData.addEvent('dataChanged', function() {
                            if (!contactInformationData.get('phone')) {
                                quickActionsData.set('phoneEnabled', false);
                            }
                            else {
                                if (phoneContactInformationDataWasNotEnteredYet) {
                                    phoneContactInformationDataWasNotEnteredYet = false;
                                    quickActionsData.set('phoneEnabled', true);
                                }
                            }
                            if (!contactInformationData.get('email')) {
                                quickActionsData.set('emailEnabled', false);
                            }
                            else {
                                if (emailContactInformationDataWasNotEnteredYet) {
                                    emailContactInformationDataWasNotEnteredYet = false;
                                    quickActionsData.set('emailEnabled', true);
                                }
                            }
                            if (!contactInformationData.get('address')) {
                                quickActionsData.set('addressEnabled', false);
                            }
                            else {
                                if (addressContactInformationDataWasNotEnteredYet) {
                                    addressContactInformationDataWasNotEnteredYet = false;
                                    quickActionsData.set('addressEnabled', true);
                                }
                            }

                        });

                        socialLinksData.addEvent('dataChanged', function() {
                            if (!that.isSomeSocialMediaAdded(socialLinksData)) {
                                quickActionsData.set('socialLinksEnabled', false);
                            }
                            else {
                                if (socialLinksDataWasNotEnteredYet) {
                                    socialLinksDataWasNotEnteredYet = false;
                                    quickActionsData.set('socialLinksEnabled', true);
                                }
                            }
                        });
                    });
                });
            });
        },
        //TODO - must be a better way - maybe move this function to DataItemWithSchema?
        isSomeSocialMediaAdded: function(socialLinksData) {
            var socialLinkData = socialLinksData.getData();
            for (var property in socialLinkData) {
                if (socialLinkData.hasOwnProperty(property) && property !== 'id' && property !== 'type' && property !== 'metaData' && socialLinkData[property]) {
                    return true;
                }
            }
            return false;
        },

        setViewerMode: function(mode){
            this._secondaryPreviewReadyCommand = W.Commands.registerCommand("WEditorCommands.SecondaryPreviewReady");

            var currentMode = this.resources.W.Config.env.$viewingDevice;
            if (!Object.contains(Constants.ViewerTypesParams.TYPES, mode) || currentMode === mode) {
                return;
            }

            this.clearSelectedComponent();

            switch (mode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:

                    try {
                        W.Preview.getMultiViewersHandler().switchToSecondaryPreview(this._editMode, Constants.ViewerTypesParams.TYPES.MOBILE);
                    }
                    catch (err) {
                        this._onErrorSwitchingToMobileEditor(err);
                        return;
                    }
                    //Since viewer is rerendering on mobile, this must happen async, after the viewer is ready
                    this._secondaryPreviewReadyCommand.registerListener(this, this._setSecondaryEditorInterface);
                    this.resources.W.Commands.executeCommand("EditCommands.EnableEditCommandsOnEditorModeSwitch", {isEnabled: false, isMobileEditorMode: true});

                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:

                    this.setForcePropertyPanelVisible(true);

                    W.Preview.getMultiViewersHandler().switchToMainPreview(this._editMode);
                    this.resources.W.Commands.executeCommand("EditCommands.EnableEditCommandsOnEditorModeSwitch", {isEnabled: true, isMobileEditorMode: false});
                    //This line must be after switchToMainPreview
                    this._editorUI.hideMobileControls();

                    break;
            }
        },

        _onErrorSwitchingToMobileEditor: function(err) {
            setTimeout(function() {
                W.Commands.executeCommand("WEditorCommands.SetViewerMode", {mode: Constants.ViewerTypesParams.TYPES.DESKTOP});
                var errParams = {};

                var errType = err.type || err;

                switch (errType) {
                    case "DESKTOP_STRUCTURE_NOT_VALID":
                        errParams.wixError = wixErrors.DID_NOT_SWITCH_TO_MOBILE_DUE_TO_CORRUPTION;
                        errParams.errorDescriptionKey = 'ERROR_SWITCH_MOBILE_SITE_CORRUPTED';
                        break;
                    case "MERGE_ALGORITHM_FAILED":
                        errParams.wixError = wixErrors.DID_NOT_SWITCH_TO_MOBILE_DUE_TO_UNKNOWN_MERGE_ALGO_ISSUE;
                        errParams.errorDescriptionKey = 'ERROR_SWITCH_MOBILE_UNKNOWN_REASON';
                        break;
                    case "CONVERSION_ALGORITHM_FAILED":
                        errParams.wixError = wixErrors.DID_NOT_SWITCH_TO_MOBILE_DUE_TO_UNKNOWN_CONVERSION_ALGO_ISSUE;
                        errParams.errorDescriptionKey = 'ERROR_SWITCH_MOBILE_UNKNOWN_REASON';
                        break;
                }

                LOG.reportError(errParams.wixError, 'setViewerMode', '', err.stack);
                this.resources.W.EditorDialogs.openPromptDialog(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERROR_SWITCH_MOBILE_TITLE'), this.resources.W.Resources.get('EDITOR_LANGUAGE', errParams.errorDescriptionKey) + ' (code: ' + errParams.wixError.errorCode + ')', "", this.resources.W.EditorDialogs.DialogButtonSet.OK);

            }.bind(this), 200);
        },

        _setSecondaryEditorInterface: function(viewerMode) {
            this._secondaryPreviewReadyCommand.unregisterListener(this);

            this._editorUI.showMobileControls();
            this.setForcePropertyPanelVisible(true);
        },

        getComponentFriendlyName: function(originalClassName, componentData) {
            return this.getComponentDataProvider(originalClassName).getComponentFriendlyName(componentData);
        },

        _onViewerStateChanged: function(params) {
            this.resources.W.Config.env.setViewingDevice(Constants.ViewerTypesParams.TYPES.MOBILE);
            this.resources.W.Commands.executeCommand('WPreviewCommands.ViewerStateChanged', params, this);
        },

        getPanelsLayer: function() {
            return this._editorComponents.propertyPanel || null;
        },

        isSupportedByMobilePanelUndo: function() {
            return this.getPanelsLayer().isSupportedByMobilePanelUndo();
        },

        deleteComponent: function (component, omitTransactionRecording) {
            if (!component.isDeleteableRecurse()) {
                return;
            }
            omitTransactionRecording = omitTransactionRecording || !!component.IS_DEAD;

            var oldParentComp = component.getParentComponent();
            var deletedComponentLayoutData = {
                height: component.getPhysicalHeight(),
                y: component.getY()
            };

            var changedComponents = [component];
            var changedComponentNodes = changedComponents.map(function (comp) {
                return comp.getViewNode();
            });
            var changedComponentData = this.injects().CompSerializer.serializeComponents(changedComponentNodes, true);

            var changedComponentIds = changedComponents.map(function (changedComp) {
                return changedComp.getComponentId();
            });

            var oldChildIdList = oldParentComp.getChildComponents().map(function (component) {
                return component.getLogic().getComponentId();
            });

            // Mark all custom styles data items as clean (not dirty)
            var changedComponentsWithCustomStyles = this._getComponentsWithCustomStyles(changedComponents);
            var compsAndCustomStyleIdLists = this._getCompsAndCustomStyleIdLists(changedComponentsWithCustomStyles);
            var currentStyle;

            for (var i = 0, j = changedComponentsWithCustomStyles.length; i < j; i++) {
                currentStyle = changedComponentsWithCustomStyles[i].getStyle();
                currentStyle.getDataItem().markDataAsClean();
            }

            var styleData = {
                data: {
                    subType: 'StyleChangeByDelete',
                    changedComponentIds: compsAndCustomStyleIdLists.componentIds,
                    oldState: {style: compsAndCustomStyleIdLists.styleIds},
                    newState: {style: null}
                }
            };

            var zOrderData = {
                subType: 'zOrderChangeByDelete',
                changedComponentIds: changedComponentIds,
                oldState: {children: oldChildIdList},
                newState: {children: oldChildIdList}
            };

            var addDeleteData = {
                //This is the line added by ViewerRefactor.New
                componentData: changedComponentData,
                data: {
                    changedComponentIds: changedComponentIds,
                    oldState: {
                        parentId: oldParentComp._compId,
                        changedComponentData: changedComponentData
                    },
                    newState: {parentId: null,
                        changedComponentData: null
                    }
                }
            };

            var animationState = this._getAllSelectedComponentsBehaviors(changedComponents);

            var animationData = {
                data: {
                    subType: 'AnimationChangeByDelete',
                    changedComponentIds: changedComponentIds,
                    oldState: animationState,
                    newState: animationState
                }

            };

            if (!omitTransactionRecording) {
                this.injects().UndoRedoManager.startTransaction();
            }

            this.injects().Commands.executeCommand('WEditorCommands.ComponentStyleChanged', styleData);
            this.injects().Commands.executeCommand('WEditorCommands.ComponentBehaviorsChanged', animationData);

            this.injects().Preview.getPreviewManagers().Commands.executeCommand('WViewerCommands.ComponentZIndexChanged', {editedComponent: component, urmData: zOrderData});

            component.dispose();

            this.injects().Preview.getPreviewManagers().Layout.reportDeleteComponent(oldParentComp, true);
            if (component === this._editedComponent) {
                this.clearSelectedComponent();
            }

            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                this._adjustPageComponentsToFillDeletedComponentSpace(oldParentComp, deletedComponentLayoutData);
            }

            this.fireEvent('onComponentDelete', addDeleteData);

            if (!omitTransactionRecording) {
                this.injects().UndoRedoManager.endTransaction();
            }

            if (!this.arePageCompsDraggableToFooter()) {
                this.onComponentChanged(true);
            }
        },

        calcEditorCoordinates: function (comp, position, dimensions) {
            var coordinates = this._previewToEditor(comp, position);

            coordinates.w = (dimensions && dimensions.width) || this._getCompWidth(comp);
            coordinates.h = (dimensions && dimensions.height) || this._getCompHeight(comp);

            coordinates.right = coordinates.x + coordinates.w;
            coordinates.bottom = coordinates.y + coordinates.h;

            coordinates.center_x = Math.floor(coordinates.x + (coordinates.w / 2));
            coordinates.center_y = Math.floor(coordinates.y + (coordinates.h / 2));

            coordinates.comp = comp;

            return coordinates;
        },

        _previewToEditor: function (comp, position) {
            var coordinates = {};

            if (position === undefined) {
                coordinates.x = this._getCompX(comp);
                coordinates.y = this._getCompY(comp);
            } else {
                coordinates.x = position.x;
                coordinates.y = position.y;
            }

            var offset = {x: 0, y: 0};
            if (!(typeof comp.shouldBeFixedPosition === 'function' && comp.shouldBeFixedPosition())) {
                offset = comp.getViewNode().getParent().getPosition();
            }

            coordinates.x += offset.x - window.getScroll().x;
            coordinates.y += offset.y - window.getScroll().y;

            this.resources.W.Preview.previewToEditorCoordinates(coordinates);

            return coordinates;
        },

        _getCompWidth: function (comp) {
            if (comp.getAngle() !== 0) {
                return comp.getBoundingWidth();
            } else {
                return comp.getSelectableWidth();
            }
        },

        _getCompHeight: function (comp) {
            if (comp.getAngle() !== 0) {
                return comp.getBoundingHeight();
            } else {
                return comp.getSelectableHeight();
            }
        },

        _getCompY: function (comp) {
            if (comp.getAngle() !== 0) {
                return comp.getBoundingY();
            } else {
                return comp.getSelectableY();
            }
        },

        _getCompX: function (comp) {
            if (comp.getAngle() !== 0) {
                return comp.getBoundingX();
            } else {
                return comp.getSelectableX();
            }
        },

        isEditedComponentHidden: function() {
            return !!this._isEditedComponentHidden;
        },

        setEditedComponentHidden: function(isHidden) {
            this._isEditedComponentHidden = isHidden;
        },

        getDocumentHeight: function() {
            var body = document.body,
                html = document.documentElement;

            var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

            return height;
        }
    });
});
