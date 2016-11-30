define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.NGPromoteDialog', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({

        _onOpenPublishWebsiteShareDialogCommand: function (param, cmd) {
            var editorUI = jQuery('#editorUI');
            var savePublishDialogService = angular.element(editorUI).injector().get('savePublishDialogs');
            savePublishDialogService.openPromoteDialog();
        }

    });
});

