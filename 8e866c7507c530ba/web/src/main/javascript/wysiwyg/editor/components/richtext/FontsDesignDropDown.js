define.component('wysiwyg.editor.components.richtext.FontsDesignDropDown', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.richtext.ToolBarDropDown');

    def.methods({
        _displayOptionsOnTop: function () {
            var dropDownComponentHeight = this.getViewNode().getHeight();
            this._skinParts.content.setStyle('margin-top', '-' + (dropDownComponentHeight + this._getContentHeight()) + 'px');
        },
        _displayOptionsOnBottom: function () {
            this._skinParts.content.setStyle('margin-top', '1px');
        }
    });
});
