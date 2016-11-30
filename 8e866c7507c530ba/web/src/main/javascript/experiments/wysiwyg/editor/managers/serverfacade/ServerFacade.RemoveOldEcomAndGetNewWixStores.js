define.experiment.Class('wysiwyg.editor.managers.serverfacade.ServerFacade.RemoveOldEcomAndGetNewWixStores', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        markOldEcomAsDeleted: function (onSuccess, onError) {
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var url = this._urlBuilderForApps.getMarkOldEcomAsDeletedUrl();
            var params = {};
            this._restClient.post(url, {}, callbacks);
        }
    });
});
