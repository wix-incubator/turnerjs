/** @class wysiwyg.editor.components.dialogs.SaveDialog */
define.experiment.component('wysiwyg.editor.components.dialogs.SaveDialog.LazyProvision', function (def, strategy) {

	def.methods({

        _performPostSaveOperations: function(firstSaveResponseData, isNoRedirectSave) {
            this.resources.W.SMEditor.completeProvisionAfterMetasiteSave(
                this._smEditorCompleteProvisionAfterMetaSiteSaveSuccess.bind(this, firstSaveResponseData, isNoRedirectSave)
            );
        },

        _smEditorCompleteProvisionAfterMetaSiteSaveSuccess: function(firstSaveResponseData, isNoRedirectSave){
            this.resources.W.AppsEditor2.saveDraft(
                firstSaveResponseData.metaSiteId,
                false,
                true,
                this._navigateToEditOnFirstSave.bind(this, firstSaveResponseData, isNoRedirectSave),
                this._onCloneError.bind(this)
            );
        },

        _navigateToEditOnFirstSave: function(firstSaveResponseData, isNoRedirectSave){
            var editorEditURL = this._getEditorEditURL();

            if (isNoRedirectSave) {
                this._finalizeNoRedirectSave(editorEditURL, firstSaveResponseData);
            } else {
                this._updateWindowLocation(editorEditURL + "#save=1");
            }
        },

        _appStoreManagerCompleteProvisionAfterMetasiteSaveSuccess: strategy.remove()

	});
});