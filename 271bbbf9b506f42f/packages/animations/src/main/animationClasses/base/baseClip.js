define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    function getClipRect(element) {
        //TODO: we need measurements of children of container.
        //TODO: fix and uncomment this when we have measurements

        var compRect = engine.getBoundingRect(element);
        var contentRect = engine.getBoundingContentRect(element);

        var top = contentRect.top - compRect.top;
        var left = contentRect.left - compRect.left;
        var right = contentRect.width + left;
        var bottom = contentRect.height + top;

        return 'rect(' + [top, right, bottom, left].join('px,') + 'px)';
    }

    /**
     * Clip base animation object, expect all passed elements to be of the same size
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {String} [params.from.clip]
     * @param {String} [params.to.clip]
     * @returns {TimelineMax}
     */
    function baseClip(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        if (!params.to || !params.to.clip){
            params.to = params.to || {};
            params.to.clip = getClipRect(elements[0]);
        }
        if (!params.from || !params.from.clip){
            params.from = params.from || {};
            params.from.clip = getClipRect(elements[0]);
        }

        return engine.tween(elements, params, ['clip']);
    }

    factory.registerAnimation('BaseClip', baseClip);
});
