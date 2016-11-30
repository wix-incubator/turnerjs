/**
 * @Class wysiwyg.editor.components.panels.MainEditorBar
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.MainEditorBar', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.resources(['W.Commands', 'W.Utils']);

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.utilize(['core.managers.components.ComponentBuilder']);

    def.binds(['_enableOnPreviewReadyEvent', '_reshow', '_toggleUserPanel', '_onBarPlaceholderCaptureClick']);

    def.skinParts({
        content:{type:'htmlElement'},
        pagesDropDown:{ type:'wysiwyg.editor.components.SiteNavigationDropDown' },
        viewModeSwitch: { type: 'wysiwyg.editor.components.ViewModeSwitch', argObject:{tooltip:true} },
        wixLogo:{type:'htmlElement'}
    });

    def.states({
        editorMode    : ['edit', 'preview'],
        viewDeviceMode: ['mobile', 'desktop'],
        userPanel: ['collapsedUserPanel', 'uncollapsedUserPanel']
    });

    def.statics({
        _events: {
            USER_PANEL_TOGGLE: {
                'desc': 'User toggled User Panel',
                'type': 40, // replace l.type.userAction
                'category': 1, // replace with l.category.editor
                'biEventId': 110,
                'biAdapter': 'hed-misc'
            }
        }

    });

    def.dataTypes(['PropertyList', '']);

    /**
     * @lends wysiwyg.editor.components.panels.MainEditorBar
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.disable();

            this._enableOnPreviewReadyEvent();
            this._editActionsGroup = null;
            this._undoActionsGroup = null ;
            this._captureUndoRedoCount = 0;
            W.Commands.registerCommandListenerByName('EditorCommands.SiteLoaded', this, this._reshow);
            W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handleEditModeChange);
            W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleViewerStateChange);

            if (this._isIE() || this._isFB()) {
                return;
            }

            this.resources.W.Commands.registerCommandAndListener('EditorCommands.UserPanelToggleOnActions', this, this._toggleUserPanel);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.Save', this, this._collapse);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.OpenPublishDialog', this, this._collapse);
        },

        _onAllSkinPartsReady: function() {
            if (this._isIE() || this._isFB()) {
                return;
            }

            this._initUserPanel();
        },

        _initUserPanel: function() {
            if (this._isIE() || this._isFB()) {
                return;
            }

            this.setState('collapsedUserPanel', 'userPanel');
            this._skinParts.wixLogo.addEvent('click', function() {
                this._toggleUserPanel();
            }.bind(this));
        },

        _toggleUserPanel: function(forceState) {
            var userPanelVisible = forceState || this.getState('userPanel') === 'uncollapsedUserPanel';
            userPanelVisible ? this.setState('collapsedUserPanel', 'userPanel') : this.setState('uncollapsedUserPanel', 'userPanel');
            this.resources.W.Commands.executeCommand('WEditorCommands.ToggleEditorUserPanel', !userPanelVisible);
            LOG.reportEvent(this._events.USER_PANEL_TOGGLE, {c1: userPanelVisible});
        },

        _collapse: function() {
            this.setState('collapsedUserPanel', 'userPanel');
        },

        _isIE: function() {
            if (this.resources.W.Utils.getInternetExplorerVersion() === 9) {
                return true;
            }
            return false; //this.resources.W.Utils.getInternetExplorerVersion() > -1;
        },

        _isFB: function() {
            return this.resources.W.Config.getApplicationType() == Constants.WEditManager.SITE_TYPE_FACEBOOK;
        },

        _handleViewerStateChange: function(params){
            switch (params.viewerMode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('mobile', 'viewDeviceMode');
                    break;
//                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                default:
                    this.setState('desktop', 'viewDeviceMode');
                    break;
            }
        },

        _handleEditModeChange: function(mode){
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

        _reshow:function(){
            //fix fpr ie9 that screw the top bar.
            if(this._view && this._view.parentNode){
                this._view.parentNode.replaceChild(this._view, this._view);
            }
        },
        _enableOnPreviewReadyEvent:function () {
            var previewReadyCommand = W.Commands.getCommand('PreviewIsReady');
            if (!previewReadyCommand) {
                W.Commands.registerCommandAndListener('PreviewIsReady', this, this.enable);
            } else {
                previewReadyCommand.registerListener(this, this.enable);
            }
        },

        _onGridLinesLoaded:function () {
            W.Commands.executeCommand('EditCommands.ToggleGridLines', true);
        },

        _addDocumentActions:function () {
            //Document Actions (save, publish, preview etc.)
            var helpIcon = {iconSrc:'maineditortabs/dark-help-sprite.png', iconSize:{width:18, height:18}, spriteOffset:{x:0, y:0}};
            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, this._translate('MAIN_BAR_PREVIEW'), false, null, 'mainBarDocActions', null, 'Main_Menu_Preview_ttid', 'WEditorCommands.WSetEditMode', {'editMode':W.Editor.EDIT_MODE.PREVIEW, 'src':'previewBtn'});
                this.addButtonField(null, this._translate('MAIN_BAR_SAVE'), false, null, 'mainBarDocActions', null, 'Main_Menu_Save_ttid', 'WEditorCommands.Save', {'promptResultDialog':true, 'src':'saveBtn'});
                this.addButtonField(null, this._translate('MAIN_BAR_PUBLISH'), false, null, 'mainBarDocActions', null, 'Main_Menu_Publish_ttid', 'WEditorCommands.OpenPublishDialog', {});
                if (_.contains(_.pluck(editorModel.permissionsInfo.loggedInUserRoles, 'role'), 'owner')) {
                    this.addButtonField(null, this._translate('MAIN_BAR_UPGRADE'), false, null, 'mainBarDocActions', null, 'Main_Menu_Upgrade_ttid', 'WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo':Constants.WEditManager.UPGRADE_SRC.TOP_PANEL});
                }

                this.addButtonField(null, this._translate('MAIN_BAR_HELP'), false, helpIcon, 'mainBarHelpIcon', null, null, 'WEditorCommands.ShowHelpDialog', 'TopBar');

            }, 'skinless');
        },

        _addUndoActions:function () {
            var bar = this;
            //Undo Actions (undo, redo)
            this._undoActionsGroup = this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                bar._undoButton = this.addButtonField(null, this._translate('MAIN_BAR_UNDO'), false, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:-108}}, 'mainBarEditActions', null, 'Main_Menu_Undo_ttid', 'WEditorCommands.Undo', 'mainBar');
                bar._redoButton = this.addButtonField(null, this._translate('MAIN_BAR_REDO'), false, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:-135}}, 'mainBarEditActions', null, 'Main_Menu_Redo_ttid', 'WEditorCommands.Redo', 'mainBar');
            }, 'skinless');
        },

        _addDebugActions: function() {
            W.Commands.registerCommandAndListener('Experiments.Open', this, this._openDialog);

            this.addInputGroupField(function() {
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, 'Experiments', false, {iconSrc: 'maineditortabs/dark-icon-sprite.png', iconSize: {width:26, height:26}, spriteOffset: {x:0, y:-189}}, 'mainBarEditActions', null, 'Main_Menu_Experiment_ttid', 'Experiments.Open');
            }, 'skinless');
        },

        _openDialog: function() {
            this.resources.W.EditorDialogs.openExperimentsDialog();
        },

        _createFields: function(){
            this.setNumberOfItemsPerLine(0, '5px');
            this._addMainEditorBarActionButtons();
        },

        _addMainEditorBarActionButtons: function(){
            if (this._isDebugActions){
                this._addDebugActions();
            }
//            this._addMobileActions();
            this._addUndoActions();
            this._addComponentEditActions();
            this._addGeneralEditActions();
            this._addDocumentActions();

            this._registerModeChangeCommands();
            this._handleMobileSwitchButtonsVisibility();

            this._addUndoRedoHackForModalWindows();
        },

        _addUndoRedoHackForModalWindows: function () {
            var barPlaceholder = this._skinParts.view;

            W.Commands.registerCommandListenerByName('WEditorCommands.StartCapturingUndoRedoButtons', this, function () {
                ++this._captureUndoRedoCount;
                if (this._captureUndoRedoCount === 1) {
                    barPlaceholder.addEventListener('click', this._onBarPlaceholderCaptureClick, true);
                }
            }.bind(this));

            W.Commands.registerCommandListenerByName('WEditorCommands.StopCapturingUndoRedoButtons', this, function () {
                --this._captureUndoRedoCount;
                if (this._captureUndoRedoCount === 0) {
                    barPlaceholder.removeEventListener('click', this._onBarPlaceholderCaptureClick, true);
                }
            }.bind(this));
        },

        _onBarPlaceholderCaptureClick: function (clickEventData) {
            function hasParentMax2Levels(child, parent) {
                return child.parentNode === parent || child.parentNode.parentNode === parent;
            }
            var clickedOnUndoRedo =
                    hasParentMax2Levels(clickEventData.target, this._undoButton.getHtmlElement()) ||
                    hasParentMax2Levels(clickEventData.target, this._redoButton.getHtmlElement());
            if (!clickedOnUndoRedo) {
                clickEventData.stopPropagation();
                W.EditorDialogs.closeAllDialogs();
            }
        },

        _registerModeChangeCommands: function(){
            W.Commands.registerCommandListenerByName("WEditorCommands.WSetEditMode", this, this._onSetEditorMode);
            W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._onSetViewerDeviceMode);
        },

        _handleMobileSwitchButtonsVisibility: function(){
            var appType = W.Config.getApplicationType();

            if (appType === Constants.WEditManager.SITE_TYPE_FACEBOOK) {
                this._skinParts.viewModeSwitch.collapse();
            }
        },

        _onSetViewerDeviceMode: function(params){
            this._changeButtonsVisibilityByDevice(params.mode);
            this.disposeHelpInfoBubble();
        },

        _onSetEditorMode: function(){
            this._changeButtonsVisibilityByDevice(W.Config.env.$viewingDevice);
            this.disposeHelpInfoBubble();
        },

        _changeButtonsVisibilityByDevice: function(viewerDeviceMode){
            switch (viewerDeviceMode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this._componentEditActionsGroup.copy.collapse();
                    this._componentEditActionsGroup.paste.collapse();
                    this._generalEditActionsGroup.grid.collapse();
                    this.resources.W.Commands.executeCommand('WEditorCommands.HidePopover');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this._componentEditActionsGroup.copy.uncollapse();
                    this._componentEditActionsGroup.paste.uncollapse();
                    this._generalEditActionsGroup.grid.uncollapse();
                    this.resources.W.Commands.executeCommand('WEditorCommands.ShowPopover');
                    break;
            }
        },

        _addComponentEditActions:function () {
            //Component Edit Actions (copy, paste)
            this._componentEditActionsGroup = {};
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, this._translate('MAIN_BAR_COPY'), false, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:-27}}, 'mainBarEditActions', null, 'Main_Menu_Copy_ttid', 'EditCommands.Copy', 'mainBar')
                    .runWhenReady(function(logic){
                        panel._componentEditActionsGroup.copy = logic;
                    });
                this.addButtonField(null, this._translate('MAIN_BAR_PASTE'), false, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:0}}, 'mainBarEditActions', null, 'Main_Menu_Paste_ttid', 'EditCommands.Paste', 'mainBar')
                    .runWhenReady(function(logic){
                        panel._componentEditActionsGroup.paste = logic;
                    });
            }, 'skinless');
        },

        _addGeneralEditActions:function () {
            //General Edit Actions (rulers, grid etc.)
            this._generalEditActionsGroup = {};
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, this._translate('MAIN_BAR_GRID'), true, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:-54}}, 'mainBarEditActions', null, 'Main_Menu_Grid_ttid', 'EditCommands.ToggleGridLines')
                    .runWhenReady(function (logic) {
                        panel._generalEditActionsGroup.grid = logic;
                        logic.toggleSelected(true);
                        W.Commands.registerCommandListenerByName('EditorCommands.SiteLoaded', panel, panel._onGridLinesLoaded);
                    });
                this.addButtonField(null, this._translate('MAIN_BAR_SNAP'), true, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:-81}}, 'mainBarEditActions', null, 'Snap_To_Object_Toggle_ttid', 'EditCommands.SnapToObject')
                    .runWhenReady(function (logic) {
                        panel._generalEditActionsGroup.snap = logic;
                        logic.toggleSelected(true);
                        W.Commands.executeCommand('EditCommands.SnapToObject', true);
                    });
                this.addButtonField(null, this._translate('MAIN_BAR_RULERS'), true, {iconSrc:'maineditortabs/dark-icon-sprite.png', iconSize:{width:26, height:26}, spriteOffset:{x:0, y:-216}}, 'mainBarEditActions', null, 'Main_Menu_RulersAndGuides_ttid', 'WEditorCommands.WToggleRulers')
                    .runWhenReady(function (logic) {
                        panel._generalEditActionsGroup.rulers = logic;
                        logic.toggleSelected(false);
                    });
            }, 'skinless');
        },

        _onRender: function(){
            this._skinParts.wixLogo.addEvent(Constants.CoreEvents.CLICK, this._onWixLogoClick);
        },

        _onWixLogoClick: function() {
            LOG.reportEvent(wixEvents.CLICK_ON_WIX_LOGO);
        },

        getHelpInfoBubble: function() {
            return this._helpInfoBubble;
        },

        createHelpInfoBubble: function(titleText, bodyText, checkBoxState, checkBoxText){
            titleText = titleText || "";
            bodyText = bodyText || "";
            checkBoxState = checkBoxState ? true : false;
            checkBoxText = checkBoxText || "";

            this.disposeHelpInfoBubble();

            var def = {
                type:"wysiwyg.editor.components.InfoBubble",
                skin:"wysiwyg.editor.skins.InfoBubbleSkin"
            };
            var viewNode = new Element("div");
            var compBuilder = new this.imports.ComponentBuilder(viewNode);
            compBuilder.
                withType(def.type).
                withSkin(def.skin).
                withArgs({
                    titleText:titleText,
                    bodyText:bodyText,
                    checkBoxState:checkBoxState,
                    checkBoxText:checkBoxText
                }).
                create();

            this._helpInfoBubble = viewNode.$logic;
            W.Editor.getEditorUI().$view.appendChild(viewNode);

            viewNode.$logic.addEvent("close", function(){
                this.disposeHelpInfoBubble();
            }.bind(this));
        },

        disposeHelpInfoBubble: function () {
            if(this._helpInfoBubble) {
                this._helpInfoBubble.dispose();
                this._helpInfoBubble = null;
            }
        },

        dispose: function () {
            this.disposeHelpInfoBubble();
            this.parent();
        },
    });
});