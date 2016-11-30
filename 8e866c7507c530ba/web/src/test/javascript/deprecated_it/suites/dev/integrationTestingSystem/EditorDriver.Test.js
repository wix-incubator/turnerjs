describe("Editor Driver test:", function () {

    beforeEach(function () {
        waitsFor(function () {
            return editor.isReady();
        }, 'editor to finish loading', 10000);
    });

    describe("Editor:", function () {

        it("should be ready (loaded)", function () {
            expect(editor.isReady()).toBeTruthy();
        });

        describe("Adding a page to the site", function () {
            it("Should add a page to the site and have it ready", function () {
                var isPageReady;

                var addedPage = editor.addBlankPage();

                waitsFor(function () {
                    isPageReady = editor.isComponentReady(addedPage);
                    return isPageReady;
                }, 'page to be ready', 1000);
                runs(function () {
                    expect(isPageReady).toBeTruthy();
                });
            });
        });

        describe("Adding clipart component", function () {
            var clipart;

            beforeEach(function () {
                clipart = editor.addComponent('ClipArt', 'wysiwyg.viewer.components.ClipArt');
                waitsFor(function () {
                    return editor.isComponentReady(clipart);
                }, 'item to be positioned', 1000);
            });

            it("should add one clipart comp to the site", function () {
                expect(editor.isComponentReady(clipart)).toBeTruthy();
            });

            describe("Moving clipart component", function () {
                function toBeNear(position, expectedPosition, tollerance) {
                    return Math.abs(position.x - expectedPosition.x) < tollerance
                        && Math.abs(position.y - expectedPosition.y) < tollerance;
                }

                it("should be moved to the correct position", function () {
                    var isNear;
                    var initialPosition = clipart.getPosition();
                    var offset = {x: 100, y: 0};
                    var expectedPosition = {x: initialPosition.x + offset.x, y: initialPosition.y + offset.y};

                    editor.dragComponent(clipart, offset);

                    waitsFor(function () {
                        currentPosition = clipart.getPosition();
                        isNear = toBeNear(currentPosition, expectedPosition, 6);
                        return isNear;
                    }, "item to be positioned", 1000);

                    runs(function () {
                        expect(isNear).toBeTruthy();
                    });
                });
            });

            describe("Clicking it", function () {

                beforeEach(function() {
                    //Create another clipart so that the component edit box will not be on the tested clipart comp:
                    editor.addComponent('ClipArt', 'wysiwyg.viewer.components.ClipArt');
                });

                it("Should place the componentEditBox on it", function() {
                    expect(editor.getEditedComponent()).not.toEqual(clipart);
                    editor.clickOn(clipart);
                    expect(editor.getEditedComponent()).toEqual(clipart);

                });

            });
        });
    });
});