define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        pseudoRight: {angleX: '180', angleY: '0', idx: 0},
        right: {angleX: '0', angleY: '180', idx: 1},
        pseudoLeft: {angleX: '-180', angleY: '0', idx: 2},
        left: {angleX: '0', angleY: '-180', idx: 3}
    };

    function getAdjustedDirection(idx, angle) {
        var direction = ['pseudoRight', 'right', 'pseudoLeft', 'left'];
        var shiftBy = Math.round(angle / 90);

        idx = (idx + (direction.length - 1) * shiftBy) % direction.length;
        return direction[idx];
    }

    function getRotate3DParams(direction) {
        return {rotationX: paramsMap[direction].angleX, rotationY: paramsMap[direction].angleY};
    }

    function getTransformOriginParams(element) {
        return '50% 50% ' + (-1.50 * element.offsetWidth);
    }

    /**
     * Arc Out animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=left] right, left
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = params.direction || 'left';
        delete params.direction;

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 1}, to: {opacity: 0}, ease: 'Sine.easeInOut'}));

        _.forEach(elements, function(element) {
            var elementAngleInDeg = element.getAttribute('data-angle') || 0;
            var adjDirection = getAdjustedDirection(paramsMap[direction].idx, elementAngleInDeg);
            var rotate3DParams = getRotate3DParams(adjDirection);
            var transformOriginParams = getTransformOriginParams(element);

            sequence
                .add(engine.set(element, {transformOrigin: transformOriginParams}), 0)
                .add(factory.animate('BaseRotate3D', element, duration, delay, {to: rotate3DParams, perspective: 200, fallbackFor3D: false, ease: 'Sine.easeInOut'}), 0);
        });

        return sequence.get();
    }

    animation.properties = {
        hideOnStart: false
    };

    factory.registerAnimation('ArcOut', animation);
});
