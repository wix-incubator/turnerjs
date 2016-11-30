define.Class('wysiwyg.editor.components.addviamediagallery.SingleAudioPlayerStrategy', function (def) {
    def.inherits('wysiwyg.editor.components.addviamediagallery.BaseStrategy');

    def.fields({
        compClass: 'wysiwyg.viewer.components.SingleAudioPlayer'
    });

    def.methods({
        getDefaultPreset: function () {
            return {
                compType: 'SingleAudioPlayer',
                compData: {
                    comp: 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer',
                    skin: 'wysiwyg.common.components.singleaudioplayer.viewer.skins.SingleAudioPlayerSkin',
                    data: {
                        'type': 'SingleAudioPlayer'
                    },
                    "layout": {
                        "width": 280,
                        "height": 68
                    }
                },
                styleId: "SingleAudioPlayer_1"
            };
        },
        extractMediaGalleryData: function (rawAudioData) {
            return { 
                uri: rawAudioData.uri,
                originalFileName: rawAudioData.title
            };
        }
    });
}); 
