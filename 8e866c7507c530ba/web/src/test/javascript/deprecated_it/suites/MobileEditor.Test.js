testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

describe("MobileEditor:", function () {

    beforeEach(function () {

        window.editor = window.editor || new this.JasmineEditorHelper();

        this.getEditorComponents = function () {
            var mainEditorBar = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MainEditorBar");
            var modeSwitchBar = editor.getComponentNode("wysiwyg.editor.components.ViewModeSwitch", mainEditorBar);
            var modeSwitchButtons = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImages", modeSwitchBar);
            var desktopButton = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImage", modeSwitchButtons, 0);
            desktopButton = desktopButton.getElementsByTagName('input')[0];
            var mobileButton = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImage", modeSwitchButtons, 1);
            mobileButton = mobileButton.getElementsByTagName('input')[0];
            var leftMenu = editor.getEditorComponentNode("wysiwyg.editor.components.Tabs");

            return {
                desktopButton: desktopButton,
                mobileButton: mobileButton,
                modeSwitchBar: modeSwitchBar,
                leftMenu: leftMenu
            };

        };

        waitsFor(function () {
            return editor.isReady();
        }, 'editor to finish loading', 10000);
    });


    describe("Initial state", function () {
        it("should be loaded by default in Desktop Mode", function () {
            var editorMode = W.Config.env.$viewingDevice;
            expect(editorMode).toBe('DESKTOP');
        });

        it("should clean state for Mobile Welcome Dialog before tests", function(){
            // clean state for Welcome Mobile Dialog
            var editorPrefs = W.Editor.getEditorPreferences();
            var dialogsToHide = editorPrefs.get("dontShowAgainDialogs");
            var dialogId = "_mobileWelcomeDialog";
            var resetDialogsToHide = _.reject(dialogsToHide, function (id) {
                return id === dialogId;
            });
            editorPrefs.set("dontShowAgainDialogs", resetDialogsToHide);
        });

        describe("Top Menu Bar", function () {
            it("should be rendered before the rest of the tests", function () {
                waitsFor(function () {
                    var editorBar = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MainEditorBar");
                    return editor.isComponentReady(editorBar);
                }, 'settings side panel didnt open', 10000);

                runs(function () {
                    expect(this.getEditorComponents().modeSwitchBar).toBeDefined();
                });
            });

            it("should have Mobile Button", function(){
                this.components = this.getEditorComponents();
                expect(this.components.mobileButton).toBeDefined();
            });


            it("should have Desktop Button", function(){
                this.components = this.getEditorComponents();
                expect(this.components.desktopButton).toBeDefined();
            });

            });

        describe("Tiny Menu", function () {
            beforeEach(function () {
                this.preview = editor.getPreview();
            });

            it("should not exist before first conversion", function () {
                var tinyMenuElems = editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview);
                expect(tinyMenuElems).not.toBeDefined();
            });
        });
    });

    describe("Transition to Mobile", function () {
        beforeEach(function () {
            this.components = this.getEditorComponents();
        });

        var isInMobile = false;
        W.Commands.getCommand('WEditorCommands.SecondaryPreviewReady')
            .registerListener(this, function () {
                isInMobile = true;
            });

        beforeEach(function () {
            this.components.mobileButton.click();
        });

        it("should set Preview mode to MOBILE", function () {
            waitsFor(function () {
                return isInMobile;
            });
            runs(function () {
                var editorMode = W.Config.env.$viewingDevice;
                expect(editorMode).toBe('MOBILE');
            });
        });

        it("should change left menu to MOBILE", function () {
            waitsFor(function () {
                return isInMobile;
            });
            runs(function () {
                var leftMenu = this.components.leftMenu;
                var dataQuery = leftMenu.getAttribute('dataquery');
                var settingsButton = editor.getComponentNode("wysiwyg.editor.components.WButton", leftMenu, 3);
                expect(dataQuery).toBe("#TOP_TABS_MOBILE");
                expect(settingsButton.id).toBe("tbMobileSettings");
            });
        });

        describe("Mobile Welcome Dialog", function () {
            it("should appear for user's first mobile session", function () {
                waitsFor(function () {
                    return isInMobile;
                });
                runs(function () {
                    var dialog = editor.getEditorComponentNode("wysiwyg.editor.components.dialogs.MobileWelcomeDialog");
                    expect(dialog).toBeDefined();
                });
            });
            it("should not appear for user's later mobile sessions", function () {
                W.EditorDialogs.closeDialogById('_mobileWelcomeDialog');
                isInMobile = false;
                this.components.desktopButton.click();
                this.components.mobileButton.click();
                waitsFor(function () {
                    return isInMobile;
                });
                runs(function () {
                    var dialog = editor.getEditorComponentNode("wysiwyg.editor.components.dialogs.MobileWelcomeDialog");
                    expect(dialog).toBeUndefined();
                });
            });
        });

    });


    describe("Components", function(){
        xdescribe("Hidden Components", function(){
            describe("Removal", function(){
                // stuff to use:
                // structure = W.Preview.getPreviewManagers().Viewer._getDataResolver_()_getSerializedStructureForSingleView_("MOBILE")
                // structure.pages {{id:object},...}
                it("should remove component from view");
                it("should put component in Hidden Items List");
            });
            describe("Restore", function(){
                it("should remove componente from Hidden Items");
                it("should add component to the view");
            });
        });

        describe("Tiny Menu", function () {
            beforeEach(function () {
                this.preview = editor.getPreview();
            });

            it("should be added on first conversion", function () {
                var tinyMenuComp = editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview);
                expect(tinyMenuComp).toBeDefined();
            });

            describe("In Preview", function () {
                beforeEach(function () {
                    this.preview = editor.getPreview();
                    this.tinyMenuComp = editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview);
                    this.tinyMenuBtn = this.tinyMenuComp.getElementsByTagName('div')[0];
                    this.menuList = this.tinyMenuComp.getElementsByTagName('ul')[0];
                    this.pageBtn = this.tinyMenuComp.getElementsByTagName('a')[1];
                });

                it("should show dropdown with pages", function () {
                    var menuIsVisible = this.menuList.getStyle("display");
                    expect(menuIsVisible).toBe("none");

                    this.tinyMenuBtn.click();

                    menuIsVisible = this.menuList.getStyle("display");
                    expect(menuIsVisible).toBe("block");
                });

                it("should change page on click", function(){
                    var pageId = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                    this.pageBtn.click();
                    var pageIdAfter = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                    expect(pageId).not.toBe(pageIdAfter);
                });

                xdescribe("Floating Panel", function(){
                    beforeEach(function () {
                        this.preview = editor.getPreview();
                        this.tinyMenuComp = editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview);
                        this.textComp = editor.getComponentNode("wysiwyg.viewer.components.WRichText", this.preview);
                        this.floatingPropertyPanel = editor.getEditorComponentNode("wysiwyg.editor.components.panels.FloatingPropertyPanel");
                    });
//
                    it("has Settings and Navigation", function(){
//                        //debugger;
//                        var log = this.tinyMenuComp.getLogic();
//                        W.Editor.setSelectedComp(log);
//                        W.Editor.getFloatingPanel().setEditedComponent(log);
//                        W.Editor._editorUI.showFloatingPropertyPanel();
//                        var comp = W.Editor.getSelectedComp();
//                        expect(this.tinyMenuComp).toBe(comp);
//
//                        // TODO: test [this.floatingPropertyPanel] to have relevant divs
                    });
//                    it("has Scale Up and Scale down", function(){
//
//                    });
                });
            });
        });


        describe("Virtual Device Frame", function () {
            beforeEach(function () {
                this.preview = editor.getPreview();
                this.editorPreview = editor.getEditorComponentNode("wysiwyg.editor.components.WEditorPreview");
                this.firstPage = editor.getComponentNode("mobile.core.components.Page", this.preview);
            });
            it("should be displayed", function(){
                expect(this.editorPreview).toBeDefined();
            });
            it("should contain page components", function(){
                expect(this.firstPage).toBeDefined();
            });
        });
    });


    // getting back in Desktop is sync if no changes in mobile were made
    // hence no async wrappers
    describe("Transition to Desktop", function () {
        beforeEach(function () {
            this.components = this.getEditorComponents();
        });


        it("should change mode from MOBILE to DESKTOP", function () {
            this.components.mobileButton.click();
            this.components.desktopButton.click();
            var editorMode = W.Config.env.$viewingDevice;
            expect(editorMode).toBe('DESKTOP');
        });

        it("should change left menu to DESKTOP", function () {
            var leftMenu = this.components.leftMenu;
            var dataQuery = leftMenu.getAttribute('dataquery');
            var settingsButton = editor.getComponentNode("wysiwyg.editor.components.WButton", leftMenu, 3);
            expect(dataQuery).toBe("#TOP_TABS");
            expect(settingsButton.id).toBe("tbSettings");
        });
    });

});