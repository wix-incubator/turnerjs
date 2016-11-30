define.component("wysiwyg.editor.components.EditorPresenter", function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.utilize(['core.managers.components.ComponentBuilder']);

    def.resources(['W.Editor', 'W.EditorDialogs', 'W.Config', 'W.Commands', 'W.Preview', 'W.CookiesManager']);

    def.binds(['_onEditorLoaded', '_autoStartQuickTour', '_showMobileQuickTour', '_hideMobileQuickTour']) ;

    def.states({
        cursor        : ['progress', 'normal'],
        editorMode    : ['edit', 'preview'],
        viewDeviceMode: ['mobile', 'desktop'],
        loadPhase     : ['preload', 'loaded']
    });

    def.skinParts({
        bottomDecorationLayer: {type: 'wysiwyg.editor.components.EditorDecorations'},
        editLayer            : {type: 'wysiwyg.editor.components.EditLayerPresenter'},
        panelsLayer          : {type: 'wysiwyg.editor.components.PanelPresenter'},
        toolTip              : {type: 'wysiwyg.editor.components.ToolTip'},
        dialogContainer      : {type: 'wysiwyg.editor.components.DialogPresenter'},
        editDecorationLayer: {type: 'wysiwyg.editor.components.EditLayerDecorations'}
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Editor.registerEditorComponent('editorPresenter', this);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditingModeChange);
            this._gridLinesState    = null ;
            this._rulersState       = null ;
            this.resources.W.Editor.addEvent(Constants.EditorEvents.EDITOR_LOAD_FINISHED, this._onEditorLoaded);

            this._bindListeners();
        },

        _bindListeners: function(){
            this.injects().Commands.registerCommandAndListener("WEditorCommands.SecondaryPreviewReady", this, this._autoStartQuickTour, null);
            this.injects().Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._autoStartQuickTour, null);

            this.injects().Commands.registerCommandAndListener("WEditorCommands.ShowMobileQuickTour", this, this._showMobileQuickTour);
            this.injects().Commands.registerCommandAndListener("WEditorCommands.HideMobileQuickTour", this, this._hideMobileQuickTour);
        },

        _onEditingModeChange: function(mode) {
            switch (mode) {
                case Constants.EditorStates.EDIT_MODE.CURRENT_PAGE:
                    this.showEditControls();
                    this.showDialogLayer();
                    break;
                case Constants.EditorStates.EDIT_MODE.MASTER_PAGE:
                    this.showDialogLayer();
                    break;
                case Constants.EditorStates.EDIT_MODE.PREVIEW:
                    this.hideEditControls();
                    this.hideDialogLayer();
                    this.hideAllPanels() ;
                    break;
            }
        },

        createComponentPart: function(skinPart, keepComponent) {
        },

        hideAllPanels: function () {
            this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS) ;
        },

        hideDialogLayer: function() {
            this._skinParts.dialogContainer.hide();
        },

        showDialogLayer: function() {
            this._skinParts.dialogContainer.show();
        },

        showEditControls: function() {
            this.setState('edit', 'editorMode');
            this._skinParts.editLayer._restoreRulersAccordingToState();
        },

        _getPageGroup: function() {
            return this.resources.W.Preview.getPreviewManagers().Viewer.getPageGroup();
        },

        hideEditControls: function() {
            this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_PANEL);
            this.setState('preview', 'editorMode');
            this._skinParts.editLayer._hideRulersAndRememberState();
        },

        showMobileControls: function() {
            W.Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
            this.setState('mobile', 'viewDeviceMode');
        },

        hideMobileControls: function() {
            var isPreviewMode = this.resources.W.Config.env.isEditorInPreviewMode();
            W.Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
            this.setState('desktop', 'viewDeviceMode');
        },

        /**
         * @returns {wysiwyg.editor.components.EditLayerPresenter} - the Editing Layer
         */
        getEditLayer: function() {
            return this._skinParts.editLayer ;
        },

        getSkinPart: function(part){
            return this._skinParts[part] || this._skinParts.editLayer.getSkinPart(part) || this._skinParts.panelsLayer.getSkinPart(part) || null;
        },

        getPanelsLayer: function() {
            return this._skinParts.panelsLayer ;
        },

        _onEditorLoaded: function() {
            this.setState("loaded", "loadPhase") ;
        },

        updateBreadcrumbState: function() {
            this.getPanelsLayer().updateBreadcrumbStateToPreviousCrumb() ;
        },

        getMainBarHeight: function(){
            return this.resources.W.Preview.getPreviewPosition().y;
        },

        getRulerGuides: function() {
            return this._skinParts.editLayer.getRulerGuides();
        },

        getCommentsContainer: function() {
            return this._skinParts.editDecorationLayer.getCommentsContainer();
        },

        // ============================================
        // Mobile Quick Tour
        // ============================================

        _autoStartQuickTour: function(){
            if(!this._mobileQuickTourWasAlreadyActivated() && !this.injects().Config.env.isEditorInPreviewMode() && this.injects().Config.env.isViewingSecondaryDevice() && !this._mobileQuickTourStarted) {
                this._showMobileQuickTour(true);
                this._mobileQuickTourStarted = true;
            }
        },

        _showMobileQuickTour:function(autoStart){
            if(this._mobileQuickTourComponent){
                return;
            }

            this.resources.W.CookiesManager.removeCookie("mobileQuickTourActivated");
            this.resources.W.CookiesManager.setCookieParam("mobileQuickTourActivated", true);
            this.resources.W.EditorDialogs.closeAllDialogs();
            this._mobileQuickTourComponent = this._createQuickTourComponent();
            this.$view.appendChild(this._mobileQuickTourComponent);

            if(autoStart) {
                LOG.reportEvent(wixEvents.QUICK_TOUR_MOBILE_TUTORIAL_AUTO_START);
            } else {
                LOG.reportEvent(wixEvents.QUICK_TOUR_MOBILE_TUTORIAL_STARTED_FROM_HELP_CENTER);
            }
        },

        _hideMobileQuickTour:function(){
            if(this._mobileQuickTourComponent) {
                this._mobileQuickTourComponent.$logic.dispose();
                this._mobileQuickTourComponent = null;
            }
        },

        getMobileQuickTourComponent: function() {
            return this._mobileQuickTourComponent;
        },

        _createQuickTourComponent: function(){
            var def = {
                id:"mobileQuickTour",
                type:"wysiwyg.editor.components.MobileQuickTour",
                skin:"wysiwyg.editor.skins.MobileQuickTourSkin"
            };

            var viewNode = new Element("div");
            viewNode.setProperty("skinPart", def.id);

            var compBuilder = new this.imports.ComponentBuilder(viewNode);

            compBuilder.
                withType(def.type).
                withSkin(def.skin).
                create();

            return viewNode;
        },

        _mobileQuickTourWasAlreadyActivated: function() {
            return this.resources.W.CookiesManager.getCookie("mobileQuickTourActivated");
        }
    });
});
