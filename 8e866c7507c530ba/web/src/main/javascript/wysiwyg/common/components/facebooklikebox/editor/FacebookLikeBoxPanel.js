define.component('wysiwyg.common.components.facebooklikebox.editor.FacebookLikeBoxPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.resources(['W.Data', 'W.Utils', 'W.Resources', 'W.Commands']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.dataTypes(['FacebookLikeBox']);
    def.propertiesSchemaType('FacebookLikeBoxProperties');

    def.skinParts({
        getFacebookLink: {
            type: Constants.PanelFields.InlineTextLinkField.compType,
            argObject: {
                buttonLabel: 'FBLIKEBOX_getFacebookLink',
                command: 'WEditorCommands.ShowHelpDialog',
                commandParameter: '/node/22390'
            }
        },
        pageIdInput:{
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'FBLIKEBOX_uid',
                maxLength: '128'
            },
            bindToData: 'facebookPageId',
            hookMethod: '_addPageIdValidator'

        },
        colorCombo:{
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'FBLIKEBOX_colorScheme' },
            bindToData: 'colorScheme',
            dataProvider: [
                {label: 'Dark', value: 'dark'},
                {label: 'Light', value: 'light'}
            ]
        },
        transparentBgChk: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: { labelText: 'FBLIKEBOX_transparentBg' },
            bindToProperty: 'transparentBg'
        },
        facesCB:{
            type: Constants.PanelFields.CheckBox.compType,
            argObject: { labelText: 'FBLIKEBOX_showFaces'},
            bindToData: 'showFaces'

        },
        streamCB:{
            type: Constants.PanelFields.CheckBox.compType,
            argObject: { labelText: 'FBLIKEBOX_showStream'},
            bindToData: 'showStream'

        },
        borderCB:{
            type: Constants.PanelFields.CheckBox.compType,
            argObject: { labelText: 'FBLIKEBOX_showBorder'},
            bindToData: 'showBorder'

        },
        headerCB:{
            type: Constants.PanelFields.CheckBox.compType,
            argObject: { labelText: 'FBLIKEBOX_showHeader'},
            bindToData: 'showHeader'

        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

        },
        _onAllSkinPartsReady: function (){
            var data = this._previewComponent.getDataItem();
            data.addEvent(Constants.DataEvents.DATA_CHANGED, this._applyVisibilityConditions.bind(this));
            this._applyVisibilityConditions(data);
        },

        _applyVisibilityConditions: function (data){
            if (this.getIsDisposed()) {
                return;
            }
            var isCollapsed = (!data.get('showStream') && !data.get('showFaces'));

            this._applyVisibilityCondition(this._skinParts.borderCB, isCollapsed);
            this._applyVisibilityCondition(this._skinParts.headerCB, isCollapsed);
        },

        _applyVisibilityCondition: function(skinPart, isCollapsed){
            skinPart.setCollapsed(isCollapsed);
            _.delay(function(panel,  isCollapsed) {
                if(isCollapsed ) {
                    panel.resources.W.Commands.executeCommand(Constants.EditorUI.RESIZE_HANDLES_CHANGED);
                }
            }, 100, this, isCollapsed);
        },

        _addPageIdValidator: function (definition){
            definition.argObject.validatorArgs = {validators: [this._facebookPageIdValidator.bind(this)]};
            return definition;
        },

        _facebookPageIdValidator: function(text) {
            if(/[^\w\.]/.test(text.trim())) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS');
            }
            if (2 > text.trim().length) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'FBLIKEBOX_ERR_TO_SHORT');
            }
            if (200 < text.trim().length) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'FBLIKEBOX_ERR_TO_LONG');
            }
        }
    });
});
