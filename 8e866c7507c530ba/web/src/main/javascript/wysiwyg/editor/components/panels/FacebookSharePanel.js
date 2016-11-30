define.component('wysiwyg.editor.components.panels.FacebookSharePanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Data', 'W.Utils', 'W.Resources']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.dataTypes(['FacebookShareButton']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
        },

        _createFields: function () {
            var panel = this;
            var data = this.getDataItem(),
                radioOptions;

            if (!data) {
                return;
            }
            radioOptions = data._schema.urlChoice["enum"].map(function (label) {
                return {
                    label: panel._getTranslatedLabel(label),
                    value: label
                };
            });

            panel.addInputGroupField(function () {
                this.addRadioButtonsField(this._translate('FACEBOOK_SHARE_URL_CHOICE'), radioOptions, 'Current page Url', "RTL").bindToField('urlChoice');
            });

            panel.addInputGroupField(function () {
                this.addInputField(this._translate('FACEBOOK_SHARE_BUTTON_LABEL'), null, 0, 50, {validators: [panel._htmlCharactersValidator]}, null, null).bindToField('label');
            });

            this.addAnimationButton();

        },
        _getTranslatedLabel:function (label){
            label = label.toUpperCase();
            label=label.replace(" ","_");
            return this._translate('FACEBOOK_SHARE_URL_CHOICE_'+label);

        }
    });

});
