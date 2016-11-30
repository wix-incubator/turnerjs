define.experiment.Class('wysiwyg.editor.commandregistrars.SaveCommandRegistrar.LinkFixerOverride', function (classDefinition, experimentStrategy) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _onSaveCommand: function (param, cmd) {
            if (!W.Preview.isSiteReady()) {
                return;
            }
            if (W.Editor._editMode == W.Editor.EDIT_MODE.PREVIEW) {
                return;
            }
            /** Changed If **/
            // Checking metasite since post-save (after metasite save) operation
            // might have failed.
            if (W.Config.siteNeverSavedBefore() && !W.Editor.getEditorStatusAPI().getDocumentSaveSucceeded()) {
                this.resources.W.EditorDialogs.openSaveDialog(param);
            }
            /** Changed If **/
            else {
                if (W.Editor.getEditorStatusAPI().getSaveInProcess()) {
                    return;
                }
                this._saveFailedBecauseTimeout = false;
                this._lastSaveParam = param;
                W.Editor.getEditorStatusAPI().setSaveInProcess(true);
                W.Editor.getEditorStatusAPI().setSaveOverride(false);
                if (W.Preview.getPreviewManagers().Data.shouldSaveOverride) {
                    delete W.Preview.getPreviewManagers().Data.shouldSaveOverride;
                    this.resources.W.ServerFacade.overrideSaveDocument(window.siteHeader.id, this.resources.W.Preview.getPreviewSite(), this._onSaveSuccess, this._onSaveFail, param);
                } else {
                    W.ServerFacade.saveDocument(window.siteHeader.id, W.Preview.getPreviewSite(),
                        this._onSaveSuccess,
                        this._onSaveFail,
                        param
                    );
                }

            }

            if (param && (param.src == 'saveBtn')) {
                //report BI event
                LOG.reportEvent(wixEvents.SAVE_BUTTON_CLICKED_IN_MAIN_WINDOW, {g1: W.Editor._templateId});
            }
        }
    });
});



