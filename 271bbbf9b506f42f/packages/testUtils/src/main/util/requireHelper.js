define(['lodash', 'Squire'], function (_, Squire) {
    'use strict';

    function getSquireWithMocks(mockedDependencies) {
        var squire = new Squire();
        _(mockedDependencies)
            .pick(_.identity)
            .forEach(function (mock, path) {
                squire.mock(path, mock);
            })
            .value();

        return squire;
    }

    function describeWithMocks(description, mocks, deps, callback) {
        var squireWithMocks = getSquireWithMocks(mocks);
        squireWithMocks.require(deps, _.noop);

        describe(description, function () {
            var args = _.times(deps.length, function () {
                return {};
            });

            beforeAll(function (done) {
                squireWithMocks.require(deps, function () {
                    var modules = _.toArray(arguments);
                    _.forEach(args, function (arg, index) {
                        _.assign(arg, modules[index]);
                    });
                    done();
                });
            });

            callback.apply(this, args);
        });
    }


    /**
     * get a module with mocked dependencies for all the modules who requires one of the mocked modules
     * @param {String} modulePath the full path of the module (e.g. 'testUtils/util/requireHelper')
     * @param {object} mockedDependencies map of dependencies path to mocked value (e.g. {'lodash': {map: _.mapRight}})
     * @param {function(module)} callback a callback function that gets the required module as an argument
     */
    function requireWithMocks(modulePath, mockedDependencies, callback) {
        var doneCallback = _.noop;
        var mockModule = {};
        var moduleRequired = false;

        getSquireWithMocks(mockedDependencies)
            .require([modulePath], function (module) {
                _.assign(mockModule, module);
                moduleRequired = true;
                doneCallback();
            });

        beforeAll(function (done) { //eslint-disable-line santa/no-jasmine-outside-describe
            if (moduleRequired) {
                done();
                return;
            }

            var timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL - 1000;
            var timer = setTimeout(function () {
                if (!moduleRequired) {
                    // Fail the test with informative error message.
                    expect(modulePath).toBe('required in not more then ' + timeout + 'ms');

                    // Reset done callback to avoid running the tests after the timeout.
                    doneCallback = _.noop;
                }
            }, timeout);

            doneCallback = function () {
                clearTimeout(timer);
                done();
            };
        });

        callback(mockModule);
    }

    return {
        requireWithMocks: requireWithMocks,
        describeWithMocks: describeWithMocks
    };
});
