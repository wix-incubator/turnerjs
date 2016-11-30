define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils'], function (_, santa, errorUtils, apiCoverageUtils) {

    'use strict';

    describe('Document Services - Mobile - Action Bar', function () {

        var documentServices;

        describe('Clean iframe', function(){

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing actionBar spec 1');
                    done();
                });
            });

            it("check default value of colorScheme is dark", function () {
                var colorScheme = documentServices.mobile.actionBar.colorScheme.get();
                expect(colorScheme).toEqual('dark');
            });

        });

        describe('Shared iframe', function(){

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing actionBar spec 2');
                    done();
                });
            });

            describe("enable", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.enable');
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.isEnabled');
                });

                it("check Quick Actions bar can be toggeled - site Meta data changed based on it", function (done) {
                    var isQuickActionEnabled = documentServices.mobile.actionBar.isEnabled();
                    expect(isQuickActionEnabled).toEqual(false);
                    documentServices.mobile.actionBar.enable(true);
                    documentServices.waitForChangesApplied(function () {
                        isQuickActionEnabled = documentServices.mobile.actionBar.isEnabled();
                        expect(isQuickActionEnabled).toEqual(true);
                    }, true);

                    documentServices.mobile.actionBar.enable(false);
                    documentServices.waitForChangesApplied(function () {
                        isQuickActionEnabled = documentServices.mobile.actionBar.isEnabled();
                        expect(isQuickActionEnabled).toEqual(false);
                        done();
                    });
                });

                it("Try to toggle to invalid value should throw exception", function (done) {
                    var initialVal = documentServices.mobile.actionBar.isEnabled();
                    expect(initialVal).toEqual(false);
                    errorUtils.waitForError(documentServices, function () {
                        var afterExceptionVal = documentServices.mobile.actionBar.isEnabled();
                        expect(afterExceptionVal).toEqual(initialVal);
                        done();
                    }, null);
                    documentServices.mobile.actionBar.enable("mockValue");
                });
            });

            describe("colorScheme", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.colorScheme.get');
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.colorScheme.set');
                });

                it("check setting to the same color", function (done) {
                    var originalColorScheme = documentServices.mobile.actionBar.colorScheme.get();
                    documentServices.mobile.actionBar.colorScheme.set(originalColorScheme);
                    documentServices.waitForChangesApplied(function () {
                        var newColorScheme = documentServices.mobile.actionBar.colorScheme.get();
                        expect(newColorScheme).toEqual(originalColorScheme);
                        done();
                    });
                });

                it("should update site meta data on toggle of colorScheme", function (done) {
                    var colorScheme = documentServices.mobile.actionBar.colorScheme.get();
                    var firstColorScheme = (colorScheme === 'light') ? 'dark' : 'light';
                    documentServices.mobile.actionBar.colorScheme.set(firstColorScheme);
                    documentServices.waitForChangesApplied(function () {
                        colorScheme = documentServices.mobile.actionBar.colorScheme.get();
                        expect(colorScheme).toEqual(firstColorScheme);
                    }, true);

                    var secondColorScheme = (firstColorScheme === 'light') ? 'dark' : 'light';
                    documentServices.mobile.actionBar.colorScheme.set(secondColorScheme);
                    documentServices.waitForChangesApplied(function () {
                        colorScheme = documentServices.mobile.actionBar.colorScheme.get();
                        expect(colorScheme).toEqual(secondColorScheme);
                        done();
                    });
                });

                it("change the color to a non valid value should throw exception", function (done) {
                    var initialColorScheme = documentServices.mobile.actionBar.colorScheme.get();
                    errorUtils.waitForError(documentServices, function () {
                        var colorScheme = documentServices.mobile.actionBar.colorScheme.get();
                        expect(colorScheme).toEqual(initialColorScheme);
                        done();
                    }, null);
                    documentServices.mobile.actionBar.colorScheme.set('mockScheme');
                });
            });

            describe("actions.enable", function () {
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.actions.getEnabled');
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.actions.enable');
                });

                it("enable action with empty data - throws exception", function (done) {
                    errorUtils.waitForError(documentServices, done, 'Action "undefined" has a missing value and thus cannot be enabled');
                    documentServices.mobile.actionBar.actions.enable({phone: true});
                });

                it("enable action to a non valid prop - throws exception", function (done) {
                    errorUtils.waitForError(documentServices, done, 'Action "undefined" is not valid. Valid values are [navigationMenu,phone,email,address,socialLinks]');
                    documentServices.mobile.actionBar.actions.enable({mockProp: true});
                });

                it("enable actions with one invalid action will throw exception and not make any change - order of params shouldn't make difference on the result", function (done) {
                    var originalValues = documentServices.mobile.actionBar.actions.getEnabled();
                    errorUtils.waitForError(documentServices, function () {
                        var valuesAfterFuncRun = documentServices.mobile.actionBar.actions.getEnabled();
                        expect(valuesAfterFuncRun).toEqual(originalValues);
                        done();
                    }, 'Action "undefined" has a missing value and thus cannot be enabled');
                    documentServices.mobile.actionBar.actions.enable({phone: true, navigationMenu: false});
                });


                it("enable map must check the values are boolean", function (done) {
                    errorUtils.waitForError(documentServices, done, null);
                    documentServices.mobile.actionBar.actions.update({phone: "03-000000"});
                    documentServices.mobile.actionBar.actions.enable({phone: "gggggg"});
                });

                it("enable property with data should update site meta data", function (done) {
                    var expectedVal = documentServices.mobile.actionBar.actions.getEnabled();
                    documentServices.mobile.actionBar.actions.update({phone: "03-000000"});
                    documentServices.mobile.actionBar.actions.enable({phone: true});
                    documentServices.waitForChangesApplied(function () {
                        expectedVal.phone = true;
                        var values = documentServices.mobile.actionBar.actions.getEnabled();
                        expect(values).toEqual(expectedVal);
                        done();
                    });
                });
            });

            describe("actions.update", function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.mobile.actionBar.actions.update');
                });

                it("Update Actions should update only relevant values", function (done) {
                    var expectedValues = documentServices.mobile.actionBar.actions.get();
                    var changedValues = {phone: "mockPhone", email: "mockEmail"};
                    documentServices.mobile.actionBar.actions.update(changedValues);
                    _.merge(expectedValues, changedValues);
                    documentServices.waitForChangesApplied(function () {
                        var values = documentServices.mobile.actionBar.actions.get();
                        expect(values).toEqual(expectedValues);
                        done();
                    });
                });

                it("Update Actions shouldn't update any value if invalid props exist - order of params shouldn't matter", function (done) {
                    var expectedValues = documentServices.mobile.actionBar.actions.get();
                    var changedValues = {mmmm: "mockVal", phone: "mockPhone2", email: "mockEmail2"};
                    errorUtils.waitForError(documentServices, function () {
                        var values = documentServices.mobile.actionBar.actions.get();
                        expect(values).toEqual(expectedValues);
                        done();
                    }, 'Action "mmmm" is not valid. Valid values are [phone,email,address,socialLinks]');
                    documentServices.mobile.actionBar.actions.update(changedValues);
                });


                it("should fail after updating socialLinks value with incorrect object", function (done) {
                    var expectedValues = documentServices.mobile.actionBar.actions.get();
                    var changedValues = {socialLinks: {phone: "mockPhone", email: "mockEmail"}};
                    errorUtils.waitForError(documentServices, function () {
                        var values = documentServices.mobile.actionBar.actions.get();
                        expect(values).toEqual(expectedValues);
                        done();
                    }, 'Social link "phone" is not valid. Valid values are [facebook,twitter,pinterest,google_plus,tumblr,blogger,linkedin,youtube,vimeo,flickr]');
                    documentServices.mobile.actionBar.actions.update(changedValues);
                });

                it("Update social Values require correct Obj", function () {
                    var expectedValues = documentServices.mobile.actionBar.actions.get();
                    var changedValues = {socialLinks: {blogger: "mockBlog"}};
                    documentServices.mobile.actionBar.actions.update(changedValues);
                    _.merge(expectedValues, changedValues);
                    documentServices.waitForChangesApplied(function () {
                        var values = documentServices.mobile.actionBar.actions.get();
                        expect(values).toEqual(expectedValues);
                    });
                });
            });
        });
    });
});
