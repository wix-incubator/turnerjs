define.component('wysiwyg.editor.components.Tabs', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.statics({
        tabWidth: 50,
        tabHeight: 50,
        tabMargin: 10,
        tabHoverHeight: 50,
        tabHoverMargin: 5,
        baseBackgroundPosition: "-10px -10px",
        baseHoverBackgroundPosition: "-5px -5px",
        firstTimeBackgroundPosition:"-173px -5px",
        APP_MARKET_OPENED_KEY: 'openedAppMarket'
    });

    def.states({
        "tabState": ["tabSelected"],
        "panelState": ["openPanels", "closedPanels"],
        "tabsPreview": ["fullPreview", "hidePreview"],
        "editorMode": ['edit', 'preview'],
        "viewDeviceMode": ['mobile', 'desktop']
    });

    def.binds(['_resetTabsState', '_onSidePanelClose', '_onPopoverLinkClick', '_onPopoverClose']);

    def.inherits('core.components.BaseList');

    def.resources(['W.Commands', 'W.Utils', 'W.Config', 'W.Preview', 'W.Resources', 'W.Editor']);

    def.skinParts({itemsContainer: {type: 'htmlElement'}});

    def.dataTypes(['PropertyList']);

    def.fields({
        _itemClassName: 'wysiwyg.editor.components.WButton',
        _hoverVertPositionOnFirstTime: 5,
        _hoverHorizPositionOnFirstTime: -5,
        _firstTimeRender: true,
        _mobileHoverHorizPositionOnFirstTime: -5,
        mobileFirstTimeBackgroundPosition   : '-191px -5px'
    });

    def.utilize(['core.managers.components.ComponentBuilder']);

    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.NoRedirectFirstSave", this, this._exitFullPreviewState);
            this.resources.W.Commands.registerCommandAndListener(Constants.EditorUI.CLOSE_PANEL, this, this._onSidePanelClose);
            this.resources.W.Commands.registerCommandAndListener(Constants.EditorUI.CLOSE_ALL_PANELS, this, this._onSidePanelClose);

            this.parent(compId, viewNode, argsObject);
            argsObject = argsObject || {};
            var cmd = new this.resources.W.Commands.Command("UICommands.tab" + this.resources.W.Utils.getUniqueId());
            cmd.registerListener(this, this._onTab, null);
            this._itemCommand = cmd;
            this._currentItem = null;
            this._tabItems = [];
            this._isToggle = argsObject.isToggle !== false;

            this.disable();
            var previewReadyCommand = this.resources.W.Commands.getCommand('PreviewIsReady');
            if (!previewReadyCommand) {
                this.resources.W.Commands.registerCommandAndListener(
                    'PreviewIsReady', this, this.enable.bind(this));
            } else {
                previewReadyCommand.registerListener(this, this.enable.bind(this));
            }
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditModeChanged);
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.ViewerStateChanged", this, this._onViewerStateChanged);

            this._userPrefsService = this.resources.W.Editor.userPreferencesHandler;
            // When editor is fully loaded, query user data in order to define if the popover should be shown
            this._previewReadyCommand = this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._onPreviewIsReady, null, true);
            this._isMarketOpened = 0;
        },

        _onEditModeChanged: function(mode) {
            if (mode === Constants.EditorStates.EDIT_MODE.PREVIEW) {
                this.setState('preview', 'editorMode');
                this.collapse();

            } else {
                this.uncollapse();
                this.setState('edit', 'editorMode');
                if (this._isRenderNeededAfterDataChange()){
                    this._renderIfReady();
                }

            }
        },

        _isRenderNeededAfterDataChange: function(){
            return !this._tabItems.length;
        },

        _onViewerStateChanged: function(params){
            switch(params.viewerMode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('mobile', 'viewDeviceMode');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setState('desktop', 'viewDeviceMode');
                    break;
            }
        },

        render: function () {
            this._renderItems(this._data.get("items"), true);

            this._resetTabsState();

            _.each(this._tabItems, function(tabLogic) {
                var viewNode = tabLogic.ui.getViewNode();

                viewNode.addEvent(Constants.CoreEvents.MOUSE_OVER, _.bind(function(e) {
                    if (this.getState("panelState") === "closedPanels") {
                        this._onTabMouseOver(tabLogic);
                    }
                }, this));

                viewNode.addEvent(Constants.CoreEvents.MOUSE_OUT, _.bind(function(e) {
                    if (this.getState("panelState") === "closedPanels") {
                        this._onTabMouseOut(tabLogic);
                    }
                }, this));
            }, this);

            if (!this._isFirstTimeUser() || !this._firstTimeRender) {
                return;
            }

            this.setState('fullPreview', 'tabsPreview');
            this._onFirstTimeUserPreview();
        },

        _showTabsLabels: function() {
            _.each(this._tabItems, function(tabLogic) {
                tabLogic.ui.setState('showLabel', 'labelVisibility');
            });
        },

        _resetTabsState: function(){
            this.setState('closedPanels', 'panelState');
            this._resetBackgroundPosition();

            this._hideTabsLabels();
        },

        _hideTabsLabels: function() {
            _.each(this._tabItems, function(tabLogic) {
                tabLogic.ui.setState("hideLabel");
            });
        },

        _onTabSelect: function(tabLogic) {
            if(!tabLogic) {
                return ;
            }

            // Remove 'selected' state from all other tab buttons
            _.forEach(this._tabItems, function (item) {
                if (item.commandParameter !== tabLogic.commandParameter) {
                    item.ui.removeState('selected');
                }
            });

            tabLogic.ui.setState('selected');

            if ((this._isFirstTimeUser() && this._firstTimeRender)){
                this._onFirstTimeUserTabSelect();
            }

            this._hideTabsLabels();
            this.getViewNode().setStyle("background-position", this._getBackgroundPositionForSelection(tabLogic));

            this._hidePopover();

            if (tabLogic.commandParameter === Constants.EditorUI.MARKET_PANEL) {
                this._isMarketOpened = 1;
            }
        },

        _onTabMouseOver: function(tabLogic) {
            if (!this._isClosedPanels() || this._isFullPreview()) {
                return;
            }

            this.getViewNode().setStyle("background-position", this._getBackgroundPosition(tabLogic));

            tabLogic.ui.getViewNode().setStyle("background-position", this._getHoverBackgroundPosition(tabLogic));
            tabLogic.ui.setState("showLabel", "labelVisibility");

            if (tabLogic.commandParameter === Constants.EditorUI.MARKET_PANEL ||
                tabLogic.commandParameter === Constants.EditorUI.SETTINGS_PANEL) {
                this._hidePopover();
            }
        },

        _isFullPreview: function() {
            return this.getState("tabsPreview") === "fullPreview";
        },

        _onTabMouseOut: function(tabLogic) {
            if (!this._isClosedPanels() || this._isFullPreview()) {
                return;
            }

            this.getViewNode().setStyle("background-position", this.baseBackgroundPosition);
            tabLogic.ui.setState("hideLabel", "labelVisibility");
        },

        _getBackgroundPositionForSelection: function(tabLogic) {
            var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view) + 1;
            var bgPosHorz = -(tabIndex * (this.tabWidth + this.tabMargin) + 10);
            return this._bgPos(bgPosHorz, -10);
        },

        _getBackgroundPosition: function(tabLogic) {
            var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view) + 1;
            var tabsCount = this._itemsNodes.length;
            var btnBodyWidth = (tabIndex+tabsCount) * this.tabWidth;
            var btnMarginWidth = (tabIndex+tabsCount) * this.tabMargin;
            var bgPosHorz = -(btnMarginWidth + btnBodyWidth) - 10;
            var bgPosVert = -10;
            return this._bgPos(bgPosHorz, bgPosVert);
        },

        _getHoverBackgroundPosition: function(tabLogic) {
            var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view);
            var btnBodyHeight = tabIndex * this.tabHeight;
            var btnMarginWidth = tabIndex * this.tabHoverMargin;
            var bgPosVert = -(btnMarginWidth + btnBodyHeight) - 5;
            var bgPosHorz = -5;
            return this._bgPos(bgPosHorz, bgPosVert);
        },

        _bgPos: function(horz, vert) {
            return horz + "px " + vert + "px";
        },

        _onSidePanelClose: function() {
            this.setState('closedPanels', 'panelState');
            this._resetBackgroundPosition();

            _(this._tabItems).forEach(function (item) {
                item.ui.removeState('selected');
            });
        },

        _resetBackgroundPosition: function(){
            var position;
            if (this._isFirstTimeUser() && this._firstTimeRender){
                var isMobileViewer = (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE);
                position = (isMobileViewer) ? this.mobileFirstTimeBackgroundPosition : this.firstTimeBackgroundPosition;
            } else {
                position = this.baseBackgroundPosition;
            }
            this.getViewNode().setStyle("background-position", position);
        },

        _isClosedPanels: function() {
            return this.getState("panelState") === "closedPanels";
        },

        switchPanel: function(state) {
            this._onTabSelect(this._findTabByCommandParameter(state));
            this.setState('openPanels', 'panelState');
        },

        _findTabByCommandParameter: function(param) {
            return _.first(_.filter(this._tabItems, function(item) {
                return item.commandParameter === param;
            }));
        },

        _onDataChange: function(dataItem, field, value){
            this._tabItems = [];
            this.parent(dataItem, field, value);

        },

        /**
         * toggle buttons which can be toggled. i.e. grid and snapToGrid buttons
         * @param skinPart
         */
        _toggleButton: function (skinPart) {
            var state = this._skinParts[skinPart].getAttribute('state') == 'enabled';

            if (state) {
                this._skinParts[skinPart].removeAttribute('state');
            } else {
                this._skinParts[skinPart].setAttribute('state', 'enabled');
            }
        },

        getItemsContainer: function () {
            return this._skinParts.itemsContainer;
        },

        _getParamsToPassToItem: function (itemData, callback) {
            callback(itemData);
        },

        _onItemReady: function (itemLogic, isNew, listItemData) {
            if (isNew) {
                if (this._isToggle) {
                    itemLogic.setCommand(this._itemCommand);
                }
                var item = {ui: itemLogic, linkedUI: listItemData.ui, command: listItemData.command, commandParameter: listItemData.commandParameter};
                this._tabItems.push(item);
                if (item.linkedUI) {
                    var ui = $(item.linkedUI);
                    if (ui) {
                        ui.collapse();
                    }
                }
            }
        },

        _onTab: function (param, commandRec) {
            this.injects().Editor.getEditorUI().hidePropertyPanel();
            var source = commandRec.source;
            var item = this._findTabByItem(source);
            this._setCurrentItem(item);
        },

        _setCurrentItem: function (item) {
            var current = this._currentItem;
            var toggle = this._isToggle;

            if (!toggle || item != current) {
                if (current) {
                    if (toggle) {
                        current.ui.removeState('selected');
                    }
                    if (current.linkedUI) {
                        var oldUI = $(current.linkedUI);
                        if (oldUI) {
                            oldUI.collapse();
                        }
                    }
                }
                this._currentItem = item;
                if (item) {
                    if (toggle) {
                        item.ui.setState('selected');
                    }
                    if (item.linkedUI) {
                        var ui = $(item.linkedUI);
                        if (ui) {
                            ui.uncollapse();
                        }
                    }
                }
            }
            // in any case, execute the item's command
            if (item.command) {
                var cmd = this.resources.W.Commands.getCommand(item.command);
                if (cmd) {
                    cmd.execute(item.commandParameter, item); // fake the command source, the toolbar is just a proxy
                }
            }
        },

        _findTabByItem: function (item) {
            var ret = this._tabItems.getByField("ui", item);
            return ret || null;
        },

        _onFirstTimeUserTabSelect: function() {
            this._firstTimeRender = false;

            this.setState('hidePreview', 'tabsPreview');
            _.each(this._tabItems, function(tabLogic) {
                var viewNode = tabLogic.ui.getViewNode();
                viewNode.removeEvent(Constants.CoreEvents.MOUSE_OVER);
                viewNode.removeEvent(Constants.CoreEvents.MOUSE_OUT);
                tabLogic.ui.setState('hidePreview', 'FirstTimeUser');
            });
        },

        _isFirstTimeUser: function() {
            // A monk asked Gartzman: What is the nature of a FirstTimeUser?
            // Gartzman replied: A user who never saved the site before.
            // The monk reached enlightenment.
            return this.resources.W.Config.getEditorModelProperty('firstSave');
        },

        _onFirstTimeUserPreview: function() {
            _.each(this._tabItems, function(tabLogic) {
                var viewNode = tabLogic.ui.getViewNode();

                tabLogic.ui.setState('showPreview', 'FirstTimeUser');
                viewNode.addEvent(Constants.CoreEvents.MOUSE_OVER, _.bind(function(e) { this._onFirstTimeUserTabMouseOver(tabLogic); }, this));
                viewNode.addEvent(Constants.CoreEvents.MOUSE_OUT, _.bind(function(e) { this._onFirstTimeUserTabMouseOut(tabLogic); }, this));
            }, this);

            this._showTabsLabels();

        },

        _onFirstTimeUserTabMouseOver: function(tabLogic) {
            tabLogic.ui.getViewNode().setStyle("background-position", this._getHoverBackgroundPositionForFirstTimeUser(tabLogic));
        },

        _onFirstTimeUserTabMouseOut: function(tabLogic) {
            tabLogic.ui.getViewNode().setStyle("background-position", this._getHoverBackgroundPositionForFirstTimeUser(tabLogic));
        },

        _getHoverBackgroundPositionForFirstTimeUser: function(tabLogic){
            var isMobileViewer = (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE);

            var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view);
            var btnBodyHeight = tabIndex * this.tabHeight;
            var btnMarginWidth = tabIndex * this.tabHoverMargin;
            var bgPosVert = -(btnMarginWidth + btnBodyHeight) - this._hoverVertPositionOnFirstTime;
            var bgPosHorz = (isMobileViewer) ? this._mobileHoverHorizPositionOnFirstTime : this._hoverHorizPositionOnFirstTime;

            return this._bgPos(bgPosHorz, bgPosVert);
        },

        _exitFullPreviewState: function() {
            this._onFirstTimeUserTabSelect();
            this._hideTabsLabels();
            this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
        },

        /*
         * Checks if all conditions for showing the popover are fulfilled:
         * 1. Site is saved.
         * 2. User has not yet opened the App Market.
         * If they do, it shows the popover next to the App Market button.
         */
        _showAppMarketPopoverIfNeeded: function  () {
            if (!this._shouldShowAppMarketPopover()) {
                return;
            }

            var appMarketButton = _(this._tabItems).find(function(tabLogic) {
                return tabLogic.commandParameter === Constants.EditorUI.MARKET_PANEL;
            });

            if (appMarketButton) {
                this._showPopover(appMarketButton.ui.getViewNode());
            }
        },

        /*
         * Checks if popover should be displayed or not.
         */
        _shouldShowAppMarketPopover: function () {
            return !this._isFirstTimeUser() && !this._isMarketOpened && !this._hasTPAsInSite();
        },

        /*
         * Checks if there is any TPA in client spec map or not.
         */
        _hasTPAsInSite: function () {
            var specMap = this._getClientSpecMap();

            return specMap && _(specMap).any(function (spec) {
                return spec.type === 'editor' && !spec.demoMode;
            });
        },

        _showPopover: function (item) {
            var popoverTitle = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SIDE_BTN_MARKET');
            var popoverDesc = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'APP_MARKET_POPOVER_CONTENT');
            var content = '<b style="color:#373737">' + popoverTitle + '</b><br>' + popoverDesc;

            var args = {
                item: item,
                width: 365,
                content: content,
                link: {
                    selector: 'a',
                    onClick: this._onPopoverLinkClick
                },
                closeButton: true,
                onClose: this._onPopoverClose,
                fadeIn: true,
                fadeOut: true
            };

            /* Create the component dynamically */
            var that = this;
            var viewNode = new Element("div");
            var compBuilder = new this.imports.ComponentBuilder(viewNode);
            compBuilder.
                withType('wysiwyg.editor.components.Popover').
                withSkin('wysiwyg.editor.skins.PopoverSkin').
                withArgs(args).
                onWixified(function(childCompLogic) {
                    childCompLogic._view.insertInto(that._view);
                    that._skinParts.popover = childCompLogic;
                    LOG.reportEvent(wixEvents.APP_MARKET_TOOLTIP_DISPLAYED);
                }).
                create();
        },

        _onPopoverClose: function () {
            this._markAppMarketOpened();
        },

        _onPopoverLinkClick: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.Market', { origin: 'market-tooltip' });
            this._hidePopover();
        },

        _hidePopover: function () {
            if (this._skinParts.popover) {
                this._skinParts.popover.dispose();
            }
        },

        /*
         * Listens to 'PreviewIsReady' command.
         */
        _onPreviewIsReady: function () {
            this._previewReadyCommand.unregisterListener(this);
            this._userPrefsService.getData(this.APP_MARKET_OPENED_KEY, { key: 'app-market' }).then(function(data){
                this._isMarketOpened = _.isObject(data) && _.isEmpty(data) ? this._isMarketOpened : data;
                this._showAppMarketPopoverIfNeeded();
            }.bind(this));
        },

        /**
         * @returns Client spec map from preview window.
         */
        _getClientSpecMap: function(){
            try{
                return this.resources.W.Preview.getPreviewSite().rendererModel.clientSpecMap;
            } catch (err) {
                return null;
            }
        },

        _markAppMarketOpened: function () {
            // Set user prefs. Assign 1 for 'true' for optimization.
            this._userPrefsService.setData(this.APP_MARKET_OPENED_KEY, 1, { key: 'app-market' });
        }
    });

});
