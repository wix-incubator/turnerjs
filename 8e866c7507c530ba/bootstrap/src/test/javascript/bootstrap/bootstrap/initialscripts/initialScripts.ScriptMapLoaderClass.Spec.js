describe('ScriptMapLoaderClass', function() {
    'use strict';

    var ScriptMapLoaderClass = window.WT.ScriptMapLoaderClass;

    var loader;

    describe('_throwArtifactNotFound', function() {
        it ('should throw an error containing the artifact name that was not found', function() {
            loader = new ScriptMapLoaderClass();
            expect(function() {loader._throwArtifactNotFound('xxx');}).toThrowErrorContaining('xxx');
        });

        it ('should throw an error containing the specified errorArgs as a JSON', function() {
            var args = {x:'yy'};
            loader = new ScriptMapLoaderClass();
            expect(function() {loader._throwArtifactNotFound('xxx', args);}).toThrowErrorContaining(JSON.stringify(args, null, 4));
        });
    });

    describe('_appendToUrlPath', function() {
        beforeEach(function() {
            loader = new ScriptMapLoaderClass();
        });

        it('should append a path to the URL while removing redundant slashes', function() {
            expect(loader._appendToUrlPath('http://a/b/', '/c')).toBe('http://a/b/c');
            expect(loader._appendToUrlPath('https://a/b/', '/c')).toBe('https://a/b/c');
            expect(loader._appendToUrlPath('//a/b/', '/c')).toBe('//a/b/c');
            expect(loader._appendToUrlPath('//a/b', 'c')).toBe('//a/b/c');
            expect(loader._appendToUrlPath('//a/b', '/c')).toBe('//a/b/c');
        });
    });

    describe('_overrideScriptsMap', function() {
        beforeEach(function() {
            loader = new ScriptMapLoaderClass();
        });

        it('should return an empty array if given an empty object', function() {
            expect(loader._overrideScriptsMap({})).toBeEquivalentTo([]);
        });

        it('should override the scriptsMap and prepend the base URLs', function() {
            var scriptsMap = { x: 'x1.js', y: 'y1.js', z: 'z1.js' };
            var defaultScriptsLocationMap = { x: 'defaultx', y: 'defaulty', z: 'defaultz' };
            var overrideScriptsLocationMap = { a: 'overridea', x: 'overridex', z: 'overridez' };

            var expectedResult = ['overridex/x1.js', 'defaulty/y1.js', 'overridez/z1.js'];

            var result = loader._overrideScriptsMap(scriptsMap, defaultScriptsLocationMap, overrideScriptsLocationMap);
            expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResult));
        });
    });

    describe('loadScripts', function() {
        var ajaxClient;
        var scriptUrls = ['x', 'y', 'z'];

        beforeEach(function() {
            ajaxClient = {};
            loader = new ScriptMapLoaderClass({ajaxClient: ajaxClient});
        });

        it('should call ajaxClient with the list of the scripts returned from _overrideScriptsMap', function() {
            ajaxClient.loadScriptsSequentially = jasmine.createSpy('loadScriptsSequentially');
            spyOn(loader, '_overrideScriptsMap').andReturn(scriptUrls);

            var scriptsMap = { x: 'x1.js', y: 'y1.js', z: 'z1.js' };
            var defaultScriptsLocationMap = { x: 'defaultx', y: 'defaulty', z: 'defaultz' };
            var overrideScriptsLocationMap = { a: 'overridea', x: 'overridex', z: 'overridez' };

            loader.loadScripts(scriptsMap, defaultScriptsLocationMap, overrideScriptsLocationMap);

            expect(loader._overrideScriptsMap).toHaveBeenCalledWith(
                scriptsMap,
                defaultScriptsLocationMap,
                overrideScriptsLocationMap
            );

            expect(loader._overrideScriptsMap.callCount).toBe(1);
            expect(ajaxClient.loadScriptsSequentially.mostRecentCall.args[0]).toBe(scriptUrls);
            expect(ajaxClient.loadScriptsSequentially.callCount).toBe(1);
        });

        function testWithLoadScriptsSeqError(loadScriptsSequentiallyError) {
            describe('when loadScriptsSequentially returns ' + loadScriptsSequentiallyError ? 'an error' : 'successfully', function() {
                var callback;

                beforeEach(function() {
                    ajaxClient.loadScriptsSequentially = function(urls, callback) {callback(loadScriptsSequentiallyError);};
                    callback = jasmine.createSpy('callback');
                    spyOn(loader, '_overrideScriptsMap').andReturn(scriptUrls);
                });

                it('should call the callback with ' + loadScriptsSequentiallyError ? 'the error' : 'a falsy value' + ' and the scriptUrls', function() {
                    loader.loadScripts(null, null, null, callback);
                    expect(callback).toHaveBeenCalled();
                    expect(callback.mostRecentCall.args[0]).toBe(loadScriptsSequentiallyError);
                    expect(callback.mostRecentCall.args[1]).toBe(scriptUrls);
                });
            });
        }

        testWithLoadScriptsSeqError(undefined);
        testWithLoadScriptsSeqError(new Error('foo'));
    });
});
