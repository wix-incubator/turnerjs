describe("UndoRedo in Styles panels: ", function () {
    var selectedFontBeforeChange,
        originalSource,
        originalStyleData,
        fontSelectorField,
        expectedStyleSource,
        advanceStylingDialog,
        addedComp,
        savedFont,
        fontComp;

    var compList = [
        {compData: {"groupType":"Gallery","comp":"wysiwyg.viewer.components.SliderGallery","skin":"wysiwyg.viewer.skins.galleryslider.SliderGalleryDefaultSkin","data":{"type":"ImageList"},"dataRefs":{"items":{"isList":true,"items":[{"data":{"type":"Image","id":"i01or7","metaData":{"isPreset":true,"schemaVersion":"2.0","isHidden":false},"title":"I'm a title","uri":"84770f_f899a8151a034278b6cbd0ffc6507858.jpg","description":"I'm a description. Click to edit me","width":426,"height":567,"alt":"","link":""}},{"data":{"type":"Image","id":"i11xwy","metaData":{"isPreset":true,"schemaVersion":"2.0","isHidden":false},"title":"I'm a title","uri":"84770f_1857c0b87f1f44c49b452d7845c9fcf6.jpg","description":"I'm a description. Click to edit me","width":426,"height":567,"alt":"","link":""}},{"data":{"type":"Image","id":"i2217f","metaData":{"isPreset":true,"schemaVersion":"2.0","isHidden":false},"title":"I'm a title","uri":"84770f_7d714a86326f42938d3b4bd6cca93b3f.jpg","description":"I'm a description. Click to edit me","width":426,"height":567,"alt":"","link":""}}]}},"layout":{"width":480,"height":160}}},
        {compData: {"comp":"wysiwyg.viewer.components.SiteButton","skin":"wysiwyg.viewer.skins.button.SiteButtonSkin","data":{"type":"LinkableButton","metaData":{"isPreset":true}},"layout":{"width":130,"height":60},"componentType":"wysiwyg.viewer.components.SiteButton"}},
        {compData: {"comp":"wysiwyg.viewer.components.LoginButton","skin":"wysiwyg.viewer.skins.button.LoginButtonSkin","layout":{"width":190,"height":40}}},
        {compData: {"groupType":"Gallery","comp":"wysiwyg.viewer.components.MatrixGallery","skin":"wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryDefaultSkin","data":{"type":"ImageList","metaData":{"isPreset":true}},"dataRefs":{"items":{"isList":true,"items":[{"data":{"type":"Image","title":"Water Droplets","uri":"cd6a81b7d29d88425609ecc053a00d16.jpg","description":"Describe your image here","width":1000,"height":750}},{"data":{"type":"Image","title":"Budding Tree","uri":"44dab8ba8e2b5ec71d897466745a1623.jpg","description":"Describe your image here","width":1000,"height":750}},{"data":{"type":"Image","title":"Fallen Apples","uri":"8dfce587e3f99f17bba2d3346fea7a8d.jpg","description":"Describe your image here","width":758,"height":569}},{"data":{"type":"Image","title":"Cherry Blossom","uri":"3dcc6f56be1f8507181d0197e52d09e8.jpg","description":"Describe your image here","width":1000,"height":750}},{"data":{"type":"Image","title":"Ray of Light","uri":"8fed9ef13904fb85b6b12092c269a465.jpg","description":"Describe your image here","width":750,"height":563}},{"data":{"type":"Image","title":"Bloom","uri":"24bba47f40f8473a534ae0301bf748c9.jpg","description":"Describe your image here","width":1000,"height":750}},{"data":{"type":"Image","title":"Dew","uri":"8dde68848c4daae3a6905dc6a17d270e.jpg","description":"Describe your image here","width":800,"height":600}},{"data":{"type":"Image","title":"Tranquil forest","uri":"568544c06dafc9d2ab6f4f4496e7d7b9.jpg","description":"Describe your image here","width":800,"height":600}},{"data":{"type":"Image","title":"Lily Pond","uri":"a3ae91861f93fde1b8917291180c5fe0.jpg","description":"Describe your image here","width":700,"height":525}}]}},"layout":{"width":480,"height":360},"componentType":"wysiwyg.viewer.components.MatrixGallery"}},
        {compData: {"comp":"wysiwyg.viewer.components.menus.DropDownMenu","skin":"wysiwyg.viewer.skins.dropmenu.TextSeparatorsMenuNSkin","layout":{"width":400,"height":100,"x":0},"uID":"#MAIN_MENU"}}
    ];

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

    function addComp(compToAdd){
        return automation.viewercomponents.ViewerComponent.addComponent(compToAdd);
    }

    function openAdvanceStyleDialog(comp){
        expect(comp).toBeDefined();
        W.Commands.executeCommand('WEditorCommands.AdvancedDesign', {selectedComponent: comp});

        return automation.editorcomponents.Dialogs.waitForDialogOfType('wysiwyg.editor.components.panels.design.AdvancedStyling');
    }

    function waitForDialogToBeReady(dialog){
        advanceStylingDialog=dialog;
        return dialog.getFontSelectorPromise();
    }

    function waitForFontDialogToBeReady(fontDialog){
        return fontDialog.getDialogPromise();
    }

    function openFontAdvancedStyleDialog(fontSelectorField){
        expect(fontSelectorField._skinParts.fontSelectorButton).toBeDefined();
        fontSelectorField._skinParts.fontSelectorButton._openFontSelectorDialog();
        return automation.editorcomponents.Dialogs.waitForDialogOfType('wysiwyg.editor.components.dialogs.FontAdvanceStyleDialog');
    }

    function simulateFontFormatChange(comp,formatlocation){
        expect(comp).toBeDefined();
        selectedFontBeforeChange=comp._fontFormatLogic._skinParts.comboBox._skinParts.select._skinParts.label.innerHTML;
        originalStyleData = addedComp._style.getProperty(fontSelectorField.propertyName);
        originalSource = addedComp._style.getPropertySource(fontSelectorField.propertyName);
        var fontFormatBtn = comp._fontFormatLogic._skinParts.comboBox._skinParts.options._skinParts.view.getChildren()[formatlocation].getLogic();
        var expectedVals = W.Preview.getPreviewManagers().Theme.getProperty(fontFormatBtn._data._data.format);
        fontFormatBtn.fireEvent("click");
        var selectedFontFamily = comp._familyFieldLogic._optionsData.get("selected")._data.label;
        var currSizeVal = comp._sizeFieldLogic._skinParts.input._value;
        expect(selectedFontFamily).toEqual(expectedVals._fontFamily);
        expect(currSizeVal).toEqual(expectedVals._fontSize);
        expectedStyleSource = "theme";
        return comp.getDialogPromise();
    }
    function simulateFontFamilyChange(comp,locationInOptionList){
        selectedFontBeforeChange=comp._fontFormatLogic._skinParts.comboBox._skinParts.select._skinParts.label.innerHTML;
        originalStyleData = addedComp._style.getProperty(fontSelectorField.propertyName);
        originalSource = addedComp._style.getPropertySource(fontSelectorField.propertyName);
        expect(comp).toBeDefined();
        var FamilyButtonDataSchema = comp._familyFieldLogic._skinParts.comboBox._skinParts.options._data._data.items[locationInOptionList];
        var FontWButton = comp._familyFieldLogic._skinParts.comboBox._skinParts.options.items[locationInOptionList].$logic;
        var expectedLabel =FamilyButtonDataSchema._data.label;
        var expectedVal =FamilyButtonDataSchema._data.value;
        comp._familyFieldLogic._skinParts.comboBox._skinParts.options._onItemSelected(FontWButton);
        var selectedFontFamily = comp._familyFieldLogic._optionsData.get("selected")._data.label;
        var currFormat = comp._fontFormatLogic._optionsData.get("selected")._data.format;
        expect(currFormat).toEqual("customized");
        expectedStyleSource = "value";
        return comp.getDialogPromise();
    }
    function simulateDialogClose(dialog,action){
        dialog._dialogWindow.endDialog(action);
    }

    function getFontValue() {
        return {
            text: fontSelectorField._skinParts.fontSelectorButton.$view.textContent,
            value: fontSelectorField.CurrentValue
        };
    }

    function undo() {
        W.Commands.executeCommand("WEditorCommands.Undo");
    }

    function waitForUndoWasMade() {
        return conditionPromise(function () {
            var curFontVal = getFontValue(fontComp)
            return _.isEqual(savedFont, curFontVal);
        });
    }

    function conditionPromise(conditionFn) {
        var d = Q.defer(),
            iId,
            res;
        iId = setInterval(function () {
            res = conditionFn();
            if (res) {
                clearTimeout(iId);
                d.resolve(res);
            }
        }, 500);
        return d.promise;
    }


    function addCompTest (compToAdd){
        it("Should add a comp"+compToAdd.compData.comp +"and test several style changes", function () {
            automation.Utils.waitsForPromise(function() {
                return new Q()
                    .then(function(){
                        return addComp(compToAdd);
                    })
                    .then(function (comp){
                        addedComp = comp;
                        return openAdvanceStyleDialog(addedComp);
                    })
                    .then(waitForDialogToBeReady)
                    .then(function(fontSelector){
                        fontSelectorField = fontSelector;
                        return openFontAdvancedStyleDialog(fontSelectorField);
                    })
                    .then(waitForFontDialogToBeReady)
                    .then(function(comp){
                        fontComp = comp;
                        savedFont = getFontValue(comp);
                        return simulateFontFamilyChange(comp, 4);
                    })
                    .then(function(dialog){
                        return simulateDialogClose(dialog, "OK");
                    })
                    .then(undo)
                    .then(waitForUndoWasMade);
            });
        });
    }

    for (var i = 0; i < compList.length; i++) {
        addCompTest(compList[i]);
    }
});