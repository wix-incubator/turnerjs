define(['santa-harness', 'apiCoverageUtils'], function (santa, apiCoverageUtils) {

    "use strict";
    describe('Document Services - Pages - Permissions', function () {

        var documentServices;
        var pageWithoutPassword = 'page-without-password';
        var pageWithPassword = 'page-with-password';

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                documentServices.pages.add(pageWithPassword);
                documentServices.pages.add(pageWithoutPassword);
                console.log('Testing pages permissions spec');
                documentServices.waitForChangesApplied(done);
            });
        });

        afterEach(function () {
            documentServices.pages.permissions.removePassword(pageWithPassword);
        });

        describe('hasPassword', function () {
            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.permissions.hasPassword');
            });


            it('should return false when no password is set', function () {
                expect(documentServices.pages.permissions.hasPassword(pageWithoutPassword)).toBeFalsy();
            });

            it('should return true when password is set', function (done) {
                documentServices.pages.permissions.updatePassword(pageWithPassword, '123456');
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeTruthy();
                    done();
                });
            });

        });

        describe('updatePassword', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.permissions.updatePassword');
            });

            it('should set page password when only password string is given as a parameter', function (done) {
                expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                documentServices.pages.permissions.updatePassword(pageWithPassword, '123456');
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeTruthy();
                    done();
                });
            });

            it('should set page password when {value: password, hashed: false} object is given as a parameter', function (done) {
                var passwordObject = {
                    value: '123456',
                    hashed: false
                };
                expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                documentServices.pages.permissions.updatePassword(pageWithPassword, passwordObject);
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeTruthy();
                    done();
                });
            });

            it('should set page password when {value: password, hashed: true} object is given as a parameter', function (done) {
                var passwordObject = {
                    value: '123456',
                    hashed: true
                };
                expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                documentServices.pages.permissions.updatePassword(pageWithPassword, passwordObject);
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeTruthy();
                    done();
                });
            });

        });



        describe('removePassword', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.permissions.removePassword');
            });

            it('should leave page unprotected when no password was set', function (done) {
                expect(documentServices.pages.permissions.hasPassword(pageWithoutPassword)).toBeFalsy();
                documentServices.pages.permissions.removePassword(pageWithoutPassword);
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithoutPassword)).toBeFalsy();
                    done();
                });
            });

            it('should remove password when password is set and waiting for changes to be applied before removing password', function (done) {
                expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                documentServices.pages.permissions.updatePassword(pageWithPassword, '123456');
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeTruthy();
                    documentServices.pages.permissions.removePassword(pageWithPassword);
                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                        done();
                    });
                });
            });

            it('should remove password when password is set', function (done) {
                expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                documentServices.pages.permissions.updatePassword(pageWithPassword, '123456');
                documentServices.pages.permissions.removePassword(pageWithPassword);
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.pages.permissions.hasPassword(pageWithPassword)).toBeFalsy();
                    done();
                });
            });

        });

        describe('isPagesProtectionOnServerOn', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.permissions.isPagesProtectionOnServerOn');
            });

            /*
             isPagesProtectionOnServerOn calls a function from passwordProtected.js that should return true since the experiment of password protected pages is already merged.
             But in this case, experiment.isOpen() is being checked by verticals (e.g. photographers), therefore it should remain there.
             */
            it('should return true', function () {
                expect(documentServices.pages.permissions.isPagesProtectionOnServerOn()).toBeTruthy();
            });

        });

    });
});
