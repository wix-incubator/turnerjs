define.component('Editor.wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.spotifyplayer.editor.SpotifyPlayerPanel',
        skin: 'wysiwyg.common.components.spotifyplayer.editor.skins.SpotifyPlayerPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/18991'
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            //This event is fired from the Component Edit Box
            this.addEvent("resizeEnd", this._setIframeSize );

            this._resizableSides = [
                Constants.BaseComponent.ResizeSides.LEFT,
                Constants.BaseComponent.ResizeSides.RIGHT
            ];
        }),

        _togglePlaceholderImage: strategy.after(function(shouldHideImage) {
            if(shouldHideImage) {
                this._resizableSides = [
                    Constants.BaseComponent.ResizeSides.LEFT,
                    Constants.BaseComponent.ResizeSides.RIGHT
                ];
            }
            else {
                this._resizableSides = [];  //The placeholder image is not resizeable
            }
        }),

        registerOnCompDelete: function (callback){
            this._onCompDeleteCallback = callback;
        },

        exterminate: function (){
            if(typeof this._onCompDeleteCallback === 'function') {
                this._onCompDeleteCallback();
            }
            this.parent();
        }
    });
});