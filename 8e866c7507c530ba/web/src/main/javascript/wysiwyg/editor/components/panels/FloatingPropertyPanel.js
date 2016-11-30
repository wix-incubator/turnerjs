define.component('wysiwyg.editor.components.panels.FloatingPropertyPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.skinParts({
        lock:{ type:'wysiwyg.editor.components.WButton' },
        unlock:{ type:'wysiwyg.editor.components.WButton' },
        copy:{ type:'wysiwyg.editor.components.WButton' },
        paste:{ type:'wysiwyg.editor.components.WButton' },
        label:{ type:'htmlElement' },
        help:{ type:'htmlElement' },
        remove:{ type:'wysiwyg.editor.components.WButton' },
        forward:{ type:'wysiwyg.editor.components.WButton' },
        back:{ type:'wysiwyg.editor.components.WButton' },
        settings:{ type:'wysiwyg.editor.components.WButton', argObject:{label:"FPP_SETTINGS_LABEL", labelType:'langKey'}},
        design:{ type:'wysiwyg.editor.components.WButton', argObject:{label:"FPP_DESIGN_LABEL", labelType:'langKey'}},
        isInMasterCB:{ type:'wysiwyg.editor.components.inputs.CheckBox', argObject:{toolTip:{}}},
        fixedPosition:{ type:'wysiwyg.editor.components.inputs.CheckBox', argObject:{toolTip:{}}},
        customButton:{ type:'wysiwyg.editor.components.WButton', autoCreate:false },
        actions:{ type:'htmlElement' },
        customActions:{ type:'htmlElement' },
        textLarger:{ type:'wysiwyg.editor.components.WButton' },
        textSmaller:{ type:'wysiwyg.editor.components.WButton' },
        hide:{ type:'wysiwyg.editor.components.WButton' },
        animation: { type: 'wysiwyg.editor.components.WButton', argObject: {label: "FPP_ADD_ANIMATION_LABEL", labelType: 'langKey'} },
        hiddenElements: { type:'wysiwyg.editor.components.ComponentsMenu', argObject: { } },
        background: {type:'wysiwyg.editor.components.WButton', argObject: {label: "FPP_ChangeBackground", labelType: 'langKey'}}
    });

    def.resources(['W.Utils', 'W.Editor', 'W.Commands', 'W.Resources', 'W.Data', 'W.Preview', 'W.AppStoreManager', 'W.EditorDialogs', 'W.Config', 'W.TPA']);

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds([
        '_componentIsLocked', '_componentIsUnlocked',
        '_showPropertyPanel', 'hidePanel', '_hidePanelOnMouseMove', '_setOrderButtonsState', '_showStyleDialog', '_getAllStyles',
        '_setPositionOnceOnReady', '_onSingleCustomPartReady', '_collapseOnTransitionEnd', '_onHelpButtonClick', '_setPanelScope',
        '_moveCurrentComponentToOtherScope', '_enableDrag', '_onEditorReady', '_setLabel', '_bindFixedPositionCheckbox', '_onFixedPositionChecked'
    ]);

    def.statics({
        DRAG_OFFSET:40,
        OFFSET_FROM_MOUSE:{x:45, y:0},
        OFFSET_FROM_PANEL:{x:65, y:55},
        HIDDEN_ELEMENTS_MARGIN: 15
    });

    def.states({
        'transition':['fade'],
        'moveScope':['moveToMaster', 'moveToPage', 'disabled', 'notChangeable'],
        compScope : ['scopeMaster', 'scopePage'],
        fixedPosition: ['hide']
    });

    def.fields({
        _enableShowOnAllPages:true
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._editedComponent = null;
            this._customParts = [];
            this._customPartsReady = false;
            this._customPartsLength = 0;
            this._lastKnownMousePosition = {x:0, y:0};
            this._hasCssTransitions = Modernizr.csstransitions;
            this._visible = false;
            this.resources.W.Editor.addEvent(this.resources.W.Editor.EDITOR_READY, this._onEditorReady);
            this.collapse();
            this.resources.W.Editor.registerEditorComponent('floatingPanel', this);
        },

        _onEditorReady: function () {
            this.resources.W.Preview.getPreviewManagers().Commands.registerCommandAndListener('WViewerCommands.ComponentZIndexChanged', this, this._onZIndexChanged);
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.componentScopeChange', this, this._setPanelScope, null);
        },

        _onZIndexChanged: function(param) {
            this._setOrderButtonsState(param);
            if(this._editedComponent && this._skinParts.hiddenElements.$view.isDisplayed() && !this._editedComponent.isMultiSelect) {
                this._buildHiddenElementsList(this._lastKnownMousePosition);
            }
        },

        // The only difference is that the property panel is being constructed each time the component is clicked
        // No caching, Mr. Tom, WixApps need fresh meat!
        setEditedComponent:function (clickPosition) {
            this._panelDeleteOpts = this._getDeleteOptions();
            this._editedComponent = this.resources.W.Editor.getEditedComponent();
            this._setLabel(this._editedComponent);

            var previewComp = this.resources.W.Preview.translateEditorClickPosition(clickPosition);
            var componentCommands = this.resources.W.Editor.getComponentMetaData(this._editedComponent, previewComp) || {};
            var customCommands = null;
            var forceHideDesign = false;
            var forceHideSettings = false;
            var forceHideAnimation = false;

            var mode = this.resources.W.Config.env.$viewingDevice;

            //noinspection JSHint
            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    customCommands = componentCommands.mobile && componentCommands.mobile.custom;
                    forceHideDesign = true;
                    forceHideAnimation = true;
                    forceHideSettings = componentCommands.mobile && componentCommands.mobile.hidePanel;
                    this._enableShowOnAllPages = false;
                    this._enableTextSacleButtons = this._isComponentTextScalable(componentCommands);
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                default:
                    customCommands = componentCommands.custom;
                    this._enableShowOnAllPages = true;
                    this._enableTextSacleButtons = false;
                    break;

            }
            this._setPanelCommands(componentCommands.general, { "forceHideSettings": forceHideSettings, "forceHideDesign": forceHideDesign, "forceHideAnimation": forceHideAnimation, "forceHideHiddenElements": false}, clickPosition);
            this._populateCustomButtons(customCommands);
            this._setPanelButtonsVisibility(mode, componentCommands);
            this._setPanelScopeState();
        },

        /**
         * Set the panel position, take in account the borders of the editor window and OFFSET_FROM_MOUSE constant
         * If a part of the panel will appear out of the window, correct the position.
         * if no parameters passed, using last known mouse position
         * @param x {Number} in px
         * @param y {Number} in px
         */
        setPosition:function (x, y) {
            if (isNaN(x) || isNaN(y)) {
                x = this._lastKnownMousePosition.x;
                y = this._lastKnownMousePosition.y;
            } else {
                this._lastKnownMousePosition = {x:x, y:y};
            }
            this._changePosition(x, y, false);
        },

        _changePosition: function(x, y, ignoreWindowBoundaries) {
            var winScroll = window.getScroll();
            var winSize = window.getSize();
            var offset = this.OFFSET_FROM_MOUSE;
            var mySize = this.getViewNode().getSize();

            var left = (x + offset.x - winScroll.x);
            var top = (y + offset.y - winScroll.y);

            // Correct position if it gets out of window boundaries
            if(!ignoreWindowBoundaries) {
                if (left + mySize.x > winSize.x) {
                    left = left - mySize.x - (2 * offset.x);
                }
                if (top + mySize.y > winSize.y) {
                    top = winSize.y - mySize.y;
                }
            }

            this.setX(left);
            this.setY(top);
        },

        /**
         * Show the panel and register some visual states and events on it
         * @param position {Object} Optional new position in the the form of {x:Number, y:Number}
         */
        showPanel:function (position) {
            this._setDeleteButtonState();
            this._setOrderButtonsState({editedComponent: this._editedComponent});
            window.addEvent(Constants.CoreEvents.MOUSE_MOVE, this._hidePanelOnMouseMove);
            this.uncollapse();
            if (position) {
                this.setPosition(position.x, position.y);
                if (!this.isPanelReady()) {
                    this.addEvent('customPartsReady', this._setPositionOnceOnReady);
                }
            }
            if (this._hasCssTransitions) {
                this.removeState('fade', 'transition');
            }

            if (this._enableShowOnAllPages) {
                this._setPanelScope();
            } else {
                this.setState('disabled', 'moveScope');
            }
            this._addRelevantFPPcheckboxes();
            this._visible = true;
            this._manageLockComponentButtons();
        },

        /**
         * Hide the panel and remove events added by showPanel
         */
        hidePanel:function () {
            //TODO: add command.unregisterListener?
            window.removeEvent(Constants.CoreEvents.MOUSE_MOVE, this._hidePanelOnMouseMove);
            if (this._hasCssTransitions) {
                this.setState('fade', 'transition');
            } else {
                this.collapse();
            }
            this._visible = false;
        },
        /**
         * @return true if panel is visible
         */
        isPanelVisible:function () {
            return this._visible;
        },

        /**
         * return true if both component and it's custom parts are ready
         */
        isPanelReady:function () {
            return this.isReady() && this._customPartsReady;
        },

        /**
         * Set initial panel state.
         * - Set buttons commands and tooltips
         * - Hide on startup
         * - Get styles object for _showStylesDialog (TODO: remove when style dialogs will change)
         * - Add Drag.Move event
         */
        _onAllSkinPartsReady:function () {
            this._setButtons();
            this.resources.W.Data.getDataByQuery("#STYLES", this._getAllStyles);
            this._setTransitionEndListener();
            this._enableDrag();
            this._registerHiddenElementsEvents();
            window.addEvent(Constants.CoreEvents.RESIZE, this._enableDrag);
        },
        /**
         * test if the entire list of custom components is ready, fires a custom 'customPartsReady' event with no parameters
         */
        _onSingleCustomPartReady:function () {
            var i = 0;
            this._customPartsReady = true;
            for (i; i < this._customPartsLength; i++) {
                if (!this._customParts || !this._customParts.length || !this._customParts[i] || !this._customParts[i].getLogic || !this._customParts[i].getLogic().isReady()) {
                    this._customPartsReady = false;
                    break;
                }
                if (this._customPartsReady) {
                    this.fireEvent('customPartsReady');
                }
            }
        },
        /**
         * Helper function to run setPosition on ready and then remove the event
         * */
        _setPositionOnceOnReady:function () {
            this.setPosition();
            this.removeEvent('customPartsReady', this._setPositionOnceOnReady);
        },
        /**
         * Hide the panel when the mouse moves away from the panel
         * @param event
         */
        _hidePanelOnMouseMove:function (event) {
            event = event || {};
            var mouse = event.page;
            var position = this._view.getPosition();
            var scroll = window.getScroll();
            var size = this._view.getSize();
            var shouldHide = false;
            if (position) {
                if (mouse.x < position.x + scroll.x - this.OFFSET_FROM_PANEL.x) {
                    shouldHide = true;
                }
                if (mouse.x > position.x + scroll.x + size.x + this.OFFSET_FROM_PANEL.x) {
                    shouldHide = true;
                }
                if (mouse.y < position.y + scroll.y - this.OFFSET_FROM_PANEL.y) {
                    shouldHide = true;
                }
                if (mouse.y > position.y + scroll.y + size.y + this.OFFSET_FROM_PANEL.y) {
                    shouldHide = true;
                }
                if (shouldHide) {
                    this.hidePanel();
                }
            }
        },

        /**
         * Set panel label from preset values in the language file
         * @param labelLanguageId
         */
        _setLabel:function (comp) {
            var label = this.resources.W.Editor.getComponentFriendlyName(comp.$className, comp.getDataItem());
            this._skinParts.label.set('html', label);
        },


        /**
         * set the Duplicate, Delete, Back and Forward buttons commands, tooltips and labels
         */
        _setButtons:function () {
            this._addToolTipToButtons();
            this._setButtonsParameters();
            this._setLockComponentButtons();
            if (this._enableShowOnAllPages) {
                this._addInMasterPageCheckBox();
            }
        },

        _addToolTipToButtons:function(){
            this._addToolTipToSkinPart(this._skinParts.lock, 'Boundary_box_Lock_button_ttid');
            this._addToolTipToSkinPart(this._skinParts.unlock, 'Boundary_box_unLock_button_ttid');
            this._addToolTipToSkinPart(this._skinParts.copy, 'Boundary_box_Copy_button_ttid');
            this._addToolTipToSkinPart(this._skinParts.paste, 'Boundary_box_Paste_button_ttid');
            this._addToolTipToSkinPart(this._skinParts.back, 'Boundary_box_Arrow_down_ttid');
            this._addToolTipToSkinPart(this._skinParts.forward, 'Boundary_box_Arrow_up_ttid');
            this._addToolTipToSkinPart(this._skinParts.remove, 'Boundary_box_Trash_can_ttid');
            this._addToolTipToSkinPart(this._skinParts.textLarger, 'Boundary_box_text_larger_ttid');
            this._addToolTipToSkinPart(this._skinParts.textSmaller, 'Boundary_box_text_smaller_ttid');
            this._addToolTipToSkinPart(this._skinParts.hide, 'Boundary_box_hide_ttid');
        },

        _setButtonsParameters:function(){
            var iconSrc = this._getButtonsIconUrl();
            this._skinParts.copy.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-55}, command:'EditCommands.Copy'});
            this._skinParts.paste.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-112}, command:'EditCommands.Paste'});
            this._skinParts.back.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-82}, command:'WEditorCommands.MoveBack'});
            this._skinParts.forward.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-27}, command:'WEditorCommands.MoveForward'});
            this._skinParts.remove.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-1}, command:'WEditorCommands.WDeleteSelectedComponent'});
            this._skinParts.lock.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-245}, command:'EditCommands.Lock', commandParameter: {source:'FppLockButton'}});
            this._skinParts.unlock.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-219}, command:'EditCommands.Unlock', commandParameter: {source:'FppUnlockButton'}});
            this._skinParts.textLarger.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-162}, command:'WEditorCommands.WComponentTextLarger'});
            this._skinParts.textSmaller.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-189}, command:'WEditorCommands.WComponentTextSmaller'});
            this._skinParts.hide.setParameters({iconSrc:iconSrc, iconSize:{width:26, height:27}, spriteOffset:{x:0, y:-135}, command:'WEditorCommands.WHideSelectedComponent'});

        },

        _setLockComponentButtons:function(){
            this._skinParts.unlock.collapse();
            this._skinParts.lock.addEvent(Constants.CoreEvents.CLICK, this._componentIsLocked);
            this._skinParts.unlock.addEvent(Constants.CoreEvents.CLICK, this._componentIsUnlocked);
        },

        _componentIsLocked:function(){
            this._skinParts.unlock.uncollapse();
            this._skinParts.lock.collapse();
        },

        _componentIsUnlocked:function(){
            this._skinParts.unlock.collapse();
            this._skinParts.lock.uncollapse();
        },

        _getButtonsIconUrl:function(){
            var iconSrc = 'button/fpp-buttons-icons4.png';
            return iconSrc;
        },

        _addInMasterPageCheckBox:function () {
            this._skinParts.isInMasterCB.addEvent('inputChanged', this._moveCurrentComponentToOtherScope);
            this._skinParts.isInMasterCB.setValue(false);
            this._skinParts.isInMasterCB.setLabel(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SHOW_ON_ALL_PAGES'));
        },

        _moveCurrentComponentToOtherScope:function () {
            var fakeEvent = {page:this._lastKnownMousePosition};
            this.resources.W.Commands.executeCommand('EditCommands.moveCurrentComponentToOtherScope', {event:fakeEvent});
        },

        _shouldMoveScopeBeDisabled: function(){
            return !this._editedComponent.canMoveToOtherScope();
        },

        _setPanelScope:function () {
            if (this._editedComponent){
                if (this._shouldMoveScopeBeDisabled()) {
                    this.setState('disabled', 'moveScope');
                } else {
                    var isInPage = (this.resources.W.Config.env.$editorMode == this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE);
                    this._skinParts.isInMasterCB.setValue(!isInPage);
                    if (this._editedComponent.getShowOnAllPagesChangeability()) {
                        this.setState(isInPage ? 'moveToMaster' : 'moveToPage', 'moveScope');
                        this._skinParts.isInMasterCB.enable();
                        this._skinParts.isInMasterCB.addToolTip('Component_Panel_is_in_master_ttid', true, undefined, false);

                    } else {
                        this.setState('notChangeable', 'moveScope');
                        this._skinParts.isInMasterCB.disable();
                        this._skinParts.isInMasterCB.addToolTip('Component_Panel_is_in_master_not_changeable_ttid', true, undefined, false);
                    }
                }
            }
        },

        _disableSkinpartAndAddTooltip: function(skinPart, tooltipId, shouldShowQuestionMark){
            skinPart.disable();
            skinPart.addToolTip(tooltipId, shouldShowQuestionMark);
        },

        /**
         * Show the component property panel
         */
        _showPropertyPanel:function () {
            W.Commands.executeCommand(Constants.EditorUI.HIGHLIGHT_PROPERTY_PANEL);
            W.Commands.executeCommand(Constants.EditorUI.OPEN_PROPERTY_PANEL);
        },

        /**
         * Set the enabled/disabled state of the Back/Forward buttons
         * @param param: param.editedComponent, param.urmData
         */
        _setOrderButtonsState:function (param) {
            var componentChanged = param.editedComponent;
            var component = this.resources.W.Editor.getEditedComponent();
            var container = null;

            var backEnabled = false;
            var forwardEnabled = false;

            if (componentChanged === component) {
                if (!component.isMultiSelect) {
                    container = component.getParentComponent();
                    backEnabled = container.canMoveBack(component);
                    forwardEnabled = container.canMoveForward(component);
                }

                var cmd = this.resources.W.Commands.getCommand('WEditorCommands.MoveForward');
                cmd.setState(forwardEnabled);
                cmd = this.resources.W.Commands.getCommand('WEditorCommands.MoveTop');
                cmd.setState(forwardEnabled);
                cmd = this.resources.W.Commands.getCommand('WEditorCommands.MoveBottom');
                cmd.setState(backEnabled);
                cmd = this.resources.W.Commands.getCommand('WEditorCommands.MoveBack');
                cmd.setState(backEnabled);

            }
        },
        /**
         * Set the panel's actions from the edited component's EDITOR_META_DATA
         */
        _setPanelCommands:function (params, forceHideObject, clickPosition) {
            if (typeof params !== 'object' || typeof forceHideObject !== 'object') {
                return;
            }
            if (params.disableMoveBackward){
                var moveBackCmd = this.resources.W.Commands.getCommand('WEditorCommands.MoveBack');
                moveBackCmd && moveBackCmd.setState(false);
            }

            if (params.disableMoveForward){
                var moveForwardCmd = this.resources.W.Commands.getCommand('WEditorCommands.MoveForward');
                moveForwardCmd && moveForwardCmd.setState(false);
            }

            //Always show 'settings' unless explicitly turned off
            if (params.settings !== false && !forceHideObject.forceHideSettings){
                this._skinParts.settings.uncollapse();
                this._skinParts.settings.addEvent(Constants.CoreEvents.CLICK, this._showPropertyPanel);
            } else {
                this._skinParts.settings.collapse();
                this._skinParts.settings.removeEvent(Constants.CoreEvents.CLICK, this._showPropertyPanel);
            }
            if (params.design && !forceHideObject.forceHideDesign){
                this._skinParts.design.uncollapse();
                this._skinParts.design.addEvent(Constants.CoreEvents.CLICK, this._showStyleDialog);
            } else {
                this._skinParts.design.collapse();
                this._skinParts.design.removeEvent(Constants.CoreEvents.CLICK, this._showStyleDialog);
            }
            if (params.animation !== false && !forceHideObject.forceHideAnimation) {
                this._skinParts.animation.uncollapse();
                var label = this.resources.W.Resources.get('EDITOR_LANGUAGE', (this._editedComponent.getBehaviors()) ? 'FPP_EDIT_ANIMATION_LABEL' : 'FPP_ADD_ANIMATION_LABEL');
                _.defer(this._skinParts.animation.setLabel.bind(this._skinParts.animation), label);
                this._skinParts.animation.addEvent(Constants.CoreEvents.CLICK, this._showAnimationDialog);
            }
            else {
                this._skinParts.animation.collapse();
                this._skinParts.animation.removeEvent(Constants.CoreEvents.CLICK, this._showAnimationDialog);
            }

            this._helpRef = params.helpId;
            if (params.help !== false){
                this._skinParts.help.uncollapse();
                this._skinParts.help.addEvent(Constants.CoreEvents.CLICK, this._onHelpButtonClick);
            } else {
                this._skinParts.help.collapse();
                this._skinParts.help.removeEvent(Constants.CoreEvents.CLICK, this._onHelpButtonClick);
            }

            if (params.hiddenElements !== false && !forceHideObject.forceHideHiddenElements) {
                var hiddenElements = this._skinParts.hiddenElements;
                if(this._editedComponent.isMultiSelect) {
                    hiddenElements.collapse();
                } else {
                    this._buildHiddenElementsList(clickPosition);
                    if(!_.isEmpty(hiddenElements._componentsArray)) {
                        hiddenElements.uncollapse();
                    } else {
                        hiddenElements.collapse();
                    }
                }
            }

            if (params.background){
                this._skinParts.background.uncollapse();
                this._skinParts.background.on(Constants.CoreEvents.CLICK, this, this._showBackgroundPanel);
            } else {
                this._skinParts.background.collapse();
                this._skinParts.background.off(Constants.CoreEvents.CLICK, this, this._showBackgroundPanel);
            }
        },

        _showBackgroundPanel: function() {
            var commandsToExecute = [] ;
            if(this.resources.W.Config.env.isViewingDesktopDevice()) {
                commandsToExecute.push({name: 'WEditorCommands.Design'}) ;
                commandsToExecute.push({name: 'WEditorCommands.ShowBackgroundDesignPanel', param: {src: 'fpp'}});
                commandsToExecute.push({name: 'WEditorCommands.ShowMobileBackgroundEditorPanel', param: {src: 'fpp'}});
            } else {
                commandsToExecute.push({name: "WEditorCommands.MobileDesign"}) ;
                commandsToExecute.push({name: 'WEditorCommands.ShowMobileBackgroundEditorPanel', param: {src: 'fpp_mobile'}}) ;
            }
            if(commandsToExecute.length > 0) {
                for(var i=0; i < commandsToExecute.length; i++) {
                    var cmdName     = commandsToExecute[i].name;
                    var cmdParam    = commandsToExecute[i].param;
                    this.resources.W.Commands.executeCommand(cmdName, cmdParam) ;
                }
            }
        },

        /**
         * Build a WButton compatible argObject from edited component's EDITOR_META_DATA
         * @param argObject
         */
        _buildCustomButtonArgObject:function (argObject) {
            var returnedArgObject = {};
            if (argObject.label) {
                returnedArgObject.label = this.resources.W.Resources.get('EDITOR_LANGUAGE', argObject.label, argObject.label);
            }
            returnedArgObject.command = argObject.command;
            returnedArgObject.commandParameter = {};
            Object.each(argObject.commandParameter, function (value, propName) {
                returnedArgObject.commandParameter[propName] = value;
            });
            returnedArgObject.commandParameter.selectedComp = this._editedComponent;

            if (argObject.commandParameterDataRef && argObject.commandParameter) {
                if (argObject.commandParameterDataRef == 'SELF') {
                    returnedArgObject.commandParameter.data = this._editedComponent.getDataItem();
                }
            }
            return returnedArgObject;
        },

        /**
         * Create a list of buttons from EDITOR_META_DATA
         * @param argObjectList {Object} EDITOR_META_DATA
         */
        _populateCustomButtons:function (argObjectList) {
            var i = 0;
            this._disposeCustomParts();
            if (argObjectList && argObjectList.length) {
                var definition = this.getSkinPartDefinition('customButton');
                var el = null;
                this._customPartsLength = argObjectList.length;
                for (i; i < this._customPartsLength; i++) {
                    definition.argObject = this._buildCustomButtonArgObject(argObjectList[i]);
                    el = this._createComponentbyDefinition(definition, null, this._onSingleCustomPartReady);
                    el.insertInto(this._skinParts.customActions);
                    this._customParts.push(el);
                }
            }
        },
        /**
         * Dispose all custom parts of the panel
         */
        _disposeCustomParts:function () {
            var el = null;
            this._customParts = this._customParts || [];
            while (this._customParts.length) {
                el = this._customParts.pop();
                el.dispose();
            }
            this._skinParts.customActions.empty();
            this._customPartsReady = false;
        },
        /**
         * Show styles or advanced styles dialog depending on the number of styles th edited component has
         */
        _showStyleDialog:function () {
            var targetComp = this.resources.W.Editor.getEditedComponent();

            //Hack for pages container, pass the current page
            if (this._isPage()) {
                targetComp = this._getPageComponent();
            }

            this.resources.W.Commands.executeCommand("WEditorCommands.ChooseComponentStyle", {editedComponentId:targetComp.getComponentId(), left:0});
        },
        /**
         * get styles list
         * @param styles
         */
        _getAllStyles:function (styles) {
            this._allCompStyles = styles && styles.get && styles.get("styleItems");
        },
        /**
         * Make the panel dragable
         */
        _enableDrag:function () {
            var screenSize = window.getSize();
            var limits = {
                x:[10, screenSize.x - this.DRAG_OFFSET],
                y:[this.DRAG_OFFSET, screenSize.y - this.DRAG_OFFSET]
            };
            this._drag = new Drag.Move(this._skinParts.view, {
                snap:0,
                handle:this._skinParts.label,
                limit:limits
            });
        },
        _onHelpButtonClick:function () {
            if (!this._helpRef) {
                var componentInformation = this.resources.W.Preview.getPreviewManagers().Components.getComponentInformation(this._editedComponent.$className);
                this._helpRef = (componentInformation && componentInformation.get('helpIds') && componentInformation.get('helpIds').componentPanel) ||
                    'COMPONENT_PANEL_' + this._editedComponent.$className.split('.').getLast();
            }
            W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', this._helpRef);
        },

        /**
         * Helper function for Fade in/out transition
         * Sniff which TransitionEnd function is supported on the current browser
         */
        _whichTransitionEvent:function () {
            var t;
            var el = document.createElement('fakeelement');
            var transitions = {
                'WebkitTransition':'webkitTransitionEnd',
                'MozTransition':'transitionend',
                'OTransition':'oTransitionEnd',
                'msTransition':'MSTransitionEnd',
                'transition':'transitionend'
            };

            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
            return null;
        },
        /**
         * Helper function for Fade in/out transition
         * Collapse the view after fade out
         */
        _collapseOnTransitionEnd:function () {
            if (this.getState('transition') === 'fade') {
                this.collapse();
            }
        },
        /**
         * Helper function for Fade in/out transition
         * Set the transitionEnd event listener
         */
        _setTransitionEndListener:function () {
            if (this._hasCssTransitions) {
                var transitionEnd = this._whichTransitionEvent();
                //if (!Modernizr.testProp('pointerEvents')) {
                    this._view.addEventListener(transitionEnd, this._collapseOnTransitionEnd, false);
                //}
            }
        },
        _openPageSettings:function (pageComponent) {
            var pageData = pageComponent.getDataItem();
            var refId = '#' + pageData.get('id');
            this.resources.W.Commands.executeCommand("WEditorCommands.Pages");
            this.resources.W.Commands.executeCommand("WEditorCommands.PageSettings", {
                pageId:refId
            });
        },
        _isPage:function () {
            var targetComp = this.resources.W.Editor.getEditedComponent();
            return (targetComp.getOriginalClassName() == 'wysiwyg.viewer.components.PagesContainer');
        },
        _getPageComponent:function () {
            var currentPageID = this.resources.W.Preview.getPreviewCurrentPageId();
            return this.resources.W.Preview.getHtmlElement(currentPageID).getLogic();
        },

        _setPanelScopeState: function(){
            var isInPage = (this.resources.W.Config.env.$editorMode === this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE);
            //Pages Container is different from all others.
            if (this._editedComponent.$className === 'wysiwyg.viewer.components.PagesContainer'){
                isInPage = true;
            }
            this.setState((isInPage)? 'scopePage': 'scopeMaster', 'compScope');
        },

        _isComponentTextScalable: function(componentCommands){
            return componentCommands && componentCommands.mobile && componentCommands.mobile.isTextScalable;
        },

        /**
         * What was done here:
         * 1. If the edited component can be fixed position, we add the checkbox to the FPP. Otherwise, we hide the checkbox
         * 2. If the edited component is the child of the footer, we disable the show on all pages checkbox and add the relevant tooltip (as per product from long long ago, it just never worked properly)
         * 3. If the edited component is the child of the header and the header is in fixed position, we disable the show on all pages checkbox and add the relevant tooltip (as per product)
         */
        _addRelevantFPPcheckboxes: function(){
            if (this._editedComponent.canBeFixedPosition() && this.resources.W.Config.env.isViewingDesktopDevice()) {
                this._addFixedPositionCheckboxToFPP();
            } else {
                this._hideFixedPositionCheckboxFromFPP();
                if(this._editedComponent.isChildOfFooter()){
                    this._disableSkinpartAndAddTooltip(this._skinParts.isInMasterCB, 'Component_Panel_is_in_master_not_changeable_ttid', true);
                }else if(this._editedComponent.isChildOfFixedPositionHeader()){
                    this._disableSkinpartAndAddTooltip(this._skinParts.isInMasterCB, 'Component_In_Fixed_Position_Header_ttid', true);
                }
            }
        },
        _addFixedPositionFPPLabelAndTooltip: function () {
            var fixedPositionSkinpart = this._skinParts.fixedPosition;
            var editedComponentClassName = this._editedComponent.$className;
            var tooltipId;

            fixedPositionSkinpart.setLabel(fixedPositionSkinpart._translate('FIXED_POSITION_LABEL','Fixed Position'));

            var fixedComponentToolTips = {
                'wysiwyg.viewer.components.HeaderContainer' : 'HeaderContainer_Fixed_Position_ttid',
                'wysiwyg.viewer.components.FooterContainer' : 'FooterContainer_Fixed_Position_ttid'
            };

            tooltipId = fixedComponentToolTips[editedComponentClassName];

            this._skinParts.fixedPosition.addToolTip(tooltipId, true, undefined, false);
        },

        _showFixedPositionFPPSkinpart: function () {
            this.removeState('hide','fixedPosition');
        },

        _addFixedPositionCheckboxToFPP: function () {
            var fixedPositionSkinpart = this._skinParts.fixedPosition;
            var isFixed = this._editedComponent.isFixedPositioned();
            fixedPositionSkinpart.setValue(isFixed);
            this._showFixedPositionFPPSkinpart();
            this._bindFixedPositionCheckbox();
            this._addFixedPositionFPPLabelAndTooltip();
            fixedPositionSkinpart.enable();
        },

        _hideFixedPositionCheckboxFromFPP: function () {
            this.setState('hide','fixedPosition');
            this._skinParts.fixedPosition.disable();
        },

        _bindFixedPositionCheckbox:function () {
            if(!this._isBoundToFixedPosition){
                this._skinParts.fixedPosition.addEvent('inputChanged',this._onFixedPositionChecked);
                this._isBoundToFixedPosition = true;
            }
        },

        _onFixedPositionChecked: function(e){
            var pos = e.value ? 'fixed' : 'absolute';
            if(!this._isValidComponentForFixedPosition()){
                var desc = this._editedComponent.canBeFixedPosition() ? 'canBeFixedPosition = true' : '.'; //just interesting to know..
                LOG.reportError(wixErrors.INVALID_COMPONENT_ATTEMPT_TO_BE_FIXEDPOSITION, this._editedComponent.$className, '_onFixedPositionChecked: FPP', desc);
                return;
            }
            this._editedComponent.setPos(pos);
            LOG.reportEvent(wixEvents.FIXED_POSITION_TOGGLED,{c1: this._editedComponent.$className, i1: e.value});
        },

        _isValidComponentForFixedPosition: function(){
            var validClassNames = ["wysiwyg.viewer.components.HeaderContainer", "wysiwyg.viewer.components.FooterContainer"];
            return _.contains(validClassNames, this._editedComponent.$className);
        },

        _showAnimationDialog: function() {
            W.Commands.executeCommand('WEditorCommands.ShowAnimationDialog');
        },

        _manageLockComponentButtons:function(){
            var compEditBox = this.resources.W.Editor.getComponentEditBox();
            var isSelectedComponentsCanBeLocked = compEditBox.isSelectedComponentsCanBeLocked();
            if(!isSelectedComponentsCanBeLocked){
                this._skinParts.unlock.collapse();
                this._skinParts.lock.collapse();
                return;
            }
            if(compEditBox.isComponentLocked()){
                this._componentIsLocked();
            }
            else{
                this._componentIsUnlocked();
            }
        },

        _buildHiddenElementsList: function(position) {
            var componentsAtPosition = this._filterComponentsAtPosition(this._getComponentAtPosition(position));
            this._skinParts.hiddenElements.buildList(componentsAtPosition);
        },

        _registerHiddenElementsEvents: function() {
            var hiddenElements = this._skinParts.hiddenElements;
            hiddenElements.on('open', this, this._onHiddenElementsListOpened);
            hiddenElements.on('closed', this, this._onHiddenElementsListClosed);
            hiddenElements.on('componentClicked', this, this._onHiddenElementClicked);
            hiddenElements.on('componentOver', this, this._onHiddenElementOver);
            hiddenElements.on('componentOut', this, this._onHiddenElementOut);
        },

        _onHiddenElementClicked: function(e) {
            var hiddenElements = this._skinParts.hiddenElements,
                componentsListPositionBeforeFPPReopen,
                componentsListPositionAfterFPPReopen,
                newFPPPosition;

            // Store components list position just before the FPP change its position
            componentsListPositionBeforeFPPReopen = hiddenElements.getViewNode().getPosition();

            // Reopen FPP at source position
            this.resources.W.Editor.setSelectedComp(e.data.component, null, null, true);
            this.resources.W.Commands.executeCommand(Constants.EditorUI.OPEN_FLOATING_PANEL, this._lastKnownMousePosition);

            // Store components list position after the FPP changed its position
            componentsListPositionAfterFPPReopen = hiddenElements.getViewNode().getPosition();

            // Change the FPP position according to the delta between the old and new hidden element position
            newFPPPosition = this._computeFPPPositionAccordingToHiddenElementsDelta(hiddenElements, componentsListPositionBeforeFPPReopen, componentsListPositionAfterFPPReopen, e);
            this._changePosition(newFPPPosition.x, newFPPPosition.y, true);

            if(_.isEmpty(hiddenElements._componentsArray)) {
                hiddenElements.closeList();
            }

            this.resources.W.Commands.executeCommand("Graphics.Clear");
        },

        _onHiddenElementsListOpened: function() {
            var hiddenElementsListDimensions = this._skinParts.hiddenElements._skinParts.list.getDimensions();
            this.expandMouseOffsetFromPanelByDelta(hiddenElementsListDimensions.width, hiddenElementsListDimensions.height);
        },

        _onHiddenElementsListClosed: function() {
            this.resetMouseOffsetFromPanelToDefault();
        },

        _onHiddenElementOver: function(e) {
            var borderColor, backgroundColor;

            if(this.resources.W.Editor.getComponentScope(e.data.component) === this.resources.W.Editor.EDIT_MODE.MASTER_PAGE) {
                borderColor = "#F7D793";
                backgroundColor = "#FFAE00";
            } else {
                borderColor = backgroundColor = "#00D5FF";
            }

            this.resources.W.Commands.executeCommand("Graphics.HighlightComponent", { component: e.data.component, styles: { borderColor: borderColor, bgColor: backgroundColor, bgOpacity: 0.15 } });
        },

        _onHiddenElementOut: function() {
            this.resources.W.Commands.executeCommand("Graphics.Clear");
        },

        _computeFPPPositionAccordingToHiddenElementsDelta: function(hiddenElements, oldPosition, newPosition, e) {
            var fppNewPositionX,
                fppNewPositionY,
                windowScroll = window.getScroll(),
                currentPosition = this.getViewNode().getPosition();

            if(_.isEmpty(hiddenElements._componentsArray)) {
                fppNewPositionX = e.data.clickPos.x - this.OFFSET_FROM_MOUSE.x;
                fppNewPositionY = e.data.clickPos.y - this.OFFSET_FROM_MOUSE.y;
            } else {
                fppNewPositionX = (currentPosition.x - this.OFFSET_FROM_MOUSE.x) + (oldPosition.x - newPosition.x) + windowScroll.x;
                fppNewPositionY = (currentPosition.y - this.OFFSET_FROM_MOUSE.y) + (oldPosition.y - newPosition.y) + windowScroll.y;
            }

            return {
                x: fppNewPositionX,
                y: fppNewPositionY
            };
        },

        _filterComponentsAtPosition: function(componentsAtPosition) {
            componentsAtPosition = _.filter(componentsAtPosition, function(component) {
                return component.getComponentId() !== this.resources.W.Preview.getPagesContainer().getLogic().getComponentId();
            }, this);
            if(_.size(componentsAtPosition) === 1 && componentsAtPosition[0].getComponentId && componentsAtPosition[0].getComponentId() === this._editedComponent.getComponentId()) {
                componentsAtPosition = [];
            }
            return componentsAtPosition;
        },

        _getComponentAtPosition: function(clickPosition) {
            // allComponentsFromGlobalCoordinates expects to get client position and clickPosition is the page position
            var windowScrollOffset = this.resources.W.Utils.getWindowScrollOffset();
            var clientX = clickPosition.x - windowScrollOffset.x;
            var clientY = clickPosition.y - windowScrollOffset.y;
            var componentsAtPosition = this.resources.W.Preview.allComponentsFromGlobalCoordinates(clientX, clientY, this.resources.W.Preview.selectionFilter, this.HIDDEN_ELEMENTS_MARGIN);
            return componentsAtPosition;
        },

        expandMouseOffsetFromPanelByDelta: function(xDelta, yDelta) {
            this.OFFSET_FROM_PANEL = {
                x: this.OFFSET_FROM_PANEL.x + (xDelta || 0),
                y: this.OFFSET_FROM_PANEL.y + (yDelta || 0)
            };
        },

        resetMouseOffsetFromPanelToDefault: function() {
            this.OFFSET_FROM_PANEL = { x: 65, y: 55 };
        },

        _setPanelButtonsVisibility: function(mode, componentCommands){
            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this._skinParts.copy.collapse();
                    this._skinParts.paste.collapse();
                    if(componentCommands && componentCommands.mobile && componentCommands.mobile.forceRemoveIconOnHide === true) {
                        this._skinParts.remove.setCommand("WEditorCommands.WHideSelectedComponent");
                        this._skinParts.remove.uncollapse();
                        this._skinParts.hide.collapse();
                    } else {
                        this._setDeleteButtonCommand();
                        this._skinParts.remove.collapse();
                        this._skinParts.hide.uncollapse();
                    }
                    break;
                default:
                    this._skinParts.copy.uncollapse();
                    this._skinParts.paste.uncollapse();
                    this._skinParts.remove.uncollapse();
                    this._setDeleteButtonCommand();
                    this._skinParts.hide.collapse();
                    break;

            }

            this._skinParts.textLarger.setCollapsed(!this._enableTextSacleButtons);
            this._skinParts.textSmaller.setCollapsed(!this._enableTextSacleButtons);
        },

        _setDeleteButtonCommand: function () {
            var _this = this;

            _.defer(function () { // Defer to make it being called after FPP is totally rendered
                if (_this._panelDeleteOpts.enableTrashcanButton) {
                    _this._skinParts.remove.setCommand("WEditorCommands.WDeleteSelectedComponent");
                } else {
                    _this._skinParts.remove.removeCommand();
                }
            });
        },

        /**
         * Set the enabled/disabled state of the delete button
         * Adding support for Hide button as well, since they follow the same rules
         */
        _setDeleteButtonState: function(){
            var _this = this;

            _.defer(function () { // Defer to make it being called after FPP is totally rendered
                var cmd = _this._panelDeleteOpts.deleteCommand;
                cmd.setState(_this._panelDeleteOpts.enableDeleteCommand);

                if (_this._panelDeleteOpts.enableTrashcanButton){
                    _this._skinParts.remove.enable();
                } else {
                    _this._skinParts.remove.disable();
                }
            });
        },

        _getDeleteCommand: function () {
            var mode = this.resources.W.Config.env.$viewingDevice;

            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    return this.resources.W.Commands.getCommand('WEditorCommands.WHideSelectedComponent');
                default:
                    return this.resources.W.Commands.getCommand('WEditorCommands.WDeleteSelectedComponent');
            }
        },

        _getDeleteOptions: function () {
            var view, isMobileEditorView;
            var comp = this.resources.W.Editor.getEditedComponent();
            var deleteCompEnabled = this.resources.W.Editor.canDeleteSelectedComponent();
            var isTPASection = this.resources.W.TPA.isTPASectionComponent(comp);
            var deleteCommand = this._getDeleteCommand();
            var deleteOptions = {
                enableTrashcanButton: false,
                enableDeleteCommand: false,
                deleteCommand: deleteCommand
            };

            if (isTPASection) {
                // Enable delete command only in desktop editor mode
                view = this.resources.W.Config.env.$viewingDevice;
                isMobileEditorView = view === Constants.ViewerTypesParams.TYPES.MOBILE;
                deleteOptions.enableDeleteCommand = !isMobileEditorView;

                return deleteOptions;
            }

            if (deleteCompEnabled) {
                deleteOptions.enableTrashcanButton = deleteOptions.enableDeleteCommand = true;
            }

            return deleteOptions;
        }
    });

});