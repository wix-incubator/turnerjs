define(['lodash', 'Squire', 'testUtils/util/requireHelper'], function (_, Squire, requireHelper) {
    'use strict';

    describe('requireHelper', function () {
        it('should return a copy of the module in the callback method', function (done) {
            spyOn(jasmine.currentEnv_, 'beforeAll').and.callFake(function (beforeAll) {
                expect(beforeAll.length).toEqual(1); // expect beforeAll to be async

                // This method is called before the first test and should have the module required
                var beforeAllDone = function () {
                    _.forEach(_, function (value, key) {
                        expect(module[key]).toBe(value);
                    });

                    done();
                };

                beforeAll(beforeAllDone);
            });

            var module = null;
            requireHelper.requireWithMocks('lodash', {}, function (lodash) {
                expect(lodash).toEqual({});
                module = lodash;
            });
        });

        describe('should return the same module on the second test', function () {
            requireHelper.requireWithMocks('lodash', {'MockSquire': Squire}, function (lodash) {
                var module;

                it('lodash module should be defined', function () {
                    module = lodash; // save the instance for the second test
                    expect(lodash).not.toEqual({}); // test the _.max method
                    expect(lodash.max([1, 2, 3])).toEqual(3); // test the _.max method
                });

                it('should still be the same instance from the first test', function () {
                    expect(lodash).toBe(module);
                });

                it('should have a different context of execution', function () {
                    expect(_).not.toBe(lodash);
                });
            });
        });

        describe('should use the mocked modules when required', function () {
            var modulePath = 'testUtils/util/requireHelper';
            var requireMock = {
                required: 'byMock'
            };

            function MockSquire() {
            }

            MockSquire.prototype = {
                require: function (path, callback) {
                    _.defer(callback.bind(null, requireMock));
                },
                mock: _.noop
            };

            var mockedDependencies = {
                'Squire': MockSquire
            };

            var mockPath = 'mockPath';
            var mockModules = {
                barvaz: {oger: true}
            };

            requireHelper.requireWithMocks(modulePath, mockedDependencies, function (rHelper) {

                it('requireHelper should have a mocked Squire', function (done) {
                    spyOn(jasmine.currentEnv_, 'beforeAll').and.callFake(function (beforeAll) {
                        beforeAll(function () {
                            expect(testModule).toEqual(requireMock);
                            done();
                        });
                    });

                    var testModule = null;
                    var callback = function (module) {
                        testModule = module;
                    };
                    rHelper.requireWithMocks(mockPath, mockModules, callback);
                    expect(testModule).toEqual({});
                });
            });
        });
    });
});
