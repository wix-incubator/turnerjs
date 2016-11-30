define(['lodash', 'santa-harness', 'componentUtils', 'errorUtils', 'apiCoverageUtils', 'generalUtils'], function (_, santa, componentUtils, errorUtils, apiCoverageUtils, generalUtils) {
    'use strict';

    describe("Document Services - Component - Skin", function () {

        var documentServices;
        var compReference;
        var focusedPageRef;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing Skin spec');
                done();
            });
        });

        describe('get', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.skin.get');
            });

            it("should return the skin name set in the style", function () {
                var photoDef = componentUtils.getComponentDef(documentServices, 'WPHOTO');
                compReference = documentServices.components.add(focusedPageRef, photoDef);
                documentServices.waitForChangesApplied(function () {
                    var originalStyle = documentServices.theme.styles.get(photoDef.styleId);
                    var skinReturnedFromDS = documentServices.components.skin.get(compReference);
                    expect(skinReturnedFromDS).toEqual(originalStyle.skin);
                });
            });
        });

        describe('set', function () {

            beforeEach(function (done) {
                var photoDef = componentUtils.getComponentDef(documentServices, 'WPHOTO');
                compReference = documentServices.components.add(focusedPageRef, photoDef);
                documentServices.waitForChangesApplied(done);
            });

            afterEach(function () {
                generalUtils.cleanPage(documentServices, focusedPageRef);
            });

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.skin.set');
            });

            //TODO: decide if there is a way to make a successful documentServices.components.skin.set, if not, why this function exists at all
            // there is no way to change skin for component with style (logically)
            // there is no way to change skin for component with no style (fail on validation)
            xit("should successfully set the component's skin", function (done) {
                var validSkinName = 'wysiwyg.viewer.skins.photo.CirclePhoto';
                var photoDef = componentUtils.getComponentDef(documentServices, 'WPHOTO');
                var photoDefNoStyle = _.omit(photoDef, 'styleId');
                compReference = documentServices.components.add(focusedPageRef, photoDefNoStyle);
                documentServices.components.skin.set(compReference, validSkinName);
                documentServices.waitForChangesApplied(function () {
                    var resultSkinName = documentServices.components.skin.get(compReference);
                    expect(resultSkinName).toEqual(validSkinName);
                    done();
                });
            });

            it("should fail to set the component's skin when a style already exists", function (done) {
                var originalSkinName = documentServices.components.skin.get(compReference);
                var newValidSkinName = 'wysiwyg.viewer.skins.photo.CirclePhoto';

                errorUtils.waitForError(documentServices, function () {
                    var resultSkinName = documentServices.components.skin.get(compReference);
                    expect(resultSkinName).toEqual(originalSkinName);
                    done();
                }, 'skin cannot be set if style already exists');

                documentServices.components.skin.set(compReference, newValidSkinName);
            });


            function testFailOnInvalidSkinName(skinName, done) {
                var originalSkinName = documentServices.components.skin.get(compReference);

                errorUtils.waitForError(documentServices, function () {
                    var resultSkinName = documentServices.components.skin.get(compReference);
                    expect(resultSkinName).toEqual(originalSkinName);
                    done();
                }, 'skin name param must be a string');

                documentServices.components.skin.set(compReference, skinName);
            }

            it("should fail to set the component's skin when providing invalid skin param {}", function (done) {
                testFailOnInvalidSkinName({}, done);
            });
            it("should fail to set the component's skin when providing invalid skin param []", function (done) {
                testFailOnInvalidSkinName([], done);
            });
            it("should fail to set the component's skin when providing invalid skin param true", function (done) {
                testFailOnInvalidSkinName(true, done);
            });
            it("should fail to set the component's skin when providing invalid skin param false", function (done) {
                testFailOnInvalidSkinName(false, done);
            });
            it("should fail to set the component's skin when providing invalid skin param NaN", function (done) {
                testFailOnInvalidSkinName(NaN, done);
            });
            it("should fail to set the component's skin when providing invalid skin param 4", function (done) {
                testFailOnInvalidSkinName(4, done);
            });
        });

        it("should fail to set a new skin when providing a non-existent component", function (done) {
            var newValidSkinName = 'wysiwyg.viewer.skins.photo.CirclePhoto';
            var nonExistingCompRef = {id: 'fakeId', pageId: documentServices.pages.getFocusedPageId()};
            errorUtils.waitForError(documentServices, done);
            documentServices.components.skin.set(nonExistingCompRef, newValidSkinName);
        });
    });
});
