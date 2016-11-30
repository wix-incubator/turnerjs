define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils', 'generalUtils'], function (_, santa, componentUtils, apiCoverageUtils, generalUtils) {
    'use strict';

    describe("Document Services - Component API", function () {

        var focusedPageRef;
        var componentServices;
        var documentServices;
        var pictureDef, containerDef, expectedPictureDef;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                componentServices = documentServices.components;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing set Container spec');
                done();
            });
        });

        beforeEach(function (done) {
            pictureDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
            expectedPictureDef = _.cloneDeep(pictureDef);
            containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
            generalUtils.cleanPage(documentServices, focusedPageRef);
            documentServices.waitForChangesApplied(done);
        });

        describe("setContainer", function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.setContainer');
            });

            function checkComp(comp) {
                var compStyleId = componentServices.style.getId(comp);
                expect(compStyleId).toBe('wp3');
                var data = componentServices.data.get(comp);
                expect(data.uri).toBe(expectedPictureDef.data.uri);
                var properties = componentServices.properties.get(comp);
                expect(properties).toBeDefined();
            }

            it("should find the component after it was moved to a container", function (done) {
                var containerRef = componentServices.add(focusedPageRef, containerDef);
                var pictureRef = documentServices.components.add(focusedPageRef, pictureDef);
                componentServices.setContainer(pictureRef, containerRef);
                documentServices.waitForChangesApplied(function () {
                    checkComp(pictureRef);
                    done();
                });
            });

            it("should find the component and it's data after it was moved to a different page", function (done) {
                var pictureRef = documentServices.components.add(focusedPageRef, pictureDef);
                var newPage = documentServices.pages.add('newPage');
                componentServices.setContainer(pictureRef, newPage);
                documentServices.waitForChangesApplied(function () {
                    checkComp(pictureRef);
                    done();
                });
            });

            it("should find the component and it's data after it was moved to master page", function (done) {
                var pictureRef = documentServices.components.add(focusedPageRef, pictureDef);
                var pagesContainer = documentServices.siteSegments.getPagesContainer();
                componentServices.setContainer(pictureRef, pagesContainer);
                documentServices.waitForChangesApplied(function () {
                    checkComp(pictureRef);
                    done();
                });
            });


            it('should check that component that was set as shown on all pages became first component', function (done) {
                var containerRef = componentServices.add(focusedPageRef, containerDef);
                var wphotoRef = documentServices.components.add(containerRef, pictureDef);

                componentServices.setContainer(wphotoRef, focusedPageRef);
                documentServices.waitForChangesApplied(function () {
                    expect(componentServices.arrangement.canMoveForward(wphotoRef)).toBeFalsy();
                    expect(componentServices.arrangement.canMoveBackward(wphotoRef)).toBeTruthy();
                    done();
                });
            });

            it('should set component inside container that inside other container', function (done) {
                var containerRef = componentServices.add(focusedPageRef, containerDef);
                var innerContainerRef = componentServices.add(containerRef, containerDef);
                var wphotoRef = documentServices.components.add(containerRef, pictureDef);

                componentServices.setContainer(wphotoRef, innerContainerRef);
                documentServices.waitForChangesApplied(function () {
                    var refArr = componentServices.getChildren(containerRef);
                    expect(refArr.length).toEqual(1);
                    refArr = componentServices.getChildren(innerContainerRef);
                    expect(refArr.length).toEqual(1);
                    done();
                });
            });

            it("should set component inside container that inside other container and then set component to be shown on all pages", function (done) {
                var containerRef = componentServices.add(focusedPageRef, containerDef);
                var newContainerReference = componentServices.add(containerRef, containerDef);
                var wphotoRef = documentServices.components.add(containerRef, pictureDef);
                componentServices.setContainer(wphotoRef, newContainerReference);
                componentServices.setContainer(wphotoRef, focusedPageRef);
                documentServices.waitForChangesApplied(function () {
                    var refArr = componentServices.getChildren(newContainerReference);
                    expect(refArr.length).toEqual(0);
                    expect(componentServices.arrangement.canMoveForward(wphotoRef)).toBeFalsy();
                    expect(componentServices.arrangement.canMoveBackward(wphotoRef)).toBeTruthy();
                    done();
                });
            });

            it('Should update picture layout to be relative to the new container', function (done) {
                var containerRef = componentServices.add(focusedPageRef, containerDef);
                var wphotoRef = documentServices.components.add(focusedPageRef, pictureDef);
                documentServices.waitForChangesApplied(function () {
                    var containerLayout = componentServices.layout.get(containerRef);
                    var oldCompLayout = componentServices.layout.get(wphotoRef);
                    var expectedLayout = {
                        x: oldCompLayout.x - containerLayout.x,
                        y: oldCompLayout.y - containerLayout.y
                    };
                    componentServices.setContainer(wphotoRef, containerRef);
                    documentServices.waitForChangesApplied(function () {
                        var newCompLayout = componentServices.layout.get(wphotoRef);
                        expect(newCompLayout.x).toEqual(expectedLayout.x);
                        expect(newCompLayout.y).toEqual(expectedLayout.y);
                        done();
                    });
                });
            });

            it('should set picture inside container that inside other container and then update picture layout to be relative to the new container', function (done) {
                var containerRef = componentServices.add(focusedPageRef, containerDef);
                var innerContainerRef = componentServices.add(containerRef, containerDef);
                var wphotoRef = documentServices.components.add(focusedPageRef, pictureDef);
                var expectedLayout;
                documentServices.waitForChangesApplied(function () {
                    var oldCompLayout = componentServices.layout.get(wphotoRef);
                    var containerLayout = componentServices.layout.get(containerRef);
                    var newContainerLayout = componentServices.layout.get(innerContainerRef);
                    expectedLayout = {
                        x: oldCompLayout.x - containerLayout.x - newContainerLayout.x,
                        y: oldCompLayout.y - containerLayout.y - newContainerLayout.y
                    };
                }, true);

                componentServices.setContainer(wphotoRef, innerContainerRef);
                documentServices.waitForChangesApplied(function () {
                    var newCompLayout = componentServices.layout.get(wphotoRef);
                    expect(newCompLayout.x).toEqual(expectedLayout.x);
                    expect(newCompLayout.y).toEqual(expectedLayout.y);
                    done();
                });
            });
        });

    });
});

