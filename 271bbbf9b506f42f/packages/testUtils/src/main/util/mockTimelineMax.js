define([], function() {
    "use strict";

    var TimelineMax = function() {
        this.args = arguments[0];
        this.data = arguments[0].data;
        this.tweens = []; // for test purposes only - checking if `add` method was called
    };

    TimelineMax.prototype.add = function(value) {
        this.tweens.push(value);
        return this;
    };

    TimelineMax.prototype.pause = function() {};
    TimelineMax.prototype.paused = function() {};
    TimelineMax.prototype.clear = function() {};
    TimelineMax.prototype.progress = function() {};
    TimelineMax.prototype.kill = function() {};

    return TimelineMax;
});