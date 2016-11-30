define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        top: {idx: 0},
        right: {idx: 1},
        bottom: {idx: 2},
        left: {idx: 3}
    };

    function adjustDirection(idx, angle) {
        var direction = ['top', 'right', 'bottom', 'left'];
        var shiftBy = Math.round(angle / 90);

        idx = (idx + (direction.length - 1) * shiftBy) % direction.length;

        return direction[idx];
    }

    function getClipTweenParams(element, direction) {
        var compRect = engine.getBoundingRect(element);
        var contentRect = engine.getBoundingContentRect(element);

        var top = contentRect.top - compRect.top;
        var left = contentRect.left - compRect.left;
        var right = contentRect.width + left;
        var bottom = contentRect.height + top;

        var clipParams = {
            top: [top, right, top, left],
            right: [top, right, bottom, right],
            center: [(bottom + top) / 2, (right + left) / 2, (bottom + top) / 2, (right + left) / 2],
            bottom: [bottom, right, bottom, left],
            left: [top, left, bottom, left]
        };

        return {clip: 'rect(' + clipParams[direction].join('px,') + 'px)'};
    }

    /**
     * Reveal (Clip) animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=left] 'top' or 'right' or 'bottom' or 'left'
     * @returns {TimelineMax}
     */
    function reveal(elements, duration, delay, params) {

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = params.direction || 'left';
        delete params.direction;

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration * 0.25, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Cubic.easeInOut'}));

        _.forEach(elements, function(element) {
            var elementAngleInDeg = element.getAttribute('data-angle') || 0;
            var adjDirection = direction !== 'center' ? adjustDirection(paramsMap[direction].idx, elementAngleInDeg) : direction;
            var fromClipParams = getClipTweenParams(element, adjDirection);

            sequence.add(factory.animate('BaseClip', element, duration, delay, {from: fromClipParams, ease: 'Cubic.easeInOut'}), 0);
        });

        return sequence.get();
    }

    reveal.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('Reveal', reveal);
});