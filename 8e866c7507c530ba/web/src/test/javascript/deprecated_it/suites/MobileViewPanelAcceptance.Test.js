describe("MobileViewPanelAcceptance:", function () {

    beforeEach(function () {

        this.getPanelComponents = function() {
            var mobileViewPanelNode = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MobileQuickActionsViewPanel");
            var checkBoxImageNode = editor.getComponentNode("wysiwyg.editor.components.inputs.CheckBoxImage", mobileViewPanelNode);

            var mobilePreviewInputNode = editor.getComponentNode("wysiwyg.editor.components.inputs.MobilePreviewInput", mobileViewPanelNode);
            var colorSchemeButtonsNode = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImages", mobileViewPanelNode);

            var checkBox0Node = editor.getComponentNode("wysiwyg.editor.components.inputs.CheckBox", mobileViewPanelNode, 0);
            var checkBox1Node = editor.getComponentNode("wysiwyg.editor.components.inputs.CheckBox", mobileViewPanelNode, 1);
            var checkBox2Node = editor.getComponentNode("wysiwyg.editor.components.inputs.CheckBox", mobileViewPanelNode, 2);
            var checkBox3Node = editor.getComponentNode("wysiwyg.editor.components.inputs.CheckBox", mobileViewPanelNode, 3);
            var checkBox4Node = editor.getComponentNode("wysiwyg.editor.components.inputs.CheckBox", mobileViewPanelNode, 4);

            var link0Node = editor.getComponentNode("wysiwyg.editor.components.inputs.InlineTextLinkInput", mobileViewPanelNode, 0);
            var link1Node = editor.getComponentNode("wysiwyg.editor.components.inputs.InlineTextLinkInput", mobileViewPanelNode, 1);
            var link2Node = editor.getComponentNode("wysiwyg.editor.components.inputs.InlineTextLinkInput", mobileViewPanelNode, 2);
            var link3Node = editor.getComponentNode("wysiwyg.editor.components.inputs.InlineTextLinkInput", mobileViewPanelNode, 3);

            return {
                mobileViewPanel: mobileViewPanelNode.getLogic(),
                quickActionsSwitch: checkBoxImageNode.getLogic(),
                mobilePreviewInput: mobilePreviewInputNode.getLogic(),
                colorSchemeButtons: colorSchemeButtonsNode.getLogic(),
                navigationMenuCheckBox: checkBox0Node.getLogic(),
                phoneCheckBox: checkBox1Node.getLogic(),
                emailCheckBox: checkBox2Node.getLogic(),
                addressCheckBox: checkBox3Node.getLogic(),
                socialMediaCheckBox: checkBox4Node.getLogic(),
                phoneLink: link0Node.getLogic(),
                emailLink: link1Node.getLogic(),
                addressLink: link2Node.getLogic(),
                socialMediaLink: link3Node.getLogic()
            }

        }

        waitsFor(function () {
            return editor.isReady();
        }, 'editor to finish loading', 10000);
    });

    describe("MobileViewPanelInitialization", function () {
        it ("should be able to open mobile view panel", function(){
            W.Commands.executeCommand("WEditorCommands.Settings");
            waitsFor(function () {
                var settingsPanelNode = editor.getEditorComponentNode("wysiwyg.editor.components.panels.SettingsPanel");
                return editor.isComponentReady(settingsPanelNode);
            }, 'settings side panel didnt open', 10000);

            runs(function(){
                W.Commands.executeCommand("WEditorCommands.ShowMobileQuickActionsView");
            });

            waitsFor(function () {
                var mobileViewPanelNode = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MobileQuickActionsViewPanel");
                return editor.isComponentReady(mobileViewPanelNode);
            }, 'settings side panel didnt open', 10000);

            runs(function(){
                expect(true).toBeTruthy();
            });
        });

        it('should wait few seconds to load all panel components', function(){
            var timeoutTimeFinished = false;
            setTimeout(function(){
                timeoutTimeFinished = true;
            }, 1500);

            waitsFor(function() {
                return (timeoutTimeFinished === true);
            }, 'timeout to be done', 2000);

            runs(function() {
                expect(true).toBeTruthy();
            });
        });
    });

    describe('Tests After Mobile View Panel fully loaded', function() {
        beforeEach(function () {
            this.panelComps = this.getPanelComponents();
        });

        describe('Mobile View Panel inner components', function() {

            it('enableQuickActions checkBoxImage should be initially toggled off', function() {
                expect(this.panelComps.quickActionsSwitch.getValue()).toBeFalsy();
            });

            it('all checkboxes should be disabled', function(){
                expect(this.panelComps.navigationMenuCheckBox.isEnabled()).toBeFalsy();
                expect(this.panelComps.phoneCheckBox.isEnabled()).toBeFalsy();
                expect(this.panelComps.emailCheckBox.isEnabled()).toBeFalsy();
                expect(this.panelComps.addressCheckBox.isEnabled()).toBeFalsy();
                expect(this.panelComps.socialMediaCheckBox.isEnabled()).toBeFalsy();
            });

            it('color scheme buttons should be disabled', function(){
                expect(this.panelComps.colorSchemeButtons.isEnabled()).toBeFalsy();
            });

            it('Mobile Preview Input should be disabled', function(){
                expect(this.panelComps.mobilePreviewInput.isEnabled()).toBeFalsy();
            });

            describe('links', function(){
                it('Links should be presented: --Add your xxx---', function(){

                    //TODO
//                    expect(this.panelComps.phoneLink.getViewNode().textContent.indexOf("Add your")).toBeGreaterThan(-1);

                    expect(this.panelComps.emailLink.getViewNode().textContent.indexOf("Add your")).toBeGreaterThan(-1);
                    expect(this.panelComps.addressLink.getViewNode().textContent.indexOf("Add your")).toBeGreaterThan(-1);
                    expect(this.panelComps.socialMediaLink.getViewNode().textContent.indexOf("Edit your")).toBeGreaterThan(-1);
                });

                it('Links should be enabled', function(){
                    expect(this.panelComps.phoneLink.isEnabled()).toBeTruthy();
                    expect(this.panelComps.emailLink.isEnabled()).toBeTruthy();
                    expect(this.panelComps.addressLink.isEnabled()).toBeTruthy();
                    expect(this.panelComps.socialMediaLink.isEnabled()).toBeTruthy();
                });

            });

        });

        describe('when enabling quickActions', function(){
            it ('should enable and check Navigation menu checkbox', function() {

            });

            it('all other checkboxes should be unchecked and disabled', function(){

            });

            it('color scheme buttons should be enabled', function(){

            });

            it('Mobile Preview Input should be enabled and present only the navigation button', function(){

            });

        });

        describe('when going to ContactInformation, adding phone, and returning to the Mobile View panel:', function() {
            it ('Phone checkbox should be enabled and checked', function() {

            });
            it ('Phone checkbox details should contain the phone entered number', function() {

            });

        });
    });




});