describe("EditorAcceptance:", function () {

    beforeEach(function () {
        waitsFor(function () {
            return editor.isReady();
        }, 'editor to finish loading', 10000);
    });

    describe("editor", function () {

        describe("user agent", function () {

            it("should be firefox", function () {
                expect(navigator.userAgent.indexOf('Firefox') != -1).toBeTruthy();
            });

            it("should be chrome", function () {
                expect(navigator.userAgent.indexOf('Chrome') != -1).toBeTruthy();
            });

            it("should be IE", function () {
                expect(navigator.userAgent.indexOf('MSIE') != -1).toBeTruthy();
            });

        });

    });
});