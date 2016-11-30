define.component("wysiwyg.editor.components.PanelPresenter", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Commands', 'W.Config', 'W.Editor', 'W.Utils', 'W.Data', 'W.Components', 'W.Preview', 'W.AppsEditor2']);

    def.binds(['_onSitePageChanged', '_onWindowResize', '_handleViewerStateChange', '_handleEditModeChange', '_showHiddenElementsPanelOnce', 'showInnerSidePanel', '_backToParentPanel']);

    def.utilize(['wysiwyg.editor.components.BreadCrumb']);

    def.states({
        panels: [
            Constants.EditorUI.CLOSED_PANELS,
            Constants.EditorUI.DESIGN_PANEL,
            Constants.EditorUI.ADD_PANEL,
            Constants.EditorUI.PAGES_PANEL,
            Constants.EditorUI.SETTINGS_PANEL,
            Constants.EditorUI.MARKET_PANEL,
            Constants.EditorUI.NO_MARKET_PANEL,
            Constants.EditorUI.MOBILE_DESIGN_PANEL,
            Constants.EditorUI.MOBILE_ADD_PANEL,
            Constants.EditorUI.MOBILE_SETTINGS_PANEL,
            Constants.EditorUI.MOBILE_MARKET_PANEL,
            Constants.EditorUI.MOBILE_HIDDEN_ELEMENTS_PANEL
        ],
        mediaQueryWidth: [
            'noWidthState',
            'defaultWidth',
            'minimalWidth'
        ],
        mediaQueryHeight: [
            'noHeightState',
            'defaultHeight',
            'minimalHeight'
        ],
        editorMode: [
            'edit',
            'preview'
        ],
        viewDeviceMode: [
            'mobile',
            'desktop'
        ]
    });

    def.skinParts({
        mainEditorBar: { type: 'wysiwyg.editor.components.panels.MainEditorBar' },
        editStateBar: { type: 'wysiwyg.editor.components.EditModeStateBar' },
        sidePanel: { type: 'wysiwyg.editor.components.panels.base.SidePanel', argObject: {closeCommand: Constants.EditorUI.CLOSE_PANEL}},
        subPanel: { type: 'htmlElement'},
        propertyPanelContainer: { type: 'htmlElement' },
        propertyPanel: { type: 'wysiwyg.editor.components.panels.ComponentPanel' },
        floatingPanel: {type: 'wysiwyg.editor.components.panels.FloatingPropertyPanel'},

        // main tabs
        mainTabs: { type: 'wysiwyg.editor.components.Tabs', dataQuery: "#TOP_TABS"},

        // specific tabs
        addComponent: { type: 'wysiwyg.editor.components.panels.AddComponentPanel', autoCreate: false },
        designPanel: { type: 'wysiwyg.editor.components.panels.DesignPanel', autoCreate: false },
        masterComponents: { type: 'wysiwyg.editor.components.panels.MasterComponentPanel', autoCreate: false },
        pagesPanel: { type: 'wysiwyg.editor.components.panels.PagesPanel', autoCreate: false },
        settingsPanel: { type: 'wysiwyg.editor.components.panels.SettingsPanel', autoCreate: false },
        marketPanel: { type: 'tpa.editor.components.panels.MarketPanel', autoCreate: false },
        noMarket: { type: 'wysiwyg.editor.components.panels.MiniMarketPanel', autoCreate: false },

        // tabs drill-down
        backgroundDesign: { type: 'wysiwyg.editor.components.panels.BackgroundDesignPanel', autoCreate: false },
        backgroundEditor: { type: 'wysiwyg.editor.components.panels.BackgroundEditorPanel', autoCreate: false, dataQuery:"#TRANSIENT_CUSTOM_BG", argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} } ,
        pageSettings: { type: 'wysiwyg.editor.components.panels.PageSettingsPanel', autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },

        // sub-panels
        siteName: { type: 'wysiwyg.editor.components.panels.SiteNamePanel', dataQuery: "#SITE_SETTINGS", autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },
        statistics: { type: 'wysiwyg.editor.components.panels.StatisticsPanel', dataQuery: "#SITE_SETTINGS", autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },
        faviconAndThumbnail: { type: 'wysiwyg.editor.components.panels.FaviconAndThumbnailPanel', dataQuery: "#SITE_SETTINGS", autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },
        seo: { type: 'wysiwyg.editor.components.panels.SEOPanel', dataQuery: "#SITE_SETTINGS", autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },
        colorDesign: { type: 'wysiwyg.editor.components.panels.ColorsDesignPanel', autoCreate: false },
        customizeColors: { type: 'wysiwyg.editor.components.panels.DynamicPalettePanel', autoCreate: false },
        fonts: { type: 'wysiwyg.editor.components.panels.FontsPanel', autoCreate: false },
        customizeFonts: { type: 'wysiwyg.editor.components.panels.CustomizeFontsPanel', autoCreate: false },
        social: { type: 'wysiwyg.editor.components.panels.SocialPanel', dataQuery: "#SITE_SETTINGS", autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },
        contactInformation: {type: 'wysiwyg.editor.components.panels.ContactInformationPanel', autoCreate: false, dataQuery: "#CONTACT_INFORMATION", argObject: {closeCommand: 'EditorUI.ClosePanelOpenQuickActions'}},
        socialMedia: {type: 'wysiwyg.editor.components.panels.SocialMediaPanel', autoCreate: false, dataQuery: "#SOCIAL_LINKS", argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL}},

        //Mobile
        mobileDesign: { type: 'wysiwyg.editor.components.panels.MobileDesignPanel', autoCreate: false },
        mobileAdd: { type: 'wysiwyg.editor.components.panels.MobileAddPanel', autoCreate: false },
        mobileAddSubPanel: { type: 'wysiwyg.editor.components.panels.MobileAddSubPanel', autoCreate: false },
        mobileSettings: { type: 'wysiwyg.editor.components.panels.MobileSettingsPanel', autoCreate: false },
        mobileMarket: { type: 'wysiwyg.editor.components.panels.MobileMarketPanel', autoCreate: false },
        mobileHiddenElements: { type: 'wysiwyg.editor.components.panels.MobileHiddenElementsPanel', autoCreate: false },
        mobileActivationAlertContainer: { type: 'htmlElement'},
        mobileActivationAlert: { type: 'wysiwyg.editor.components.MobileActivationAlert', autoCreate: false, dataQuery: "#MULTIPLE_STRUCTURE" },
        mobileViewSelector: { type: 'wysiwyg.editor.components.panels.MobileViewSelectorPanel', autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL}, dataQuery: "#MULTIPLE_STRUCTURE"},
        mobileQuickActionsView: { type: 'wysiwyg.editor.components.panels.MobileQuickActionsViewPanel', autoCreate: false, dataQuery: "#QUICK_ACTIONS", argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL}},
        mobilePreloaderPanel: { type: 'wysiwyg.editor.components.panels.MobilePreloader', autoCreate: false, dataQuery: "#CONTACT_INFORMATION", argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },
        mobilePageSettings: { type: 'wysiwyg.editor.components.panels.MobilePageSettingsPanel', autoCreate: false, argObject: {closeCommand: Constants.EditorUI.CLOSE_SUB_PANEL} },

        //right side features
        feedbackButton: { type: 'wysiwyg.editor.components.inputs.FeedbackButton'},

        userPanel: { type: 'wysiwyg.editor.components.panels.UserPanel' }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this._addBGTransientDataItem();
            this._currentPanel = {panel: null};
            this._currentSubPanel = {panel: null};
            this._currentPropertyPanel = {panel: null};
            this._breadCrumb = new this.imports.BreadCrumb();
            this._panelsMap = {};
            this._cachedSubPanels = [];
            this._desktopComponentPanel = null;
            this._mobileComponentPanel = null;

            window.addEvent(Constants.CoreEvents.RESIZE, this._onWindowResize);

            this.resources.W.Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onSitePageChanged);

            this._registerCommandsAndListeners();

            this.parent(compId, viewNode, args);
        },

        _addBGTransientDataItem: function() {
            this.resources.W.Data.addDataItem('TRANSIENT_CUSTOM_BG', {"type": 'TransientCustomBG'});
        },

        _registerCommandsAndListeners: function () {
            var cmdmgr = this.resources.W.Commands;

            cmdmgr.registerCommandAndListener('WEditorCommands.rulerStateChanged', this, this._handleRulerStateChanged);
            cmdmgr.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handleEditModeChange);
            cmdmgr.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleViewerStateChange);
            cmdmgr.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleTabsDataChange);
            cmdmgr.registerCommandAndListener('WEditorCommands.SetViewerMode', this, this._handleViewerModeChange);

            this._mobileHideCommand = cmdmgr.registerCommand("WEditorCommands.DeletedComponentsListUpdated");

            // panels
            var _hideSidePanelCommand = cmdmgr.registerCommandAndListener(Constants.EditorUI.CLOSE_PANEL, this, this._hideEditorPanel);
            var _hideSubPanelCommand = cmdmgr.registerCommandAndListener(Constants.EditorUI.CLOSE_SUB_PANEL, this, this._hideSubPanel);
            var _hideAllPanelsCommand = cmdmgr.registerCommandAndListener(Constants.EditorUI.CLOSE_ALL_PANELS, this, this._hideAllPanels);
            var _closePropertyPanel = cmdmgr.registerCommandAndListener(Constants.EditorUI.CLOSE_PROPERTY_PANEL, this, this._onClosePropertyPanel);
            var _showPropertyPanelCommand = cmdmgr.registerCommandAndListener(Constants.EditorUI.OPEN_PROPERTY_PANEL, this, this.showPropertyPanel);
            // Floating Property Panel
            var _closeFloatingPanel = cmdmgr.registerCommandAndListener(Constants.EditorUI.CLOSE_FLOATING_PANEL, this, this.hideFloatingPropertyPanel);
            var _showFloatingPanelCommand = cmdmgr.registerCommandAndListener(Constants.EditorUI.OPEN_FLOATING_PANEL, this, this.showFloatingPropertyPanel);

            // tabs
            var _pagesCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Pages", this, this._showPagesPanel);
            var _settingsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Settings", this, this._showSettingsPanel);
            var _marketCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Market", this, this._showMarketPanel);
            var _designCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Design", this, this._showDesignPanel);
            var _showComponentCategoriesCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowComponentCategories", this, this._onShowComponentCategories);

            // tabs drill-down
            var _showBackgroundDesignPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowBackgroundDesignPanel", this, this._onShowBackgroundDesignPanel);
            var _showBackgroundEditorPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowBackgroundEditorPanel", this, this._onShowBackgroundEditorPanel);
            var _showColorsPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowColorsPanel", this, this._onShowColorsPanel);
            var _showFontsPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowFontsPanel", this, this._onShowFontsPanel);
            var _advancedDesignCommand = cmdmgr.registerCommandAndListener("WEditorCommands.AdvancedDesign", this, this._showAdvancedDesignPanel);

            // sub-panels
            var _showSiteName = cmdmgr.registerCommandAndListener("WEditorCommands.ShowSiteName", this, this._onShowSiteName);
            var _showFaviconAndThumbnail = cmdmgr.registerCommandAndListener("WEditorCommands.ShowFaviconAndThumbnail", this, this._onShowFaviconAndThumbnail);
            var _showSocial = cmdmgr.registerCommandAndListener("WEditorCommands.ShowSocial", this, this._onShowSocial);
            var _showSEO = cmdmgr.registerCommandAndListener("WEditorCommands.ShowSEO", this, this._onShowSEO);
            var _showStatistics = cmdmgr.registerCommandAndListener("WEditorCommands.ShowStatistics", this, this._onShowStatistics);
            var _chooseComponentStyle = cmdmgr.registerCommandAndListener("WEditorCommands.ChooseComponentStyle", this, this._showStyleSelectorPanel);
            var _customizeComponentStyle = cmdmgr.registerCommandAndListener("WEditorCommands.CustomizeComponentStyle", this, this._onCustomizeComponentStyle);
            var _customizeColorsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.CustomizeColors", this, this._onCustomizeColors);
            var _customizeFontsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.CustomizeFonts", this, this._onCustomizeFonts);
            var _customizeFontsDirectCommand = cmdmgr.registerCommandAndListener("WEditorCommands.CustomizeFontsDirect", this, this._onCustomizeFontsDirect);
            var _pageSettingsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.PageSettings", this, this._onPageSettings);
            var _backToParentPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.BackToParentPanel", this, this._backToParentPanel);
            var _showComponentCategoryCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowComponentCategory", this, this._onShowAddComponent);
            var _showContactInfo = cmdmgr.registerCommandAndListener("WEditorCommands.ShowContactInformation", this, this._showContactInformation);
            var _showMobileQuickActionsView = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileQuickActionsView", this, this._showMobileQuickActionsViewPanel);

            //Mobile
            var _mobilePagesCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobilePages", this, this._showMobilePagesPanel);
            var _mobileSettingsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobileSettings", this, this._showMobileSettingsPanel);
            var _mobileDesignCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobileDesign", this, this._showMobileDesignPanel);
            var _mobileAddCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobileAdd", this, this._showMobileAddPanel);
            this._showMobileComponentCategoryCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileComponentCategory", this, this._onShowMobileAddComponent);
            var _mobileMarketCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobileMarket", this, this._showMobileMarketPanel);
            var _mobilehiddenElementsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobileHiddenElements", this, this._showMobileHiddenElementsPanel);
            var _mobileMenuPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileMenuPanel", this, this._showMobileMenuDesignPanel);
            this._mobileMenuPropertyPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileMenuPropertyPanel", this, this._showMobileMenuPropertyPanel);
            var _mobileViewSelectorCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileViewSelector", this, this._showMobileViewSelectorPanel);
            var _showMobileBackgroundEditorPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileBackgroundEditorPanel", this, this._onShowMobileBackgroundEditorPanel);
            this._mobilePreloaderPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobilePreloaderPanel", this, this._showMobilePreloaderPanel);
            var _mobilePageSettingsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.MobilePageSettings", this, this._onPageSettings);
            var _mobileBackToTopButtonPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileBackToTopButtonPanel", this, this._showBackToTopButtonPanel);

            //Mobile Quick Action panels
            var _showSocialMedia = cmdmgr.registerCommandAndListener("WEditorCommands.ShowSocialMedia", this, this._showSocialMedia);
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;
            var mobileCompPanelClassName = 'wysiwyg.editor.components.panels.MobileComponentPanel';
            var mobileCompPanelSkinName = 'wysiwyg.editor.skins.panels.MobileComponentPanelSkin';

            if (invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE])) {
                this._desktopComponentPanel = this._skinParts.propertyPanel;
                this.resources.W.Components.createComponent(mobileCompPanelClassName, mobileCompPanelSkinName, null, null, null, function (panelLogic) {
                    this._mobileComponentPanel = panelLogic;
                }.bind(this));

                //feedback button
                this._fixFeedbackButtonPosition();
                this._skinParts.feedbackButton.on(Constants.CoreEvents.CLICK, this, this._onFeedbackButtonClick);
            }
        },

        _showPagesPanel: function () {
            this._showEditorPanel('pagesPanel');
        },

        _showSettingsPanel: function () {
            this._showEditorPanel('settingsPanel');
        },

        _showDesignPanel: function () {
            this._showEditorPanel('designPanel');
        },

        _showEditorPanel: function (panelName, callback) {
            if (panelName && typeof(panelName) === 'object') {
                panelName = panelName.skinPart;
            }
            this.resources.W.Editor.clearSelectedComponent(); //TODO: wire this to relevant presenter
            this.showComponentInSidePanel(panelName, true, null, panelName, callback);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_PANEL, {c1: panelName});
        },

        _showMarketPanel: function (panelName) {
            var isFacebookSite = this.resources.W.Config.isFacebookSite();
            var action = isFacebookSite ? 'noMarket' : 'marketPanel';
            var paramConst = isFacebookSite ? Constants.EditorUI.NO_MARKET_PANEL : Constants.EditorUI.MARKET_PANEL;
            var overrideState = isFacebookSite ? panelName : undefined;

            this.hidePropertyPanel();
            this.resources.W.Editor.clearSelectedComponent(); //TODO: wire this to relevant presenter
            this.showComponentInSidePanel(action, true, panelName, paramConst, undefined, overrideState);
        },

        _hideEditorPanel: function () {
            var current = this._currentPanel;
            this._clearSelectionAndDisposeCurrentPanel(current.panel, current.dispose);
            this.hideSidePanel();
            this.hideSubPanel();
        },

        _getCachedPanel: function (panelName, args) {
            if (!this._cachedSubPanels.length) {
                return false;
            }

            var panelData;

            if (args && args.options && args.options.allowMany) {
                panelData = _.filter(this._cachedSubPanels, function (cachedPanel) {
                    return cachedPanel.id === args.data.getData().id && cachedPanel.skinPart === panelName;
                })[0];
            }
            else {
                panelData = _.filter(this._cachedSubPanels, function (cachedPanel) {
                    return cachedPanel.skinPart === panelName;
                })[0];
            }

            if (panelData && panelData.args && panelData.args.options && panelData.args.options.allowMany) {
                if (panelData.panel.getDataItem().getData().id === args.data.getData().id) {
                    return panelData.panel;
                } else {
                    return false;
                }
            }

            if (panelData && panelData.panel) {
                return panelData.panel;
            }
            else {
                return false;
            }
        },

        _allowMany: function (args) {
            return args && args.options && args.options.allowMany;
        },

        _createPanelComponent: function (panelName, args, keep) {
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, {c1: null, c2: panelName});


            var cachedPanel = this._getCachedPanel(panelName, args);

            if (!!cachedPanel) {
                this._currentSubPanel.panel.collapse();
                this._currentSubPanel.panel = cachedPanel;
                cachedPanel.uncollapse();
                this.showSubPanelTheReal();
                window.fireEvent('resize');
                this._currentSubPanel.panel.fireEvent('subPanelOpened', { "panel": this._currentSubPanel.panel });
                return;
            }

            this.createComponentPart(panelName, false, args, null, null, null, function (comp, skinPart) {
                this._cachedSubPanels.push({
                    skinPart: skinPart,
                    panel: comp,
                    args: args,
                    id: args != null ? _.has(args, "allowMany") ? null : args && args.data && args.data.getData().id : null
                });

                if (_.has(this._currentSubPanel, "panel") && this._currentSubPanel.panel != null) {
                    this._currentSubPanel.panel.collapse();
                }

                this._currentSubPanel.panel = comp;

                this._insertPanelToContainer(this._skinParts.subPanel, comp);

                this.showSubPanelWithParentPanelSize(comp, keep);
            }.bind(this));
        },

        /**
         * @param panel the panel to clear the selection from (and dispose if needed).
         * @param shouldDispose true iff the panel should be disposed.
         */
        _clearSelectionAndDisposeCurrentPanel: function (panel, shouldDispose) {
            if (!panel) {
                return;
            }

            // fire event to clear panel selected buttons
            if (this._currentPanel.panel) {
                this._currentPanel.panel.fireEvent('subMenuCloses');
            }

            panel.fireEvent('panelHides');

            //ugly safari-hack
            this.resources.W.Utils.forceBrowserRepaint();

            this._currentPanel.panel = null;
        },

        /**
         * Show floating Property Panel
         */
        showFloatingPropertyPanel: function (position) {
            var floatingPanel = this._skinParts.floatingPanel;
            floatingPanel.setEditedComponent(position);
            floatingPanel.showPanel(position);
        },

        hideFloatingPropertyPanel: function () {
            this._skinParts.floatingPanel.hidePanel();
        },

        hideSidePanel: function () {
            this._skinParts.sidePanel.collapse();
        },

        showSidePanel: function () {
            this._skinParts.sidePanel.uncollapse();
        },

        hideSubPanel: function () {
            if (this._currentPanel && this._currentPanel.panel && this._currentPanel.panel != null) {
                this._currentPanel.panel.fireEvent('subMenuCloses');
            }
            this._skinParts.subPanel.collapse();
        },

        showSubPanelTheReal: function () {
            this._skinParts.subPanel.uncollapse();
        },

        showComponentInPanel: function (skinPart, keepComponent, args, state, callback, overrideState) {
            var showCallback = function (comp) {
                this.showPanel(comp, keepComponent, state, {
                    skinPart: skinPart,
                    args: args,
                    state: state
                });

                this._skinParts.mainTabs.switchPanel(overrideState || state); //TODO: Wire this to MainTabsPresenter

                if (callback) {
                    callback(comp);
                }
            }.bind(this);

            var comp = this._panelsMap[skinPart];
            if (comp) {
                showCallback(comp);
            }
            else {
                this.createComponentPart(skinPart, keepComponent, args, showCallback);
            }
        },

        showPanel: function (panel, keep, state, historyLink) {
            if (panel && W.AppsEditor2.isAppBuilderDialogOpened()) {
                this.resources.W.Commands.executeCommand("WAppsEditor2Commands.CloseAppBuilderManageDialog");
            }

            state = state || Constants.EditorUI.CLOSED_PANELS;
            var current = this._currentPanel;
            if (current.panel == panel) {
                return;
            }
            this.showSubPanel(null);
            if (panel) {
                panel.onBeforeShow(historyLink, state);
            }

            this._showPanel(panel, current, keep, this._skinParts.sidePanel);
            this.setState(state, 'panels');

            if (historyLink) {
                historyLink.name = panel.getName();
                historyLink.canGoBack = panel.canGoBack();
                this.pushHistory(historyLink);
            }
            this._updateBreadcrumbState();
        },

        hidePropertyPanel: function (stayClosed) {
            var panel = this.resources.W.Editor.getPanelsLayer();
            panel.disable();
            var current = this._currentPropertyPanel;
            panel.collapse();

            if (stayClosed && this.resources.W.Editor.FORCE_PROPERTY_PANEL_VISIBILITY) {
                this.resources.W.Editor.setForcePropertyPanelVisible(false);
            }
        },

        showSubPanelWithParentPanelSize: function (panel, keep) {
            panel._setHeightTimerCounter = 0;
            panel._setHeightTimerCounterMax = 10;

            var parentPanel = this._currentPanel.panel;
            parentPanel.addEvent(Constants.CoreEvents.RESIZE, _.bind(this._matchSubPanelHeight, this));
            parentPanel.addEvent(Constants.DataEvents.DATA_CHANGED, this._matchSubPanelHeight);

            //this.showSubPanel(panel, keep);
            this.showSubPanelTheReal();
            this._matchSubPanelHeight();
        },

        showSubPanel: function (panel, keep) {
            var current = this._currentSubPanel;
            if (current.panel == panel) {
                return;
            }
            this._showPanel(panel, current, keep, this._skinParts.subPanel);
        },

        showPropertyPanel: function (args) {
            var forceShowPanel = W.Editor.FORCE_PROPERTY_PANEL_VISIBILITY;
            args = args || {};

            if (this._shouldHidePanel()) {
                forceShowPanel = false;
                this.hidePropertyPanel(true);
            }
            else {
                W.TPAEditorManager.onSettingsOpen();

                var panel = this._skinParts.propertyPanel;
                panel.enable();
                panel.uncollapse();

                var current = this._currentPropertyPanel;
                if (current.panel != panel) {

                    if (!this.resources.W.AppsEditor2.isAppBuilderDialogOpened() || args.forceOpen) {
                        this.resources.W.Commands.executeCommand("WAppsEditor2Commands.CloseAppBuilderManageDialog");
                        this._showPanel(panel, current, true, this._skinParts.propertyPanelContainer);
                    }
                }
            }

            this.resources.W.Editor.setForcePropertyPanelVisible(forceShowPanel);

        },

        _shouldHidePanel: function () {
            var isMobileMode = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            var editedComponent = W.Editor.getEditedComponent();
            var editedComponentEditorMetaData = W.Editor.getComponentMetaData(editedComponent);

            return !!(isMobileMode && editedComponentEditorMetaData.mobile && editedComponentEditorMetaData.mobile.hidePanel);
        },

        /**
         * @param panel the panel to show, pass null to hide the current
         * @param current the record of the currently shown panel
         * @param keep if false, dispose the panel when it's removed
         * @param container the container into which to insert the panel
         */
        _showPanel: function (panel, current, keep, container) {
            var currentPanel = current.panel;
            if (currentPanel == panel) {
                return;
            }

            if (currentPanel) {
                // fire event to clear panel selected buttons
                if (this._currentPanel.panel) {
                    this._currentPanel.panel.fireEvent('subMenuCloses');
                }

                if (current.dispose) {
                    currentPanel.dispose();
                }
                else {
                    currentPanel.removeEvent(Constants.EditorUI.PANEL_CLOSING, this._onPanelClosing);
                    currentPanel.collapse();
                    currentPanel.fireEvent('panelHides');

                    //ugly safari-hack
                    this.injects().Utils.forceBrowserRepaint();
                }
            }

            if (panel) {
                panel.uncollapse();
                if (container.insertPanel) {
                    var len = this._history.length;
                    var prev = len > 0 && this._history[len - 1];
                    container.insertPanel(panel, prev && prev.name);
                }
                else {
                    panel.getViewNode().insertInto(container);
                }
                var innerComponentProxies = panel.getFields();
                if (innerComponentProxies) {
                    innerComponentProxies.forEach(function (proxy) {
                        proxy.renderIfNeeded();
                    });
                }
                panel.addEvent(Constants.EditorUI.PANEL_CLOSING, this._onPanelClosing);
                panel.fireEvent('subPanelOpened', {panel: panel});
            }
            current.dispose = !keep;
            current.panel = panel;
            this._panelCallLater(this._resize, null, 100);
        },

        _panelCallLater: function (callback, args, time) {
            var callId = null;
            if (!this._isDisposed) {
                callId = this.resources.W.Utils.callLater(callback, args, this, time);
            }
            return callId;
        },

        _hideSubPanel: function () {
            var parentPanel = this._currentPanel.panel;
            if (parentPanel) {
                parentPanel.removeEvent(Constants.CoreEvents.RESIZE, this._matchSubPanelHeight);
                parentPanel.removeEvent(Constants.DataEvents.DATA_CHANGED, this._matchSubPanelHeight);
                parentPanel.fireEvent('subMenuCloses');
            }
            //this.showSubPanel(null);
            this.hideSubPanel();
            // Ugly fix for IE 9 repaint to hide sidepanel shadow
            if (this._isRunningOnIE()) {
                this._repaintIE9Fix();
            }
        },

        _isRunningOnIE: function () {
            return window.Browser.name === "ie";
        },

        _repaintIE9Fix: function () {
            var element = window.document.body;
            var zoom = element.style.zoom;
            element.style.zoom = 0.99 + 0.01 * Math.random();
            setTimeout(function () {
                element.style.zoom = zoom;
            }, 1);
        },

        /**
         * insert the panel into the container
         * @param container the container to contain the panel.
         * @param panel the panel to be contained (sub-panel).
         */
        _insertPanelToContainer: function (container, panel) {
            panel.uncollapse(); // show panel (as in visible)
            if (container && container.insertPanel) {
                var len = this._breadCrumb.getBreadcrumbLength();
                var prev = len > 1 && this._breadCrumb.getCrumbAtIndex(len - 2);
                container.insertPanel(panel, prev || prev.name);
            } else {
                panel.getViewNode().insertInto(container);
            }
            // render proxied components.
            var innerComponentProxies = panel.getFields();
            if (innerComponentProxies) {
                innerComponentProxies.forEach(function (proxy) {
                    proxy.renderIfNeeded();
                });
            }
            // register an event handler for closing the panel.
            //panel.addEvent(Constants.EditorUI.PANEL_CLOSING, this._onPanelClosing);
            panel.fireEvent('subPanelOpened', {panel: panel});
        },

        _showPanelIfExist: function (panelId) {
            this._cachedPanels = this._cachedPanels || {};

            if (this._cachedPanels[panelId]) {
                this.showSubPanelWithParentPanelSize(this._cachedPanels[panelId], true);
                return true;
            }
            return false;
        },

        _savePanelInCache: function (panel, panelId) {
            this._cachedPanels = this._cachedPanels || {};
            this._cachedPanels[panelId] = panel;
        },

        _backToParentPanel: function () {
            var parentPanel = this._breadCrumb.popPreviousCrumb();
            if (parentPanel) {
                this.showComponentInSidePanel(parentPanel.skinPart, parentPanel.keepComponent, parentPanel.args,
                    parentPanel.state, parentPanel.callback, parentPanel.overrideState);
            }
        },

        _hideAllPanels: function () {
            if (this._currentPanel.panel) {
                this.hideSidePanel();
            }
            if (this._currentSubPanel.panel) {
                this.hideSubPanel();
            }
            this._currentPanel.panel = null;
        },

        _onClosePropertyPanel: function (params) {
            params = params || {};
            this.hidePropertyPanel(params.stayClosed);
        },

        updateBreadcrumbStateToPreviousCrumb: function () {
            this._backToParentPanel();
        },

        _updateBreadcrumbState: function (panelName, canGoBack, skinPart, keepComponent, args, state, callback, overrideState) {
            var lastPanel = {
                name: panelName,
                canGoBack: canGoBack,
                skinPart: skinPart,
                keepComponent: keepComponent,
                args: args,
                state: state,
                callback: callback,
                overrideState: overrideState
            };
            this._breadCrumb.pushCrumb(lastPanel);

            var depth = this._breadCrumb.getBreadcrumbDepth();
            this._skinParts.sidePanel.setHistoryDepth(depth);
        },

        /**
         * Returns the last link in the history chain
         * @param remove if not false, just return the last element
         */
        popHistory: function () {
            var length = this._history.length;
            if (length > 1) {
                this._history.pop();
                return this._history.pop();
            }
            return null;
        },

        pushHistory: function (historyLink) {
            if (historyLink) {
                this._history.push(historyLink);
                // limit the history size
                if (this._history.length > 10) {
                    this._history.splice(0, 1);
                }
            }
        },

        /**
         * Create the component that corresponds to the specified skinpart
         * @param skinPart the name of the skinpart to create
         * @param keepComponent should the resulting component be cached for further use?
         * @param args additional args to add to the object passed to createComponent
         * @param state
         * @param overrideState
         * @param callback function to call upon successful creation
         */
        createComponentPart: function (skinPart, keepComponent, args, state, overrideState, callback, onFinish) {
            var def = this.getSkinPartDefinition(skinPart);
            var params = {
                type: def.type,
                skin: def.skin,
                data: def.dataQuery,
                args: def.argObject || {},
                componentReadyCallback: function (comp) {
                    if (keepComponent) {
                        if (keepComponent && !_.has(this._panelsMap, skinPart)) {
                            this._panelsMap[skinPart] = comp;
                        }
                    }
                    if (onFinish) {
                        onFinish(comp, skinPart, keepComponent, args, state, callback, overrideState);
                    }
                }.bind(this)
            };

            // additional args to add to the object passed to createComponent
            if (args) {
                for (var key in args) {
                    params.args[key] = args[key];
                }
            }

            if (def.getDataFromSite) {
                this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(params.data, function (dataItem) {
                    params.data = dataItem;
                    this.resources.W.Components.createComponent(params);
                });
            }
            else {
                this.resources.W.Components.createComponent(params);
            }
        },

