describe('BasicAjaxClientClass', function() {
    'use strict';

    var BasicAjaxClientClass = window.WT.BasicAjaxClientClass;

    describe('loadScriptsSequentially', function() {
        it('should not throw when an empty callback is specified', function() {
            var ajaxClient = new BasicAjaxClientClass();
            ajaxClient.loadScriptsSequentially([]);
        });
    });

    describe('integration tests', function() {
        var test = function(funcName, description, url, expectation) {
            var ajaxClient = new BasicAjaxClientClass({windowScope: window, document: document});

            it (description, function() {
                var ctx = {};

                ajaxClient[funcName](url, function(err, text) {
                    ctx.called = true;
                    ctx.err = err;
                    ctx.text = text;
                });

                waitsFor(function() { return ctx.called; }, funcName + ' to call its callback');

                runs(expectation.bind(this, ctx));
            });
        };

        describe('_sendGetRequestWithXmlHttp', function() {
            var testXHR = test.bind(this, '_sendGetRequestWithXmlHttp');

            var thisUrl = window.location.href.split('?')[0];
            testXHR('should send a get request with xhr', thisUrl, function(ctx) {
                expect(ctx.err).toBeFalsy();
                expect(ctx.text).toBeTruthy();
                expect(ctx.text).toContainString('html');
            });

            if (!Browser.ie8 && !Browser.ie9) {
                var url = '//static.parastorage.com/services/third-party/tpa/unittest/test.json';
                testXHR('should send a get request to the statics with xhr', url, function(ctx) {
                    expect(ctx.err).toBeFalsy();
                    expect(ctx.text).toBeTruthy();
                    expect(ctx.text).toContainString('isWorking');
                });
            }

            testXHR('should call the callback with an error when there is an error', 'http://wix.com/doesnotexist/xxxxx', function(ctx) {
                expect(ctx.err).toBeTruthy();
            });
        });

        describe('_sendGetRequestWithJsonp', function() {
            var testJsonp = test.bind(this, '_sendGetRequestWithJsonp');
            var url = '//static.parastorage.com/services/third-party/tpa/unittest/test.json';
            testJsonp('should send a request with jsonp and call the callback', url, function(ctx) {
                expect(ctx.err).toBeFalsy();
                expect(ctx.text).toBeTruthy();
                expect(ctx.text.isWorking).toBeTruthy();
            });

            testJsonp('should call the callback with an error', url + 'xxxxx', function(ctx) {
                expect(ctx.err).toBeTruthy();
                expect(ctx.text).toBeFalsy();
            });
        });

        describe('loadScript', function() {
            beforeEach(function() {
                delete window.WT.testFilesLoaded;
            });

            var testScript = test.bind(this, 'loadScript');
            var url = '//static.parastorage.com/services/third-party/tpa/unittest/test1.js';

            testScript('should load a script and call the callback', url, function(ctx) {
                expect(ctx.err).toBeFalsy();
                expect(ctx.text).toBeTruthy();
                expect(window.WT.testFilesLoaded).toBeDefined();
                expect(window.WT.testFilesLoaded).toBeEquivalentTo(['test1.js']);
            });

            testScript('should call the callback with an error', url + 'xxxxx', function(ctx) {
                expect(ctx.err).toBeTruthy();
                expect(ctx.text).toBeFalsy();
                expect(window.WT.testFilesLoaded).not.toBeDefined();
            });
        });

        describe('loadScriptsSequentially', function() {
            beforeEach(function() {
                delete window.WT.testFilesLoaded;
            });

            var testScripts = test.bind(this, 'loadScriptsSequentially');
            var urls = [1,2,3].map(function(i) {
                return '//static.parastorage.com/services/third-party/tpa/unittest/test' + i + '.js';
            });

            testScripts('should load all the scripts in a sequence and call the callback',
                urls,
                function(ctx) {
                    expect(ctx.err).toBeFalsy();
                    expect(window.WT.testFilesLoaded).toBeDefined();
                    expect(window.WT.testFilesLoaded).toBeEquivalentTo(['test1.js', 'test2.js', 'test3.js']);
                }
            );

            var urlsWithAnError = [urls[0], urls[1] + 'xxxxx', urls[2]];

            testScripts('should call the callback with an error and stop loading the scripts',
                urlsWithAnError,
                function(ctx) {
                    expect(ctx.err).toBeTruthy();
                    expect(window.WT.testFilesLoaded).toBeDefined();
                    expect(window.WT.testFilesLoaded).toBeEquivalentTo(['test1.js']);
                }
            );
        });
    });

    describe('_ensureObject', function() {
        var ajaxClient = new BasicAjaxClientClass();
        it('should return the same object if an object is specified', function() {
            var o = {a:12};
            expect(ajaxClient._ensureObject(o)).toBe(o);
        });
        it('should return a parsed json if a string is specified', function() {
            var o = {a:12};
            expect(ajaxClient._ensureObject(o)).toBe(o);
        });
    });
});

