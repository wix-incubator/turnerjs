define.component('wysiwyg.editor.components.AnimationGalleryItem', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.skinParts({
        container: {type: 'htmlElement'},
        label: {type: 'htmlElement'},
        icon: {type: 'htmlElement'}
    });
    def.dataTypes(['list']);
    def.states(['selected', 'up']);
    def.methods({
        _onAllSkinPartsReady: function () {
            this._skinParts.label.set('text', this._data.get('label'));
            // We want to preserve bg color;
            this._skinParts.icon.setStyle('background', 'url(' + this._getIconUrl(this._data.get('iconUrl')) + ')');
            this._skinParts.icon.setStyle('background-repeat', 'no-repeat');
            this._skinParts.icon.setStyle('background-position', 'center');
        },

        _getIconUrl: function (iconPath) {
            // Cover full URLs, URLs with no protocol & image data schemes
            if (iconPath.test(/^(http|\/\/|data\:image)/)) {
                return iconPath;
            }

            return W.Theme.getProperty("WEB_THEME_DIRECTORY") + iconPath;
        }
    });

});
