describe('StatemapOrTopologyLoaderClass', function() {
    'use strict';

    var StatemapOrTopologyLoaderClass = window.WT.StatemapOrTopologyLoaderClass;

    var loader;
    var dependencies;

    describe('integration tests', function() {
        describe('_getQueryParamsFromUrl', function() {
            it('should accept the query string from the dependencies parameter', function() {
                loader = new StatemapOrTopologyLoaderClass({queryString: '?a=b&c=d'});
                expect(loader._getQueryParamsFromUrl()).toBeEquivalentTo({a:'b',c:'d'});
            });
        });

        describe('_getStatemapParamValue', function() {
            it('should get the statemap from the query params even when "special" experiments are defined', function() {
                loader = new StatemapOrTopologyLoaderClass({
                    windowScope: {
                        rendererModel: {
                            runningExperiments: {
                                htmlRendererUseGivenStatemap: 'bar'
                            }
                        }
                    },
                    queryString: '?statemap=foo'
                });
                expect(loader._getStatemapParamValue()).toBe('foo');
            });
        });

        describe('_getTopologyUrl', function() {
            it('should return the query param value', function() {
                loader = new StatemapOrTopologyLoaderClass({queryString: '?topology_url=http://localhost/foo'});
                expect(loader._getTopologyUrl()).toBe('http://localhost/foo');
            });
        });
    });

    describe('stateful functions', function() {
        describe('_getRunningExperiments', function() {
            var runningExperiments = {a:'New', b:'New'};

            function test(description, windowScope) {
                it('should return the running experiments from ' + description, function() {
                    loader = new StatemapOrTopologyLoaderClass({windowScope: windowScope});
                    expect(loader._getRunningExperiments()).toBe(runningExperiments);
                });
            }

            test('the editorModel', { editorModel: { runningExperiments: runningExperiments } });
            test('the rendererModel', { rendererModel: { runningExperiments: runningExperiments } });
        });

        describe('_getStatemapFromRunningExperiments', function() {
            function test(description, runningExperiments, expectedStatemap) {
                it('should return ' + (expectedStatemap ? 'the correct statemap' : 'undefined') + ' when ' + description, function() {
                    loader = new StatemapOrTopologyLoaderClass();
                    spyOn(loader, '_getRunningExperiments').andReturn(runningExperiments);
                    expect(loader._getStatemapFromRunningExperiments()).toBe(expectedStatemap);
                });
            }

            test('experiment htmlEditorUseGivenStatemap exists', {htmlEditorUseGivenStatemap: 'aaa'}, 'aaa');
            test('experiment htmlEditorUseGivenStatemap is "default"', {htmlEditorUseGivenStatemap: 'default'});
            test('experiment htmlRendererUseGivenStatemap exists', {htmlRendererUseGivenStatemap: 'bbb'}, 'bbb');
            test('experiment htmlRendererUseGivenStatemap is "default"', {htmlRendererUseGivenStatemap: 'default'});
            test('experiments htmlEditorUseGivenStatemap and htmlRendererUseGivenStatemap exist', {htmlEditorUseGivenStatemap: 'aaa', htmlRendererUseGivenStatemap: 'bbb'}, 'aaa');
            test('experiment htmlEditorUseGivenStatemap is "default", even when experiment htmlRendererUseGivenStatemap also exists', {htmlEditorUseGivenStatemap: 'default', htmlRendererUseGivenStatemap: 'bbb'});
        });

        describe('_getStatemapParamValue', function() {
            it('should get the statemap from the query params', function() {
                loader = new StatemapOrTopologyLoaderClass({queryString: '?statemap=foo'});
                expect(loader._getStatemapParamValue()).toBe('foo');
            });

            it('should get the statemap from the query params even when _getStatemapFromRunningExperiments returns a value', function() {
                loader = new StatemapOrTopologyLoaderClass({queryString: '?statemap=foo'});
                spyOn(loader, '_getStatemapFromRunningExperiments').andReturn('bar');
                expect(loader._getStatemapParamValue()).toBe('foo');
            });

            it('should get the statemap from _getStatemapFromRunningExperiments if the query param is not specified', function() {
                loader = new StatemapOrTopologyLoaderClass();
                spyOn(loader, '_getStatemapFromRunningExperiments').andReturn('bar');
                expect(loader._getStatemapParamValue()).toBe('bar');
            });
        });

        describe('loadStatemapOrTopology', function() {
            var callback;

            beforeEach(function() {
                callback = jasmine.createSpy('callback');
            });

            function expectCallback(err, statemap) {
                expect(callback.callCount).toBe(1);
                var args = callback.mostRecentCall.args;
                if (err) {
                    expect(args[0]).toBe(err);
                } else if (statemap) {
                    expect(args[0]).toBeFalsy();
                    expect(JSON.stringify(args[1])).toBe(JSON.stringify(statemap));
                }
            }

            var topology, fullStatemap, resolvedTopology, fullStatemapWithResolvedTopology;
            beforeEach(function() {
                topology = {a:'local',b:'baz'};
                fullStatemap = {topology: topology};
                resolvedTopology = {a:'http://localhost/a',b:'baz'};
                fullStatemapWithResolvedTopology = {topology:resolvedTopology};
            });

            function setupResolver(scope, resolverError, resolverResult) {
                scope = scope || {};

                jasmine.Clock.useMock();

                scope.topologyResolver = {
                    resolve: function(topology, callback) {
                        setTimeout(function() {
                            callback(resolverError, resolverResult);
                        }, 0);
                    }
                };

                spyOn(scope.topologyResolver, 'resolve').andCallThrough();

                scope.expectResolverCall = function(withTopologyArg) {
                    expect(scope.topologyResolver.resolve).toHaveBeenCalled();
                    expect(scope.topologyResolver.resolve.mostRecentCall.args[0]).toBe(withTopologyArg);
                    jasmine.Clock.tick(1);
                };

                return scope;
            }

            function testInlineStatemap(description, resolverError, resolverResult) {
                description = 'should ' + description;

                it(description, function() {
                    var scope = setupResolver({}, resolverError, resolverResult);

                    loader = new StatemapOrTopologyLoaderClass({
                        topologyResolver: scope.topologyResolver
                    });

                    spyOn(loader, '_getStatemapParamValue').andReturn('foo');
                    spyOn(loader, '_getInlineTopology').andReturn(topology);
                    loader.loadStatemapOrTopology(callback);
                    expect(loader._getStatemapParamValue).toHaveBeenCalled();
                    expect(loader._getInlineTopology).toHaveBeenCalledWith('foo');
                    scope.expectResolverCall(topology);
                    expectCallback(scope.resolverError, scope.resolverResult);
                });
            }

            describe('when both _getStatemapParamValue and _getTopologyUrl return falsy', function() {
                testInlineStatemap('should immediately return an empty statemap', undefined, {});
            });

            describe('when _getStatemapParamValue returns truthy and _getInlineTopology returns truthy', function() {
                describe('when the resolver returns a result', function() {
                    testInlineStatemap('return the resolved statemap', undefined, resolvedTopology);
                });

                describe('when the resolver returns an error', function() {
                    testInlineStatemap('return the error', new Error('resolver error'));
                });
            });

            function setupAjaxClient(scope, ajaxError, ajaxResult) {
                scope = scope || {};

                scope.ajaxClient = {
                    loadJson: function(url, callback) {
                        setTimeout(function() {
                            callback(ajaxError, ajaxResult);
                        }, 0);
                    }
                };

                spyOn(scope.ajaxClient, 'loadJson').andCallThrough();

                scope.expectAjaxCall = function() {
                    jasmine.Clock.tick(1);
                    if (ajaxError) {
                        expect(scope.topologyResolver.resolve).not.toHaveBeenCalled();
                        expectCallback(ajaxError, ajaxResult);
                    }
                };

                return scope;
            }

            describe('when a statemap name is specified', function() {
                function testAjaxStatemap(ajaxError, ajaxResult, resolverArg, resolverError, resolverResult, callbackResult) {
                    var scope = setupResolver({}, resolverError, resolverResult);
                    scope = setupAjaxClient(scope, ajaxError, ajaxResult);

                    loader = new StatemapOrTopologyLoaderClass({
                        ajaxClient: scope.ajaxClient,
                        topologyResolver: scope.topologyResolver
                    });

                    spyOn(loader, '_getStatemapParamValue').andReturn('foo');
                    spyOn(loader, '_getInlineTopology').andReturn(null);
                    spyOn(loader, '_getStatemapUrlFromName').andReturn('http://localhost/foo');
                    loader.loadStatemapOrTopology(callback);
                    expect(loader._getStatemapParamValue).toHaveBeenCalled();
                    expect(loader._getInlineTopology).toHaveBeenCalledWith('foo');
                    expect(loader._getStatemapUrlFromName).toHaveBeenCalledWith('foo');
                    expect(scope.ajaxClient.loadJson).toHaveBeenCalled();
                    expect(scope.ajaxClient.loadJson.mostRecentCall.args[0]).toBe('http://localhost/foo');
                    jasmine.Clock.tick(1);
                    if (ajaxError) {
                        expect(scope.topologyResolver.resolve).not.toHaveBeenCalled();
                        expectCallback(ajaxError, ajaxResult);
                    } else {
                        scope.expectResolverCall(resolverArg);
                        expectCallback(resolverError, callbackResult);
                    }
                }

                describe('when the ajaxClient returns the statemap', function() {
                    describe('when the resolver returns a result', function() {
                        it('should return the resolved statemap', function() {
                            testAjaxStatemap(
                                undefined, fullStatemap,
                                topology,
                                undefined, resolvedTopology,
                                fullStatemapWithResolvedTopology
                            );
                        });
                    });

                    describe('when the resolver returns an error', function() {
                        var error = new Error('resolver error');
                        it ('should return the error', function() {
                            testAjaxStatemap(
                                undefined, fullStatemap,
                                topology,
                                error, undefined,
                                error
                            );
                        });
                    });
                });

                describe('when the ajaxClient returns an error', function() {
                    var error = new Error('this is the error');
                    it('should return the error', function() {
                        testAjaxStatemap('return the error', error);
                    });
                });
            });

            describe('when a topology url param is specified', function() {
                function testAjaxTopology(ajaxError, ajaxResult, resolverArg, resolverError, resolverResult, callbackResult) {
                    var scope = setupResolver({}, resolverError, resolverResult);
                    scope = setupAjaxClient(scope, ajaxError, ajaxResult);

                    loader = new StatemapOrTopologyLoaderClass({
                        ajaxClient: scope.ajaxClient,
                        topologyResolver: scope.topologyResolver
                    });

                    spyOn(loader, '_getStatemapParamValue').andReturn(null);
                    spyOn(loader, '_getInlineTopology');
                    spyOn(loader, '_getStatemapUrlFromName');
                    spyOn(loader, '_getTopologyUrl').andReturn('http://localhost/bar');
                    loader.loadStatemapOrTopology(callback);
                    expect(loader._getStatemapParamValue).toHaveBeenCalled();
                    expect(loader._getInlineTopology).not.toHaveBeenCalled();
                    expect(loader._getStatemapUrlFromName).not.toHaveBeenCalled();
                    expect(loader._getTopologyUrl).toHaveBeenCalled();
                    expect(scope.ajaxClient.loadJson).toHaveBeenCalled();
                    expect(scope.ajaxClient.loadJson.mostRecentCall.args[0]).toBe('http://localhost/bar');
                    jasmine.Clock.tick(1);
                    if (ajaxError) {
                        expect(scope.topologyResolver.resolve).not.toHaveBeenCalled();
                        expectCallback(ajaxError, ajaxResult);
                    } else {
                        scope.expectResolverCall(resolverArg);
                        expectCallback(resolverError, callbackResult);
                    }
                }

                describe('when the ajaxClient returns the topology', function() {
                    describe('when the resolver returns a result', function() {
                        it('should return the resolved topology', function() {
                            testAjaxTopology(
                                undefined, topology,
                                topology,
                                undefined, resolvedTopology,
                                resolvedTopology
                            );
                        });
                    });

                    describe('when the resolver returns an error', function() {
                        var error = new Error('resolver error');
                        it ('should return the error', function() {
                            testAjaxTopology(
                                undefined, topology,
                                topology,
                                error, undefined,
                                error
                            );
                        });
                    });
                });

                describe('when the ajaxClient returns an error', function() {
                    var error = new Error('this is the error');
                    it('should return the error', function() {
                        testAjaxTopology('return the error', error);
                    });
                });
            });
        });
    });

    describe('stateless functions', function() {
        beforeEach(function() {
            loader = new StatemapOrTopologyLoaderClass();
        });

        describe('_getQueryParamsFromUrl', function() {
            var gqp;
            beforeEach(function() {
                gqp = loader._getQueryParamsFromUrl.bind(loader);
            });

            function test(description, qs, expectedObj) {
                it('should parse a query string with' + description + ' correctly', function() {
                    expect(gqp(qs)).toBeEquivalentTo(expectedObj);
                });
            }

            test(' two parameters', '?acb=def&bla=123', {acb:'def',bla:'123'});
            test('out a question mark in the beginning', 'acb=def&bla=123', {acb:'def',bla:'123'});
            test(' a single parameter', '?acb=def', {acb:'def'});
            test(' a single plus sign', '?acb=d+ef', {acb:'d ef'});
            test(' multiple plus signs', '?acb=d++ef', {acb:'d ef'});
            test(' an encoded value', '?acb=d%20ef', {acb:'d ef'});
            test(' multiple instances of the same param', '?acb=1&acb=2', {acb:'2'});
            test('out a value', '?acb', {acb:true});
            test('out a value followed by another param', '?acb&bla=123', {acb:true,bla:'123'});
        });

        describe('_getInlineTopology', function() {
            var gis;
            beforeEach(function() {
                gis = loader._getInlineTopology.bind(loader);
            });

            function test(description, statemapQueryString, expectedResult) {
                var itDescription = 'should return ' + (expectedResult ? 'the inline statemap' : 'falsy') + ' when given ' + description;

                it(itDescription, function() {
                    var result = gis(statemapQueryString);
                    if (!expectedResult) {
                        expect(result).toBeFalsy();
                    } else {
                        expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResult));
                    }
                });
            }

            test('a regular statemap number', '1.2345.5');
            test('a regular statemap name', 'something');
            test('a URL', '//static.wixstatic.com/statemap/1.3456.7');
            test('a single name-value pair', 'a:b', {a:'b'});
            test('a single name-value pair with a multi-character name', 'ab1:b', {ab1:'b'});
            test('a single name-value pair with a multi-character name and value', 'ab1:de2', {ab1:'de2'});
            test('multiple name-value pairs with a single character name and value', 'a:b,c:d', {a:'b','c':'d'});
            test('multiple name-value pairs with multiple characters', 'ab12:bc34,cd56:d78', {ab12:'bc34','cd56':'d78'});
            test('name-value pairs with whitespace', ' ab12 : bc34 , cd56 : d78', {ab12:'bc34','cd56':'d78'});
            test('multiple commas', 'ab12:bc34,,cd56:d78', {ab12:'bc34','cd56':'d78'});
            test('multiple trailing commas', 'ab12:bc34,,cd56:d78,,', {ab12:'bc34','cd56':'d78'});
        });

        describe('_getStatemapUrlFromName', function() {
            var func;
            beforeEach(function() {
                func = loader._getStatemapUrlFromName.bind(loader);
            });

            it('should return the correct url', function() {
                expect(func('1.2345.6')).toBe('//static.wixstatic.com/statemap/123456.json');
            });
        });
    });
});
