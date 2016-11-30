define.component('wysiwyg.editor.components.ViewModeSwitch', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands', 'W.Resources','W.Config','W.Editor','W.EditorDialogs', 'W.Preview']);

    def.binds(['_setViewerMode', '_addDesktopEditorTooltip', '_addMobileEditorTooltip']);

    def.skinParts({
        viewModeSwitch: {type: 'wysiwyg.editor.components.inputs.RadioImages', argObject: {}, hookMethod:'_setRadioButtonsInit'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._hasToolTip = args.tooltip || false;
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.WSetEditMode', this, this._handleEditModeChange);
        },

        _handleEditModeChange: function(state){
            switch (state.editMode) {
                case Constants.EditorStates.EDIT_MODE.PREVIEW:
                    this._skinParts.desktopIndicationTooltip.collapse();
                    this._skinParts.mobileIndicationTooltip.collapse();
                    break;
                default:
                    break;
            }
        },

        _setRadioButtonsInit: function(definition) {

            var size = {w: '36px', h: '36px'};
            definition.argObject.presetList = [
                {value: Constants.ViewerTypesParams.TYPES.DESKTOP, image: 'mobile/topbar-toggle-desktop.png', dimensions: size},
                {value: Constants.ViewerTypesParams.TYPES.MOBILE,  image: 'mobile/topbar-toggle-mobile.png', dimensions: size}
            ];
            return definition;
        },

        /*
        * default mode is set to desktop.
        * If we want it to use the default that the editor is opened in (whichever it may be),
        * we need to call _setCurrentMode with W.Preview.getViewerMode() as the mode value in the parameter- but the viewer isn't ready at this point
        * */
        _onAllSkinPartsReady : function() {
            this._skinParts.viewModeSwitch.addEvent('inputChanged', this._setViewerMode);
            W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._setCurrentMode);

            this._setCurrentMode({mode:Constants.ViewerTypesParams.TYPES.DESKTOP});

            // adding tooltips to mode switch buttons
            var viewModeSwitch = this._skinParts.viewModeSwitch;
            var radioButtonsLogic = viewModeSwitch.getRadioButtonsList();
            var btns = {
                desktop: radioButtonsLogic.DESKTOP._skinParts.radioContainer,
                mobile: radioButtonsLogic.MOBILE._skinParts.radioContainer
            };

            if (this._hasToolTip){
                var readyCommand = this.resources.W.Commands.getCommand('PreviewIsReady');
                if (readyCommand){
                    readyCommand.registerListener(this, this._addMobileEditorTooltip);
                    readyCommand.registerListener(this, this._addDesktopEditorTooltip);
                }
            } else {
                this._addToolTipToSkinPart(btns.desktop, 'Main_Menu_Desktop_Edit_Mode_ttid');
                this._addToolTipToSkinPart(btns.mobile, 'Main_Menu_Mobile_Edit_Mode_ttid');
            }
        },

        _addDesktopEditorTooltip: function(){
            this.resources.W.Commands.getCommand('PreviewIsReady').unregisterListener(this);

            var desktopEditorButton = this._skinParts.viewModeSwitch.getRadioButtonsList().DESKTOP._skinParts.radioContainer;
            var tooltipDialog = this._skinParts.desktopIndicationTooltip;

            this._skinParts.desktopLabel.innerHTML = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_INDICATION_TOOLTOP_DESKTOP_LABEL');

            desktopEditorButton.addEvent('mouseenter', function () {
                tooltipDialog.style.display = 'block';
            }.bind(this));
            desktopEditorButton.addEvent('mouseleave', function () {
                tooltipDialog.style.display = 'none';
            }.bind(this));
        },

        _addMobileEditorTooltip: function(){
            this.resources.W.Commands.getCommand('PreviewIsReady').unregisterListener(this);

            var mobileEditorButton = this._skinParts.viewModeSwitch.getRadioButtonsList().MOBILE._skinParts.radioContainer;
            var tooltipDialog = this._skinParts.mobileIndicationTooltip;
            var closeButton = this._skinParts.close;

            this._skinParts.mobileLabel.innerHTML = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_INDICATION_TOOLTOP_MOBILE_LABEL');
            this._skinParts.mobileDescription.innerHTML = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_INDICATION_TOOLTOP_DESCRIPTION');

            mobileEditorButton.addEvent('mouseenter', function () {
                tooltipDialog.style.display = 'block';
                closeButton.style.visibility = 'hidden';
            }.bind(this));
            mobileEditorButton.addEvent('mouseleave', function () {
                tooltipDialog.style.display = 'none';
            }.bind(this));

            var beforeFirstSave = this.resources.W.Config.getEditorModelProperty('firstSave');
            if (beforeFirstSave) {
                return;
            }
            var wasDisplayed = this.resources.W.EditorDialogs.dialogWasShownAlready('mainMenuMobileEditorTooltip');
            if(!wasDisplayed){
                this._displayMobileEditorTooltip(tooltipDialog, closeButton);
            }
        },

        _displayMobileEditorTooltip: function(tooltipDialog, closeButton){
            tooltipDialog.style.display = 'block';

            closeButton.addEvent('click', function () {
                tooltipDialog.style.display = 'none';
                closeButton.style.visibility = 'hidden';
            });

            closeButton.style.visibility = 'visible';
        },

        /*
        * params is an object, containing a 'mode' field
        * */
        _setCurrentMode: function(params){
            if (this._lastMode === params.mode){
                return;
            }
            this._lastMode = params.mode;
            this._skinParts.viewModeSwitch.setValue(params.mode);
        },

        _setViewerMode: function(event){
            if (this._lastMode === event.value){
                return;
            }
            this._lastMode = event.value;
            var src = event.value.toLowerCase()+'Btn';
            this.resources.W.Commands.executeCommand('WEditorCommands.SetViewerMode',{mode: event.value,src: src},this);
        }
    });
});
