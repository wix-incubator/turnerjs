define.component('wysiwyg.editor.components.dialogs.SpotifySearchDialog', function (componentDefinition) {
    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        'iframe': {type: 'htmlElement'}
    });

    def.resources(['W.Resources', 'W.Commands', 'W.EditorDialogs']);

    def.traits(['core.editor.components.traits.DataPanel']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._iframeUrl = args.iframeUrl;
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.iframe.setAttribute('src',this._iframeUrl);
        }
    });
});





