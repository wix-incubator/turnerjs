//integration.noAutomation();
//
//describe("Exit mobile mode button - Editor integration tests", function(){
//
//    var button;
//    var panelsPresenter;
//
//    beforeEach(function(){
//        panelsPresenter = W.Editor.getEditorUI().getPanelsLayer();
//    });
//
//    it("should be tested within the mobile editor", function() {
//        automation.Utils.waitsForPromise(function () {
//            return Q.resolve()
//                .then(function(){
//                    if(!W.Config.env.isViewingSecondaryDevice()){
//                        return automation.controllers.States.switchToMobileEditor();
//                    }
//                    return Q.resolve();
//                })
//                .then(function(){
//                    expect(W.Config.env.isViewingSecondaryDevice()).toBeTruthy();
//                });
//        });
//    });
//
//    it("should have a selected button component available for test", function() {
//
//        automation.Utils.waitsForPromise(function () {
//            return Q.resolve()
//                .then(function(){
//                    button = W.Preview.getCompByID("EXIT_MOBILE").$logic;
//                    if(!button) {
//                        W.Commands.executeCommand("WEditorCommands.AddExitMobileModeButton");
//                        return automation.controllers.Events.waitForCommand("WEditorCommands.SelectedComponentChange");
//                    } else {
//                        automation.Component.selectComponent(button);
//                    }
//                    return Q.resolve();
//                })
//                .then(function(){
//                    button = W.Preview.getCompByID("EXIT_MOBILE").$logic;
//                    var selectedComp = W.Editor.getSelectedComp();
//                    expect(selectedComp).toBe(button);
//                });
//        });
//    });
//
//    it("should have one instance", function() {
//        W.Commands.executeCommand("WEditorCommands.AddExitMobileModeButton");
//        W.Commands.executeCommand("WEditorCommands.AddExitMobileModeButton");
//        W.Commands.executeCommand("WEditorCommands.AddExitMobileModeButton");
//
//        var siteStructure = W.Preview.getCompByID("mobile_SITE_STRUCTURE");
//        var elements = automation.WebElement.getWebElements(siteStructure, "[comp='wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode']");
//        expect(elements.length).toBe(1);
//    });
//
//    describe("Component properties panel test", function(){
//
//        var propertiesPanel;
//        var compPropertiesPanel;
//
//        it("should display the properties panel", function(){
//            W.Editor.openComponentPropertyPanels();
//            automation.Utils.waitsForPromise(function () {
//                return Q.resolve()
//                    .then(function(){
//                        propertiesPanel = panelsPresenter._currentPropertyPanel.panel;
//                        compPropertiesPanel = automation.WebElement.getWebElement(propertiesPanel.$view, "[comp='wysiwyg.editor.components.panels.ExitMobileModePanel']");
//                        compPropertiesPanel = compPropertiesPanel.$logic;
//                        expect(compPropertiesPanel).not.toBeNull();
//                    })
//                    .then(function() {
//                    });
//            });
//        });
//
//        it("should be able to modify the button's label", function(){
//            var testValue = "test123";
//            compPropertiesPanel._exitMobileLabel.setValue(testValue);
//            compPropertiesPanel._compData.set("label", testValue);
//            var dataItem = button.getDataItem();
//            expect(dataItem.get("label")).toBe(testValue);
//        });
//
//        it("should be able to modify the button text's font style", function(){
//            var testValue = "font_3";
//            compPropertiesPanel._compStyle.setProperty("fnt", testValue);
//            var styleData = button.getStyle();
//            expect(styleData.getProperty("fnt")).toBe(testValue);
//        });
//    });
//});
