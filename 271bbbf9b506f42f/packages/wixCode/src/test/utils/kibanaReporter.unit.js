define(['lodash', 'utils', 'wixCode/utils/kibanaReporter'], function(_, utils, kibanaReporter) {
    'use strict';

    describe('kibana reporter', function() {

        var pixel, baseDomain = 'wix.com';
        // match[1] = host + path, match[2] = query param string
        var srcRegexp = /(http:\/\/[^\/]*\/[^?]*)\?(.*)/;

        function _getQuery() {
            var match = pixel.src.match(srcRegexp);

            return match[2].split('&').reduce(function(query, pairString) {
                var pair = pairString.split('=');
                query[pair[0]] = decodeURIComponent(pair[1] || '');

                return query;
            }, {});
        }

        beforeEach(function() {
            pixel = {};
            spyOn(window, 'Image').and.returnValue(pixel);
        });

        it('should expose levels structure', function() {
            expect(kibanaReporter.levels.INFO).toEqual('info');
            expect(kibanaReporter.levels.ERROR).toEqual('error');
        });

        describe('trace', function() {
            it('should throw if baseDomain is not supplied', function() {
                function trace() {
                    kibanaReporter.trace(null, null);
                }

                expect(trace).toThrowError('parameter `baseDomain` is invalid, received: null');
            });

            it('should report to the correct url', function() {
                kibanaReporter.trace(null, baseDomain);

                var match = pixel.src.match(srcRegexp);
                expect(match[1]).toEqual('http://monitoringhub.wix.com/logstash/events/gost');
            });

            it('should send a start report with default params', function() {
                kibanaReporter.trace(null, baseDomain);

                var query = _getQuery();

                expect(query.source).toEqual('wix-code-client');
                expect(query.level).toEqual(kibanaReporter.levels.INFO);
                expect(query.actionPosition).toEqual('start');
                expect(query.timestamp).toBeDefined();
                expect(query.userActionId).toEqual(jasmine.any(String));
            });

            it('should send a start report with the given params', function() {
                var params = {
                    message: 'test message',
                    action: 'action name'
                };

                kibanaReporter.trace(params, baseDomain);

                var query = _getQuery();

                expect(query.message).toEqual(params.message);
                expect(query.action).toEqual(params.action);
            });

            it('should allow overriding default params', function() {
                var params = {
                    source: 'custom-source',
                    level: 'custom-level',
                    userActionId: 'custom-user-action-id'
                };

                kibanaReporter.trace(params, baseDomain);

                var query = _getQuery();

                expect(query.source).toEqual(params.source);
                expect(query.level).toEqual(params.level);
                expect(query.userActionId).toEqual(params.userActionId);
            });

            it('should not allow to override the timestamp param', function() {
                var params = {
                    timestamp: 'custom-timestamp'
                };

                kibanaReporter.trace(params, baseDomain);

                var query = _getQuery();

                expect(query.timestamp).toBeDefined();
                expect(query.timestamp).not.toEqual(params.timestamp);
            });

            it('should not allow to override the actionPosition param', function() {
                var params = {
                    actionPosition: 'custom-actionPosition'
                };

                kibanaReporter.trace(params, baseDomain);

                var query = _getQuery();

                expect(query.actionPosition).toBeDefined();
                expect(query.actionPosition).not.toEqual(params.actionPosition);
            });

            it('should return the traceEnd function', function() {
                var traceEnd = kibanaReporter.trace(null, baseDomain);

                expect(traceEnd).toEqual(jasmine.any(Function));
            });

            describe('message parameter', function () {
                it('should be the stack trace if it was an Error object', function() {
                    var params = {
                        message: new Error('fake error')
                    };

                    kibanaReporter.trace(params, baseDomain);

                    var query = _getQuery();

                    expect(query.message).toEqual(params.message.stack);
                });

                it('should be stringified if it is not a string', function() {
                    var params = {
                        message: {a: 'b'}
                    };

                    kibanaReporter.trace(params, baseDomain);

                    var query = _getQuery();

                    expect(query.message).toEqual(JSON.stringify(params.message));
                });

                it('should be limited to 512 characters', function() {
                    var params = {
                        message: _.repeat('*', 600)
                    };
                    var truncatedMessage = _.repeat('*', 512);

                    kibanaReporter.trace(params, baseDomain);

                    var query = _getQuery();

                    expect(query.message).toEqual(truncatedMessage);
                });
            });


            describe('traceEnd', function() {
                it('should send an end report with the params from the initial trace', function() {
                    var params = {
                        message: 'hello'
                    };
                    var traceEnd = kibanaReporter.trace(params, baseDomain);
                    var initialQuery = _getQuery();
                    traceEnd();

                    var endQuery = _getQuery();

                    _(initialQuery).omit(['actionPosition', 'timestamp']).forOwn(function(value, key) {
                        expect(endQuery[key]).toEqual(initialQuery[key]);
                    }).value();
                });

                it('should send an end report with the default end params', function() {
                    var traceEnd = kibanaReporter.trace(null, baseDomain);
                    traceEnd();
                    var query = _getQuery();

                    expect(query.actionPosition).toEqual('end');
                    expect(query.duration).toBeDefined();
                    expect(query.timestamp).toBeDefined();
                });

                it('should send an end report with the given end params', function() {
                    var traceEnd = kibanaReporter.trace(null, baseDomain);
                    var params = {
                        message: 'hello'
                    };
                    traceEnd(params);
                    var query = _getQuery();

                    expect(query.message).toEqual(params.message);
                });

                it('should allow overriding the initial trace params', function() {
                    var params = {
                        message: 'hello'
                    };
                    var endParams = {
                        message: 'world'
                    };
                    var traceEnd = kibanaReporter.trace(params, baseDomain);
                    traceEnd(endParams);

                    var query = _getQuery();

                    expect(query.message).toEqual(endParams.message);
                });

                it('should not allow to override the timestamp param', function() {
                    var endParams = {
                        timestamp: 'custom-timestamp'
                    };
                    var traceEnd = kibanaReporter.trace(null, baseDomain);
                    traceEnd(endParams);

                    var query = _getQuery();

                    expect(query.timestamp).toBeDefined();
                    expect(query.timestamp).not.toEqual(endParams.timestamp);
                });

                it('should not allow to override the duration param', function() {
                    var endParams = {
                        duration: 'custom-duration'
                    };
                    var traceEnd = kibanaReporter.trace(null, baseDomain);
                    traceEnd(endParams);

                    var query = _getQuery();

                    expect(query.duration).toBeDefined();
                    expect(query.duration).not.toEqual(endParams.duration);
                });

                it('should not allow to override the actionPosition param', function() {
                    var endParams = {
                        actionPosition: 'custom-actionPosition'
                    };
                    var traceEnd = kibanaReporter.trace(null, baseDomain);
                    traceEnd(endParams);

                    var query = _getQuery();

                    expect(query.actionPosition).toBeDefined();
                    expect(query.actionPosition).not.toEqual(endParams.actionPosition);
                });
            });
        });
    });
});
