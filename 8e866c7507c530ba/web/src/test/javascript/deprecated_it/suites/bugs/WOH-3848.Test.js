testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

describe("Fix of bug WOH-3848 (Change default video id of Video component)", function () {
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
    });

    describe("Video component", function () {
        var videoComp;

        beforeEach(function () {
            videoComp = videoComp || editor.addComponent('addVideo', 'wysiwyg.viewer.components.Video');

            waitsFor(function () {
                return editor.isComponentReady(videoComp);
            }, 'Video component to be ready', 1000);
        });

        it("should add one video comp to the site", function () {
            expect(editor.isComponentReady(videoComp)).toBeTruthy();
        });

        describe('Default video', function (){

            /*
             * Experiment ChangeDefaultYouTubeVideo fixes the tested bug and makes the tests pass
             */

            it('should NOT be the old video id (UAxMzrWZOpY)', function (){
                var oldVideoId = 'UAxMzrWZOpY';
                var currentVideoId = videoComp.getLogic().getDataItem()._data.videoId;

                expect(currentVideoId).not.toEqual(oldVideoId);
            });

            it('should be the new video id (83nu4yXFcYU)', function (){
                var newVideoId = '83nu4yXFcYU';
                var currentVideoId = videoComp.getLogic().getDataItem()._data.videoId;

                expect(currentVideoId).toEqual(newVideoId);
            })
        })
    });
});