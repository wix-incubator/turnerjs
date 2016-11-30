define(['tweenEngine'], function (TweenEngineConstructor) {
    'use strict';

    var tweenEngine = new TweenEngineConstructor();
    /**
     * We decided to disable lagSmoothing in viewer due to some annoying IE behaviors.
     */
    tweenEngine.engine.adjustLagSmoothing(500, 33);
    tweenEngine.engine.useRAF(true);

    return tweenEngine;
});
