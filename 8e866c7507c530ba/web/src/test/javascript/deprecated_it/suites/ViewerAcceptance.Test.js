testRequire().classes('wysiwyg.deployment.JasmineViewerHelper');

describe("ViewerAcceptance:", function () {
    beforeEach(function() {
        window.viewer = window.viewer || new this.JasmineViewerHelper();
    });

    describe("viewer", function () {

        it("should be ready (loaded)", function () {
            expect(viewer.isReady()).toBeTruthy();
        });

        it('should know basic addition', function() {
            expect(2+3).toEqual(5);
        });

        it('should know basic multiplication', function() {
            expect(2*3).toEqual(6);
        });

    });
});