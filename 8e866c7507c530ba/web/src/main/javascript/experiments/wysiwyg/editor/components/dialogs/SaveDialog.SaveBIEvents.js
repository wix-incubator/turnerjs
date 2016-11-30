define.experiment.component('wysiwyg.editor.components.dialogs.SaveDialog.SaveBIEvents', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _cloneSite: strategy.before(function(siteLabel){
            LOG.reportEvent(wixEvents.SAVE_START, {i1: 0, i2: '?', c1: siteLabel });
        }),

        _onCloneSuccess: strategy.before(function() {
            //if save failed due to timeout and the success response followed the timeout error, we should not present success
            if (this._cloneFailedBecauseTimeout) {
                return;
            }
            LOG.reportEvent(wixEvents.SAVE_SUCCESS, {i1: 0, i2: '?' });
        })
    });
});