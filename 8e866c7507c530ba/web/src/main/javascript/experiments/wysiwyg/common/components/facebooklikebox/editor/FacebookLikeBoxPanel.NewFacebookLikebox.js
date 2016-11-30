define.experiment.component('wysiwyg.common.components.facebooklikebox.editor.FacebookLikeBoxPanel.NewFacebookLikebox', function (componentDefinition, experimentStrategy) {
    var strategy = experimentStrategy;
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
        pageIdInput: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'FBLIKEBOX_uid',
                maxLength: '128'
            },

            bindToData: 'facebookPageId',
            hookMethod: '_addPageIdValidator'
        },
        headerCB: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'FBLIKEBOX_showHeader'},
            bindToData: 'showHeader'
        },

        facesCB: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'FBLIKEBOX_showFaces'},
            bindToData: 'showFaces'
        },

        streamCB: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'FBLIKEBOX_showStream'},
            bindToData: 'showStream'
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            var comp = W.Editor.getSelectedComp();
            comp._prevData = _.pick(comp._data._data, ['showFaces', 'showHeader', 'showStream']);
        },

        _onAllSkinPartsReady: function () {
            var data = this._previewComponent.getDataItem();
            data.addEvent(Constants.DataEvents.DATA_CHANGED, this._onDataChange.bind(this));
        },

        _onDataChange: function (data) {
            if (this.getIsDisposed()) {
                return;
            }
            var data = _.pick(data._data, ['showFaces', 'showHeader', 'showStream']),
                comp = W.Editor.getSelectedComp();

            if (comp._shouldChangeHeight(data, comp._prevData)) {
                var height = comp._getHeights(data).currentHeight || 146;

                _.delay(function (panel, height) {
                    W.Editor.getSelectedComp().setHeight(height);
                    panel.resources.W.Commands.executeCommand(Constants.EditorUI.RESIZE_HANDLES_CHANGED);
                }, 80, this, height);

                comp._prevData = data;
            }
        },

        _addPageIdValidator: function (definition) {
            definition.argObject.validatorArgs = {validators: [this._facebookPageIdValidator.bind(this)]};
            return definition;
        },

        _facebookPageIdValidator: function (text) {
            if (/[^\w\.]/.test(text.trim())) {
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
