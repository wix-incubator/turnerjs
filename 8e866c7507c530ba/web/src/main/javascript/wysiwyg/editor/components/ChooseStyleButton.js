define.component('wysiwyg.editor.components.ChooseStyleButton', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.WButton');
    def.binds(['_openCustomizeStylePanel']);
    def.skinParts({
        icon: {type: 'htmlElement', optional: 'true'},
        label: {type: 'htmlElement'},
        editStyle: {type: 'htmlElement'}
    });

    def.methods({initialize: function (compId, viewNode, attr) {
        this.parent(compId, viewNode, attr);
    },
        _onAllSkinPartsReady: function () {
            this.parent();
            this._skinParts.editStyle.addEvent('click', this._openCustomizeStylePanel);
            this._skinParts.editStyle.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'STYLE_CHANGE_BUTTON'));
        },
        _openCustomizeStylePanel: function (event) {
            event.stopPropagation();
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            this.fireEvent('propagateEvent', {type: 'editStyleClicked', params: { left: pos.x, top: pos.y }});

        }
    });
});
