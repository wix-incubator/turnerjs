define.experiment.Class('wysiwyg.editor.managers.serverfacade.WServerApiUrlsForApps.RemoveOldEcomAndGetNewWixStores', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        initialize:  strategy.after(function () {
            this._w_constants = Object.merge(this._w_constants, {
                'MARK_OLD_ECOM_AS_DELETED':'/editor/ecom/remove/{0}'
            });
        }),

        getMarkOldEcomAsDeletedUrl: function () {
            var metaSiteId = W.Config.getEditorModelProperty('metaSiteId');
            var url =  this._getUrl(this._w_constants.MARK_OLD_ECOM_AS_DELETED, [metaSiteId]);
            url = this._addJsonParam(url);
            return url;
        }
    });
});
