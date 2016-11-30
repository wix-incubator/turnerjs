describe("ChangeGallery Integration Tests", function () {

    var originalGalleryPreset = {compData: {"groupType":"Gallery","comp":"wysiwyg.viewer.components.SliderGallery","skin":"wysiwyg.viewer.skins.galleryslider.SliderGalleryDefaultSkin","data":{"type":"ImageList"},"dataRefs":{"items":{"isList":true,"items":[{"data":{"type":"Image","id":"i01or7","metaData":{"isPreset":true,"schemaVersion":"2.0","isHidden":false},"title":"I'm a title","uri":"84770f_f899a8151a034278b6cbd0ffc6507858.jpg","description":"I'm a description. Click to edit me","width":426,"height":567,"alt":"","link":""}},{"data":{"type":"Image","id":"i11xwy","metaData":{"isPreset":true,"schemaVersion":"2.0","isHidden":false},"title":"I'm a title","uri":"84770f_1857c0b87f1f44c49b452d7845c9fcf6.jpg","description":"I'm a description. Click to edit me","width":426,"height":567,"alt":"","link":""}},{"data":{"type":"Image","id":"i2217f","metaData":{"isPreset":true,"schemaVersion":"2.0","isHidden":false},"title":"I'm a title","uri":"84770f_7d714a86326f42938d3b4bd6cca93b3f.jpg","description":"I'm a description. Click to edit me","width":426,"height":567,"alt":"","link":""}}]}},"layout":{"width":480,"height":160}}},
        originalGalleryId,
        originalGalleryItems,
        newGalleryId,
        newGalleryItems,
        changeGalleryDialog;

    function convertItemIdsToImagesData(itemIds){
        var imagesData = [];
        itemIds.forEach(function(itemId){
            var dataItem = W.Preview.getPreviewManagers().Data.getDataByQuery(itemId),
                imageData = dataItem.getData();

            delete imageData.id;//We remove ID because it's the only property that may change from gallery to gallery. All other properties (uri, title etc.) must stay.
            imagesData.push(imageData);
        });

        return imagesData;
    }

    function addGallery(){
        return automation.viewercomponents.ViewerComponent.addComponent(originalGalleryPreset);
    }

    function openChangeGalleryDialog(gallery){
        expect(gallery).toBeDefined();

        originalGalleryId = gallery.getComponentId();
        originalGalleryItems = convertItemIdsToImagesData(gallery.getDataItem().get('items'));

        W.Commands.executeCommand('WEditorCommands.OpenChangeGalleryDialog', {selectedComp: gallery});

        return automation.editorcomponents.Dialogs.waitForDialogOfType('wysiwyg.editor.components.dialogs.ChangeGalleryDialog');
    }

    function waitForDialogToBeReady(dialog){
        changeGalleryDialog = dialog;
        return dialog._galleryReadyQ.promise;
    }

    function clickFirstItemInList(dialog){
        expect(dialog._galleryListLogic).toBeDefined();
        dialog._galleryListLogic._skinParts.selectionList.$view.getChildren()[0].click();

        return automation.editorcomponents.EditBox.waitForCompSelectionChange();
    }

    function clickOkButton(comp){
        expect(comp).toBeDefined();

        changeGalleryDialog._dialogWindow.endDialog(W.EditorDialogs.DialogButtons.OK);
        return changeGalleryDialog._dialogClosingQ.promise;
    }

    function checkIfGalleryActuallyChangedAndThenUndo(gallery){
        newGalleryId = gallery.getComponentId();
        newGalleryItems = convertItemIdsToImagesData(gallery.getDataItem().get('items'));

        expect(newGalleryId).not.toBe(originalGalleryId);
        expect(newGalleryItems).toEqual(originalGalleryItems);
        expect(W.Preview.getCompByID(originalGalleryId)).toBeUndefined();

        W.UndoRedoManager.undo();

        return automation.controllers.Events.waitForEvent(W.UndoRedoManager, Constants.UrmEvents.UNDO_COMPLETE);
    }

    function checkIfGalleryIsBackToOriginalState(){
        var selectedGalleryAfterUndo = W.Editor.getEditedComponent(),
            selectedGalleryId = selectedGalleryAfterUndo.getComponentId();

        expect(selectedGalleryId).toBe(originalGalleryId);
        expect(W.Preview.getCompByID(newGalleryId)).toBeUndefined();
    }

    it("Should add a MatrixGallery, switch to SliderGallery and then revert to original MatrixGallery", function () {
        automation.Utils.waitsForPromise(function() {
            return new Q()
                .then(addGallery)
                .then(openChangeGalleryDialog)
                .then(waitForDialogToBeReady)
                .then(clickFirstItemInList)
                .then(clickOkButton)
                .then(checkIfGalleryActuallyChangedAndThenUndo)
                .then(checkIfGalleryIsBackToOriginalState);
        });
    });
});
