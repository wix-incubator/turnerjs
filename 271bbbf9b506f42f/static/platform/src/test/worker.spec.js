'use strict';

describe('worker', function() {

    var proxyquire = require('proxyquire').noPreserveCache();
    var reporter;

    beforeEach(function() {
        global.self = jasmine.createSpyObj('fake worker global scope', ['postMessage', 'importScripts']);
        reporter = {
            error: jasmine.createSpy('error')
        };
        fakeLoadEditorSDK();
        proxyquire('../main/worker', {'./reporter': reporter});
    });

    function fakeLoadEditorSDK() {
        global.self.editorSDK = {
            __init: jasmine.createSpy('__init').and.returnValue({
                then: jasmine.createSpy('then').and.callFake(function(cb) {
                    cb();
                })
            }),
            getBoundedSDK: jasmine.createSpy('getBoundedSDK')
        };
    }

    describe('initialize', function() {

        it('should initialize editorSDK', function() {
            expect(global.self.editorSDK.__init).toHaveBeenCalledWith(jasmine.any(Function));
            expect(global.self.editorSDK.__init().then).toHaveBeenCalledWith(jasmine.any(Function));
        });

        it('should notify `Alive` when editorSDK init is done', function() {
            expect(global.self.postMessage).toHaveBeenCalledWith({
                type: 'workerAlive'
            });
        });
    });

    describe('on addApps message - ', function() {
        var appScriptUrl = 'url';
        var applicationId = 100;
        var appDefinitionId = 'dataBinding';

        var apps = {
            normal: {
                applicationId: applicationId,
                appDefinitionId: appDefinitionId,
                editorUrl: appScriptUrl
            },
            noUrl: {
                applicationId: applicationId,
                appDefinitionId: appDefinitionId,
                editorUrl: undefined
            },
            noId: {
                applicationId: undefined,
                appDefinitionId: appDefinitionId,
                editorUrl: appScriptUrl
            }
        };

        var message = {
            data: {
                intent: 'PLATFORM_WORKER',
                type: 'addApps'
            }
        };

        it('should import app script as npm module', function() {
            message.data.apps = [apps.normal];
            global.self.onmessage(message);
            expect(global.self.importScripts).toHaveBeenCalledWith(appScriptUrl);
            expect(global.self.appsAPI[applicationId]).toEqual({});
        });

        it('should not import app script if app was already loaded', function () {
            var count = global.self.importScripts.calls.count();
            message.data.apps = [apps.normal];
            global.self.onmessage(message);
            global.self.onmessage(message);

            expect(global.self.importScripts.calls.count()).toEqual(count + 1);
        });

        it('should not import app script as npm module if url is undefined', function() {
            message.data.apps = [apps.noUrl];
            global.self.onmessage(message);
            expect(global.self.importScripts).not.toHaveBeenCalledWith(appScriptUrl);
            expect(global.self.appsAPI[applicationId]).toBeUndefined();
        });

        it('should not import app script as npm module if app id is undefined', function() {
            message.data.apps = [apps.noId];
            global.self.onmessage(message);
            expect(global.self.importScripts).not.toHaveBeenCalledWith(appScriptUrl);
            expect(global.self.appsAPI[applicationId]).toBeUndefined();
        });
    });

    describe('app manifest', function() {
        var manifest = 'manifest';
        var appScriptUrl = 'url';
        var applicationId = 100;
        var appDefinitionId = 'dataBinding';
        var apps = {
            normal: {
                applicationId: applicationId,
                appDefinitionId: appDefinitionId,
                editorUrl: appScriptUrl
            }
        };
        var message = {
            data: {
                intent: 'PLATFORM_WORKER',
                type: 'addApps'
            }
        };

        function fakeGetAppManifest(expectedUrl, fn) {
            global.self.importScripts.and.callFake(function(url) {
                if (expectedUrl === url) {
                    global.self.module.exports = {
                        getAppManifest: jasmine.createSpy('getAppManifest').and.callFake(fn)
                    };
                }
            });
        }

        it('should call getAppManifest if exists when adding the app', function(done) {
            fakeGetAppManifest(apps.normal.editorUrl, function() {
                done();
            });

            message.data.apps = [apps.normal];
            global.self.onmessage(message);
        });

        it('should call `setManifest` post message with the return manifest from getAppManifest', function() {
            fakeGetAppManifest(apps.normal.editorUrl, function() {
                return manifest;
            });

            message.data.apps = [apps.normal];
            global.self.onmessage(message);

            expect(global.self.postMessage).toHaveBeenCalledWith({
                type: 'setManifest',
                manifest: manifest,
                applicationId: applicationId
            });
        });

        it('should not call `setManifest` post message in case no manifest was returned from getAppManifest', function() {
            fakeGetAppManifest(apps.normal.url, function() {
                return;
            });

            message.data.apps = [apps.normal];
            global.self.onmessage(message);

            expect(global.self.postMessage).not.toHaveBeenCalledWith({
                type: 'setManifest',
                manifest: manifest
            });
        });
    });

    describe('app editorOnReady', function () {
        var appScriptUrl = 'url';
        var applicationId = 100;
        var appDefinitionId = 'dataBinding';
        var apps = {
            normal: {
                applicationId: applicationId,
                appDefinitionId: appDefinitionId,
                editorUrl: appScriptUrl
            }
        };
        var message = {
            data: {
                intent: 'PLATFORM_WORKER',
                type: 'addApps'
            }
        };

        function fakeOnEditorReady(expectedUrl, fn) {
            global.self.importScripts.and.callFake(function(url) {
                if (expectedUrl === url) {
                    global.self.module.exports = {
                        editorReady: jasmine.createSpy('editorReady').and.callFake(fn)
                    };
                }
            });
        }

        it('should call editorReady if exists when adding an app', function(done) {
            fakeOnEditorReady(apps.normal.editorUrl, function() {
                done();
            });

            message.data.apps = [apps.normal];
            global.self.onmessage(message);
        });

        it('should report app is missing an onEditorReady when adding an app', function() {
            global.self.importScripts.and.callFake(function() {
                global.self.module.exports = {
                    editorReady: undefined
                };
            });

            message.data.apps = [apps.normal];
            global.self.onmessage(message);
            expect(reporter.error).toHaveBeenCalled();
        });
    });
});
