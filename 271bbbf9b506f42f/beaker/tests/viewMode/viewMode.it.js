define(['lodash', 'santa-harness', 'apiCoverageUtils', 'errorUtils'], function (_, santa, apiCoverageUtils, errorUtils) {
    'use strict';

    describe('Document Services - ViewMode', function () {

        var documentServices;

        describe('Clean iframe', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing view mode spec');
                    done();
                });
            });

            it('Should test the initial view mode', function () {
                var viewMode = documentServices.viewMode.get();
                expect(viewMode).toEqual('DESKTOP');
            });
        });

        describe('Shared iframe', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing view mode spec');
                    done();
                });
            });

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.viewMode.get');
                apiCoverageUtils.checkFunctionAsTested('documentServices.viewMode.set');
            });

            describe('Starting from Mobile', function () {

                beforeEach(function (done) {
                    documentServices.viewMode.set('MOBILE');
                    documentServices.waitForChangesApplied(done);
                });

                it("should set Desktop View", function (done) {
                    var viewMode = documentServices.viewMode.get();
                    expect(viewMode).toEqual('MOBILE');
                    documentServices.viewMode.set('DESKTOP');
                    documentServices.waitForChangesApplied(function () {
                        viewMode = documentServices.viewMode.get();
                        expect(viewMode).toEqual('DESKTOP');
                        done();
                    });
                });

                it("should set Desktop View and then set Mobile View", function (done) {
                    var viewMode = documentServices.viewMode.get();
                    expect(viewMode).toEqual('MOBILE');
                    documentServices.viewMode.set('DESKTOP');
                    documentServices.viewMode.set('MOBILE');
                    documentServices.waitForChangesApplied(function () {
                        viewMode = documentServices.viewMode.get();
                        expect(viewMode).toEqual('MOBILE');
                        done();
                    });
                });
            });


            describe('Starting from Desktop', function () {

                beforeEach(function (done) {
                    documentServices.viewMode.set('DESKTOP');
                    documentServices.waitForChangesApplied(done);
                });

                it("should set Mobile View", function (done) {
                    documentServices.viewMode.set('MOBILE');
                    documentServices.waitForChangesApplied(function () {
                        var viewMode = documentServices.viewMode.get();
                        expect(viewMode).toEqual('MOBILE');
                        done();
                    });
                });

                it("should set Mobile View and then set Desktop View", function (done) {
                    var viewMode = documentServices.viewMode.get();
                    expect(viewMode).toEqual('DESKTOP');
                    documentServices.viewMode.set('MOBILE');
                    documentServices.viewMode.set('DESKTOP');
                    documentServices.waitForChangesApplied(function () {
                        viewMode = documentServices.viewMode.get();
                        expect(viewMode).toEqual('DESKTOP');
                        done();
                    });
                });
            });

            describe('General', function () {

                it("should throw an exception when set view mode that not exists", function (done) {
                    var originalViewMode = documentServices.viewMode.get();

                    errorUtils.waitForError(documentServices, function () {
                        var viewMode = documentServices.viewMode.get();
                        expect(viewMode).toEqual(originalViewMode);
                        done();
                    }, 'view mode not valid. valid viewModes are: ' + _.values(documentServices.viewMode.VIEW_MODES));

                    documentServices.viewMode.set('MOCKMODE');
                });

                it("should stay in the same ViewMode", function (done) {
                    var originalViewMode = documentServices.viewMode.get();
                    documentServices.viewMode.set(originalViewMode);
                    documentServices.waitForChangesApplied(function () {
                        var viewMode = documentServices.viewMode.get();
                        expect(viewMode).toEqual(originalViewMode);
                        done();
                    });
                });
            });
        });
    });
});
