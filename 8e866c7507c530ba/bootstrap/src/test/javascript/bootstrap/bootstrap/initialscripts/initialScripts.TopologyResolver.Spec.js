describe('TopologyResolverClass', function() {
    'use strict';

    var StatemapResolverClass = window.WT.TopologyResolverClass;

    var resolver;

    var clientVersionsLoader;
    var snapshotVersionsLoader;

    var callback;

    describe('resolve', function() {
        beforeEach(function() {
            var createLoader = function() {
                var loader = {
                    load: function(callback) {
                        setTimeout(function() {
                            callback(loader.error, loader.result);
                        }, 0);
                    }
                };

                spyOn(loader, 'load').andCallThrough();

                return loader;
            };

            clientVersionsLoader = createLoader();
            snapshotVersionsLoader = createLoader();

            resolver = new StatemapResolverClass({
                clientArtifactVersionsLoader: clientVersionsLoader,
                snapshotVersionsLoader: snapshotVersionsLoader,
                urlTemplates: {
                    statics:  'base/${urlPathPrefix}${artifactName}/${artifactVersion}',
                    snapshot: 'snapshot/${urlPathPrefix}${artifactName}/${artifactVersion}',
                    local:    'local/${urlPathPrefix}${artifactName}'
                }
            });

            callback = jasmine.createSpy('callback');
        });

        function expectCallbackCall() {
            expect(callback).toHaveBeenCalled();
            expect(callback.callCount).toBe(1);
        }

        function expectCallbackErrorCall(expectedError) {
            expectCallbackCall();
            if (expectedError) {
                expect(callback.mostRecentCall.args[0]).toBe(expectedError);
            } else {
                expect(callback.mostRecentCall.args[0]).toBeTruthy();
            }
        }

        function expectCallbackSuccessCall(expectedResult) {
            expectCallbackCall();
            expect(callback.mostRecentCall.args[0]).toBeNull();
            expect(callback.mostRecentCall.args[1]).toBeEquivalentTo(expectedResult);
        }

        function expectClientVersionsLoaderCall(numTimes) {
            expect(clientVersionsLoader.load).toHaveBeenCalled();
            expect(clientVersionsLoader.load.callCount).toBe(numTimes);
        }

        function expectSnapshotLoaderCall(numTimes) {
            expect(snapshotVersionsLoader.load).toHaveBeenCalled();
            expect(snapshotVersionsLoader.load.callCount).toBe(numTimes);
        }

        it('should resolve without calling loader when not needed', function() {
            var statemap = {a: 'foo', b: 'bar', c: 'baz'};
            resolver.resolve(statemap, callback);
            expect(clientVersionsLoader.load).not.toHaveBeenCalled();
            expectCallbackSuccessCall({
                a: 'foo',
                b: 'bar',
                c: 'baz'
            });
        });

        it('should resolve an empty statemap without calling loader', function() {
            var statemap = {};
            resolver.resolve(statemap, callback);
            expect(clientVersionsLoader.load).not.toHaveBeenCalled();
            expectCallbackSuccessCall({});
        });

        it('should resolve and call loader when local is specified', function() {
            var statemap = {a: 'foo', b: 'bar', c: 'local'};

            clientVersionsLoader.result = {
                c: { ga: null, rc: null, urlPathPrefix: 'prefix/' }
            };

            jasmine.Clock.useMock();
            resolver.resolve(statemap, callback);
            expectClientVersionsLoaderCall(1);
            jasmine.Clock.tick(1);
            expectCallbackSuccessCall({
                a: 'foo',
                b: 'bar',
                c: 'local/prefix/c'
            });
        });

        it('should return without the prefix for local a artifact when the artifact is not in the version map', function() {
            var statemap = {a: 'foo', b: 'local', c: 'local'};

            clientVersionsLoader.result = {
                b: { urlPathPrefix: 'prefix' }
            };

            jasmine.Clock.useMock();
            resolver.resolve(statemap, callback);
            expectClientVersionsLoaderCall(2);
            jasmine.Clock.tick(1);
            expectCallbackSuccessCall({
                a: 'foo',
                b: 'local/prefixb',
                c: 'local/c'
            });
        });

        it('should resolve and call loader when needed', function() {
            var statemap = {a: 'ga', b: 'rc', c: 'local', d: 'shumklum', e: 'snapshot'};

            clientVersionsLoader.result = {
                a: { ga: '1.2.3', rc: '0'     },
                b: { ga: '0',     rc: '4.5.6', urlPathPrefix: 'prefix/' },
                e: { ga: '0',     rc: '0'     }
            };

            snapshotVersionsLoader.result = {
                e: '6.7.8'
            };

            jasmine.Clock.useMock();
            resolver.resolve(statemap, callback);
            expectClientVersionsLoaderCall(3);
            expectSnapshotLoaderCall(1);
            jasmine.Clock.tick(1);
            expectCallbackSuccessCall({
                a: 'base/a/1.2.3',
                b: 'base/prefix/b/4.5.6',
                c: 'local/c',
                d: 'shumklum',
                e: 'snapshot/e/6.7.8'
            });
        });

        it('should expand html-client artifacts', function() {
            var statemap = {a: 'local', 'html-client': 'baz'};
            clientVersionsLoader.result = {};

            jasmine.Clock.useMock();
            resolver.resolve(statemap, callback);
            expectClientVersionsLoaderCall(1);
            jasmine.Clock.tick(1);
            expectCallbackSuccessCall({
                a: 'local/a',
                bootstrap: 'baz',
                core: 'baz',
                skins: 'baz',
                web: 'baz'
            });
        });

        it('should call the callback once with an error if the resolver func has an error', function() {
            var statemap = {a: 'foo', b: 'bar', c: 'ga', d: 'rc', e: 'shumklum'};

            clientVersionsLoader.result = {}; // no "c"

            jasmine.Clock.useMock();
            resolver.resolve(statemap, callback);
            expectClientVersionsLoaderCall(2);
            jasmine.Clock.tick(1);
            expectCallbackErrorCall();
        });

        it('should call the callback once with an error if the loader has an error', function() {
            var statemap = {a: 'foo', b: 'bar', c: 'ga', d: 'shumklum'};

            clientVersionsLoader.error = new Error('this is the error');

            jasmine.Clock.useMock();
            resolver.resolve(statemap, callback);
            expectClientVersionsLoaderCall(1);
            jasmine.Clock.tick(1);
            expectCallbackErrorCall(clientVersionsLoader.error);
        });
    });
});
