describe("Viewer Driver test:", function () {

    beforeEach(function () {
        waitsFor(function () {
            return viewer.isReady();
        }, 'viewer to finish loading', 10000);
    });

    describe("Viewer:", function () {

        it("should be ready (loaded)", function () {
            expect(viewer.isReady()).toBeTruthy();
        });

        it("should include a clipart comp", function() {
            expect(viewer.containsComponent("wysiwyg.viewer.components.ClipArt")).toBeTruthy();
        });

    });
});