testRequire()
    .classes('wysiwyg.deployment.JasmineEditorHelper')
    .resources('W.Preview');

describe("ContainerNBC Refactor", function () {
    beforeEach(function() {
        window.editor = window.editor || new this.JasmineEditorHelper();
    });

    describe("Box component", function () {
        var boxComp,
            boxCompLogic;

        beforeEach(function () {
            boxComp = boxComp || editor.addComponent('area', 'core.components.Container');

            waitsFor(function () {
                return editor.isComponentReady(boxComp);
            }, 'Box component to be ready', 1000);

            runs(function (){
                boxCompLogic = boxCompLogic || boxComp.getLogic();
            });
        });

        it("should add one Box component to the site", function () {
            expect(editor.isComponentReady(boxComp)).toBeTruthy();
        });

        describe('Ribbon Skins bug', function (){

            it('CenterRibbon should take the entire width of the component', function (){
                var skinName = 'wysiwyg.viewer.skins.area.CenterRibbon';
                _changeComponentSkin(skinName, boxCompLogic);

                waitsFor(function (){
                    return (boxCompLogic.getSkin().className === skinName);
                }, 'Skin to be applied', 1000);

                runs(function (){
                    var skinWidth = boxComp.getComputedStyle('width');
                    var compWidth = boxCompLogic.getWidth() + 'px';
                    expect(skinWidth).toEqual(compWidth);
                });
            });

            it('ForkedRibbonArea should take the entire width of the component', function (){
                var skinName = 'wysiwyg.viewer.skins.area.ForkedRibbonArea';
                _changeComponentSkin(skinName, boxCompLogic);

                waitsFor(function (){
                    return (boxCompLogic.getSkin().className === skinName);
                }, 'Skin to be applied', 1000);

                runs(function (){
                    var skinWidth = boxComp.getComputedStyle('width');
                    var compWidth = boxCompLogic.getWidth() + 'px';
                    expect(skinWidth).toEqual(compWidth);
                });
            });
        });
    });


    function _changeComponentSkin(skinName, compLogic){
        var compStyle = compLogic.getStyle();

        this.W.Preview.getPreviewManagers().Skins.getSkin(skinName, function (skin) {
            compStyle.setSkin(skin);
        });
    }
});