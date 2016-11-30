define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;


    /**
     * Scroll base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Object} [params.scrollTo] params.to.scrollTo will work to for compatibility reasons, defaults to {x:0, y:0}
     * @param {Number} [params.x]
     * @param {Number} [params.y]
     * @param {Boolean} [params.autoKill=false] set to false so the scroll will continue even if interrupted
     * @returns {TimelineMax|TweenMax}
     */
    function baseScroll(elements, duration, delay, params) {
        params = params || {};
        params.duration = duration || 0;
        params.delay = delay || 0;
        params.scrollTo = {x: params.x || 0, y: params.y || 0, autoKill: params.autoKill || false};
        delete params.x;
        delete params.y;
        delete params.autoKill;

        elements = (elements instanceof window.HTMLElement || elements === window) ? [elements] : elements;

        var sequence = factory.sequence();

        _.forEach(elements, function(element){
            sequence.add(engine.tween(element, params, ['scrollTo', 'autoKill']), 0);
        });

        return sequence.get();
    }

    factory.registerAnimation('BaseScroll', baseScroll);
});