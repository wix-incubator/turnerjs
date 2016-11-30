testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

describe("Editor rulers and guides", function () {

    var getEditorModeSwitchBtns = function(){
        var mainEditorBar = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MainEditorBar");
        var modeSwitchBar = editor.getComponentNode("wysiwyg.editor.components.ViewModeSwitch", mainEditorBar);
        var modeSwitchButtons = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImages", modeSwitchBar);

        var desktopButton = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImage", modeSwitchButtons, 0);
        desktopButton = desktopButton.getElementsByTagName('input')[0];

        var secondaryButton = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImage", modeSwitchButtons, 1);
        secondaryButton = secondaryButton.getElementsByTagName('input')[0];

        return {
            desktopButton: desktopButton,
            secondaryButton: secondaryButton
        };
    };

    var getRulersToggleBtn = function(){
        var mainEditorBar = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MainEditorBar");
        var inputGroup = editor.getComponentNode("wysiwyg.editor.components.inputs.InputGroup", mainEditorBar, 3);
        var rulersToggleBtnContainer = editor.getComponentNode("wysiwyg.editor.components.inputs.ButtonInput", inputGroup, 2);

        return editor.getComponentNode("wysiwyg.editor.components.WButton", rulersToggleBtnContainer);
    };

    var getRulers = function(){
        var rulers = {};

        rulers.horzRuler = editor ? editor.getEditorComponentNode("wysiwyg.editor.components.Ruler", 0) : null;
        rulers.vertRuler = editor ? editor.getEditorComponentNode("wysiwyg.editor.components.Ruler", 1) : null;

        return rulers.horzRuler && rulers.vertRuler ? rulers : null;
    };

    var areRulersVisible = function(){
        var rulers = getRulers()
        return rulers.horzRuler.style.display !== 'none' && rulers.vertRuler.style.display !== 'none';
    };

    var getAutoShowRulersDialog = function(){
        var dialog = editor.getEditorComponentNode("core.editor.components.dialogs.DialogWindow");
        var dialogCheckbox = dialog ? dialog.getElementsByTagName("input")[0] : null;
        var dialogCloseBtn = dialog ? editor.getComponentNode("core.editor.components.EditorButton", dialog) : null;
        var dialogNotification = editor.getEditorComponentNode("wysiwyg.editor.components.dialogs.NotificationDialog");

        return {
            dialog: dialog,
            dialogCheckbox: dialogCheckbox,
            dialogCloseBtn: dialogCloseBtn,
            dialogNotification: dialogNotification
        };
    };

    it("should expect editor to be ready", function(){
        var flag;

        window.editor = window.editor || new this.JasmineEditorHelper();

        waitsFor(function () {
            flag = editor && editor.isReady();
            return flag;
        }, 'editor should finish loading and ready to user', 30000)

        runs(function(){
            expect(flag).toEqual(true);
        });
    });

    it("should expect both horizontal and vertical rulers to be defined", function(){
        var rulers;

        waitsFor(function() {
            rulers = getRulers();
            if(rulers) {
                expect(rulers.horzRuler).toBeDefined();
                expect(rulers.vertRuler).toBeDefined();
            }
            return rulers;
        }, "", 750);
    });

    describe("Rulers display state", function(){
        var rulers;

        beforeEach(function(){
            rulers = getRulers();
        });

        it("should be hidden by default", function(){
            expect(areRulersVisible()).toEqual(false);
        });

        it("should be visible after clicking the rulers switch button", function(){
            getRulersToggleBtn().click();
            expect(areRulersVisible()).toEqual(true);
        });

        describe("Auto-show rulers popup", function(){
            var popup;

            beforeEach(function(){
                popup = getAutoShowRulersDialog();
            });

            it("should be displayed if user didnt choose to auto hide the rulers", function(){
                expect(popup.dialog).toBeDefined();
                expect(popup.dialogNotification).toBeDefined();
            });

            it("should not be displayed if user didnt choose to auto hide the rulers", function(){
                popup.dialogCheckbox.checked = true;
                popup.dialogCloseBtn.click();
                popup = getAutoShowRulersDialog();

                expect(popup.dialogNotification).not.toBeDefined();
            });
        });

        describe("Visibility on editor mode switch", function(){
            var editorSwitchBtns;

            beforeEach(function(){
                editorSwitchBtns = getEditorModeSwitchBtns();
            });

            it("(rulers) should stay visible on editor mode switch", function(){
                if(!areRulersVisible()){
                    getRulersToggleBtn().click();
                }
                runs(function(){
                    editorSwitchBtns.secondaryButton.click();
                });

                waitsFor(function(){
                    return W.Config.env.$viewingDevice==="MOBILE" && editor.isReady();
                },"mobile editor is ready", 5000);

                runs(function(){
                    expect(areRulersVisible()).toEqual(true);
                });
            });
        });
    });

    describe("Guide lines test", function(){
        var rulers;

        beforeEach(function(){
            rulers = getRulers();
        });

        it("should switch back to desktop editor", function(){
            getEditorModeSwitchBtns().desktopButton.click();
        });

        it("should add a guide-line to the horizontal ruler", function(){
            var rulerLogic = rulers.horzRuler.getLogic();
            var guidesContainer = rulerLogic._skinParts.guides;

            var guideNode = rulerLogic._addRulerGuide(100, guidesContainer);

            expect(guidesContainer).toBeDefined();
            expect(guideNode).toBeDefined();
        });

        it("should add a guide-line to the vertical ruler", function(){
            var rulerLogic = rulers.vertRuler.getLogic();
            var guidesContainer = rulerLogic._skinParts.guides;

            var guideNode = rulerLogic._addRulerGuide(100, guidesContainer);

            expect(guidesContainer).toBeDefined();
            expect(guideNode).toBeDefined();
        });

        it("should remove a guide line", function(){
            var rulerLogic = rulers.horzRuler.getLogic();
            var guidesContainer = rulerLogic._skinParts.guides;
            var guide = guidesContainer.firstChild;
            var guideLogic = guide.getLogic();
            var numOfGuides = guidesContainer.childNodes.length;

            guideLogic.dispose();

            expect(guidesContainer.childNodes.length).toBe(numOfGuides-1);
        });

        describe("Different guides to each editor mode", function(){
            var rulers;

            beforeEach(function(){
                rulers = getRulers();
            });

            it("should be on desktop editor mode", function(){
                expect(W.Config.env.$viewingDevice).not.toEqual("MOBILE");
            });

            it("should display desktop guides container", function(){
                var rulerLogic = rulers.horzRuler.getLogic();
                var guidesContainer = rulerLogic._skinParts.guides;
                expect(guidesContainer.style.display).not.toEqual('none');
            });

            it("should switch back to mobile editor", function(){
                var flag;
                runs(function(){
                    getEditorModeSwitchBtns().secondaryButton.click();
                });

                waitsFor(function(){
                    flag = W.Config.env.$viewingDevice==="MOBILE" && editor.isReady();
                    if(flag){
                        expect(flag).toEqual(true);
                    }
                    return flag;
                },"mobile editor is ready", 5000);
            });

            it("should display mobile guides container", function(){
                var rulerLogic = rulers.horzRuler.getLogic();
                var guidesContainer = rulerLogic._skinParts.guidesSecondary;
                expect(guidesContainer.style.display).not.toEqual('none');
            });
        });
    });

    describe("User preferences storage", function(){
        //EditorCommands.gotoSitePage
        var rulers;
        var rulerLogic;

        beforeEach(function(){
            rulers = getRulers();
            rulerLogic = rulers.horzRuler.getLogic();
        });

        it("should return a serialized data object for all guides", function(){
            var guidesContainer = rulerLogic._skinParts.guides;

            rulerLogic.clearGuides();

            for(var i=0; i<10; i++){
                rulerLogic._addRulerGuide(100 + (i*10), guidesContainer);
            }

            var guidesData = rulerLogic.getGuidesData();

            expect(guidesData.DESKTOP.length).toEqual(10);
        });
    });
});