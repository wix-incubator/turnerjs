integration.noAutomation();

describe("mobile menu fixed position", function () {
    var fixedMenuHandler,
        siteHeader,
        compId = 'TINY_MENU',
        compLogic,
        compViewNode,
        menuLocationAfterReposition,
        menuLocationBeforeReposition,
        repositionDialogLogic;

    beforeAll(function(){
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(addMenuComponent)
                .then(moveToMobileMode)
                .then(selectTinyMenu)
                .then(function(){
                    siteHeader = getSiteHeader();
                    var fixedMenuHandlerConstructor = W.Classes.getClass('wysiwyg.editor.components.FixedMenuEditorHandler');
                    fixedMenuHandler = new fixedMenuHandlerConstructor(compLogic);
                })
        });
    });

    describe("fix menu position", function(){
        beforeAll(function(){
            toggleComponentFixedPosition(true);
        });
        it('should make sure that menu position is not fixed in editor mode', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function(){
                        expect(compViewNode.get('pos')).toBeEquivalentTo('fixed');
                        expect(compViewNode.getStyle('position')).toBeEquivalentTo('absolute');
                    });
            });
        });
        it('should make sure that menu position is fixed in preview mode', function() {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(switchToPreview)
                    .then(function(){
                        expect(compViewNode.get('pos')).toBeEquivalentTo('fixed');
                        expect(compViewNode.getStyle('position')).toBeEquivalentTo('fixed');
                    });
            });
        });
        afterAll(function(){
            return switchToEditor();
        })
    });

    describe("unfix menu position", function(){
        beforeEach(function(){
            toggleComponentFixedPosition(false);
        });
        it("should make sure that menu position is unfixed in preview mode", function() {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(switchToPreview)
                    .then(function(){
                        expect(compViewNode.get('pos')).toBeEquivalentTo(null);
                        expect(compViewNode.getStyle('position')).toBeEquivalentTo('absolute');
                    })
            });
        });
        afterAll(function(){
            return switchToEditor();
        })
    });

    describe("menu out of view", function(){// I wanted to run menuFixedPositionWhenOutOfView before each describe but for some reason it ran before each it
        describe("fix menu position", function(){
            beforeAll(menuFixedPositionWhenOutOfView);
            it("should make sure that menu was repositioned and that dialog was opened", function() {
                automation.Utils.waitsForPromise(function () {
                    return Q.resolve()
                        .then(function(){
                            expect(compLogic.getX()).toBeEquivalentTo(250);
                            expect(compLogic.getY()).toBeEquivalentTo(10);
                        })
                });
            });
            it("should make sure that clicking on 'ok' didn't change the menu position and location", function(){
                automation.Utils.waitsForPromise(function () {
                    return Q.resolve()
                        .then(getDialog)
                        .then(confirmMenuReposition)
                        .then(function(){
                            updateComponentInstance();
                            expect(menuLocationAfterReposition.x).toBeEquivalentTo(compLogic.getX());
                            expect(menuLocationAfterReposition.y).toBeEquivalentTo(compLogic.getY());
                        })
                });
            });
            afterAll(function(){
                fixedMenuHandler._onFixedPositionChanged({value: false});
            });
        });
        xdescribe("unfix menu position when", function(){
            beforeAll(menuFixedPositionWhenOutOfView);
            xit("should make sure that clicking on 'uncheck' returned menu to its original location and that its position eas unfixed", function(){
                automation.Utils.waitsForPromise(function () {
                    return Q.resolve()
                        .then(getDialog)
                        .then(cancelMenuReposition)
                        .then(function(){
                            expect(menuLocationBeforeReposition.x).toBeEquivalentTo(compLogic.getX());
                            expect(menuLocationBeforeReposition.y).toBeEquivalentTo(compLogic.getY());
                        })
                });
            });
        });
    });


    //help methods
    function addMenuComponent() {
        return automation.viewercomponents.ViewerComponent.addComponent('dropDownMenu');
    }

    function selectTinyMenu() {
        updateComponentInstance();
        W.Editor.setSelectedComp(compLogic);
        W.Editor.openComponentPropertyPanels(false, false, true);
        return automation.WebElement.waitForElementToExist(W.Editor.getPanelsLayer().getViewNode(), '[comp="wysiwyg.editor.components.inputs.CheckBox"]');
    }

    function toggleComponentFixedPosition(isFixed) {
        var position = isFixed ? 'fixed' : 'absolute';
        compLogic.setPos(position);
    }

    function moveToMobileMode() {
        return automation.controllers.States.switchToMobileEditor();
    }

    function switchToPreview() {
        return automation.controllers.States.changeToPreviewSync();
    }

    function switchToEditor() {
        return automation.controllers.States.changeToEditModeSync();
    }

    function getDialog() {
        return automation.editorcomponents.Dialogs.findDialogWindow(repositionDialogLogic);
    }

    function confirmMenuReposition(dialogWindow) {
        dialogWindow.$logic._onButtonClicked('GOT_IT');
    }

    function cancelMenuReposition(dialogWindow) {
        dialogWindow.$logic._onButtonClicked('UNCHECK');
    }

    function updateComponentInstance() {
        compLogic = W.Preview.getPreviewManagers().Viewer.getCompLogicById(compId);
        compViewNode = compLogic.getViewNode();
    }

    function getSiteHeader() {
        return W.Preview.getPreviewManagers().Viewer.getHeaderContainer();
    }

    function menuFixedPositionWhenOutOfView() {
        compLogic.setY(360);
        menuLocationBeforeReposition = {x: compLogic.getX(), y: compLogic.getY()};
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function(){
                    W.Editor.setSelectedComp(compLogic);
                    W.Editor.openComponentPropertyPanels(false, false, true);
                    return automation.WebElement.waitForElementToExist(W.Editor.getPanelsLayer().getViewNode(), '[comp="wysiwyg.editor.components.panels.TinyMenuPanel"]');
                })
                .then(function(){
                    fixedMenuHandler._updateMenuInstance();
                    fixedMenuHandler._onFixedPositionChanged({value: true});
                    return automation.controllers.Events.waitForCommand('WEditorCommands.SecondaryPreviewReady');
                })
                .then(function(){
                    updateComponentInstance();
                    menuLocationAfterReposition = {x: compLogic.getX(), y: compLogic.getY()};
                })
                .then(function(){
                    return automation.editorcomponents.Dialogs.waitForDialogWithTitle('Menu Repositioned');
                })
                .then(function(dialogLogic){
                    repositionDialogLogic = dialogLogic;
                });
            });
    }
});