//        highlightPropertyPanel: function() {
//            console.log('highlightPropertyPanel')
//        },

        // side panel handlers
        _onShowComponentCategories: function () {
            this.resources.W.Editor.clearSelectedComponent(); //TODO: wire this to relevant presenter
            this.showComponentInSidePanel('masterComponents', true, null, Constants.EditorUI.ADD_PANEL);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_PANEL, {c1: Constants.EditorUI.ADD_PANEL});
        },

        _onShowBackgroundDesignPanel: function (param, cmd) {
            this.showComponentInSidePanel('backgroundDesign', true, null, Constants.EditorUI.DESIGN_PANEL);
            var paramSource     = param && param.src ;
            var biEventParam    = {c1: Constants.EditorUI.DESIGN_PANEL, c2: paramSource } ;
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, biEventParam);
        },

        _onShowColorsPanel: function (param, cmd) {
            this.showComponentInSidePanel('colorDesign', true, null, Constants.EditorUI.DESIGN_PANEL);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, {c1: Constants.EditorUI.DESIGN_PANEL, c2: "Color Settings"});
        },

        _onShowFontsPanel: function (cmd, param) {
            this.showComponentInSidePanel('fonts', true, null, Constants.EditorUI.DESIGN_PANEL);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, {c1: Constants.EditorUI.DESIGN_PANEL, c2: "Fonts Panel"});
        },

        _showStyleSelectorPanel: function(params, cmd) {
            W.EditorDialogs.openStyleSelector({
                selectedComponentId: params.editedComponentId,
                left: params.left,
                top: params.top
            });

            LOG.reportEvent(wixEvents.CHANGE_COMP_STYLE_BUTTON);
        },

        _showAdvancedDesignPanel: function(params, cmd) {
            this.resources.W.Data.getDataByQuery("#STYLES", function(styleList) {
                if (!styleList || !styleList.get("styleItems")) {
                    return;
                }

                W.EditorDialogs.openAdvancedStylingDialog({
                    styleList: styleList._data.styleItems,
                    selectedComponent: params.editedComponent,
                    left: params.left,
                    closeCallback: params.closeCallback,
                    undoRedoSubType: params.undoRedoSubType
                });
            }.bind(this));
        },

        _onShowBackgroundEditorPanel: function(param, cmd) {
            var paramSource = param && param.src ;
            this._addBGTransientDataItem() ;
            this.showComponentInSidePanel('backgroundEditor', false, null, Constants.EditorUI.DESIGN_PANEL);
            LOG.reportEvent(wixEvents.CUSTOMIZE_BACKGROUND_OPENED, {c1: Constants.EditorUI.DESIGN_PANEL, c2: paramSource});
        },

        _onShowSiteName: function (args) {
            this._createPanelComponent('siteName', args);
        },

        _onShowFaviconAndThumbnail: function (args) {
            this._createPanelComponent('faviconAndThumbnail', args);
        },

        _onShowSocial: function (args) {
            this._createPanelComponent('social', args);
        },

        _onShowSEO: function (args) {
            this._createPanelComponent('seo', args);
            LOG.reportEvent(wixEvents.SEO_PANEL_OPENED);
        },

        _onShowStatistics: function (args) {
            this._createPanelComponent('statistics', args);
        },

        _onCustomizeComponentStyle: function (params) {
            params = params || {};
            this.resources.W.Commands.executeCommand("WEditorCommands.AdvancedDesign", params);
        },

        _onCustomizeColors: function (param, cmd) {
            this.showComponentInSidePanel('customizeColors', true, null, Constants.EditorUI.DESIGN_PANEL);
            LOG.reportEvent(wixEvents.CUSTOMIZE_COLORS_OPENED);
        },

        _onCustomizeFonts: function (param, cmd) {
            var source = (param && param.source) || 'unknown';
            LOG.reportEvent(wixEvents.CUSTOMIZE_FONTS_OPENED, {'c1': source});
            this.showComponentInSidePanel('customizeFonts', true, null, Constants.EditorUI.DESIGN_PANEL);
        },

        _onCustomizeFontsDirect: function (param, cmd) {
            var cmdmgr = this.resources.W.Commands;
            // due to breadcrumbs problems, these panels should be opened before opening sub panel
            cmdmgr.executeCommand('WEditorCommands.Design');
            cmdmgr.executeCommand('WEditorCommands.ShowFontsPanel');
            cmdmgr.executeCommand('WEditorCommands.CustomizeFonts', param);
        },

        _onPageSettings: function (data) {
            if (!this._isSubPanelVisible() && !data.settingsButtonOverride && !data.parentPanel) {
                return;
            }

            if (data.BIsrc && data.BIsrc === 'DropDownMenuFPP') {
                LOG.reportEvent(wixEvents.RENAME_PAGES_FROM_FPP);
            }

            if (!data.pageId) {
                data.pageId = '#' + this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
            }

            if (data.parentPanel) {
                this._showEditorPanel(data.parentPanel, function () {
                    this.resources.W.Editor._siteStructure.getDataManager().getDataByQuery(data.pageId, this._onPageSettingsDataReady.bind(this));
                }.bind(this));
            } else {
                this.resources.W.Editor._siteStructure.getDataManager().getDataByQuery(data.pageId, this._onPageSettingsDataReady.bind(this));
            }
        },

        _isSubPanelVisible: function () {
            return !this._skinParts.subPanel.hasClass('hidden');
        },

        _showContactInformation: function (args) {
            this._createPanelComponent('contactInformation', args);
        },

        _onPageSettingsDataReady: function (data) {
            var panel = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE ?
                'mobilePageSettings' : 'pageSettings';

            this._createPanelComponent(panel, {
                data: data,
                options: {
                    allowMany: true
                }
            }, false);
        },

        _onShowAddComponent: function (params) {
            var category = typeOf(params) === 'object' ? params.category : params;
            params = (typeof params === 'string') ? {category: params} : params;

            LOG.reportEvent(wixEvents.ADD_COMPONENT_CATEGORY_CLICKED, {c1: category});
            this.showComponentInSidePanel('addComponent', false, params, Constants.EditorUI.ADD_PANEL);
        },

        // tabs
        _handleEditModeChange: function (mode) {
            switch (mode) {
                case Constants.EditorStates.EDIT_MODE.PREVIEW:
                    this.setState('preview', 'editorMode');
                    break;
//                case Constants.EditorStates.EDIT_MODE.CURRENT_PAGE:
//                case Constants.EditorStates.EDIT_MODE.MASTER_PAGE:
                default:
                    this.setState('edit', 'editorMode');
                    break;
            }
        },

        _handleViewerStateChange: function (params) {
            switch (params.viewerMode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('mobile', 'viewDeviceMode');
                    this._createMobileAlerts();
                    this.resources.W.Editor.addEvent('onComponentDelete', this._showHiddenElementsPanelOnce);
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setState('desktop', 'viewDeviceMode');
                    this.resources.W.Editor.removeEvent('onComponentDelete', this._showHiddenElementsPanelOnce);
                    break;
            }
            this._breadCrumb.clearCrumb();
        },

        _handleViewerModeChange: function (params) {
            var mode = params.mode;
            var isMobileMode = (mode === Constants.ViewerTypesParams.TYPES.MOBILE);

            this._skinParts.propertyPanel.collapse();
            if (isMobileMode) {
                this._skinParts.propertyPanel = this._mobileComponentPanel;
                this._desktopComponentPanel.removePanelEvents();
                this._mobileComponentPanel.bindPanelEvents();
            }
            else {
                this._skinParts.propertyPanel = this._desktopComponentPanel;
                this._mobileComponentPanel.removePanelEvents();
                this._desktopComponentPanel._bindInternalEvents();
                this._desktopComponentPanel._bindExternalEvents();
            }
            this.resources.W.Editor.registerEditorComponent('propertyPanel', this._skinParts.propertyPanel);
        },

        _createMobileAlerts: function () {
            this._createMobileActivationAlert();
        },

        _createMobileActivationAlert: function () {
            if (!this._skinParts.mobileActivationAlert) {
                var el = this._createInnerComponent(this.getSkinPartDefinition('mobileActivationAlert'));
                el.$view.insertInto(this._skinParts.mobileActivationAlertContainer);
                this._skinParts.mobileActivationAlert = el;
            }
        },

        _showHiddenElementsPanelOnce: function (event) {
            if (event.omitDeletedListUpdate) {
                return;
            }
            this.resources.W.Editor.removeEvent('onComponentDelete', this._showHiddenElementsPanelOnce);
            this._breadCrumb.clearCrumb();
            this._updateBreadcrumbState('Add Mobile Elements', false, 'mobileAdd', false, null, 'mobileAddPanel');
            W.Commands.executeCommand('WEditorCommands.MobileHiddenElements');
        },

        _setTabsData: function (dataQueryId) {
            var data = this.resources.W.Data.getDataByQuery(dataQueryId);
            this._skinParts.mainTabs.setDataItem(data);
        },

        _handleTabsDataChange: function (params) {
            var viewingDevice = params.viewerMode;
            var currentTabSetId = this._skinParts.mainTabs.getDataItem().get("id");

            switch (viewingDevice) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    if (currentTabSetId === "TOP_TABS") {
                        this._setTabsData('#TOP_TABS_MOBILE');
                    }
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    if (currentTabSetId === "TOP_TABS_MOBILE") {
                        this._setTabsData('#TOP_TABS');
                    }
                    break;
            }

        },

        _showMobileQuickActionsViewPanel: function (args) {
            this._createPanelComponent('mobileQuickActionsView', args);
        },

        _resize: function () {
            var params = {
                currentPanel: this._currentPanel.panel,
                currentSubPanel: this._currentSubPanel.panel,
                sidePanel: this._skinParts.sidePanel
            };

            this.resources.W.Commands.executeCommand('PanelPresenter:Resize', params);
        },

        _matchSubPanelHeight: function () {
            var newPanelHeight = this._currentPanel.panel.getPanelHeight();
            var subPanel = this._currentSubPanel.panel;

            if (!subPanel) {
                return;
            }

            var heightOffset = subPanel._skinParts.topBar.getSize().y + subPanel._skinParts.bottom.getSize().y;
            if (subPanel._skinParts.pageActions) {
                heightOffset += subPanel._skinParts.pageActions.getSize().y;
            }

            if (!heightOffset && subPanel._setHeightTimerCounter < subPanel._setHeightTimerCounterMax) {
                subPanel._setHeightTimerCounter += 1;
                setTimeout(_.bind(this._matchSubPanelHeight, this), 100);
                return;
            }
            else {
                subPanel._setHeightTimerCounter = 0;
            }
            subPanel._skinParts.view.setStyle('height', newPanelHeight);
            subPanel._skinParts.content.setStyle('height', newPanelHeight - heightOffset);
        },

        _onWindowResize: function () {
            this._resize();
            this._fixFeedbackButtonPosition();
        },

        _onSitePageChanged: function (pageId) {
            this.resources.W.Commands.executeCommand("WEditorCommands.SitePageChanged", {
                pageId: pageId,
                panel: this._currentSubPanel.panel,
                subPanelVisible: this._isSubPanelVisible()
            });
        },

        //Mobile Command Methods
        _showMobileSettingsPanel: function (param) {
            var callback = param ? param.callback : null;
            this._showMobilePanel("mobileSettings", Constants.EditorUI.MOBILE_SETTINGS_PANEL, callback);
        },

        _showMobileDesignPanel: function () {
            this._showMobilePanel("mobileDesign", Constants.EditorUI.MOBILE_DESIGN_PANEL);
        },

        _showMobileAddPanel: function () {
            this._showMobilePanel("mobileAdd", Constants.EditorUI.MOBILE_ADD_PANEL);
        },

        _onShowMobileAddComponent: function (params) {
            var category = typeOf(params) === 'object' ? params.category : params;
            params = (typeof params === 'string') ? {category: params} : params;
            LOG.reportEvent(wixEvents.ADD_COMPONENT_CATEGORY_CLICKED, {c1: category});

            this.showComponentInSidePanel('mobileAddSubPanel', false, params, Constants.EditorUI.MOBILE_ADD_PANEL);
        },

        _showMobileMarketPanel: function () {
            this._showMobilePanel("mobileMarket", Constants.EditorUI.MOBILE_MARKET_PANEL);
        },

        _showMobileHiddenElementsPanel: function () {
            this.showComponentInSidePanel('mobileHiddenElements', false, null, Constants.EditorUI.MOBILE_ADD_PANEL);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, {c1: null, c2: Constants.EditorUI.MOBILE_HIDDEN_ELEMENTS_PANEL});
        },

        _showMobilePagesPanel: function () {
            this._showMobilePanel("pagesPanel", Constants.EditorUI.PAGES_PANEL);
        },

        _showMobilePanel: function (skinPart, state, callback) {
            this.hidePropertyPanel();
            this.showComponentInSidePanel(skinPart, true, null, state, callback);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_PANEL, {c1: skinPart});
        },

        _showMobileMenuDesignPanel:function(){
            var comp = W.Editor.getEditedComponent();
            if (!comp || (comp && comp.$className !== "wysiwyg.viewer.components.mobile.TinyMenu")) {
                comp = W.Preview.getCompLogicById('mobile_TINY_MENU');
                if (!comp) {
                    W.EditorDialogs.openPromptDialog(W.Resources.get('EDITOR_LANGUAGE', 'Uh_oh'),
                        W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_CANT_DESIGN_TINY_MENU_IF_HIDDEN'), undefined, W.EditorDialogs.DialogButtonSet.OK);
                    return;
                }
            }
            W.Editor.setSelectedComp(comp);
            this._showStyleSelectorPanel({editedComponentId: comp.getComponentId()});
        },

        _showMobileMenuPropertyPanel: function () {
            W.Editor.setSelectedComp(W.Preview.getCompLogicById('TINY_MENU'));
            if (W.Editor.getEditedComponent()) {
                W.Editor.openComponentPropertyPanels();
            }
        },

        _showMobileViewSelectorPanel: function (args) {
            this._createPanelComponent('mobileViewSelector', args);
        },

        _onShowMobileBackgroundEditorPanel: function (param, cmd) {
            this._addBGTransientDataItem() ;
            this.showComponentInSidePanel('backgroundEditor', false, null, Constants.EditorUI.MOBILE_DESIGN_PANEL);
            var paramSource = param && param.src ;
            LOG.reportEvent(wixEvents.CUSTOMIZE_BACKGROUND_OPENED, {c1: Constants.EditorUI.DESIGN_PANEL, c2: paramSource });
        },

        _showMobilePreloaderPanel: function () {
            this._createPanelComponent('mobilePreloaderPanel', null);
        },

        _showSocialMedia: function (args) {
            this._createPanelComponent('socialMedia', args);
        },

        _showBackToTopButtonPanel: function () {
            W.EditorDialogs.openBackToTopButtonDialog();
        },

        showComponentInSidePanel: function (skinPart, keepComponent, args, state, callback, overrideState) {
            var comp = this._panelsMap[skinPart];

            if (comp) {
                this.showInnerSidePanel(comp, skinPart, keepComponent, args, state, callback, overrideState);
            } else {
                this.createComponentPart(skinPart, keepComponent, args, state, overrideState, callback, this.showInnerSidePanel);
            }
        },

        showInnerSidePanel: function (comp, skinPart, keepComponent, args, state, callback, overrideState) {
            if (this._currentPanel.panel != comp) {
                this.hideSidePanel();
                this.hideSubPanel();
            }

            this._handlePanelBreadCrumbs(comp, callback);

            this._updateBreadcrumbState(comp.getName(), comp.canGoBack(), skinPart, keepComponent, args, state, callback, overrideState);

            this.setState(state, 'panels');
            this._currentPanel.panel = comp;

            this._insertPanelToContainer(this._skinParts.sidePanel, comp);

            this.showSidePanel();

            if (comp && comp.saveCurrentState) {
                comp.saveCurrentState();
            }

            this._skinParts.mainTabs.switchPanel(overrideState || state);

            comp.onBeforeShow({skinPart: skinPart, args: args, state: state});

            if (callback) {
                callback(comp);
            }

            this._panelCallLater(this._resize, null, 100);
        },

        _handlePanelBreadCrumbs: function (comp, callback) {
            if (comp._breadcrumbs) {
                _.each(comp._breadcrumbs, function (crumb) {
                    //this.showComponentInSidePanel(crumb.name || crumb, true, null, crumb.state || crumb, callback) ;
                    this.showComponentInSidePanel(crumb.name || crumb, true, null, crumb.state || crumb, callback);
                }, this);
            }
        },

        _handleRulerStateChanged: function (params) {
            if (params.rulerType !== 'vertical') {
                return;
            }
            var rulerWidth = params.ruler.$view.getWidth();
            this._fixFeedbackButtonPosition(rulerWidth);
        },

        _onFeedbackButtonClick: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.openFeedbackDialog');
        },

        _fixFeedbackButtonPosition: function (rightMargin) {
            var btnNode = this._skinParts.feedbackButton.$view;
            rightMargin = rightMargin || 0;
            this._skinParts.feedbackButton.$view.style.top = (this._skinParts.mainEditorBar.$view.getHeight() + 23) + "px";
            this._skinParts.feedbackButton.$view.style.left = (window.getSize().x - btnNode.getWidth() - rightMargin) + "px";
        }
    });
});