describe("Container resize should stop on inner content", function () {
    var clipart, container;

    it('should load the editor',function(){
        waitsFor(function () {
            return editor.isReady();
        }, 'Editor did not load', 10000);
    });

    it("Should add a page to the site and have it ready", function () {
        var isPageReady;

        var addedPage = editor.addBlankPage();

        waitsFor(function () {
            isPageReady = editor.isComponentReady(addedPage);
            return isPageReady;
        }, 'page to be ready', 1000);
    });

    it('Should add a container and a clipart',function(){
        clipart = editor.addComponent('ClipArt', 'wysiwyg.viewer.components.ClipArt', function(element){
            clipart = element;
        });
        container = editor.addComponent('area','core.components.Container', function(element){
            container = element;
        });

        waitsFor(function () {
            return (editor.isComponentReady(clipart) && editor.isComponentReady(container));
        }, 'container and clipart to be created', 1000);
    });

    it('should move and resize the container',function(){


    });
    describe('attach the clipart to the container',function(){
        it('should drag the clipart into the container',function(){
            expect(true).toBeTruthy();
        });
    });
});
