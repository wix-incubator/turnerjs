define.component('wysiwyg.editor.components.richtext.RTEffectOptionButton', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.resources(['W.Resources']);

    def.methods({
        _renderIcon: function(){
            this.parent();
            if (this._iconMargin) {
                this._skinParts.icon.style.margin = this._iconMargin;
            }
        },
        _renderLabel: function(){
            if (this._label) {
                this._skinParts.label.set('html', this._label);
            }

            if (this._shadow) {
                this._skinParts.label.style.textShadow = this._shadow;
            }

            if (this._textColor) {
                this.$view.style.color = this._textColor;
            }

            if (this._titleKey) {
                var effectTitle = this.resources.W.Resources.get('EDITOR_LANGUAGE', this._titleKey);
                if (effectTitle !== "") {
                    this.$view.title = effectTitle;
                }
            }
        },
        _onDataChange: function(dataObj, field, value) {
            if (dataObj){
                this._shadow      = dataObj.get("labelShadow")      || this._shadow;
                this._textColor      = dataObj.get("textColor")     || this._textColor;
                this._titleKey      = dataObj.get("titleKey")     || this._titleKey;
                this._iconMargin      = dataObj.get("iconMargin")     || this._iconMargin;
            }
            this.parent(dataObj, field, value);
        },
        _onClick: function(e){
            this.parent(e);

            LOG.reportEvent(wixEvents.TEXT_EFFECT_SELECT, {c1:this.getDataItem().get("effectName")});
        }
    });

});
