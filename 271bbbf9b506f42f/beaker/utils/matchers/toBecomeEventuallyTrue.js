define(['lodash'], function (_) {
    'use strict';

    var DEFAULT_MAX_TIME = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    var DEFAULT_MIN_TIME = 0;
    var MIN_POLL_INTERVAL = 20;

    function notPassed(message) {
        return {
            pass: false,
            message: message
        };
    }

    function getTimerOptions(expected) {
        var minimalTime = expected.minimalTime || DEFAULT_MIN_TIME;
        var maximumTime = expected.maximumTime || DEFAULT_MAX_TIME;
        var pollInterval = expected.pollInterval || Math.max(MIN_POLL_INTERVAL, Math.round((maximumTime - minimalTime) / 10));

        return {
            success: expected.success,
            fail: expected.fail,
            minimalTime: minimalTime,
            maximumTime: maximumTime,
            pollInterval: pollInterval
        };
    }

    function setupTimers(predicateFn, options) {
        var intervals = [],
            timeouts = [],
            tooEarly = true,
            tooLate = false;

        function stopPolling() {
            intervals.forEach(clearInterval);
            timeouts.forEach(clearTimeout);
        }

        timeouts.push(setTimeout(function () { tooEarly = false; }, options.minimalTime));
        timeouts.push(setTimeout(function () { tooLate = true; }, options.maximumTime));

        intervals.push(setInterval(function () {
            var predicateResult = _.attempt(predicateFn);
            var didHappen = predicateResult && !_.isError(predicateResult);

            if (didHappen || tooLate) {
                stopPolling();

                if (tooEarly) {
                    options.fail('Did not expect predicate function ' + predicateFn.name + ' to become true in ' + options.minimalTime + ' ms');
                } else if (tooLate) {
                    options.fail('Expected predicate function ' + predicateFn.name + ' to become true in ' + options.maximumTime + ' ms');
                } else {
                    options.success();
                }
            }
        }, options.pollInterval));
    }

    return function () {
        return {
            compare: function toBecomeEventuallyTrue(predicateFn, expected) {
                if (!_.isFunction(predicateFn)) {
                    return notPassed('Expected ' + predicateFn + ' to be a function');
                }

                if (!expected || !_.isFunction(expected.success)) {
                    return notPassed('Expected expectation object to have success function');
                }

                if (!expected || !_.isFunction(expected.fail)) {
                    return notPassed('Expected expectation object to have fail function');
                }

                setupTimers(predicateFn, getTimerOptions(expected));

                return { pass: true };
            }
        };
    };
});
