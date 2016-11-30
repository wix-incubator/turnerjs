describe("mobile hide pages functionality", function () {

    //define all constants
    var pagesCmdName = "WEditorCommands.Pages";
    var pagesPanel = "pagesPanel";
    var pageSettingsCmdName = "WEditorCommands.PageSettings";
    var mobilePageSettingsCmdName = "WEditorCommands.MobilePageSettings";
    var pageSettingParam = {pageId: "#mainPage", settingsButtonOverride: true};
    var pageSettingsPanelComp = '[comp="wysiwyg.editor.components.panels.PageSettingsPanel"][state="shown"]';
    var mobilePageSettingsPanelComp = '[comp="wysiwyg.editor.components.panels.MobilePageSettingsPanel"]';
    var checkBoxComp = '[comp="wysiwyg.editor.components.inputs.CheckBox"]';
    var tinyMenuId = 'mobile_TINY_MENU';
    var tinyMenuHiddenPageSelector = '[data-refid="mainPage"]';

    it('should inherit mobile hide pages status from desktop hide pages', function () {
        var panelsLayer = W.Editor.getEditorUI().getSkinPart('panelsLayer');
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function(){
                    W.Commands.executeCommand(pagesCmdName, pagesPanel);
                    W.Commands.executeCommand(pageSettingsCmdName, pageSettingParam);
                    return automation.WebElement.waitForElementToExist(panelsLayer.getViewNode(), pageSettingsPanelComp);
                })
                .then(function(element){
                    element.$logic.getDataItem().set('hidePage', true);
                    return automation.controllers.States.switchToMobileEditor();
                })
                .then(function(){
                    W.Commands.executeCommand(pagesCmdName, pagesPanel);
                    W.Commands.executeCommand(mobilePageSettingsCmdName, pageSettingParam);
                    return automation.WebElement.waitForElementToExist(panelsLayer.getViewNode(), mobilePageSettingsPanelComp);
                })
                .then(function(element){
                    return automation.WebElement.waitForExactNumberOfElementsToExist(element, checkBoxComp, 2);
                })
                .then(function(elements){
                    expect(elements[0].$logic.getChecked()).toBeTruthy(); //desktop
                    expect(elements[1].$logic.getChecked()).toBeTruthy(); //mobile
                    return automation.controllers.States.changeToPreviewSync();
                })
                .then(function(){
                    var tinyMenu = W.Preview.getCompByID(tinyMenuId);
                    expect(tinyMenu.getElement(tinyMenuHiddenPageSelector)).toBeNull();
                });
        });
    });

    it('should split mobile hide pages from desktop hide pages after user changed in mobile', function () {
        var panelsLayer = W.Editor.getEditorUI().getSkinPart('panelsLayer');
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function(){
                    return automation.controllers.States.changeToEditModeSync();
                })
                .then(function(){
                    W.Commands.executeCommand(pagesCmdName, pagesPanel);
                    W.Commands.executeCommand(mobilePageSettingsCmdName, pageSettingParam);
                    return automation.WebElement.waitForElementToExist(panelsLayer.getViewNode(), mobilePageSettingsPanelComp);
                })
                .then(function(element){
                    return automation.WebElement.waitForExactNumberOfElementsToExist(element, checkBoxComp, 2);
                })
                .then(function(elements){
                    var hideCheckBox = elements[1].$logic._skinParts.checkBox;
                    hideCheckBox.click();
                    return automation.controllers.States.changeToPreviewSync();
                })
                .then(function(){
                    var tinyMenu = W.Preview.getCompByID(tinyMenuId);
                    expect(tinyMenu.getElement(tinyMenuHiddenPageSelector)).not.toBeNull();
                    return automation.controllers.States.changeToEditModeSync();
                })
                .then(function(){
                    return automation.controllers.States.switchToDesktopEditorSync();
                })
                .then(function(){
                    W.Commands.executeCommand(pagesCmdName, pagesPanel);
                    W.Commands.executeCommand(pageSettingsCmdName, pageSettingParam);
                    return automation.WebElement.waitForElementToExist(panelsLayer.getViewNode(), pageSettingsPanelComp);
                })
                .then(function(element){
                    var dataItem = element.$logic.getDataItem();
                    expect(dataItem.get('hidePage')).toBeTruthy();
                    expect(dataItem.get('mobileHidePage')).toBeFalsy();
                    dataItem.set('hidePage', false);
                    dataItem.set('hidePage', true);
                    expect(dataItem.get('mobileHidePage')).toBeFalsy();
                });
        });
    });
});
