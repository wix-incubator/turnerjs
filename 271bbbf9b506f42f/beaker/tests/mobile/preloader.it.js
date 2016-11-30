define(['santa-harness', 'errorUtils', 'apiCoverageUtils'], function (santa, errorUtils, apiCoverageUtils) {

    'use strict';

    describe('Document Services - Mobile - Preloader', function () {

        var documentServices;


        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.preloader.enable');
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.preloader.isEnabled');
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.preloader.update');
            apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.preloader.get');
        });

        describe('Clean iframe', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing preloader spec 1');
                    done();
                });
            });


            it("should test default Value", function () {
                var preLoaderDefaultVal = documentServices.mobile.preloader.isEnabled();
                expect(preLoaderDefaultVal).toEqual(false);
            });
        });

        describe('Shared iframe', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing preloader spec 2');
                    done();
                });
            });

            beforeEach(function (done) {
                documentServices.mobile.preloader.enable(false);
                documentServices.waitForChangesApplied(done);
            });

            it("should test Enable Disable", function (done) {
                var isPreLoaderEnabled;

                documentServices.mobile.preloader.enable(true);
                documentServices.waitForChangesApplied(function () {
                    isPreLoaderEnabled = documentServices.mobile.preloader.isEnabled();
                    expect(isPreLoaderEnabled).toEqual(true);
                }, true);

                documentServices.mobile.preloader.enable(false);
                documentServices.waitForChangesApplied(function () {
                    isPreLoaderEnabled = documentServices.mobile.preloader.isEnabled();
                    expect(isPreLoaderEnabled).toEqual(false);
                    done();
                });
            });

            it("should test that enable must receive Boolean param", function (done) {
                errorUtils.waitForError(documentServices, done, null);
                documentServices.mobile.preloader.enable(null);
            });


            //TODO: test is invalid as only possible values are booleans according to schema.
            //But ajv validator doesn't interpret undefined as real value and changes it by false in the validation time.
            //After validation ends with no errors we successfully save undefined value
            it("should test that if nothing is passed to enable, it will be undefined", function (done) {
                documentServices.mobile.preloader.enable();
                documentServices.waitForChangesApplied(function () {
                    var preLoaderDefaultVal = documentServices.mobile.preloader.isEnabled();
                    expect(preLoaderDefaultVal).toBeUndefined();
                    done();
                });
            });

            it("shouldn\'t update preloader if props name is invalid. order shouldn't matter", function (done) {
                var expectedValue = documentServices.mobile.preloader.get();
                var valuesToUpdate = {fakeProp: 'fakeProp', 'companyName': 'xxx'};
                errorUtils.waitForError(documentServices, function () {
                    var currentValues = documentServices.mobile.preloader.get();
                    expect(currentValues).toEqual(expectedValue);
                    done();
                }, 'Property "fakeProp" is not valid. Valid values are [companyName,logoUrl]');
                documentServices.mobile.preloader.update(valuesToUpdate);
            });

            it("should update the preloader", function (done) {
                var valuesToUpdate = {logoUrl: 'fakeURL', 'companyName': 'fakeCompany'};
                documentServices.mobile.preloader.update(valuesToUpdate);
                documentServices.waitForChangesApplied(function () {
                    var currentValues = documentServices.mobile.preloader.get();
                    expect(currentValues).toEqual(valuesToUpdate);
                    done();
                });
            });
        });
    });
});
