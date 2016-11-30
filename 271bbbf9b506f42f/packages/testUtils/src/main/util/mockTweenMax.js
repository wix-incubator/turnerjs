define([], function() {
    "use strict";

    var TweenMaxInstance = function() {
        this.args = arguments[0];
    };

    TweenMaxInstance.prototype.pause = function() {};
    TweenMaxInstance.prototype.paused = function() {};
    TweenMaxInstance.prototype.progress = function() {};
    TweenMaxInstance.prototype.kill = function() {};

    return {
        to: function() { return new TweenMaxInstance(arguments); },
        from: function() { return new TweenMaxInstance(arguments); },
        fromTo: function() { return new TweenMaxInstance(arguments); },
        staggerTo: function() { return new TweenMaxInstance(arguments); },
        staggerFrom: function() { return new TweenMaxInstance(arguments); },
        staggerFromTo: function() { return new TweenMaxInstance(arguments); },
        ticker: {
            addEventListener: function() {},
            removeEventListener: function() {}
        },
        isTweening: function() {}
    };
});