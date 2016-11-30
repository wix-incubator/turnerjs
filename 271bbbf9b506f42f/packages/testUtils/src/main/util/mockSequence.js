define(['lodash'], function(_) {
    "use strict";
    function MockSequence() {
        this.id = _.uniqueId('mock_seq_');
    }

    MockSequence.prototype.add = function() {
        return this;
    };

    MockSequence.prototype.onStartAll = function(callback) {
        this.onStart = callback;
        return this;
    };

    MockSequence.prototype.onInterruptAll = function(callback) {
        this.onInterrupt = callback;
        return this;

    };

    MockSequence.prototype.onCompleteAll = function(callback) {
        this.onComplete = callback;
        return this;

    };

    MockSequence.prototype.onReverseAll = function(callback) {
        this.onComplete = callback;
        return this;

    };

    MockSequence.prototype.execute = function() {
        if (this.onStart) {
            this.onStart();
        }
        if (this.onComplete) {
            this.onComplete();
        }
    };

    MockSequence.prototype.hasAnimations = function() {
        return true;
    };

    MockSequence.prototype.getId = function() {
        return this.id;
    };

    return function() {
        var seq = new MockSequence();
        if (arguments.length) {
            seq.add.apply(seq, arguments);
        }
        return seq;
    };

});

