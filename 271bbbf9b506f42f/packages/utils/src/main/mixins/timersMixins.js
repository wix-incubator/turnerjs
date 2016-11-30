define(['lodash'], function(_){
    'use strict';
    /**
     * @class core.intervalsMixin
     */
    var intervalsMixin = {
        componentWillMount: function () {
            this.intervals = {};
        },
        componentWillUnmount: function () {
            _.forEach(this.intervals, function (timerId, timerName) {
                this.clearIntervalNamed(timerName);
            }, this);
        },
        setIntervalNamed: function (timerName, callback, timeout) {
            if (this.intervals.hasOwnProperty(timerName)) {
                this.clearIntervalNamed(timerName);
            }
            this.intervals[timerName] = setInterval(function () {
                delete this.intervals[timerName];
                callback();
            }.bind(this), timeout);
        },
        setInterval: function (callback, timeout) {
            this.setIntervalNamed("default", callback, timeout);
        },
        clearIntervalNamed: function (timerName) {
            clearInterval(this.intervals[timerName]);
            delete this.intervals[timerName];
        },
        clearInterval: function () {
            this.clearIntervalNamed("default");
        }
    };

    /**
     * @class core.timeoutsMixin
     */
    var timeoutsMixin = {
        componentWillMount: function () {
            this.timeouts = {};
        },
        componentWillUnmount: function () {
            _.forEach(this.timeouts, function (timerId, timerName) {
                this.clearTimeoutNamed(timerName);
            }, this);
        },
        setTimeoutNamed: function (timerName, callback, timeout) {
            if (this.timeouts.hasOwnProperty(timerName)) {
                this.clearTimeoutNamed(timerName);
            }
            this.timeouts[timerName] = setTimeout(function () {
                delete this.timeouts[timerName];
                callback();
            }.bind(this), timeout);
        },
        setTimeout: function (callback, timeout) {
            this.setTimeoutNamed("default", callback, timeout);
        },
        clearTimeoutNamed: function (timerName) {
            if (this.timeouts[timerName]) {
                clearTimeout(this.timeouts[timerName]);
                delete this.timeouts[timerName];
            }
        },
        clearTimeout: function () {
            this.clearTimeoutNamed("default");
        }
    };

    return {
        timeoutsMixin: timeoutsMixin,
        intervalsMixin: intervalsMixin
    };
});
