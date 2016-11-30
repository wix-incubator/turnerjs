define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.WixAppsGalleryField', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.methods({
        _openListEditDialog: function (params) {
            this.resources.W.EditorDialogs.openListEditDialog(params.data, params.galleryConfigID, params.startingTab, params.source, params.callback);
            LOG.reportEvent(wixEvents.ORGANIZE_IMAGES_CLICKED, {
                c1: params.source,
                c2: params.galleryConfigID
            });
        }
    });
});