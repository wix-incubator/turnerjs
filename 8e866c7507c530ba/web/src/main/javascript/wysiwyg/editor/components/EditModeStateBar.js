define.component('wysiwyg.editor.components.EditModeStateBar', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.skinParts({
        editStateBarBack: {type: 'core.components.Button', 'autoBindDictionary': 'LEFT_SWITCH_TO_EDITOR_MODE'},
        helpButton: {type: 'core.components.Button'},
        title: {type: 'htmlElement'},
        description: {type: 'htmlElement'},
        viewModeSwitch: { type: 'wysiwyg.editor.components.ViewModeSwitch' }
    });

    def.resources(['W.Editor', 'W.Commands', 'W.Resources', 'W.Config']);

    def.binds(['_editStateBarBackHandler']);

    def.states({
        editorMode    : ['edit', 'preview'],
        viewDeviceMode: ['mobile', 'desktop']
    });

    def.methods({
        _onAllSkinPartsReady: function () {
            if(this.resources.W.Config.isFacebookSite()){
                this._skinParts.viewModeSwitch.collapse();
            }
            this._skinParts.editStateBarBack.addEvent(Constants.CoreEvents.CLICK, this._editStateBarBackHandler);
            this._addToolTipToSkinPart(this._skinParts.editStateBarBack, 'Back_To_Editor_ttid');

            this._skinParts.helpButton.addEvent('click', function () {
                switch (this.resources.W.Config.env.$editorMode) {
                    case this.resources.W.Editor.EDIT_MODE.MASTER_PAGE:
                        this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'MasterPage');
                        break;
                    case this.resources.W.Editor.EDIT_MODE.PREVIEW:
                        //W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'PreviewPage');
                        break;
                }

            }.bind(this));
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onModeChange);
            W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handleEditModeChange);
            W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleViewerStateChange);
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

        _onModeChange: function (editMode) {
            var rec = this.resources.W.Resources;
            switch (editMode) {
                case this.resources.W.Editor.EDIT_MODE.MASTER_PAGE:
                    this._skinParts.title.set('text', rec.get('EDITOR_LANGUAGE', 'EDIT_MODE_TITLE_MASTER'));
                    this._skinParts.description.set('text', rec.get('EDITOR_LANGUAGE', 'EDIT_MODE_DESCRIPTION_MASTER'));
                    this._skinParts.helpButton.uncollapse();
                    break;
                case this.resources.W.Editor.EDIT_MODE.PREVIEW:
                    this._skinParts.title.set('text', rec.get('EDITOR_LANGUAGE', 'EDIT_MODE_TITLE_PREVIEW'));
                    this._skinParts.description.set('text', '');
                    this._skinParts.helpButton.collapse();
                    break;
            }
        },

        _editStateBarBackHandler: function () {
            var cmds = this.resources.W.Commands;
            cmds.getCommand('WEditorCommands.WSetEditMode').execute({editMode: this.resources.W.Editor.EDIT_MODE.CURRENT_PAGE, previousEditMode: W.Editor.EDIT_MODE.PREVIEW});
        }
    });

});
