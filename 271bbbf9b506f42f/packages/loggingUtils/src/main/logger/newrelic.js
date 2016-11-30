/**
 * Created by Dan_Shappir on 7/13/15.
 */
define(['lodash'], function (_) {
    'use strict';

    if (typeof window !== 'undefined' && !(window.queryUtil && window.queryUtil.isParameterTrue('suppressbi'))) {
        var newrelic;
        try {
            newrelic = window.parent.newrelic; // Use parent for preview in editor
        } catch (e) {
            newrelic = window.newrelic;
        }
        if (newrelic) {
            var timeSinceNavigate = window.performance && window.performance.now ?
                function () {
                    return Math.round(window.performance.now());
                } : function () {
                    return 0;
                };

            return {
                setCustomAttribute: newrelic.setCustomAttribute.bind(newrelic),
                addPageAction: function (name, attributes) {
                    var tsn = timeSinceNavigate();
                    attributes = _.assign({}, attributes, {timeSinceNavigate: tsn});
                    return newrelic.addPageAction(name, attributes);
                },
                finished: function () {
                    var tsn = timeSinceNavigate();
                    if (tsn) {
                        this.setCustomAttribute('timeSinceNavigate', timeSinceNavigate());
                    }
                    return newrelic.finished.apply(newrelic, arguments);
                }
            };
        }
    }
    return {
        setCustomAttribute: _.noop,
        addPageAction: _.noop,
        finished: _.noop
    };
});
