integration.requireExperiments(['floatingskinforsavenotice']);

describe("Testing notification dialog", function () {

    var saveNoticeDialog = null,
        saveNoticeSelectorName = 'wysiwyg.editor.components.dialogs.SaveNoticeDialog';


    /**
     * Trigger 'Save' with the save notice dialog
     */
    function triggerSiteSaveSync() {
        W.Commands.executeCommand('WEditorCommands.Save', {'promptResultDialog': true, src: 'it'});
    }

    /**
     * Cache dialog logic
     *
     * @param dialogLogic
     */
    function cacheDialogSync(dialogLogic) {
        saveNoticeDialog = dialogLogic;
    }

    /**
     * Wait for our dialog
     *
     * @returns {Q.promise}
     */
    function waitForSaveNoticeDialog() {
        return automation.editorcomponents.Dialogs.waitForDialogOfType(saveNoticeSelectorName);
    }

    /**
     * Click on the "Don't show this again" checkbox
     */
    function clickOnDontShowCheckboxSync() {
        var dontShowAgainCheckbox = saveNoticeDialog._view.getElement('[comp="wysiwyg.editor.components.inputs.CheckBox"]');
        dontShowAgainCheckbox.$logic.setChecked(true);
        dontShowAgainCheckbox.$logic._changeEventHandler();
    }

    /**
     * Spy on floating dialog creation
     */
    function createSpyForDialogSync() {
        spyOn(W.EditorDialogs, '_createFloatingDialog');
    }

    /**
     * Close the dialog
     */
    function closeDialogSync() {
        saveNoticeDialog._closeDialog();
    }

    /**
     * Check if the dialog is hidden when 'Save' is triggered for the 2nd time
     * EditorDialogs._createFloatingDialog <-- should not be called
     */
    function checkIfSaveNoticeDialogDoesNotShowSync() {
        expect(W.EditorDialogs._createFloatingDialog).not.toHaveBeenCalled();
    }

    it('Should open the save notification dialog', function () {

        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(triggerSiteSaveSync)
                .then(waitForSaveNoticeDialog)
                .then(cacheDialogSync)
                .then(clickOnDontShowCheckboxSync)
                .then(closeDialogSync)
                .then(createSpyForDialogSync)
                .then(triggerSiteSaveSync)
                .then(checkIfSaveNoticeDialogDoesNotShowSync);
        });
    });
});
