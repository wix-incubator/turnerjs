define.component('wysiwyg.editor.components.ThumbGalleryItem', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.skinParts({
        container: {type: 'htmlElement'},
        icon: {type: 'htmlElement'}
    });
    def.dataTypes(['list']);
    def.states(['selected', 'up']);
    def.methods({
        _onAllSkinPartsReady: function () {
            this._skinParts.container.set('title', this._data.get('label'));
            // We want to preserve bg color;
            this._skinParts.icon.setStyle('background-image', 'url(' + this._data.get('iconUrl') + ')');
            this._skinParts.icon.setStyle('background-repeat', 'no-repeat');
            this._skinParts.icon.setStyle('background-position', 'center');
        }
    });

});
