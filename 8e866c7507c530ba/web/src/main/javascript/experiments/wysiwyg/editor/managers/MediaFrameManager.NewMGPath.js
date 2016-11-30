define.experiment.Class('wysiwyg.editor.managers.MediaFrameManager.NewMGPath', function (classDefinition, experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.statics({
        framePath: "index.html",
        protocolPath: "scripts/protocol.js",
        _topology: {
            baseUrl: "mediaGalleryG5BaseUrl",
            baseHost: "baseDomain"
        }
    });

    def.methods({
        _getFrameUrlParams: function () {
            return '';
        }
    })
});