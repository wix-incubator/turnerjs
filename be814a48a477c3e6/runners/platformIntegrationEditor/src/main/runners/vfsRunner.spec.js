define([
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver',
    'jasmine-boot'
],  function (editorDriver, platformDriver) {
    'use strict'

    describe('vfs namespace', function () {
        it('should read, write and list files', function (done) {
            var appData = platformDriver.platform.getAppDataByAppDefId('dataBinding');
            var token = 'token';

            var childrenCount;
            platformDriver.vfs.listChildren(appData, token, {
                path: 'public/'
            }).then(function (children) {
                childrenCount = children.length;
                return platformDriver.vfs.writeFile(appData, token, {
                    path: 'public/foobar',
                    content: 'bacon'
                })
            }).then(function () {
                return platformDriver.vfs.readFile(appData, token, {path: 'public/foobar'})
            }).then(function (content) {
                expect(content).toBe('bacon')
            }).then(function () {
                return platformDriver.vfs.listChildren(appData, token, {path: 'public/'})
            }).then(function (children) {
                expect(children.length).toBe(childrenCount + 1)
            }).then(function () {
                return editorDriver.deleteFile('public/foobar')
            }).then(function () {
                return platformDriver.vfs.listChildren(appData, token, {path: 'public/'})
            }).then(function (children) {
                expect(children.length).toBe(childrenCount)
            }).then(done, done.fail)
        })
    })
})
