define.component('wysiwyg.editor.components.panels.VKShareButtonPanel', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.traits(['core.editor.components.traits.DataPanel']);

    def.dataTypes(['VKShareButton']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
        },

        _createFields: function () {
            var panel = this;
            this.addInputGroupField(function () {
                this.addComboBox(this._translate("VK_SHARE_BUTTON_STYLE")).bindToField('style');

                var showText = this.addInputField(this._translate("VK_SHARE_TEXT_INPUT_STYLE"), '', null, 200, {validators: [panel._htmlCharactersValidator]}, null, null).bindToField('text');

                this.addVisibilityCondition(showText, function () {
                    var value = panel._previewComponent.getDataItem().get('style');
                    return value !== "Icon";
                });
            });
            this.addAnimationButton();
        }
    });
});


