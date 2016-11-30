describe('PublishedClientArtifactVersionsLoaderClass', function() {
    var PublishedClientArtifactVersionsLoaderClass = window.WT.PublishedClientArtifactVersionsLoaderClass;

    var loader;

    var validResponse = {
        web: { rc: "1.200.3", ga: "1.100.0" },
        bootstrap: { rc: "1.200.3", ga: "1.100.0" }
    };

    var expectedResultFromValidResponse = {
        web: { rc: "1.200.3", ga: "1.100.0" },
        bootstrap: { rc: "1.200.3", ga: "1.100.0" }
    };


    describe('_extractResponse', function() {
        beforeEach(function() {
            loader = new PublishedClientArtifactVersionsLoaderClass({url: 'myurl'});
        });

        describe('throws', function() {
            var whenResponse = function(description, response) {
                it('when response ' + description, function() {
                    expect(function() {
                        loader._extractResponse(response);
                    }).toThrowErrorContaining('myurl');
                });
            };

            whenResponse('is null', null);
            whenResponse('is undefined', undefined);
            whenResponse('is a string', 'whoa');
        });

        it('should extract the correct versions', function() {
            var result = loader._extractResponse(validResponse);
            expect(JSON.stringify(result)).toBe(JSON.stringify(expectedResultFromValidResponse));
        });
    });

    describe('load', function() {
        describe('when the loadJson call succeeds', function() {
            testWithLoadJson(function(callback) {
                callback(null, validResponse);
            }, function(args) {
                expect(args[0]).toBeNull();
                expect(args[1]).toBeEquivalentTo(expectedResultFromValidResponse);
            });
        });

        describe('when the loadJson call fails', function() {
            var error = new Error('an error for this unit test');
            testWithLoadJson(function(callback) {
                callback(error, null);
            }, function(args) {
                expect(args[0]).toBe(error);
                expect(args[1]).toBeFalsy();
            });
        });

        function testWithLoadJson(loadJsonFunc, callbackExpectation) {
            var ajaxClient;
            var callback;

            beforeEach(function() {
                ajaxClient = {
                    loadJson: function(url, callback) {
                        setTimeout(function() { loadJsonFunc(callback); }, 0);
                    }
                };

                spyOn(ajaxClient, 'loadJson').andCallThrough();

                loader = new PublishedClientArtifactVersionsLoaderClass({
                    ajaxClient: ajaxClient,
                    url: 'myurl'
                });

                callback = jasmine.createSpy('callback');
            });

            it('should call the ajaxLoad function', function() {
                jasmine.Clock.useMock();
                loader.load(callback);
                expect(ajaxClient.loadJson).toHaveBeenCalled();
            });

            it('should call the ajaxLoad function once only', function() {
                jasmine.Clock.useMock();
                loader.load(callback);
                loader.load(callback);
                loader.load(callback);
                expect(ajaxClient.loadJson.callCount).toBe(1);
            });

            it('should call the loader with the specified url', function() {
                jasmine.Clock.useMock();
                loader.load(callback);
                expect(ajaxClient.loadJson.mostRecentCall.args[0]).toBe('myurl');
            });

            it('should call the callback', function() {
                jasmine.Clock.useMock();
                loader.load(callback);
                jasmine.Clock.tick(1);

                expect(callback).toHaveBeenCalled();
                callbackExpectation(callback.mostRecentCall.args);
            });

            it('should call all the callbacks with the same response', function() {
                var callbacks = _.times(4, function(i) { return jasmine.createSpy('callback' + i); });

                callbacks[2] = callbacks[2].andCallFake(function() {
                    throw new Error('this callback has thrown');
                });

                jasmine.Clock.useMock();
                callbacks.forEach(function(callback) { loader.load(callback); });
                jasmine.Clock.tick(1);

                callbacks.forEach(function(callback) {
                    expect(callback).toHaveBeenCalled();
                    callbackExpectation(callback.mostRecentCall.args);
                });

                expect(ajaxClient.loadJson.callCount).toBe(1);
            });
        }
    });
});


