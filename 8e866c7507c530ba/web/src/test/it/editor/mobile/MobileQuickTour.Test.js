integration.noAutomation();
integration.requireExperiments(['quickactions']);

beforeEach(function () {
});

describe("Mobile quick tour tests", function(){

    var quickTourCookie = null;
    var quickTourComponent = null;

    it("should start tests without a Mobile Quick Tour Cookie", function (){
        expect(W.CookiesManager).toBeDefined();
        W.CookiesManager.removeCookie("mobileQuickTourActivated");
        W.Editor.getEditorUI()._mobileQuickTourStarted = false;
        quickTourCookie = W.CookiesManager.getCookie("mobileQuickTourActivated");
        expect(quickTourCookie).toBeFalsy();
    });

    it("should be displayed on mobile editor", function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function(){
                    return automation.controllers.States.switchToMobileEditor();
                })
                .then(function(){
                    var selector = '[comp="wysiwyg.editor.components.MobileQuickTour"]' ;
                    return automation.WebElement.waitForElementToExist(document.body, selector);
                })
                .then(function(element) {
                    quickTourComponent = element.$logic;
                    expect(quickTourComponent).not.toBeNull();
                });
        });
    });

    describe("Test navigation", function(){
        it("should switch to second slide when user click the 'next' button", function(){
            var currentSlide = quickTourComponent._currentSlide.$logic;
            var savedSlideId = quickTourComponent._currentSlideIndex;
            currentSlide.fireEvent("nextClick", null);
            waitsFor(function(){
                return quickTourComponent._currentSlide;
            }, 1000);
            runs(function() {
                expect(quickTourComponent._currentSlideIndex).toBe(savedSlideId+1);
            });
        });


        it("should switch to first slide when user click the first 'circle' in the slides nav bar", function(){
            var currentSlide = quickTourComponent._currentSlide.$logic;
            currentSlide.fireEvent("itemClick", 0);
            waitsFor(function(){
                return quickTourComponent._currentSlide;
            }, 1000);
            runs(function() {
                expect(quickTourComponent._currentSlideIndex).toBe(0);
            });
        });

        it("should be closed when user click 'skip tutorial'", function(){
            quickTourComponent._skinParts.closeBtn.fireEvent("click");
            waitsFor(function(){
                return !(quickTourComponent.$view && quickTourComponent.$view.parentNode);
            }, 1000);
            runs(function() {
                expect(quickTourComponent.$view && quickTourComponent.$view.parentNode).toBeFalsy();
                quickTourComponent = null;
            });
        });

        describe("Test post tutorial behaviours", function(){
            it("should show an info bubble that points on the help button", function(){
                var mainEditorBar = W.Editor.getEditorUI().getSkinPart("mainEditorBar");
                mainEditorBar.createHelpInfoBubble("", W.Resources.get("EDITOR_LANGUAGE", "MOBILE_QUICK_TOUR_WATCH_AGAIN_BODY", ""));
                var infoBubbleCls = W.Editor.getEditorUI().$view.children[W.Editor.getEditorUI().$view.children.length-1].getAttribute("comp");
                expect(infoBubbleCls).toBe("wysiwyg.editor.components.InfoBubble");
            });
            it("should start again when user click the 'quick tour' button in the help panel", function(){
                W.Commands.executeCommand("WEditorCommands.ShowMobileQuickTour");
                automation.Utils.waitsForPromise(function () {
                    return Q.resolve()
                        .then(function(){
                            var selector = '[comp="wysiwyg.editor.components.MobileQuickTour"]' ;
                            return automation.WebElement.waitForElementToExist(document.body, selector);
                        })
                        .then(function(element) {
                            quickTourComponent = element.$logic;
                            expect(quickTourComponent).not.toBeNull();
                        });
                });
            });
        });
    });



});
