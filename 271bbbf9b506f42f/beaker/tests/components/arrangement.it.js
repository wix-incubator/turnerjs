define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils', 'generalUtils'], function (_, santa, componentUtils, apiCoverageUtils, generalUtils) {
    "use strict";

    describe('Document Services - Component API - Arrangements', function () {

        var picsRefArr = [];
        var componentServices;
        var focusedPageRef;
        var documentServices;

         function createFivePictures(containerRef, pictureDef) {
            var numberOfPhotos = 5;
            var i;
            var refArr = [];
            for (i = 0; i < numberOfPhotos; i++) {
                refArr.push(componentServices.add(containerRef, pictureDef));
                pictureDef.layout.x += 200;
                pictureDef.layout.y += 120;
            }
            return refArr;
        }

        function createFivePicturesInContainer() {
            var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
            var pictureDef = componentUtils.getComponentDef(documentServices, "WPHOTO");
            var containerRef = componentServices.add(focusedPageRef, containerDef);
            picsRefArr = createFivePictures(containerRef, pictureDef);
        }

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                componentServices = documentServices.components;
                console.log('Testing Arrangement spec');
                done();
            });
        });

        beforeEach(function(done){
            createFivePicturesInContainer();
            documentServices.waitForChangesApplied(done);
        });

        afterEach(function(done){
            generalUtils.cleanPage(documentServices, focusedPageRef);
            documentServices.waitForChangesApplied(done);
        });


        function testIfComponentTheMostBackwarded(component){
            expect(componentServices.arrangement.canMoveBackward(component)).toBeFalsy();
            expect(componentServices.arrangement.canMoveForward(component)).toBeTruthy();
        }

        function testIfComponentTheMostForwarded(component){
            expect(componentServices.arrangement.canMoveBackward(component)).toBeTruthy();
            expect(componentServices.arrangement.canMoveForward(component)).toBeFalsy();
        }


        function testIfComponentIsInTheMiddle(component){
            expect(componentServices.arrangement.canMoveBackward(component)).toBeTruthy();
            expect(componentServices.arrangement.canMoveForward(component)).toBeTruthy();
        }

        function testIfComponentIsOnlyComponentInTheContainer(component){
            expect(componentServices.arrangement.canMoveBackward(component)).toBeFalsy();
            expect(componentServices.arrangement.canMoveForward(component)).toBeFalsy();
        }

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.arrangement.moveToBack');
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.arrangement.moveToFront');
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.arrangement.canMoveForward');
            apiCoverageUtils.checkFunctionAsTested('documentServices.components.arrangement.canMoveBackward');
        });

        it('should check that most upper component cannot be moved forward, but can be moved backward', function () {
            testIfComponentTheMostForwarded(picsRefArr[4]);
        });

        it('should check that most lower component cannot be moved backward, but can be moved forward', function () {
            testIfComponentTheMostBackwarded(picsRefArr[0]);
        });

        it('should check that middle component can be moved backward and forward', function () {
            testIfComponentIsInTheMiddle(picsRefArr[2]);
        });

        it('should check that penultimate component, that was moved forward became most forwarded component', function (done) {
            componentServices.arrangement.moveForward(picsRefArr[3]);
            documentServices.waitForChangesApplied(function () {
                testIfComponentTheMostForwarded(picsRefArr[3]);
                done();
            });
        });

        it('should check that second component, that was moved backward became first component', function (done) {
            componentServices.arrangement.moveBackward(picsRefArr[1]);
            documentServices.waitForChangesApplied(function () {
                testIfComponentTheMostBackwarded(picsRefArr[1]);
                done();
            });
        });

        it('should check that component was moved to front', function (done) {
            componentServices.arrangement.moveToFront(picsRefArr[0]);
            documentServices.waitForChangesApplied(function () {
                testIfComponentTheMostForwarded(picsRefArr[0]);
                done();
            });
        });

        it('should check that component was moved to back', function (done) {
            componentServices.arrangement.moveToBack(picsRefArr[0]);
            documentServices.waitForChangesApplied(function () {
                testIfComponentTheMostBackwarded(picsRefArr[0]);
                done();
            });
        });

        it('should check that component that was moved to other container becomes most forwarded component', function (done) {
            componentServices.setContainer(picsRefArr[0], focusedPageRef);
            documentServices.waitForChangesApplied(function () {
                testIfComponentTheMostForwarded(picsRefArr[0]);
                done();
            });
        });

        it('should check that component was left alone and cannot be moved at all', function (done) {
            componentServices.remove(picsRefArr[3]);
            componentServices.remove(picsRefArr[2]);
            componentServices.remove(picsRefArr[1]);
            componentServices.remove(picsRefArr[0]);
            documentServices.waitForChangesApplied(function () {
                testIfComponentIsOnlyComponentInTheContainer(picsRefArr[4]);
                done();
            });
        });
    });
});
