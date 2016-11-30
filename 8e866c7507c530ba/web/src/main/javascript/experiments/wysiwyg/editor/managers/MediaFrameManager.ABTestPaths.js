define.experiment.Class('wysiwyg.editor.managers.MediaFrameManager.ABTestPaths', function (classDefinition, experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.statics({
        framePath: "assets/media_gallery/index.html",
        protocolPath: "assets/media_gallery/protocol.js",
        _topology: {
            baseUrl: "mediaGalleryBaseUrlB",
            baseHost: "baseDomain",
            mediaGallery: "mediaGalleryStaticBaseUrlB"
        }
    });

});