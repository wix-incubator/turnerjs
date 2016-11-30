define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils', 'generalUtils'], function (_, santa, componentUtils, apiCoverageUtils, generalUtils) {

    'use strict';

    describe('Document Services - Component - Is Metadata', function () {

        var documentServices;
        var wphotoRef, vkShareRef, lineRef, fullLineRef, containerRef, focusedPageRef, popupRef;

        function addCompsToPage() {
            var photoDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
            wphotoRef = documentServices.components.add(focusedPageRef, photoDef);

            var vkShareDef = componentUtils.getComponentDef(documentServices, "VKSHARE");
            vkShareRef = documentServices.components.add(focusedPageRef, vkShareDef);

            var lineDef = componentUtils.getComponentDef(documentServices, "LINE");
            lineRef = documentServices.components.add(focusedPageRef, lineDef);

            var fullLineDef = componentUtils.getComponentDef(documentServices, "LINE", {
                props: {
                    fullScreenModeOn: true
                }
            });
            fullLineRef = documentServices.components.add(focusedPageRef, fullLineDef);

            var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
            containerRef = documentServices.components.add(focusedPageRef, containerDef);

            var popupDef = componentUtils.getComponentDef(documentServices, "POPUP");
            popupRef = documentServices.components.add(focusedPageRef, popupDef);
        }

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing Is Metadata spec');
                done();
            });
        });

        beforeEach(function (done) {
            generalUtils.cleanPage(documentServices, focusedPageRef);
            addCompsToPage();
            documentServices.waitForChangesApplied(done);
        });

        describe("exist", function () {
            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.exist');
            });

            it("VkShare --> component exist should be true", function () {
                var isExist = documentServices.components.is.exist(vkShareRef);
                expect(isExist).toBe(true);
            });

            it("Dummy component --> component exist should be false", function () {
                var dummyRef = _.assign({}, vkShareRef, {id: "dummy-value"});
                var isExist = documentServices.components.is.exist(dummyRef);
                expect(isExist).toBe(false);
            });

            it("Remove WPhoto component --> component exist should be false", function (done) {
                documentServices.components.remove(wphotoRef);
                documentServices.waitForChangesApplied(function () {
                    var isExist = documentServices.components.is.exist(wphotoRef);
                    expect(isExist).toBe(false);

                    // Restore the component
                    var photoDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
                    wphotoRef = documentServices.components.add(focusedPageRef, photoDef);
                    documentServices.waitForChangesApplied(done);
                });
            });
        });

        describe("removable", function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.removable');
            });

            it("WPhoto --> component removable should be true", function () {
                var isRemovable = documentServices.components.is.removable(wphotoRef);
                expect(isRemovable).toBe(true);
            });

            it("Current page --> component removable should be false", function () {
                var pageRef = documentServices.pages.getCurrentPage();
                var isRemovable = documentServices.components.is.removable(pageRef);
                expect(isRemovable).toBe(false);
            });
        });

        describe("duplicatable", function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.duplicatable');
            });

            it("WPhoto --> component duplicatable should be true", function () {
                var isDuplicatable = documentServices.components.is.duplicatable(wphotoRef);
                expect(isDuplicatable).toBe(true);
            });

            it("Current page --> component duplicatable should be false", function () {
                var pageRef = documentServices.pages.getCurrentPage();
                var isDuplicatable = documentServices.components.is.duplicatable(pageRef);
                expect(isDuplicatable).toBe(false);
            });
        });

        describe("topMost", function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.topMost');
            });

            beforeEach(function (done) {
                generalUtils.cleanPage(documentServices, focusedPageRef);
                var photoDef = componentUtils.getComponentDef(documentServices, "WPHOTO", {layout: {y: 0}});
                wphotoRef = documentServices.components.add(focusedPageRef, photoDef);

                var vkShareDef = componentUtils.getComponentDef(documentServices, "VKSHARE", {layout: {y: 0}});
                vkShareRef = documentServices.components.add(focusedPageRef, vkShareDef);
                documentServices.waitForChangesApplied(done);
            });

            it("null --> non-component topMost should be false", function () {
                var isTopMost = documentServices.components.is.topMost(null);
                expect(isTopMost).toBe(false);
            });

            it("WPhoto and vkShareRef --> for both opMost should be true because they have same y (0)", function () {
                var isTopMost = documentServices.components.is.topMost(wphotoRef);
                expect(isTopMost).toBe(true);
                isTopMost = documentServices.components.is.topMost(vkShareRef);
                expect(isTopMost).toBe(true);
            });

            it("For component with negative y topMost should be true", function (done) {
                var photoDef2 = componentUtils.getComponentDef(documentServices, "WPHOTO", {layout: {y: -7}});
                var wphotoRef2 = documentServices.components.add(focusedPageRef, photoDef2);

                documentServices.waitForChangesApplied(function () {
                    var isTopMost = documentServices.components.is.topMost(wphotoRef2);
                    expect(isTopMost).toBe(true);
                    isTopMost = documentServices.components.is.topMost(vkShareRef);
                    expect(isTopMost).toBe(false);

                    documentServices.components.remove(wphotoRef2);
                    documentServices.waitForChangesApplied(done);
                });
            });
        });

         describe("leftMost", function () {
             afterAll(function(){
                 apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.leftMost');
             });

             beforeEach(function (done) {
                 generalUtils.cleanPage(documentServices, focusedPageRef);
                 var photoDef = componentUtils.getComponentDef(documentServices, "WPHOTO", {layout: {x: 0}});
                 wphotoRef = documentServices.components.add(focusedPageRef, photoDef);

                 var vkShareDef = componentUtils.getComponentDef(documentServices, "VKSHARE", {layout: {x: 0}});
                 vkShareRef = documentServices.components.add(focusedPageRef, vkShareDef);

                 documentServices.waitForChangesApplied(done);
             });

            it("null --> non-component leftMost should be false", function () {
                var isLeftMost = documentServices.components.is.leftMost(null);
                expect(isLeftMost).toBe(false);
            });

            it("WPhoto and vkShareRef --> for both leftMost should be true because they have same x (0)", function () {
                var isLeftMost = documentServices.components.is.leftMost(wphotoRef);
                expect(isLeftMost).toBe(true);
                isLeftMost = documentServices.components.is.leftMost(vkShareRef);
                expect(isLeftMost).toBe(true);
            });

            it("For component with negative y topMost should be true", function (done) {
                var photoDef2 = componentUtils.getComponentDef(documentServices, "WPHOTO", {layout: {x: -7}});
                var wphotoRef2 = documentServices.components.add(focusedPageRef, photoDef2);

                documentServices.waitForChangesApplied(function () {
                    var isLeftMost = documentServices.components.is.leftMost(wphotoRef2);
                    expect(isLeftMost).toBe(true);
                    isLeftMost = documentServices.components.is.leftMost(vkShareRef);
                    expect(isLeftMost).toBe(false);
                    done();
                });
            });
        });

        describe("rotatable", function () {
            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.rotatable');
            });

            it("VkShare - return Rotatable default value --> component rotatable should be false", function () {
                var isRotatable = documentServices.components.is.rotatable(vkShareRef);
                expect(isRotatable).toBe(false);
            });

            it("WPhoto - override rotatable default value --> component rotatable should be true", function () {
                var isRotatable = documentServices.components.is.rotatable(wphotoRef);
                expect(isRotatable).toBe(true);
            });
        });

        describe("Resizable Functions", function () {

            describe("verticallyResizable", function () {

                afterAll(function(){
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.verticallyResizable');
                });

                it("WPhoto - resizable default value --> vertically resizable should be true", function () {
                    var isVerticallyResizable = documentServices.components.is.verticallyResizable(wphotoRef);
                    expect(isVerticallyResizable).toBe(true);
                });

                it("VkShare - override resizable to false--> vertically resizable should be false", function () {
                    var isVerticallyResizable = documentServices.components.is.verticallyResizable(vkShareRef);
                    expect(isVerticallyResizable).toBe(false);
                });

                it("line - override  vertically resizable to false--> vertically resizable should be false", function () {
                    var isVerticallyResizable = documentServices.components.is.verticallyResizable(lineRef);
                    expect(isVerticallyResizable).toBe(false);
                });
            });

            describe("horizontallyResizable", function () {
                afterAll(function(){
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.horizontallyResizable');
                });

                it("WPhoto -resizable default value --> horizontally resizable should be true", function () {
                    var isHorizontallyResizable = documentServices.components.is.horizontallyResizable(wphotoRef);
                    expect(isHorizontallyResizable).toBe(true);
                });

                it("VkShare - override resizable to false--> horizontally resizable should be false", function () {
                    var isHorizontallyResizable = documentServices.components.is.horizontallyResizable(vkShareRef);
                    expect(isHorizontallyResizable).toBe(false);
                });

                it("lineUpdate - override vertically resizable to false--> horizontally resizable should be true", function () {
                    var isHorizontallyResizable = documentServices.components.is.horizontallyResizable(lineRef);
                    expect(isHorizontallyResizable).toBe(true);
                });
            });

            describe("resizable", function () {

                afterAll(function(){
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.resizable');
                });

                it("WPhoto - gets resizeable default value --> resizable should be true", function () {
                    var isResizable = documentServices.components.is.resizable(wphotoRef);
                    expect(isResizable).toBe(true);
                });

                it("VkShare - override  resizable to false-->  resizable should be false", function () {
                    var isResizable = documentServices.components.is.resizable(vkShareRef);
                    expect(isResizable).toBe(false);
                });

                it("line - override  vertically resizable to false--> resizable should be true", function () {
                    var isResizable = documentServices.components.is.resizable(lineRef);
                    expect(isResizable).toBe(true);
                });

            });

            describe("getResizeableSides - should move to layout", function () {

                afterAll(function(){
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.layout.getResizableSides');
                });

                it("WPhoto - resizable sides default value --> comp should receive all resizable sides", function () {
                    var resizableSides = documentServices.components.layout.getResizableSides(wphotoRef);
                    expect(resizableSides).toEqual(['RESIZE_TOP', 'RESIZE_LEFT', 'RESIZE_BOTTOM', 'RESIZE_RIGHT']);
                });

                it("VKShare - resizable sides are overwritten --> comp shouldn't have resizable sides", function () {
                    var resizableSides = documentServices.components.layout.getResizableSides(vkShareRef);
                    expect(resizableSides).toEqual([]);
                });
                it("line - vertical resizable sides are overwritten --> comp should have only horizontal resizable sides", function () {
                    var resizableSides = documentServices.components.layout.getResizableSides(lineRef);
                    expect(resizableSides).toEqual(['RESIZE_LEFT', 'RESIZE_RIGHT']);
                });
            });
        });


        describe("move functions", function () {
            describe("movable", function () {

                afterAll(function(){
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.movable');
                });

                it("line - gets movable default value --> comp movable should be true", function () {
                    var isMovable = documentServices.components.is.movable(lineRef);
                    expect(isMovable).toBe(true);
                });
                it("fullLine - override horizontal movable --> comp movable should be true", function () {
                    var isMovable = documentServices.components.is.movable(fullLineRef);
                    expect(isMovable).toBe(true);
                });
            });

            describe("horizontallyMovable", function () {
                it("fullLine - override horizontal movable --> comp horizontally movable should be false", function () {
                    var isHorizontallyMovable = documentServices.components.is.horizontallyMovable(fullLineRef);
                    expect(isHorizontallyMovable).toBe(false);
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.horizontallyMovable');
                });
            });

            describe("verticallyMovable", function () {
                it("fullLine - override horizontal movable --> comp vertical movable should be true", function () {
                    var isVerticallyMovable = documentServices.components.is.verticallyMovable(fullLineRef);
                    expect(isVerticallyMovable).toBe(true);
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.verticallyMovable');
                });
            });
        });

        describe("container", function () {
            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.container');
            });

            it("Wphoto - isContainer--> comp containable value should be false", function () {
                var isContainer = documentServices.components.is.container(wphotoRef);
                expect(isContainer).toBe(false);
            });

            it("container - isContainer--> comp containable value should be true", function () {
                var isContainer = documentServices.components.is.container(containerRef);
                expect(isContainer).toBe(true);
            });
        });

        describe('fullWidth', function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.fullWidth');
            });

            it("fullLine --> component fullWidth should be true", function () {
                var isFullWidth = documentServices.components.is.fullWidth(fullLineRef);
                expect(isFullWidth).toBe(true);
            });

            it("WPhoto --> component fullWidth should be false", function () {
                var isFullWidth = documentServices.components.is.fullWidth(wphotoRef);
                expect(isFullWidth).toBe(false);
            });
        });

        describe('animatable', function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.animatable');
            });

            it("WPhoto --> component animatable should be true", function () {
                var isAnimatable = documentServices.components.is.animatable(wphotoRef);
                expect(isAnimatable).toBe(true);
            });

            it("vkShare --> component animatable should be false", function () {
                var isAnimatable = documentServices.components.is.animatable(vkShareRef);
                expect(isAnimatable).toBe(false);
            });
        });

        describe('hiddenable', function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.hiddenable');
            });

            it("WPhoto --> component hiddenable should be true", function () {
                var isHiddenable = documentServices.components.is.hiddenable(wphotoRef);
                expect(isHiddenable).toBe(true);
            });

            it("PopUp --> component hiddenable should be false", function () {
                var isHiddenable = documentServices.components.is.hiddenable(popupRef);
                expect(isHiddenable).toBe(false);
            });
        });

        describe('alignable', function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.alignable');
            });

            it("WPhoto --> component alignable should be true", function () {
                var isAlignable = documentServices.components.is.alignable(wphotoRef);
                expect(isAlignable).toBe(true);
            });

            it("PopUp --> component alignable should be false", function () {
                var isAlignable = documentServices.components.is.alignable(popupRef);
                expect(isAlignable).toBe(false);
            });
        });

        describe('groupable', function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.groupable');
            });

            it("container --> component groupable should be true", function () {
                var isGroupable = documentServices.components.is.groupable(containerRef);
                expect(isGroupable).toBe(true);
            });

            it("PopUp --> component groupable should be false", function () {
                var isGroupable = documentServices.components.is.groupable(popupRef);
                expect(isGroupable).toBe(false);
            });
        });

        describe('styleCanBeApplied', function () {

            afterAll(function(){
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.is.styleCanBeApplied');
            });

            it("WPhoto --> component styleCanBeApplied should be true", function () {
                var styleCanBeApplied = documentServices.components.is.styleCanBeApplied(wphotoRef);
                expect(styleCanBeApplied).toBe(true);
            });

            it("vkShare --> component styleCanBeApplied should be false", function () {
                var styleCanBeApplied = documentServices.components.is.styleCanBeApplied(vkShareRef);
                expect(styleCanBeApplied).toBe(false);
            });
        });

    });

});
