define(['lodash', 'loggingUtils/logger/newrelic'], function (_, newrelic) {
    'use strict';

    var START_MARKER = ' start';
    var FINISH_MARKER = ' finish';

    var queryUtil = typeof window !== 'undefined' && window.queryUtil;
    if (!queryUtil || queryUtil.isParameterTrue('suppressperformance')) {
        return {
            mark: _.noop,
            measure: _.noop,

            start: _.noop,
            startOnce: _.noop,
            finish: _.noop,

            time: function (name, code) {
                return code.apply(this, Array.prototype.slice.call(arguments, 2));
            },

            getMark: _.noop,
            getMeasure: _.noop,

            clearMarks: _.noop,
            clearMeasures: _.noop,

            now: _.now
        };
    }

    var now, performance = window.performance;
    if (performance && performance.now) {
        now = performance.now.bind(performance);
    } else {
        var initialTimestamp = (window.wixBiSession && window.wixBiSession.initialTimestamp) || 0;
        now = function () {
            return _.now() - initialTimestamp;
        };
    }

    var sendReport = /*queryUtil.getParameterByName('debug') && queryUtil.getParameterByName('sampleratio') !== 'force' ?
        _.noop :*/
        function (measure, attributes) {
            if (measure) {
                attributes = _.defaults({
                    measureName: measure.name,
                    startTime: Math.round(measure.startTime),
                    duration: Math.round(measure.duration)
                }, attributes);
                newrelic.addPageAction('measure', attributes);
            }
        };

    var api;
    if (performance && performance.measure) {
        var getEntry = function (entryType, name) {
            return _.find(performance.getEntriesByName(name), {entryType: entryType});
        };

        api = {
            mark: performance.mark.bind(performance),
            measure: function (name, startMark, endMark, report, attributes) {
                try {
                    performance.measure(name, startMark, endMark);
                    if (report) {
                        sendReport(api.getMeasure(name), attributes);
                    }
                } catch (e) {
                    // Do nothing
                }
            },
            getMark: getEntry.bind(this, 'mark'),
            getMeasure: getEntry.bind(this, 'measure'),
            clearMarks: performance.clearMarks.bind(performance),
            clearMeasures: performance.clearMeasures.bind(performance)
        };
    } else {
        var marks = {
            domLoading: {
                name: 'domLoading',
                startTime: 0
            }
        };
        var measures = {};
        var clear = function (map, name) {
            if (name) {
                delete map[name];
            } else {
                map = {};
            }
        };

        api = {
            mark: function (name) {
                marks[name] = {
                    name: name,
                    startTime: now()
                };
            },
            measure: function (name, startMark, endMark, report, attributes) {
                var s = api.getMark(startMark);
                var e = api.getMark(endMark);
                if (s && e) {
                    var m = {
                        name: name,
                        startTime: s.startTime,
                        duration: e.startTime - s.startTime
                    };
                    if (!isNaN(m.duration)) {
                        measures[name] = m;
                        if (report) {
                            sendReport(m, attributes);
                        }
                    }
                }
            },
            getMark: function (name) {
                return marks[name];
            },
            getMeasure: function (name) {
                return measures[name];
            },
            clearMarks: clear.bind(this, marks),
            clearMeasures: clear.bind(this, measures)
        };
    }

    api.start = function (name) {
        api.clearMeasures(name);
        api.mark(name + START_MARKER);
    };
    api.startOnce = function (name) {
        if (!api.getMark(name + START_MARKER)) {
            api.start(name);
        }
    };
    api.finish = function (name, report, attributes) {
        var nameStart = name + START_MARKER;
        if (api.getMark(nameStart)) {
            var nameFinish = name + FINISH_MARKER;
            api.mark(nameFinish);
            api.measure(name, nameStart, nameFinish, report, attributes);
            api.clearMarks(nameFinish);
            api.clearMarks(nameStart);
        }
        return api.getMeasure(name);
    };
    api.time = function (name, code, report, attributes) {
        try {
            api.start(name);
            return code.apply(this, Array.prototype.slice.call(arguments, 4));
        } finally {
            api.finish(name, report, attributes);
        }
    };
    api.now = now;

    return api;
});
