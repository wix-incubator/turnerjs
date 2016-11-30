/**
 * Created with IntelliJ IDEA.
 * User: lotemh
 * Date: 11/21/13
 * Time: 1:36 PM
 * To change this template use File | Settings | File Templates.
 */
testRequire().classes('wysiwyg.deployment.it.editor.ComponentsDriver').resources('W.Preview','W.Commands','W.Config');
testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');


describe("Tiny Menu", function(){

    beforeEach(function () {
        window.editor = window.editor || new this.ComponentsDriver();

        this.getEditorComponents = function () {
            var mainEditorBar = editor.getEditorComponentNode("wysiwyg.editor.components.panels.MainEditorBar");
            var modeSwitchBar = editor.getComponentNode("wysiwyg.editor.components.ViewModeSwitch", mainEditorBar);
            var modeSwitchButtons = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImages", modeSwitchBar);
            var mobileButton = editor.getComponentNode("wysiwyg.editor.components.inputs.RadioImage", modeSwitchButtons, 1);
            mobileButton = mobileButton.getElementsByTagName('input')[0];

            return {
                mobileButton: mobileButton
//                modeSwitchBar: modeSwitchBar
            };

        };

        waitsFor(function () {
            var ind = 0;
            console.log("wait for editor" + (ind += 1));
            return editor.isReady();
        }, 'editor to finish loading', 10000);

        this.components = this.getEditorComponents();
        this.components.mobileButton.click();

        waitsFor(function () {
            return W.Config.env.isViewingDesktopDevice()== false;
        },'editor to change to mobile mode', 5000);
    });

    describe("Mobile Editor Mode", function(){

        beforeEach(function () {
            this.W.Commands.executeCommand("WEditorCommands.WSetEditMode",{editMode: "EDITOR"});
        });

        it("should be drag and dropped", function(){
            this.preview = this.W.Preview.getSiteNode();
            this.tinyMenuComp = editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview);
            var initialPos = this.tinyMenuComp.getPosition();
            var xOffset = -100;
            var yOffset = 200;
            editor.dragComponent(this.tinyMenuComp, {x: xOffset, y: yOffset});
            var actualPos = this.tinyMenuComp.getPosition();
            expect(actualPos).toEqual({x: initialPos.x+ xOffset, y: initialPos.y + yOffset});
        });


    });


    describe("mobile preview mode", function(){

        beforeEach(function(){
            this.W.Commands.executeCommand("WEditorCommands.WSetEditMode",{editMode: "PREVIEW"});
        });

        describe("Tiny Menu", function(){

            beforeEach(function(){
                this.preview = this.W.Preview.getSiteNode();
                this.tinyMenuComp = editor.getComponentNode("wysiwyg.viewer.components.mobile.TinyMenu", this.preview);
                this.tinyMenuBtn = this.tinyMenuComp.getElementsByTagName('div')[0];
                this.tinyMenuCnt = this.tinyMenuComp.getElementsByTagName('div')[1];
                this.menuList = this.tinyMenuComp.getElementsByTagName('ul')[0];
                this.menuPages = this.tinyMenuComp.getElementsByTagName('li');
                this.pageBtn = this.tinyMenuComp.getElementsByTagName('a')[1];
            });

            it("should open and close", function () {
                var menuIsVisible = this.menuList.getStyle("display");
                expect(menuIsVisible).toBe("none");

                this.tinyMenuBtn.click();

                menuIsVisible = this.menuList.getStyle("display");
                expect(this.tinyMenuCnt.className).not.toContain('hidden');
                expect(this.menuList.className).toContain('tiny-menu-open');
                expect(menuIsVisible).toBe("block");

                this.tinyMenuBtn.click();
                menuIsVisible = this.menuList.getStyle("display");
                expect(this.tinyMenuCnt.className).toContain('hidden');
                expect(this.menuList.className).not.toContain('tiny-menu-open');
                expect(menuIsVisible).toBe("none");
            });

            it("should have correct number of pages and correct pages names", function(){
                this.tinyMenuBtn.click();
                var numberOfPages = this.W.Preview.getPageGroup().getChildren().length;
                var pagesNames = [];
                this.W.Preview.getPages(function(data){
                    for (var key in data){
                        pagesNames.push(data[key].getData().title);
                    }

                });

                expect(this.menuPages.length).toBe(numberOfPages);

                for(var i=0; i< this.menuPages.length; i++){
                    var pageButtonText = this.menuPages[i].getChildren()[0].innerHTML;
                    expect(pagesNames).toContain(pageButtonText);
                }
            });

            it("should have correct symbols", function(){
                expect(window.getComputedStyle(this.tinyMenuBtn, ':after').content).toBe("≡");

                this.tinyMenuBtn.click();

                expect(window.getComputedStyle(this.tinyMenuBtn, ':after').content).toBe("✕");

            });

            it("should change page on click", function(){
                var pagesIds = [];
                this.W.Preview.getPages(function(data){
                    for (var key in data){
                        pagesIds.push(key.replace("#",""));
                    }
                });

                pagesIds.forEach(function(element, index, array){
                    this.tinyMenuBtn.click();
                    var menuButton = this.menuList.getElement('li a[data-refid=' + element + ']');
                    menuButton.click();
                    console.log(menuButton);
                    var pageIdAfter = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
                    expect(pageIdAfter).toBe(element.replace("#",""));
                },this);
            });

        });

    });


});