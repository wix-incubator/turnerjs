define(['santa-harness', 'errorUtils', 'apiCoverageUtils'], function(santa, errorUtils, apiCoverageUtils) {
    'use strict';

    describe("Document Services - HomePage", function () {

        var documentServices;

        beforeEach(function(done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing homePage spec');
                done();
            });
        });

        describe('get', function() {

            afterAll(function() {
                apiCoverageUtils.checkFunctionAsTested('documentServices.homePage.get');
            });

            it('should get the home page id', function() {
                var homePageId = documentServices.homePage.get();
                expect(homePageId).toEqual('c1dmp');
            });

        });

        describe('set', function() {

            afterAll(function() {
                apiCoverageUtils.checkFunctionAsTested('documentServices.homePage.set');
            });

            it('should set the given page id as home page', function(done) {
                documentServices.pages.add('secondPage');
                var thirdPagePointer = documentServices.pages.add('thirdPage');

                documentServices.homePage.set(thirdPagePointer.id);

                documentServices.waitForChangesApplied(function() {
                    var homePageId = documentServices.homePage.get();
                    expect(homePageId).toEqual(thirdPagePointer.id);
                    done();
                });

            });

            it('should throw an error if setting a non existing page id as home page', function(done) {
                errorUtils.waitForError(documentServices, done);

                documentServices.homePage.set('someNonExistingPageId');
            });
        });

    });

});
