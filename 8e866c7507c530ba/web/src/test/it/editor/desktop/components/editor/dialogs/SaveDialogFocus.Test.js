describe("Test focus on first save dialog", function () {

    it("should set focus to site name text box", function () {

        // Open SaveAs dialog
        W.Commands.executeCommand("WEditorCommands.SaveAs");

        // SaveDialog variables
        var saveDialogView = $$('[comp="wysiwyg.editor.components.dialogs.SaveDialog"]')[0];
        var saveDialog =  saveDialogView.$logic;

        // SiteName variables
        var siteNameInputCompView = saveDialogView.getElement('[comp="wysiwyg.editor.components.inputs.Input"]');
        var siteNameInput = siteNameInputCompView.$logic;
        var siteNameSkinPart = siteNameInput.getSkinPart('input');

        // In focus
        var elementInFocus = $$(':focus')[0];

        expect(siteNameSkinPart).toEqual(elementInFocus);

        // Close SaveAs dialog
        saveDialog._dialogWindow.forceTriggerCancelButton();
    });

});