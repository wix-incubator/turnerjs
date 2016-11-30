define.component('wysiwyg.editor.components.panels.SelectableListPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.skinParts({
        content: { type: 'htmlElement' },
        scrollableArea: { type: 'htmlElement' },
        selectionList: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataType: 'SelectableList',
            argObject: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.buttons.ButtonMenuSkin'},
            hookMethod: '_createDataItem'
        }
    });

    def.methods({

        /**
         * should be implemented
         */
        _createDataItem: function (definition) {
        },

        render: function () {
            var listNode = this._skinParts.selectionList._view;
            listNode.insertInto(this._skinParts.content);
        },

        setTitleKey: function(titleKey) {
            this._titleKey = titleKey;
        },

        setDescriptionKey: function(descriptionKey) {
            this._descriptionKey = descriptionKey;
        }
    });
});