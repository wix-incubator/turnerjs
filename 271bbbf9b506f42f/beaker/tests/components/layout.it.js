define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils', 'generalUtils'], function (_, santa, componentUtils, apiCoverageUtils, generalUtils) {

    'use strict';

    describe('Document Services - Component  - Layout', function () {

        var focusedPageRef;
        var componentServices;
        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                componentServices = documentServices.components;
                console.log('Testing Layout spec');
                done();
            });
        });

        describe('update', function () {

            beforeEach(function (done) {
                generalUtils.cleanPage(documentServices, focusedPageRef);
                documentServices.waitForChangesApplied(done);
            });

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.update');
            });

            it("should check that component layout updated when it was moved by X/Y", function (done) {
                var compRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
                componentServices.layout.update(compRef, {
                    "x": 123,
                    "y": 123
                });
                documentServices.waitForChangesApplied(function () {
                    var actualLayout = componentServices.layout.get(compRef);
                    var expectedLayout = {
                        "x": 123,
                        "y": 123
                    };
                    expect(actualLayout.x).toEqual(expectedLayout.x);
                    expect(actualLayout.y).toEqual(expectedLayout.y);
                    done();
                });
            });

            xit('should not make text component smaller than its rendered text height', function (done) {
                var textCompRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "WRICH_TEXT"));

                documentServices.waitForChangesApplied(function () {
                    var originalCompLayout = documentServices.components.layout.get(textCompRef);
                    documentServices.components.layout.update(textCompRef, {height: originalCompLayout.height - 10});
                    documentServices.waitForChangesApplied(function () {
                        var layoutAfter = documentServices.components.layout.get(textCompRef);
                        expect(layoutAfter.height).toEqual(originalCompLayout.height);
                        done();
                    });
                });
            });

            it('should stop resizing container after reaching the bottom of its lowest component', function (done) {
                var containerRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "CONTAINER",
                    {layout: {height: 700, width: 300}}));

                documentServices.components.add(containerRef, componentUtils.getComponentDef(documentServices, "WPHOTO", {
                    layout: {
                        x: 0,
                        y: 300,
                        width: 100,
                        height: 100
                    }
                }));

                documentServices.components.layout.update(containerRef, {height: 300, width: 5});

                documentServices.waitForChangesApplied(function () {
                    var newLayout = documentServices.components.layout.get(containerRef);
                    expect(newLayout.height).toBe(400);
                    expect(newLayout.width).toBe(100);
                    done();
                });
            });
        });

        describe('getResizableSides', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.getResizableSides');
            });

            it('should return [top, left, bottom, right] resizable sides of picture component', function (done) {
                var compRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
                documentServices.waitForChangesApplied(function () {
                    var expectedResizableSides = ['RESIZE_TOP', 'RESIZE_LEFT', 'RESIZE_BOTTOM', 'RESIZE_RIGHT'];
                    expect(componentServices.layout.getResizableSides(compRef)).toEqual(expectedResizableSides);
                    done();
                });
            });

            it('should check bgimagestrip component and return [top, bottom] resizable sides', function (done) {
                var bgimagestripRef = componentServices.add(focusedPageRef, componentUtils.getComponentDef(documentServices, 'BG_IMAGE_STRIP'));
                documentServices.waitForChangesApplied(function () {
                    var expectedResizableSides = ['RESIZE_TOP', 'RESIZE_BOTTOM'];
                    var sides = componentServices.layout.getResizableSides(bgimagestripRef);
                    expect(sides).toEqual(expectedResizableSides);
                    done();
                });
            });
        });

        describe('updateFixedPosition', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.updateFixedPosition');
            });

            it('should reparent to page if setting comp fixed position true', function (done) {
                var containerRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "CONTAINER"));
                var compRef = documentServices.components.add(containerRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
                documentServices.components.layout.updateFixedPosition(compRef, true);

                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.utils.isSameRef(documentServices.components.getContainer(compRef), focusedPageRef)).toBeTruthy();
                    done();
                });
            });

            it('should set comp fixed position false when reparenting to container that is not fixed', function (done) {
                var containerRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "CONTAINER"));
                var compRef = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
                documentServices.components.layout.updateFixedPosition(compRef, true);
                compRef = documentServices.components.add(containerRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.components.layout.isFixedPosition(compRef)).toBeFalsy();
                    done();
                });
            });
        });

        describe('updateAndAdjustLayout', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.updateAndAdjustLayout');
            });

            beforeEach(function (done) {
                generalUtils.cleanPage(documentServices, focusedPageRef);
                documentServices.waitForChangesApplied(done);
            });

            it('should update and adjust ', function (done) {
                var containerA = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        y: 0,
                        x: 0,
                        width: 500,
                        height: 100
                    }
                }));
                var containerB = documentServices.components.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        x: 0,
                        y: 150,
                        width: 500,
                        height: 100
                    }
                }));

                documentServices.components.layout.updateAndAdjustLayout(containerA, {y: 200});

                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.components.layout.get(containerB).y).toEqual(350);
                    done();
                });
            });
        });

        describe('Docked component', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.getDock');
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.setDock');
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.updateDock');
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.unDock');
            });


            it("should update left value of docked component", function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        "height": 100,
                        "y": 200,
                        "docked": {
                            left: {
                                px: 10
                            },
                            right: {
                                px: 20
                            }
                        }
                    }
                });

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.layout.update(containerRef, {x: 20});

                documentServices.waitForChangesApplied(function () {
                    var expectedX = 20;
                    var expectedRight = 10;

                    expect(documentServices.components.layout.getDock(containerRef).left.px).toEqual(expectedX);
                    expect(documentServices.components.layout.getDock(containerRef).right.px).toEqual(expectedRight);
                    done();
                });
            });

            it("should update top value of docked component", function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        "width": 100,
                        "height": 200,
                        "x": 20,
                        "docked": {
                            top: {
                                px: 10
                            }
                        },
                        "scale": 1.0,
                        "rotationInDegrees": 0,
                        "anchors": []
                    }
                });

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.layout.update(containerRef, {y: 20});

                documentServices.waitForChangesApplied(function () {
                    var expectedTop = 20;
                    expect(documentServices.components.layout.getDock(containerRef).top.px).toEqual(expectedTop);
                    done();
                });
            });

            it("should remove docked value from layout when undocking component", function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        "width": 100,
                        "height": 200,
                        "x": 20,
                        "docked": {
                            top: {
                                px: 10
                            }
                        }
                    }
                });

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.layout.unDock(containerRef);

                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.components.layout.getDock(containerRef)).not.toBeDefined();
                    done();
                });
            });

            it('should override docked value if using setDock', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        "height": 100,
                        "width": 200,
                        "y": 200,
                        "docked": {
                            left: {
                                px: 10
                            }
                        }
                    }
                });

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.layout.setDock(containerRef, {left: {pct: 20}});

                documentServices.waitForChangesApplied(function () {
                    var expectedLeftInPct = 20;

                    expect(documentServices.components.layout.getDock(containerRef).left.pct).toEqual(expectedLeftInPct);
                    done();
                });
            });

            it('should not override docked value if using updateDock', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                    layout: {
                        "height": 100,
                        "width": 200,
                        "y": 200,
                        "docked": {
                            left: {
                                px: 10
                            }
                        }
                    }
                });

                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.layout.updateDock(containerRef, {left: {pct: 20}});

                documentServices.waitForChangesApplied(function () {
                    var expectedLeftInPct = 20,
                        expectedLeftInPx = 10;

                    expect(documentServices.components.layout.getDock(containerRef).left.pct).toEqual(expectedLeftInPct);
                    expect(documentServices.components.layout.getDock(containerRef).left.px).toEqual(expectedLeftInPx);
                    done();
                });
            });
        });
    });
});
