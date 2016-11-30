describe("Anchor Integration Tests", function () {

    var anchorPreset = {
        "compType": "wysiwyg.common.components.anchor.viewer.Anchor",
        "layout": {
            "width": 100,
            "height": 20
        },
        "styleId": 1
        },
        currentAnchor,
        currentButton,
        currentEditingScopeId;

    function _createAnchorLinkDataItem() {
        return W.Preview.getPreviewManagers().Data.createDataItem({
            type: 'AnchorLink'
        }, 'AnchorLink');
    }

    function addAnchor(){
        return automation.viewercomponents.ViewerComponent.addComponent(anchorPreset);
    }

    function makeSureAnchorIsWithCorrectName(comp){
        var expectedName = 'Anchor ' + W.Preview.getPreviewManagers().Viewer.getAnchorManager().getNumberOfAnchors(),
            calculatedName;

        calculatedName = comp._skinParts.anchorName.innerHTML;
        currentAnchor = comp;
        currentEditingScopeId = W.Editor.getEditingScope().id;

        expect(calculatedName).toBe(expectedName);

        return automation.editorcomponents.Dialogs.waitForDialogOfType('wysiwyg.editor.components.dialogs.NotificationDialog');
    }

    function addButton(){
        return automation.viewercomponents.ViewerComponent.addComponent("addButton");
    }

    function linkAnchorToButton(comp){
        expect(comp).toBeDefined();
        currentButton = comp;

        var anchorDataItem = currentAnchor.getDataItem(),
            anchorLink = _createAnchorLinkDataItem(),
            anchorLinkWithId;

        anchorLink.set('pageId', '#' + currentEditingScopeId);
        anchorLink.set('anchorDataId', anchorDataItem.get('id'));
        anchorLink.set('anchorName', anchorDataItem.get('name'));

        anchorLinkWithId = W.Preview.getPreviewManagers().Data.addDataItemWithUniqueId("",anchorLink.getData());

        currentButton.getDataItem().set('link', '#' + anchorLinkWithId.id);
    }

    function scrollToAnchor(){
        var anchorLinkId = currentButton.getDataItem().get('link'),
            anchorLink = W.Preview.getPreviewManagers().Data.getDataByQuery(anchorLinkId);

        W.Editor.setEditMode(W.Editor.EDIT_MODE.PREVIEW);

        sessionStorage.setItem('anchorDataId', anchorLink.get('anchorDataId'));
        return W.Preview.getPreviewManagers().Viewer.getAnchorManager()._scrollToLocation();
    }

    function makeSureScrollWentOk(animationData){
        var expectedScrollLocation = animationData.offset - 1,
            actualScrollLocation = W.Preview.getIFrame().contentWindow.scrollY;

        expect(actualScrollLocation).toBe(expectedScrollLocation);
    }

    function revertEditorMode(){
        W.Preview.getIFrame().contentWindow.scrollTo(0,0);
        W.Editor.setEditMode(W.Editor.EDIT_MODE.CURRENT_PAGE);
    }

    describe("Add Anchor, link it to button and then scroll", function () {

        it("add anchor with correct name (Anchor <numberOfAnchors>) and close dialog", function () {
            automation.Utils.waitsForPromise(function() {
                return new Q()
                    .then(addAnchor)
                    .then(makeSureAnchorIsWithCorrectName)
                    .then(automation.editorcomponents.Dialogs.clearDialog);
            });
        });

        it("add button", function () {
            automation.Utils.waitsForPromise(function() {
                return new Q()
                    .then(addButton)
                    .then(linkAnchorToButton);
            });
        });

        it('should scroll to correct location', function(){
            scrollToAnchor()
                .then(makeSureScrollWentOk)
                .then(revertEditorMode);
        });
    });

});