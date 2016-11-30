define.experiment.Class('wysiwyg.editor.commandregistrars.SaveCommandRegistrar.SaveBIEvents', function (classDefinition, experimentStrategy) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _onSaveCommand: strategy.before(function (param, cmd) {
            if (W.Config.siteNeverSavedBefore() && !W.Editor.getEditorStatusAPI().getDocumentSaveSucceeded()) {
                //this is the same if that we have in the original method, to display the save popup for the user to enter their name. in that case, we already have a log, so no need to report anything here
                return;
            }
            LOG.reportEvent(wixEvents.SAVE_START, {i1: 1, i2: param.isPublished });
        }),

        _onSaveSuccess: strategy.before(function() {
           //if save failed due to timeout and the success response followed the timeout error, we should not present success
           if(this._saveFailedBecauseTimeout){
               return;
           }
           LOG.reportEvent(wixEvents.SAVE_SUCCESS, {i1: 1, i2: this._lastSaveParam && this._lastSaveParam.isPublished });
        })
    });
});



