define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        top: {angleX: '90', angleY: '0', idx: 0},
        right: {angleX: '0', angleY: '90', idx: 1},
        bottom: {angleX: '-90', angleY: '0', idx: 2},
        left: {angleX: '0', angleY: '-90', idx: 3}
    };

    function getAdjustedDirection(idx, angle) {
        var direction = ['top', 'right', 'bottom', 'left'];
        var shiftBy = Math.round(angle / 90);

        idx = (idx + (direction.length - 1) * shiftBy) % direction.length;
        return direction[idx];
    }

    /**
     * Flip in from
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = params.direction || 'left';
        delete params.direction;

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration * 0.75, delay + (duration * 0.25), {from: {opacity: 1}, to: {opacity: 0}, ease: 'Sine.easeOut'}));

        _.forEach(elements, function(element){
            var elementAngleInDeg = element.getAttribute('data-angle') || 0;

            var adjDirection = getAdjustedDirection(paramsMap[direction].idx, elementAngleInDeg);
            var to = {rotationX: paramsMap[adjDirection].angleX, rotationY: paramsMap[adjDirection].angleY};

            sequence.add(factory.animate('BaseRotate3D', element, duration * 0.75, delay, {to: to, perspective: 800, fallbackFor3D: true, ease: 'Strong.easeOut'}), 0);
        });

        return sequence.get();

    }

    animation.properties = {
        hideOnStart: false
    };
    factory.registerAnimation('FlipOut', animation);
});
