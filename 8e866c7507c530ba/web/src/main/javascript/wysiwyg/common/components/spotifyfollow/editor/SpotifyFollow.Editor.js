define.component('Editor.wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.spotifyfollow.editor.SpotifyFollowPanel',
        skin: 'wysiwyg.common.components.spotifyfollow.editor.skins.SpotifyFollowPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/21352'
    });

    def.methods({
        registerOnCompDelete: function (callback){
            this._onCompDeleteCallback = callback;
        }
    });

});