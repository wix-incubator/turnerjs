define.Class('wysiwyg.editor.components.addviamediagallery.AudioPlayerStrategy', function (def) {
    def.inherits('wysiwyg.editor.components.addviamediagallery.BaseStrategy');

    def.fields({
        compType: 'addAudioPlayer',
        compClass: 'wysiwyg.viewer.components.AudioPlayer'
    });

    def.methods({
        extractMediaGalleryData: function (rawAudioData) {
            return { uri: rawAudioData.fileName };
        }
    });
}); 
