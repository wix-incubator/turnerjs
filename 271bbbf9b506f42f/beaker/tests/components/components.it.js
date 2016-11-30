define(['lodash', 'santa-harness', 'componentUtils',
        'apiCoverageUtils', 'errorUtils', 'generalUtils'],
    function (_, santa, componentUtils, apiCoverageUtils, errorUtils, generalUtils) {
        'use strict';

        describe('components methods', function () {

            var documentServices;
            var document;
            var containerDef;
            var photoDef;
            var focusedPageRef;

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    document = harness.window.document;
                    console.log('Testing Component add spec');
                    done();
                });
            });

            beforeEach(function () {
                containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                photoDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
                focusedPageRef = documentServices.pages.getFocusedPage();
            });

            describe("add", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.add');
                });

                describe("Desktop", function () {

                    it("should add a component to a site's Page with the correct layout", function (done) {
                        var customId = "My-Container-ID";
                        var expectedDef = _.cloneDeep(containerDef);
                        var compPointer = documentServices.components.add(focusedPageRef, containerDef, customId);

                        documentServices.waitForChangesApplied(function () {
                            var compLayout = documentServices.components.layout.get(compPointer);

                            expect(containerDef).toEqual(expectedDef);
                            expect(compPointer).toBeDefined();
                            expect(compLayout.height).toBe(expectedDef.layout.height);
                            expect(compLayout.width).toBe(expectedDef.layout.width);
                            expect(compLayout.x).toBe(expectedDef.layout.y);
                            expect(compLayout.y).toBe(expectedDef.layout.x);
                            expect(compLayout.rotationInDegrees).toBe(expectedDef.layout.rotationInDegrees);

                            done();
                        });
                    });

                    it("should add a component to a container component contained in the page", function (done) {
                        var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                        var addedCompRef = documentServices.components.add(containerRef, containerDef);

                        documentServices.waitForChangesApplied(function () {
                            var addedCompNode = document.getElementById(addedCompRef.id);
                            expect(addedCompNode).toBeDefined();
                            expect(documentServices.components.getContainer(addedCompRef)).toEqual(containerRef);
                            done();
                        });
                    });

                    it("should add a component to the site's master Page", function (done) {
                        var headerPointer = documentServices.siteSegments.getHeader();
                        var addedComponentPointer = documentServices.components.add(headerPointer, containerDef);

                        documentServices.waitForChangesApplied(function () {
                            var componentInDOM = document.getElementById(addedComponentPointer.id);
                            expect(componentInDOM).toBeDefined();
                            expect(documentServices.components.getContainer(addedComponentPointer)).toEqual(headerPointer);
                            done();
                        });
                    });

                    it("should not be able to add a component to a non-existent page.", function (done) {
                        var nonExistingPageRef = _.cloneDeep(focusedPageRef);
                        nonExistingPageRef.id = 'myIdBlaBla';

                        errorUtils.waitForError(documentServices, function () {
                            var componentInDOM = document.getElementById(compRef.id);
                            expect(componentInDOM).toBeFalsy();
                            done();
                        }, 'non existing component pointer: type: DESKTOP id: myIdBlaBla');

                        var compRef = documentServices.components.add(nonExistingPageRef, containerDef);
                    });

                    it("should be able to add a component with custom Id", function (done) {
                        var customId = 'myCustomIdBlaBla';
                        documentServices.components.add(focusedPageRef, containerDef, customId);
                        documentServices.waitForChangesApplied(function () {
                            var componentInDOM = document.getElementById(customId);
                            expect(componentInDOM).toBeDefined();
                            done();
                        });
                    });

                    it('should add a component with customId and use it for data and stuff', function(done){
                        var customId = 'myCustomIdBlaBla';
                        var compRef = documentServices.components.add(focusedPageRef, photoDef, customId);
                        documentServices.waitForChangesApplied(function () {
                            var componentInDOM = document.getElementById(customId);
                            expect(componentInDOM).toBeDefined();
                            var data = documentServices.components.data.get(compRef);
                            var props = documentServices.components.properties.get(compRef);
                            var styleId = documentServices.components.style.getId(compRef);
                            expect(props.id).toBe(customId);
                            expect(data.id).toBe(customId);
                            expect(styleId).not.toBe(customId);
                            done();
                        });
                    });

                    //TODO: this test should pass.. we need validation on the customId
                    xit('should add a component with customId and use it for data and stuff', function(done){
                        var customId = 'myCustomIdBlaBla';
                        documentServices.components.add(focusedPageRef, photoDef, customId);
                        var compRef = documentServices.components.add(focusedPageRef, photoDef, customId);
                        documentServices.waitForChangesApplied(function () {
                            var componentInDOM = document.getElementById(customId);
                            expect(componentInDOM).toBeDefined();
                            var data = documentServices.components.data.get(compRef);
                            var props = documentServices.components.properties.get(compRef);
                            var styleId = documentServices.components.style.getId(compRef);
                            expect(props.id).toBe(customId);
                            expect(data.id).toBe(customId);
                            expect(styleId).not.toBe(customId);
                            done();
                        });
                    });


                    it("should not add a component to a component which is not a container", function (done) {
                        var notContainerDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
                        var notContainerCompRef = documentServices.components.add(focusedPageRef, notContainerDef);
                        var compRef = documentServices.components.add(notContainerCompRef, containerDef);

                        errorUtils.waitForError(documentServices, function() {
                            var componentInDOM = document.getElementById(compRef.id);
                            expect(componentInDOM).toBeFalsy();
                            done();
                        }, 'invalid container pointer');
                    });

                    it("should not add a component with a missing componentType", function (done) {
                        var invalidCompDef = _.cloneDeep(containerDef);
                        delete invalidCompDef.componentType;
                        var compRef = documentServices.components.add(focusedPageRef, invalidCompDef);

                        errorUtils.waitForError(documentServices, function () {
                            var componentInDOM = document.getElementById(compRef.id);
                            expect(componentInDOM).toBeFalsy();
                            done();
                        }, 'invalid component structure');
                    });
                });

                describe("Mobile", function () {

                    beforeAll(function (done) {
                        documentServices.viewMode.set('MOBILE');
                        documentServices.waitForChangesApplied(done);
                    });

                    it("should not allow to add a component to the mobile components of a page.", function (done) {
                        errorUtils.waitForError(documentServices, function(){
                            var componentInDOM = document.getElementById(compRef.id);
                            expect(componentInDOM).toBeFalsy();
                            done();
                        }, 'cannot add component to mobile path');
                        var compRef = documentServices.components.add(focusedPageRef, containerDef);
                    });

                    afterAll(function(done){
                        documentServices.viewMode.set('DESKTOP');
                        documentServices.waitForChangesApplied(done);
                    });
                });
            });

            describe('addWithConstraints', function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.addWithConstraints');
                });

                it('should add component to page', function (done) {
                    var definition = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                        layout: {
                            x: 0,
                            y: 10
                        }
                    });
                    var compRef = documentServices.components.addWithConstraints(focusedPageRef, definition, null);
                    documentServices.waitForChangesApplied(function () {
                        var layout = documentServices.components.layout.get(compRef);
                        expect(layout.y).toBe(10);
                        expect(layout.x).toBe(0);
                        var parent = documentServices.components.getContainer(compRef);
                        expect(parent.id).toBe(focusedPageRef.id);
                        done();
                    });
                });

                it('should add component to page under another component', function (done) {
                    var definition = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                        layout: {
                            x: 0,
                            y: 10,
                            height: 100
                        }
                    });
                    var firstCompRef = documentServices.components.addWithConstraints(focusedPageRef, definition, null);
                    var compRef = documentServices.components.addWithConstraints(focusedPageRef, definition, {
                        under: {
                            comp: firstCompRef,
                            margin: 20
                        }
                    });
                    documentServices.waitForChangesApplied(function () {
                        var layout = documentServices.components.layout.get(compRef);
                        expect(layout.y).toBe(130);
                        expect(layout.x).toBe(0);
                        var parent = documentServices.components.getContainer(compRef);
                        expect(parent.id).toBe(focusedPageRef.id);
                        done();
                    });
                });

                it('should add component under another component. this component should move when the other moves', function (done) {
                    var definition = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                        layout: {
                            x: 0,
                            y: 10,
                            height: 100
                        }
                    });
                    var firstCompRef = documentServices.components.addWithConstraints(focusedPageRef, definition, null);
                    var compRef = documentServices.components.addWithConstraints(focusedPageRef, definition, {
                        under: {
                            comp: firstCompRef,
                            margin: 20
                        }
                    });

                    documentServices.components.layout.updateAndAdjustLayout(firstCompRef, {height: 200});
                    documentServices.waitForChangesApplied(function () {
                        var layout = documentServices.components.layout.get(compRef);
                        expect(layout.y).toBe(230);
                        expect(layout.x).toBe(0);
                        done();
                    });
                });

                it('should add component under another component. this component should move when the other moves, wait in between', function (done) {
                    var definition = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                        layout: {
                            x: 0,
                            y: 10,
                            height: 100
                        }
                    });
                    var firstCompRef = documentServices.components.addWithConstraints(focusedPageRef, definition, null);
                    var compRef = documentServices.components.addWithConstraints(focusedPageRef, definition, {
                        under: {
                            comp: firstCompRef,
                            margin: 20
                        }
                    });
                    documentServices.waitForChangesApplied(function () {
                        var layout = documentServices.components.layout.get(compRef);
                        expect(layout.y).toBe(130);
                        documentServices.components.layout.updateAndAdjustLayout(firstCompRef, {height: 200});

                        documentServices.waitForChangesApplied(function () {
                            layout = documentServices.components.layout.get(compRef);
                            expect(layout.y).toBe(230);
                            done();
                        });

                    });
                });

                it('should add component to page with custom id', function (done) {
                    var definition = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                        layout: {
                            x: 0,
                            y: 10
                        }
                    });
                    var compRef = documentServices.components.addWithConstraints(focusedPageRef, definition, null, 'myComp');
                    expect(compRef.id).toBe('myComp');
                    documentServices.waitForChangesApplied(function () {
                        var comp = documentServices.components.get.byId('myComp');
                        expect(documentServices.components.is.exist(comp)).toBe(true);
                        done();
                    });
                });

                it('should throw if container is not page', function (done) {
                    var definition = componentUtils.getComponentDef(documentServices, "CONTAINER", {
                        layout: {
                            x: 0,
                            y: 10
                        }
                    });

                    var containerRef = documentServices.components.addWithConstraints(focusedPageRef, definition, null);
                    documentServices.waitForChangesApplied(function(){
                        errorUtils.waitForError(documentServices, done, 'this API works only for page parent for now');
                        documentServices.components.addWithConstraints(containerRef, definition, null);
                    });
                });

            });

            describe("duplicate", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.duplicate');
                });

                it("should duplicate component - take all the structure except id", function (done) {
                    var compPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var duplicateCompPointer = documentServices.components.duplicate(compPointer, focusedPageRef);
                    documentServices.waitForChangesApplied(function () {
                        var duplicateCompNode = document.getElementById(duplicateCompPointer.id);
                        expect(duplicateCompNode).toBeDefined();
                        var compStructure = documentServices.components.serialize(compPointer);
                        var duplicateCompStructure = documentServices.components.serialize(duplicateCompPointer);
                        var compStructureWithoutAnchors = _.cloneDeep(compStructure);
                        var duplicateCompWithoutAnchors = _.cloneDeep(duplicateCompStructure);
                        delete compStructureWithoutAnchors.layout.anchors;
                        delete duplicateCompWithoutAnchors.layout.anchors;
                        expect(compStructureWithoutAnchors).toEqual(duplicateCompWithoutAnchors);
                        done();
                    });
                });
            });

            describe("serialize", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.serialize');
                });

                it("should retun an object describing the component structure with active modes at the time of serialization", function (done) {
                    var compPointer = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.waitForChangesApplied(function () {
                        var compStructure = documentServices.components.serialize(compPointer);
                        var compStructureWithNoAnchors = _.cloneDeep(compStructure);
                        delete compStructureWithNoAnchors.layout.anchors;
                        expect(_.omit(compStructureWithNoAnchors, 'activeModes')).toEqual(containerDef);
                        expect(compStructureWithNoAnchors.activeModes).toBeDefined();
                        done();
                    });
                });
            });

            describe("remove component", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.remove');
                });

                it("remove should delete the component", function (done) {
                    var compPointer = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.waitForChangesApplied(function () {
                        var isExist = documentServices.components.is.exist(compPointer);
                        expect(isExist).toBeTruthy();
                        var addedCompNode = document.getElementById(compPointer.id);
                        expect(addedCompNode).toBeDefined();
                        documentServices.components.remove(compPointer);
                        documentServices.waitForChangesApplied(function () {
                            isExist = documentServices.components.is.exist(compPointer);
                            expect(isExist).toBeFalsy();
                            addedCompNode = document.getElementById(compPointer.id);
                            expect(addedCompNode).toBeNull();
                            done();
                        });
                    });
                });
            });

            describe("get Container", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.getContainer');
                });

                it("get container - should return direct parent - component directly under page", function (done) {
                    var compPointer = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getContainer(compPointer)).toEqual(focusedPageRef);
                        done();
                    });
                });

                it("get container - should return direct parent - component inside container", function (done) {
                    var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                    var addedCompRef = documentServices.components.add(containerRef, containerDef);

                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getContainer(addedCompRef)).toEqual(containerRef);
                        expect(documentServices.components.getContainer(containerRef)).toEqual(focusedPageRef);
                        done();
                    });
                });
            });

            describe("get Page", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.getPage');
                });

                it("getPage - should return component page - comp directly under page", function (done) {
                    var compPointer = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getPage(compPointer)).toEqual(focusedPageRef);
                        done();
                    });
                });

                it("getPage - should return component page - comp not directly under page", function (done) {
                    var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                    var addedCompRef = documentServices.components.add(containerRef, containerDef);

                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getPage(addedCompRef)).toEqual(focusedPageRef);
                        expect(documentServices.components.getPage(containerRef)).toEqual(focusedPageRef);
                        done();
                    });
                });
            });

            describe("get Type", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.getType');
                });

                it("getType - should return component type", function (done) {
                    var compPointer = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getType(compPointer)).toEqual(containerDef.componentType);
                        expect(documentServices.components.getType(focusedPageRef)).toEqual(documentServices.components.serialize(focusedPageRef).componentType);
                        done();
                    });
                });
            });

            describe("group components", function () {

                beforeEach(function (done) {
                    generalUtils.cleanPage(documentServices, focusedPageRef);
                    documentServices.waitForChangesApplied(done);
                });

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.groupComponents');
                });

                it("groupComponents - should group components - add new group and change the parent of the two components", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var buttonCompPointer = documentServices.components.add(focusedPageRef, photoDef);

                    documentServices.components.layout.update(containerCompPointer, {x: 400, y: 70, height: 150}, true);
                    documentServices.components.layout.update(buttonCompPointer, {x: 400, y: 250}, true);
                    var groupPointer = documentServices.components.groupComponents([containerCompPointer, buttonCompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getContainer(containerCompPointer)).toEqual(groupPointer);
                        expect(documentServices.components.getContainer(buttonCompPointer)).toEqual(groupPointer);

                        expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer, buttonCompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");
                        var groupLayout = documentServices.components.layout.get(groupPointer);
                        expect(groupLayout.x).toEqual(400);
                        expect(groupLayout.y).toEqual(70);
                        done();
                    });
                });

                it("groupComponents - for one component should not create group", function (done) {
                    var buttonCompPointer = documentServices.components.add(focusedPageRef, photoDef);
                    var groupPointer = documentServices.components.groupComponents([buttonCompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.is.exist(groupPointer)).toBeFalsy();
                        done();
                    });
                });


                it("groupComponents - if element in other group should not create new group", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var photo1CompPointer = documentServices.components.add(focusedPageRef, photoDef);
                    var photo2CompPointer = documentServices.components.add(focusedPageRef, photoDef);

                    var groupPointer = documentServices.components.groupComponents([containerCompPointer, photo1CompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.is.exist(groupPointer)).toBeTruthy();
                        expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer, photo1CompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");

                        var newGroupPointer = documentServices.components.groupComponents([containerCompPointer, photo2CompPointer]);
                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.components.is.exist(newGroupPointer)).toBeFalsy();
                            expect(documentServices.components.is.exist(groupPointer)).toBeTruthy();
                            done();
                        });
                    });
                });

                it("groupComponents - if we try to group another group should ungroup the old group and regroup all new component to new group", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var photo1CompPointer = documentServices.components.add(focusedPageRef, photoDef);
                    var photo2CompPointer = documentServices.components.add(focusedPageRef, photoDef);
                    var groupPointer = documentServices.components.groupComponents([containerCompPointer, photo1CompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.is.exist(groupPointer)).toBeTruthy();
                        expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer, photo1CompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");

                        var newGroupPointer = documentServices.components.groupComponents([groupPointer, photo2CompPointer]);
                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.components.is.exist(newGroupPointer)).toBeTruthy();
                            expect(documentServices.components.is.exist(groupPointer)).toBeFalsy();
                            expect(documentServices.components.getChildren(newGroupPointer)).toEqual([photo2CompPointer, containerCompPointer, photo1CompPointer]);
                            done();
                        });

                    });
                });


                it("group element - group of comp and the comp parent create group with one element", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var wphoto1CompPointer = documentServices.components.add(containerCompPointer, photoDef);

                    var groupPointer = documentServices.components.groupComponents([containerCompPointer, wphoto1CompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");
                        expect(documentServices.components.getContainer(containerCompPointer)).toEqual(groupPointer);
                        expect(documentServices.components.getContainer(wphoto1CompPointer)).toEqual(containerCompPointer);
                        done();
                    });
                });

            });

            describe("ungroup components", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.ungroup');
                });

                beforeEach(function (done) {
                    generalUtils.cleanPage(documentServices, focusedPageRef);
                    documentServices.waitForChangesApplied(done);
                });

                it("ungroup - should remove group container and set the components under group parent component - components directly under page", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var wphotoCompPointer = documentServices.components.add(focusedPageRef, photoDef);
                    var groupPointer = documentServices.components.groupComponents([containerCompPointer, wphotoCompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer, wphotoCompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");

                        documentServices.components.ungroup(groupPointer);
                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.components.is.exist(groupPointer)).toBeFalsy();
                            expect(documentServices.components.getContainer(wphotoCompPointer)).toEqual(focusedPageRef);
                            expect(documentServices.components.getContainer(containerCompPointer)).toEqual(focusedPageRef);
                            done();

                        });
                    });
                });

                it("ungroup - should remove group container and set the components under group parent component - components directly under container", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var wphoto1CompPointer = documentServices.components.add(containerCompPointer, photoDef);
                    var wphoto2CompPointer = documentServices.components.add(containerCompPointer, photoDef);
                    var groupPointer = documentServices.components.groupComponents([wphoto1CompPointer, wphoto2CompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getChildren(groupPointer)).toEqual([wphoto1CompPointer, wphoto2CompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");

                        documentServices.components.ungroup(groupPointer);
                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.components.is.exist(groupPointer)).toBeFalsy();
                            expect(documentServices.components.getContainer(wphoto1CompPointer)).toEqual(containerCompPointer);
                            expect(documentServices.components.getContainer(wphoto2CompPointer)).toEqual(containerCompPointer);
                            done();

                        });
                    });
                });
            });

            describe("addToGroup", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.addToGroup');
                });

                beforeEach(function (done) {
                    generalUtils.cleanPage(documentServices, focusedPageRef);
                    documentServices.waitForChangesApplied(done);
                });

                it("addToGroup - should add components to existing group", function (done) {
                    var containerCompPointer = documentServices.components.add(focusedPageRef, containerDef);
                    var wphoto1CompPointer = documentServices.components.add(focusedPageRef, photoDef);
                    var wphoto2CompPointer = documentServices.components.add(focusedPageRef, photoDef);

                    var groupPointer = documentServices.components.groupComponents([containerCompPointer, wphoto1CompPointer]);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer, wphoto1CompPointer]);
                        expect(documentServices.components.getType(groupPointer)).toEqual("wysiwyg.viewer.components.Group");

                        documentServices.components.addToGroup([wphoto2CompPointer], groupPointer);
                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.components.is.exist(groupPointer)).toBeTruthy();
                            expect(documentServices.components.getChildren(groupPointer)).toEqual([containerCompPointer, wphoto1CompPointer, wphoto2CompPointer]);
                            done();

                        });
                    });
                });

            });
        });
    });
