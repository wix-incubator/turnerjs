/**
 * Created with IntelliJ IDEA.
 * User: lotemh
 * Date: 11/21/13
 * Time: 1:36 PM
 * To change this template use File | Settings | File Templates.
 */
testRequire().classes('wysiwyg.deployment.it.editor.ComponentsDriver').resources('W.Preview','W.Commands','W.Config');
testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');


describe("Drag Component in Mobile Editor", function(){

    beforeEach(function () {
        window.editor = window.editor || new this.ComponentsDriver();

        this.getEditorComponents = function () {
            var mainEditorBar = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MainEditorBar");
            var modeSwitchBar = editor.getComponentNode("wysiwyg.editor.components.ViewModeSwitch", mainEditorBar);
            var modeSwitchButtons = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImages", modeSwitchBar);
            var mobileButton = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImage", modeSwitchButtons, 1);
            mobileButton = mobileButton.getElementsByTagName('input')[0];

            return {
                mobileButton: mobileButton,
                modeSwitchBar: modeSwitchBar
            };

        };

        waitsFor(function () {
            return editor.isReady();
        }, 'editor to finish loading', 10000);
        this.components = this.getEditorComponents();
        this.components.mobileButton.click();

        waitsFor(function () {
            return W.Config.env.isViewingDesktopDevice()== false;
        },'editor to change to mobile mode', 5000);
    });

    describe("Mobile Editor Mode", function(){

        var components = [];
        var currentComp;
        var index = 0;

        beforeEach(function(){
            //set components
            this.preview = this.W.Preview.getSiteNode();
            components.push(editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview));

//                components.push(editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview));
        });

        describe("Drag ", function(){
            beforeEach(function(){
                currentComp = components[index];
                index++;
            });

            it("should be drag and dropped", function(){
                this.preview = this.W.Preview.getSiteNode();
                this.tinyMenuComp = currentComp;
                var initialPos = this.tinyMenuComp.getPosition();
                var xOffset = -100;
                var yOffset = 200;
                editor.dragComponent(this.tinyMenuComp, {x: xOffset, y: yOffset});
                var actualPos = this.tinyMenuComp.getPosition();
                expect(actualPos).toEqual({x: initialPos.x+ xOffset, y: initialPos.y + yOffset});
            });
        });
    });
});