define(['lodash', 'santa-harness', 'apiCoverageUtils', 'componentUtils'], function(_, santa, apiCoverageUtils, componentUtils){
    'use strict';
    describe('components getters', function(){
        var documentServices;


        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                done();
            });
        });

        describe('getAllComponents', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.getAllComponents');
            });

            describe('desktop', function () {
                var focusedPageRef;
                beforeEach(function () {
                    focusedPageRef = documentServices.pages.getFocusedPage();
                });

                it("should get all site components", function (done) {
                    var allCompsPointer = documentServices.components.getAllComponents();
                    var numberOfComps = allCompsPointer.length;

                    var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                    documentServices.components.add(focusedPageRef, containerDef);

                    documentServices.waitForChangesApplied(function () {

                        allCompsPointer = documentServices.components.getAllComponents();
                        expect(allCompsPointer.length).toBe(numberOfComps + 1);
                        done();
                    });

                });
            });
        });

        describe('getChildren', function(){
            var focusedPageRef;
            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.getChildren');
            });
            beforeEach(function () {
                focusedPageRef = documentServices.pages.getFocusedPage();
            });

            it('should return empty array if no children', function(done){
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.waitForChangesApplied(function(){
                    expect(documentServices.components.getChildren(containerRef)).toEqual([]);
                    done();
                });
            });

            it('should return only direct children if second arg is falsy', function(done){
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.add(containerRef, containerDef);
                var childContainer = documentServices.components.add(containerRef, containerDef);
                documentServices.components.add(childContainer, containerDef);

                documentServices.waitForChangesApplied(function(){
                    var children = documentServices.components.getChildren(containerRef);
                    expect(children.length).toBe(2);
                    done();
                });
            });

            it('should return children recursively if second arg is true', function(done){
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                var containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.components.add(containerRef, containerDef);
                var childContainer = documentServices.components.add(containerRef, containerDef);

                documentServices.components.add(childContainer, containerDef);
                var imageDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
                documentServices.components.add(childContainer, imageDef);

                documentServices.waitForChangesApplied(function(){
                    var children = documentServices.components.getChildren(containerRef, true);
                    expect(children.length).toBe(4);
                    done();
                });
            });
        });

        describe('getSiblings', function(){
            var containerDef;
            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.getSiblings');
            });
            beforeEach(function (done) {
                var focusedPageRef = documentServices.pages.getFocusedPage();
                containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                this.containerRef = documentServices.components.add(focusedPageRef, containerDef);
                documentServices.waitForChangesApplied(done);
            });

            it('should return empty array if no siblings', function(done){
                var containerRef = documentServices.components.add(this.containerRef, containerDef);
                documentServices.waitForChangesApplied(function(){
                    expect(documentServices.components.getSiblings(containerRef)).toEqual([]);
                    done();
                });
            });

            it("should return the component siblings", function(done){
                var containerRef = documentServices.components.add(this.containerRef, containerDef);
                documentServices.components.add(this.containerRef, containerDef);
                documentServices.components.add(this.containerRef, containerDef);
                documentServices.components.add(this.containerRef, containerDef);
                documentServices.waitForChangesApplied(function(){
                    var siblings = documentServices.components.getSiblings(containerRef);
                    expect(siblings.length).toBe(3);
                    done();
                });
            });
        });
    });
});