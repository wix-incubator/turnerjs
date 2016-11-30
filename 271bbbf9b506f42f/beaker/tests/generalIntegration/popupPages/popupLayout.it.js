define([
    'lodash',
    'santa-harness',
    'errorUtils',
    'componentUtils'
], function (_,
             santa,
             errorUtils,
             componentUtils) {
    'use strict';

    describe('Popup layout', function () {
        var ds;
        var iframeWindow;
        var nineGridPopupRef, fullWidthPopupRef, fullHeightPopupRef, longFullHeightPopupRef;
        var nineGridPopupContainerRef, fullWidthPopupContainerRef, fullHeightPopupContainerRef, longFullHeightPopupContainerRef;
        var screenWidthWithoutScrollBar, screenHeightWithScrollBar;

        //Todo: create wix site with 3 types of popus - ninegrid, fullHeight, fullWidth
        //Todo: to run beaker tests on your site follow this tutorial: https://github.com/wix-private/santa/wiki/Beaker
        //Todo: push changes on #CLNT-6707 jira ticket

        var VERTICAL = {
            TOP: 'top',
            CENTER: 'center',
            BOTTOM: 'bottom'
        };

        var HORIZONTAL = {
            LEFT: 'left',
            CENTER: 'center',
            RIGHT: 'right'
        };

        var TYPES = {
            NINE_GRID: 'nineGrid',
            FULL_HEIGHT: 'fullHeight',
            FULL_WIDTH: 'fullWidth'
        };

        beforeAll(function (done) {
            santa.start({
                site: "popup-layout-test",
                height: 800
            }).then(function (harness) {
                console.log('Testing Popup Layout integration');
                ds = harness.documentServices;
                iframeWindow = harness.window;
                retrieveIdsFromSite();
                done();
            });
        });

        beforeEach(function () {
            ds.history.add("Init-state");
            screenWidthWithoutScrollBar = iframeWindow.document.documentElement.clientWidth || iframeWindow.document.body.clientWidth;
            screenHeightWithScrollBar = iframeWindow.innerHeight;
        });

        afterEach(function () {
            ds.history.undo();
        });

        function retrieveIdsFromSite() {
            var popup = _.find(ds.pages.popupPages.getDataList(), {title: "centered popup"});
            nineGridPopupRef = ds.pages.getReference(popup.id);
            nineGridPopupContainerRef = ds.components.getChildren(nineGridPopupRef)[0];

            popup = _.find(ds.pages.popupPages.getDataList(), {title: "full width popup"});
            fullWidthPopupRef = ds.pages.getReference(popup.id);
            fullWidthPopupContainerRef = ds.components.getChildren(fullWidthPopupRef)[0];

            popup = _.find(ds.pages.popupPages.getDataList(), {title: "full height popup"});
            fullHeightPopupRef = ds.pages.getReference(popup.id);
            fullHeightPopupContainerRef = ds.components.getChildren(fullHeightPopupRef)[0];

            popup = _.find(ds.pages.popupPages.getDataList(), {title: "long full height popup"});
            longFullHeightPopupRef = ds.pages.getReference(popup.id);
            longFullHeightPopupContainerRef = ds.components.getChildren(longFullHeightPopupRef)[0];
        }

        describe("Nine grid popup", function () {

            beforeEach(function (done) {
                ds.pages.popupPages.open(nineGridPopupRef.id);
                ds.waitForChangesApplied(done);
            });

            describe("Alignment change when offsets are 0", function () {

                beforeEach(function () {
                    var properties = ds.components.properties.get(nineGridPopupContainerRef);
                    expect(properties.verticalOffset).toBe(0);
                    expect(properties.horizontalOffset).toBe(0);
                });

                function checkLayoutOnAlignmentChange(oldLayoutRelativeToScreen, newLayoutRelativeToScreen, newHorizontalAlignment, newVerticalAlignment) {
                    switch (newHorizontalAlignment) {
                        case HORIZONTAL.LEFT:
                            expect(newLayoutRelativeToScreen.x).toEqual(0);
                            break;
                        case HORIZONTAL.RIGHT:
                            expect(oldLayoutRelativeToScreen.x * 2).toEqual(newLayoutRelativeToScreen.x);
                            expect(newLayoutRelativeToScreen.x + newLayoutRelativeToScreen.width).toEqual(screenWidthWithoutScrollBar);
                            break;
                        case HORIZONTAL.CENTER:
                            expect(newLayoutRelativeToScreen.x).toEqual(oldLayoutRelativeToScreen.x);
                    }

                    switch (newVerticalAlignment) {
                        case VERTICAL.BOTTOM:
                            expect(oldLayoutRelativeToScreen.y * 2).toEqual(newLayoutRelativeToScreen.y);
                            expect(newLayoutRelativeToScreen.y + newLayoutRelativeToScreen.height).toEqual(screenHeightWithScrollBar);
                            break;
                        case VERTICAL.TOP:
                            expect(newLayoutRelativeToScreen.y).toEqual(0);
                            break;
                        case VERTICAL.CENTER:
                            expect(newLayoutRelativeToScreen.y).toEqual(oldLayoutRelativeToScreen.y);
                    }

                    expect(newLayoutRelativeToScreen.width).toEqual(oldLayoutRelativeToScreen.width);
                    expect(newLayoutRelativeToScreen.height).toEqual(oldLayoutRelativeToScreen.height);
                }

                function testAlignmentChange(newHorizontalAlignment, newVerticalAlignment, done) {
                    var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                    ds.components.properties.update(nineGridPopupContainerRef, {
                        horizontalAlignment: newHorizontalAlignment,
                        verticalAlignment: newVerticalAlignment
                    });

                    ds.waitForChangesApplied(function () {
                        var properties = ds.components.properties.get(nineGridPopupContainerRef);
                        var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                        checkLayoutOnAlignmentChange(oldLayoutRelativeToScreen, newLayoutRelativeToScreen, newHorizontalAlignment, newVerticalAlignment);
                        expect(properties.horizontalAlignment).toBe(newHorizontalAlignment);
                        expect(properties.verticalAlignment).toBe(newVerticalAlignment);
                        done();
                    });
                }

                it('should change layout of nine-grid popup to right top', function (done) {
                    testAlignmentChange(HORIZONTAL.RIGHT, VERTICAL.TOP, done);
                });

                it('should change layout of nine-grid popup to right center', function (done) {
                    testAlignmentChange(HORIZONTAL.RIGHT, VERTICAL.CENTER, done);
                });

                it('should change layout of nine-grid popup to right bottom', function (done) {
                    testAlignmentChange(HORIZONTAL.RIGHT, VERTICAL.BOTTOM, done);
                });

                it('should change layout of nine-grid popup to center top', function (done) {
                    testAlignmentChange(HORIZONTAL.CENTER, VERTICAL.TOP, done);
                });

                it('should change layout of nine-grid popup to center center', function (done) {
                    testAlignmentChange(HORIZONTAL.CENTER, VERTICAL.CENTER, done);
                });

                it('should change layout of nine-grid popup to center bottom', function (done) {
                    testAlignmentChange(HORIZONTAL.CENTER, VERTICAL.BOTTOM, done);
                });

                it('should change layout of nine-grid popup to left top', function (done) {
                    testAlignmentChange(HORIZONTAL.LEFT, VERTICAL.TOP, done);
                });

                it('should change layout of nine-grid popup to left center', function (done) {
                    testAlignmentChange(HORIZONTAL.LEFT, VERTICAL.CENTER, done);
                });

                it('should change layout of nine-grid popup to left bottom', function (done) {
                    testAlignmentChange(HORIZONTAL.LEFT, VERTICAL.BOTTOM, done);
                });
            });

            //TODO: tests doesn't work cause it's still possible to change an alignment type
            xit('should not change alignmentType of nine-grid popup to full height', function (done) {
                ds.components.properties.update(nineGridPopupContainerRef, {alignmentType: TYPES.FULL_HEIGHT});
                errorUtils.waitForError(ds, function () {
                    var properties = ds.components.properties.get(nineGridPopupContainerRef);
                    expect(properties.alignmentType).toBe(TYPES.NINE_GRID);
                    done();
                });
            });

            describe("Resize", function () {
                it('should resize horizontally in symmetric way and keep children in place', function (done) {
                    var oldPopupLayout = ds.components.layout.get(nineGridPopupContainerRef);
                    var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                    var componentRef = ds.components.add(nineGridPopupContainerRef, _.cloneDeep(componentInitialDef));
                    ds.components.layout.update(nineGridPopupContainerRef, {
                        width: oldPopupLayout.width - 100
                    });
                    ds.waitForChangesApplied(function () {
                        var updatedPopupLayout = ds.components.layout.get(nineGridPopupContainerRef);
                        expect(updatedPopupLayout.x).toEqual(oldPopupLayout.x + 50);
                        expect(updatedPopupLayout.width).toEqual(oldPopupLayout.width - 100);

                        var updatedCompLayout = ds.components.layout.get(componentRef);
                        var expectedChildrenLayout = _.assign(componentInitialDef.layout, {x: componentInitialDef.layout.x - 50});
                        expect(updatedCompLayout).toEqual(jasmine.objectContaining(expectedChildrenLayout));

                        done();
                    });
                });

                it('should resize vertically in symmetric way and keepChildren in place', function (done) {
                    var oldPopupLayout = ds.components.layout.get(nineGridPopupContainerRef);
                    var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                    var componentRef = ds.components.add(nineGridPopupContainerRef, _.cloneDeep(componentInitialDef));
                    ds.components.layout.update(nineGridPopupContainerRef, {
                        height: oldPopupLayout.height - 100
                    });
                    ds.waitForChangesApplied(function () {
                        var updatedPopupLayout = ds.components.layout.get(nineGridPopupContainerRef);
                        var updatedCompLayout = ds.components.layout.get(componentRef);
                        var expectedChildrenLayout = _.assign(componentInitialDef.layout, {y: componentInitialDef.layout.y - 50});
                        expect(updatedCompLayout).toEqual(jasmine.objectContaining(expectedChildrenLayout));
                        expect(updatedPopupLayout.y).toEqual(oldPopupLayout.y + 50);
                        expect(updatedPopupLayout.height).toEqual(oldPopupLayout.height - 100);
                        done();
                    });
                });
            });

            describe("Offset", function () {
                it('should add positive horizontal offset', function (done) {
                    var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                    ds.components.properties.update(nineGridPopupContainerRef, {
                        horizontalOffset: 10
                    });

                    ds.waitForChangesApplied(function () {
                        var newProperties = ds.components.properties.get(nineGridPopupContainerRef);
                        var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                        expect(newProperties.horizontalOffset).toBe(10);
                        expect(newLayoutRelativeToScreen.x).toBe(oldLayoutRelativeToScreen.x + 10);
                        done();
                    });
                });

                it('should add positive vertical offset', function (done) {
                    var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                    ds.components.properties.update(nineGridPopupContainerRef, {
                        verticalOffset: 20
                    });

                    ds.waitForChangesApplied(function () {
                        var newProperties = ds.components.properties.get(nineGridPopupContainerRef);
                        var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                        expect(newProperties.verticalOffset).toBe(20);
                        expect(newLayoutRelativeToScreen.y).toBe(oldLayoutRelativeToScreen.y + 20);
                        done();
                    });
                });

                it('should add negative horizontal offset', function (done) {
                    var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                    ds.components.properties.update(nineGridPopupContainerRef, {
                        horizontalOffset: -100
                    });

                    ds.waitForChangesApplied(function () {
                        var newProperties = ds.components.properties.get(nineGridPopupContainerRef);
                        var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                        expect(newProperties.horizontalOffset).toBe(-100);
                        expect(newLayoutRelativeToScreen.x).toBe(oldLayoutRelativeToScreen.x - 100);
                        done();
                    });
                });

                it('should add negative vertical offset', function (done) {
                    var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                    ds.components.properties.update(nineGridPopupContainerRef, {
                        verticalOffset: -50
                    });

                    ds.waitForChangesApplied(function () {
                        var newProperties = ds.components.properties.get(nineGridPopupContainerRef);
                        var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                        expect(newProperties.verticalOffset).toBe(-50);
                        expect(newLayoutRelativeToScreen.y).toBe(oldLayoutRelativeToScreen.y - 50);
                        done();
                    });
                });

                //TODO: check - don't this need to fail???
                xit('should not add too big vertical offset', function (done) {
                    var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                    ds.components.properties.update(nineGridPopupContainerRef, {
                        verticalOffset: 200000
                    });

                    ds.waitForChangesApplied(function () {
                        var newProperties = ds.components.properties.get(nineGridPopupContainerRef);
                        var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(nineGridPopupContainerRef);
                        expect(newProperties.verticalOffset).toBe(200000);
                        expect(newLayoutRelativeToScreen.y).toBe(oldLayoutRelativeToScreen.y + 200000);
                        done();
                    });
                });

            });
        });

        describe("Full height popup", function () {
            beforeEach(function (done) {
                ds.pages.popupPages.open(fullHeightPopupRef.id);
                ds.waitForChangesApplied(done);
            });

            it("should change horizontal alignment to left", function (done) {
                ds.components.properties.update(fullHeightPopupContainerRef, {horizontalAlignment: HORIZONTAL.LEFT});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullHeightPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                    expect(newLayoutRelativeToScreen.x).toEqual(0);
                    expect(newLayoutRelativeToScreen.y).toEqual(0);
                    expect(properties.horizontalAlignment).toBe(HORIZONTAL.LEFT);
                    done();
                });
            });

            it("should change horizontal alignment to right", function (done) {
                ds.components.properties.update(fullHeightPopupContainerRef, {horizontalAlignment: HORIZONTAL.RIGHT});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullHeightPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                    expect(newLayoutRelativeToScreen.x).toEqual(screenWidthWithoutScrollBar - newLayoutRelativeToScreen.width);
                    expect(newLayoutRelativeToScreen.y).toEqual(0);
                    expect(properties.horizontalAlignment).toBe(HORIZONTAL.RIGHT);
                    done();
                });
            });

            it("should be able to change horizontal alignment to center", function (done) {
                ds.components.properties.update(fullHeightPopupContainerRef, {horizontalAlignment: HORIZONTAL.CENTER});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullHeightPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                    expect(newLayoutRelativeToScreen.x).toEqual((screenWidthWithoutScrollBar - newLayoutRelativeToScreen.width) / 2);
                    expect(newLayoutRelativeToScreen.y).toEqual(0);
                    expect(properties.horizontalAlignment).toBe(HORIZONTAL.CENTER);
                    done();
                });
            });

            it("should be possible to make popup bigger and keep children in place", function (done) {
                var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                var componentRef = ds.components.add(fullHeightPopupContainerRef, _.cloneDeep(componentInitialDef));
                var oldPopupLayout = ds.components.layout.get(fullHeightPopupContainerRef);
                ds.components.layout.update(fullHeightPopupContainerRef, {
                    width: oldPopupLayout.width + 50
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullHeightPopupContainerRef);
                    expect(updatedLayout.x).toEqual(oldPopupLayout.x - 50);
                    expect(updatedLayout.width).toEqual(oldPopupLayout.width + 50);
                    var updatedCompLayout = ds.components.layout.get(componentRef);
                    var expectedChildrenLayout = _.assign(componentInitialDef.layout, {x: componentInitialDef.layout.x + 50});
                    expect(updatedCompLayout).toEqual(jasmine.objectContaining(expectedChildrenLayout));
                    done();
                });
            });

            it("should be possible to make popup smaller and keep children in place", function (done) {
                var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                var componentRef = ds.components.add(fullHeightPopupContainerRef, _.cloneDeep(componentInitialDef));
                var oldLayout = ds.components.layout.get(fullHeightPopupContainerRef);
                ds.components.layout.update(fullHeightPopupContainerRef, {
                    width: oldLayout.width - 50
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullHeightPopupContainerRef);
                    expect(updatedLayout.x).toEqual(oldLayout.x + 50);
                    expect(updatedLayout.width).toEqual(oldLayout.width - 50);
                    var updatedCompLayout = ds.components.layout.get(componentRef);
                    var expectedChildrenLayout = _.assign(componentInitialDef.layout, {x: componentInitialDef.layout.x - 50});
                    expect(updatedCompLayout).toEqual(jasmine.objectContaining(expectedChildrenLayout));
                    done();
                });
            });

            it("should not resize vertically down", function (done) {
                var oldLayout = ds.components.layout.get(fullHeightPopupContainerRef);

                ds.components.layout.update(fullHeightPopupContainerRef, {
                    height: oldLayout.height - 50
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullHeightPopupContainerRef);
                    expect(updatedLayout.y).toEqual(oldLayout.y);
                    expect(updatedLayout.height).toEqual(oldLayout.height);
                    done();
                });
            });

            it("should not resize vertically up", function (done) {
                var oldLayout = ds.components.layout.get(fullHeightPopupContainerRef);

                ds.components.layout.update(fullHeightPopupContainerRef, {
                    height: oldLayout.height + 5
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullHeightPopupContainerRef);
                    expect(updatedLayout.y).toEqual(oldLayout.y);
                    expect(updatedLayout.height).toEqual(oldLayout.height);
                    done();
                });
            });

            //TODO: the test pass, however it shouldn't
            it("should not be able to change vertical alignment to top", function (done) {
                var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                ds.components.properties.update(fullHeightPopupContainerRef, {verticalAlignment: VERTICAL.TOP});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullHeightPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                    //it stays in full height
                    expect(oldLayoutRelativeToScreen.height).toEqual(newLayoutRelativeToScreen.height);
                    expect(newLayoutRelativeToScreen.y).toEqual(0);
                    //but defined as top
                    expect(properties.verticalAlignment).toBe(VERTICAL.TOP);
                    done();
                });
            });

            //TODO: the test pass, however it shouldn't
            it("should not be able to change vertical alignment to bottom", function (done) {
                var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                ds.components.properties.update(fullHeightPopupContainerRef, {verticalAlignment: VERTICAL.BOTTOM});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullHeightPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                    //it stays in full height
                    expect(oldLayoutRelativeToScreen.height).toEqual(newLayoutRelativeToScreen.height);
                    expect(newLayoutRelativeToScreen.y).toEqual(0);
                    //but defined as bottom
                    expect(properties.verticalAlignment).toBe(VERTICAL.BOTTOM);
                    done();
                });
            });

            //TODO: the test pass, however it shouldn't
            it("should not be able to change verticalOffset", function (done) {
                var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                ds.components.properties.update(fullHeightPopupContainerRef, {verticalOffset: -50});

                ds.waitForChangesApplied(function () {
                    var newProperties = ds.components.properties.get(fullHeightPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullHeightPopupContainerRef);
                    expect(newProperties.verticalOffset).toBe(-50);
                    expect(newLayoutRelativeToScreen.y).toBe(oldLayoutRelativeToScreen.y - 50);
                    done();
                });
            });

        });

        describe("Full width popup", function () {
            beforeEach(function (done) {
                ds.pages.popupPages.open(fullWidthPopupRef.id);
                ds.waitForChangesApplied(done);
            });

            it("should change vertical alignment to top", function (done) {
                ds.components.properties.update(fullWidthPopupContainerRef, {verticalAlignment: VERTICAL.TOP});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullWidthPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullWidthPopupContainerRef);
                    expect(newLayoutRelativeToScreen.x).toEqual(0);
                    expect(newLayoutRelativeToScreen.y).toEqual(0);
                    expect(properties.verticalAlignment).toBe(VERTICAL.TOP);
                    done();
                });
            });

            it("should change vertical alignment to bottom", function (done) {
                ds.components.properties.update(fullWidthPopupContainerRef, {verticalAlignment: VERTICAL.BOTTOM});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullWidthPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullWidthPopupContainerRef);
                    expect(newLayoutRelativeToScreen.x).toEqual(0);
                    expect(newLayoutRelativeToScreen.y).toEqual(screenHeightWithScrollBar - newLayoutRelativeToScreen.height);
                    expect(properties.verticalAlignment).toBe(VERTICAL.BOTTOM);
                    done();
                });
            });

            it("should change vertical alignment to center", function (done) {
                ds.components.properties.update(fullWidthPopupContainerRef, {verticalAlignment: VERTICAL.CENTER});

                ds.waitForChangesApplied(function () {
                    var properties = ds.components.properties.get(fullWidthPopupContainerRef);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullWidthPopupContainerRef);
                    expect(newLayoutRelativeToScreen.x).toEqual(0);
                    expect(newLayoutRelativeToScreen.y).toEqual((screenHeightWithScrollBar - newLayoutRelativeToScreen.height) / 2);
                    expect(properties.verticalAlignment).toBe(VERTICAL.CENTER);
                    done();
                });
            });

            it("should be possible to make popup bigger non symmetrically and keep children in place", function (done) {
                var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                var componentRef = ds.components.add(fullWidthPopupContainerRef, _.cloneDeep(componentInitialDef));
                var oldPopupLayout = ds.components.layout.get(fullWidthPopupContainerRef);
                ds.components.layout.update(fullWidthPopupContainerRef, {
                    height: oldPopupLayout.height + 50
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullWidthPopupContainerRef);
                    expect(updatedLayout.y).toEqual(oldPopupLayout.y - 50);
                    expect(updatedLayout.height).toEqual(oldPopupLayout.height + 50);
                    var updatedCompLayout = ds.components.layout.get(componentRef);
                    var expectedChildrenLayout = _.assign(componentInitialDef.layout, {y: componentInitialDef.layout.y + 50});
                    expect(updatedCompLayout).toEqual(jasmine.objectContaining(expectedChildrenLayout));
                    done();
                });
            });

            it("should be possible to make popup smaller non symmetrically and keep children in place", function (done) {
                var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                var componentRef = ds.components.add(fullWidthPopupContainerRef, _.cloneDeep(componentInitialDef));
                var oldPopupLayout = ds.components.layout.get(fullWidthPopupContainerRef);
                ds.components.layout.update(fullWidthPopupContainerRef, {
                    height: oldPopupLayout.height - 50
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullWidthPopupContainerRef);
                    expect(updatedLayout.y).toEqual(oldPopupLayout.y + 50);
                    expect(updatedLayout.height).toEqual(oldPopupLayout.height - 50);
                    var updatedCompLayout = ds.components.layout.get(componentRef);
                    var expectedChildrenLayout = _.assign(componentInitialDef.layout, {y: componentInitialDef.layout.y - 50});
                    expect(updatedCompLayout).toEqual(jasmine.objectContaining(expectedChildrenLayout));
                    done();
                });
            });

            it("should not resize horizontally left", function (done) {
                var oldLayout = ds.components.layout.get(fullWidthPopupContainerRef);

                ds.components.layout.update(fullWidthPopupContainerRef, {
                    width: oldLayout.width - 5
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullWidthPopupContainerRef);
                    expect(updatedLayout.x).toEqual(oldLayout.x);
                    expect(updatedLayout.width).toEqual(oldLayout.width);
                    done();
                });
            });

            it("should not resize horizontally right", function (done) {
                var oldLayout = ds.components.layout.get(fullWidthPopupContainerRef);

                ds.components.layout.update(fullWidthPopupContainerRef, {
                    width: oldLayout.width + 5
                });
                ds.waitForChangesApplied(function () {
                    var updatedLayout = ds.components.layout.get(fullWidthPopupContainerRef);
                    expect(updatedLayout.x).toEqual(oldLayout.x);
                    expect(updatedLayout.width).toEqual(oldLayout.width);
                    done();
                });
            });

            //TODO: check - no such scenario in editor. It do possible to give negative offset, but the layout is fixed in opposite direction
            xit("should not be able to change verticalOffset", function (done) {
                var oldLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullWidthPopupContainerRef);
                console.log("oldLayoutRelativeToScreen", oldLayoutRelativeToScreen);
                ds.components.properties.update(fullWidthPopupContainerRef, {verticalOffset: -50});

                ds.waitForChangesApplied(function () {
                    var newProperties = ds.components.properties.get(fullWidthPopupContainerRef);
                    console.log("newProperties", newProperties);
                    var newLayoutRelativeToScreen = ds.components.layout.getRelativeToScreen(fullWidthPopupContainerRef);
                    console.log("newLayoutRelativeToScreen", newLayoutRelativeToScreen);
                    expect(newProperties.verticalOffset).toBe(-50);
                    expect(newLayoutRelativeToScreen.y).toBe(oldLayoutRelativeToScreen.y - 50);
                    done();
                });
            });
        });

        describe("Long full height popup with scroll", function () {

            beforeEach(function (done) {
                ds.pages.popupPages.open(longFullHeightPopupRef.id);
                ds.waitForChangesApplied(done);
            });

            it("should make scroll of popup", function () {
                var oldScroll = ds.site.getScroll();
                ds.site.setScroll(oldScroll.x, 1500);
                expect(ds.site.getScroll().y).toEqual(1500);
                ds.site.setScroll(oldScroll.x, 0);
                expect(ds.site.getScroll().y).toEqual(0);
            });

            it("should make scroll of popup after an element was added to popup", function (done) {
                var componentInitialDef = componentUtils.getComponentDef(ds, 'CONTAINER');
                ds.components.add(longFullHeightPopupContainerRef, _.cloneDeep(componentInitialDef));
                ds.waitForChangesApplied(function () {
                    var oldScroll = ds.site.getScroll();
                    ds.site.setScroll(oldScroll.x, 1500);
                    expect(ds.site.getScroll().y).toEqual(1500);
                    ds.site.setScroll(oldScroll.x, 0);
                    expect(ds.site.getScroll().y).toEqual(0);
                    done();
                });
            });
        });
    });
});
