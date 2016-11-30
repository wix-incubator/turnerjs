testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

describe("WOH-3848 fix:", function () {
    beforeEach(function() {
        window.editor = window.editor || new this.JasmineEditorHelper();
    });

    describe("editor", function () {

        it("should be ready (loaded)", function () {
            waitsFor(function () {
                return editor && editor.isReady();
            }, 'editor to finish loading', 10000);
            runs(function() {
                expect(editor.isReady()).toBeTruthy();
            });
        });

        describe("Adding video component and checking for the source", function () {
            var videoComponent;
            var videoId;

            beforeEach(function () {
                videoComponent = videoComponent || editor.addComponent('addVideo', 'wysiwyg.viewer.components.Video');

                waitsFor(function () {
                    return editor.isComponentReady(videoComponent);
                }, 'item to be positioned', 1000);

            });

            it("should not have the wrong video id as a source", function(){
                videoId = videoComponent.getLogic().getDataItem().getData().videoId;
                expect(videoId).not.toBe("UAxMzrWZOpY");
            });

            it("should have the right video id as a source", function(){
                videoId = videoComponent.getLogic().getDataItem().getData().videoId;
                expect(videoId).toBe("83nu4yXFcYU");
            });
        });

    });
});