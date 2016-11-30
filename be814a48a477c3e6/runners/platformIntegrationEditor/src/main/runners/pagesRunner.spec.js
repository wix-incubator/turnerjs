define([
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver',
    'jasmine-boot'
], function (editorDriver, platformDriver) {
    'use strict';

    describe('pages namespace', function () {
        describe('rename', function () {
            var appData = platformDriver.platform.getAppDataByAppDefId('dataBinding');
            it('should change page title if title is valid', function (done) {
                var pageRef = editorDriver.getCurrentPageRef();
                var newTitle = 'validTitle';
                platformDriver.pages.rename(appData, 'token', {pageRef: pageRef, title: newTitle}).then(function (error) {
                    var pageTitle = editorDriver.getPageTitle(pageRef.id);
                    expect(pageTitle).toEqual(newTitle);
                    expect(error).toEqual('');
                    done();
                });

            });

            it('should return an error for empty title', function (done) {
                var pageRef = editorDriver.getCurrentPageRef();
                var originalTitle = editorDriver.getPageTitle(pageRef.id);
                var newTitle = '';
                platformDriver.pages.rename(appData, 'token', {pageRef: pageRef, title: newTitle}).then(function (error) {
                    var pageTitle = editorDriver.getPageTitle(pageRef.id);
                    expect(pageTitle).toEqual(originalTitle);
                    expect(error).toEqual('Pages_Actions_Error_Page_Name_Too_Short');
                    done();
                });

            });

            it('should return an error for title containing html tags', function (done) {
                var pageRef = editorDriver.getCurrentPageRef();
                var originalTitle = editorDriver.getPageTitle(pageRef.id);
                var newTitle = '<button>';
                platformDriver.pages.rename(appData, 'token', {pageRef: pageRef, title: newTitle}).then(function (error) {
                    var pageTitle = editorDriver.getPageTitle(pageRef.id);
                    expect(pageTitle).toEqual(originalTitle);
                    expect(error).toEqual('Pages_Actions_Rename_Validation');
                    done();
                });

            });

            it('should return an error for title containing html tags', function (done) {
                var pageRef = editorDriver.getCurrentPageRef();
                var originalTitle = editorDriver.getPageTitle(pageRef.id);
                var newTitle = _.repeat('a', 41);
                platformDriver.pages.rename(appData, 'token', {pageRef: pageRef, title: newTitle}).then(function (error) {
                    var pageTitle = editorDriver.getPageTitle(pageRef.id);
                    expect(pageTitle).toEqual(originalTitle);
                    expect(error).toEqual('Pages_Actions_Error_Page_Name_Too_Short');
                    done();
                });

            });

            it('should getCurrent page ref', function() {
                var pageRef = platformDriver.pages.getCurrent('token');
                expect(pageRef).toEqual({
                    "type": "DESKTOP",
                    "id": "mainPage"
                });
            });
        });

    });
});
