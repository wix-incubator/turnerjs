define.component('wysiwyg.editor.components.panels.base.SidePanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.resources(['W.Commands', 'W.Config', 'W.Preview', 'W.Utils']);
    def.binds(['_onWindowResize']);
    def.skinParts({
        backButton: {type: 'htmlElement', command: 'WEditorCommands.BackToParentPanel'},
        backName: {type: 'htmlElement'},
        title: {type: 'htmlElement'},
        description: {type: 'htmlElement'},
        helplet: {type: 'htmlElement', autoBindDictionary: "HELPLET_LEARN_MORE"},
        cancelButton: {type: 'htmlElement'},
        closeButton: {type: 'htmlElement', command: "this._closeCommand"},
        content: {type: 'htmlElement'}
    });

    def.states({
        breadcrumbs: ['breadcrumb_0', 'breadcrumb_1', 'breadcrumb_2'],
        panel: ['marketPanel', 'emptyPanel', 'noPanelState']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._cancelCommand = this.resources.W.Commands.createCommand('cancel');
            this._cancelCommand.registerListener(this, this._onCancel);
            this._cancelCommand.disable();

            this._realCloseCommand = args && this.resources.W.Commands.getCommand(args.closeCommand);
            this._closeCommand = this.resources.W.Commands.createCommand('close');
            this._closeCommand.registerListener(this, this._onClose);

            this.resources.W.Commands.registerCommandAndListener(Constants.EditorUI.CLOSE_PANEL, this, this.collapse);
            this.resources.W.Commands.registerCommandAndListener(Constants.EditorUI.CLOSE_ALL_PANELS, this, this.collapse);
            this.resources.W.Commands.registerCommandAndListener("PanelPresenter:Resize", this, this.resize);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onStateChanged);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._onStateChanged);

            this._contentPanel = null;
            this._setPrevPanelName('');
            this.collapse();
        },

        _onStateChanged: function() {
            this._onClose();
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.cancelButton.collapse();
            this._skinParts.backButton.collapse();
            //Monitor window resizes
            window.addEvent('resize', this._onWindowResize);

        },

        insertPanel: function (thePanel, prevPanelName) {
            // yet another hack, safari on mac has render problems when flash 11 is installed
            if (!Browser.safari) {
                this._delayedInsertPanel(thePanel, prevPanelName);
            }
            else {
                setTimeout(function () {
                    this._delayedInsertPanel(thePanel, prevPanelName);
                }.bind(this), 100);
            }
        },

        _delayedInsertPanel: function (thePanel, prevPanelName) {
            this.uncollapse();

            var sp = this._skinParts;
            sp.content.empty();

            if (this._contentPanel){
                this._contentPanel.fireEvent('panelHides'); //notify previous inner panel that it's about to be replaced
            }
            this._contentPanel = thePanel;
            this._contentPanel.setContainerPanel(this);
            this.setState(this._contentPanel.getPanelType(), 'panel');

            if (!thePanel) {
                this._skinParts.cancelButton.collapse();
                this._skinParts.backButton.collapse();
                return;
            }

            if (!thePanel.hasClassAncestor("SideContentPanel", true)) {
                this.injects().Utils.debugTrace("side panel content must inherit from SideContentPanel");
                return;
            }

            thePanel.getViewNode().insertInto(sp.content);
            sp.title.uncollapse();
            sp.description.uncollapse();

            this._panelTitle = thePanel.getTitle();
            this._skinParts.title.set('html', this._panelTitle);

            this._panelDescription = thePanel.getDescription();
            this._skinParts.description.set('html', this._panelDescription);

            this._helplet = thePanel.getHelplet();
            this._skinParts.helplet.setCollapsed(!this._helplet);
            if (this._helplet && !this._helpletAlreadyRegistered) {
                this._helpletAlreadyRegistered = true;
                this._skinParts.helplet.addEvent('click', function () {
                    this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', this._helplet);
                }.bind(this));
            }

            this._skinParts.cancelButton.setCollapsed(!thePanel.canCancel());
            this._skinParts.backButton.setCollapsed(!thePanel.canGoBack());

            this._manageAdditionalInfo(thePanel);

            this._setPrevPanelName(prevPanelName);

            // IE SUCKS!!! (remove this line and you'll get shit skids of shadows)
            this.resources.W.Utils.forceBrowserRepaint(null, 50, ['safari', 'ie']);

            this._skinParts.help.on('click', this, this._onHelpClick);
        },

        _onHelpClick: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'APP_MARKET_Help_Icon');
        },

        //this function should be overriden
        _setPrevPanelName:function(prevPanelName){
            if(!this._skinParts){
                return;
            }
            var name = '';
            if(prevPanelName){
                var backTo = W.Resources.get('EDITOR_LANGUAGE', "BACK_TO");
                var prevName = prevPanelName.name || prevPanelName;
                name = backTo + ' ' + prevName;
                var selectedLang = window.wixEditorLangauge;
                if(selectedLang==="ja"){
                    name = prevName + ' ' + backTo;
                }
            }
            this._skinParts.backName.set('html', name);
        },

        _manageAdditionalInfo:function(thePanel){
            this._clearOldAdditionalInfo();
            if(this._isDesktopViewMode()){
                this._addNewAdditionalInfo(thePanel);
            }
        },

        _isDesktopViewMode:function(){
            if(W.Preview && W.Preview.isSiteReady()){
                if(this.resources.W.Config.env.isViewingDesktopDevice()){
                    return true;
                }
            }
            return false;
        },

        _clearOldAdditionalInfo:function(){
            while(this._skinParts.additionalInfo.children.length > 0){
                this._skinParts.additionalInfo.removeChild(this._skinParts.additionalInfo.children[0]);
            }
        },

        _addNewAdditionalInfo:function(thePanel){
            this._resetHelpletPosition();
            if(thePanel._skinParts.additionalInfo){
                this._setHelpletBeforeAdditionalInfo(thePanel);
                thePanel._skinParts.additionalInfo.setCollapsed(false);
                this._skinParts.additionalInfo.appendChild(thePanel._skinParts.additionalInfo);
            }
        },

        _resetHelpletPosition:function(){
            var helplet = this._skinParts.helplet;
            var helpletContainer = this._skinParts.helpletContainer;
            if(helplet && helpletContainer && helpletContainer!=helplet.parentNode){
                helpletContainer.appendChild(helplet);
            }
        },

        _setHelpletBeforeAdditionalInfo:function(thePanel){
            var helplet = this._skinParts.helplet;
            var helpletContainer = this._skinParts.helpletContainer;
            var panelHelpletContainer = thePanel._skinParts.helpletContainer;
            if(helpletContainer && helplet && panelHelpletContainer){
                helpletContainer.removeChild(helplet);
                panelHelpletContainer.appendChild(helplet);
            }
        },

        setHistoryDepth: function (depth) {
            this.setState('breadcrumb_' + depth, "breadcrumbs");
        },

        getResizeOffset: function () {
            //todo: calculate
            if (this._contentPanel && this._contentPanel.getActionsHeight) {
                return this._contentPanel.getActionsHeight() + 200;
            }

            return 0;

        },
        getHeaderHeight: function () {
            if (!this._skinParts || !this._skinParts.title) {
                return 0;
            }
            this._headerHeight = this._skinParts.title.getSize().y + this._skinParts.description.getSize().y + this._skinParts.additionalInfo.getSize().y;
            return this._headerHeight;
        },

        getPanelHeight: function () {
            //            this._panelHeight = this._panelHeight || this._skinParts.view.getSize().y;
            //            return this._panelHeight;
            return this._skinParts.view.getSize().y;
        },

        _onCancel: function () {
            if (this._contentPanel) {
                this._contentPanel.cancel(this._realCloseCommand);
            }
        },

        _onClose: function () {
            if (this._contentPanel && this._realCloseCommand) {
                this._contentPanel.tryClose(this._realCloseCommand);

                // IE SUCKS!!! (remove this line and you'll get shit skids of shadows)
                this.injects().Utils.forceBrowserRepaint(null, 50, ['safari', 'ie']);
                this.collapse();
            }
        },
        // fire a resize event on the panel and it's container when the window size changes
        _onWindowResize: function (e) {
            this.fireEvent('resize', e);
        },

        resize: function(panels, command) {
            if (panels.currentPanel && panels.currentPanel.resizeContentArea) {
                var calculatedSize = window.getSize().y - panels.sidePanel.getHeaderHeight() - panels.sidePanel.getResizeOffset();
                var maxSize = panels.currentPanel.getMaxHeight();
                panels.currentPanel && panels.currentPanel.resizeContentArea && panels.currentPanel.resizeContentArea(Math.min(calculatedSize, maxSize));
            }
        }
    });

});
