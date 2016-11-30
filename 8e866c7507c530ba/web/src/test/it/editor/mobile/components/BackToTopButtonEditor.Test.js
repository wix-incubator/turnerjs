integration.noAutomation();
integration.requireExperiments(['quickactions']);

describe("Exit mobile mode button - Editor integration tests", function(){

    var button;
    var panelsPresenter;

    beforeEach(function(){
        panelsPresenter = W.Editor.getEditorUI().getPanelsLayer();
    });

    it("should be tested within the mobile editor", function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function(){
                    if(!W.Config.env.isViewingSecondaryDevice()){
                        return automation.controllers.States.switchToMobileEditor();
                    }
                    return Q.resolve();
                })
                .then(function(){
                    expect(W.Config.env.isViewingSecondaryDevice()).toBeTruthy();
                });
        });
    });


    describe("Settings panel test", function(){

        var settingsPanel;
        var backToTopButton;

        it("should display the settings panel", function(){
            W.Commands.executeCommand("WEditorCommands.ShowMobileBackToTopButtonPanel");
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function(){
                        return automation.editorcomponents.Dialogs.waitForDialogOfType("wysiwyg.editor.components.panels.BackToTopButtonPanel");
                    })
                    .then(function(dialogLogic){
                        settingsPanel = dialogLogic;
                        expect(dialogLogic).not.toBeNull();
                    });
            });
        });


        it("should add the component to viewer", function(){
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function(){
                        settingsPanel._addBackToTopButton();
                        return automation.controllers.Events.waitForCommand('WEditorCommands.SecondaryPreviewReady');
                    })
                    .then(function(){
                        return automation.WebElement.waitForElementToExist(W.Preview.getSiteNode(), "[comp='wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton']");
                    })
                    .then(function(elem){
                        backToTopButton = elem;
                        expect(backToTopButton).not.toBeNull();
                    });
            });
        });

        it("should scroll the top on preview mode", function(){
            var siteBody = W.Preview.getPreviewSite().document.body;
            automation.controllers.States.changeToPreviewSync();
            siteBody.scrollTo(0, 300);
            expect(siteBody.getScroll().y).toBe(300);
            backToTopButton.$logic._onClick();

            waitsFor(function(){
                return siteBody.getScroll().y === 0;
            }, 2000);

            runs(function(){
                expect(siteBody.getScroll().y).toBe(0);
            });
        });

        it("should remove the button from site", function(){
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function(){
                        settingsPanel._removeBackToTopButton();
                    });
            });
        });
    });
});
