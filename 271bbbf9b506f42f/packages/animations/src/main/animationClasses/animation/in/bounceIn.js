define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function (_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var transformDirection = {
        'top left': {y: -1.1, x: -1.1, idx: 0},
        'top right': {y: -1.1, x: 1.1, idx: 1},
        'bottom right': {y: 1.1, x: 1.1, idx: 2},
        'bottom left': {y: 1.1, x: -1.1, idx: 3},
        'center': {y: 0, x: 0, idx: -1}
    };

    var easeParams = {
        // [Amplitude, Frequency]
        soft: [0.6, 0.25],
        medium: [0.9, 0.22],
        hard: [1.3, 0.2]
    };

    function translatePoint(x, y, angle) {
        // x' = x * cos (a) - y * sin (a)
        // y' = x * sin (a) + y * cos (a)
        angle = angle * Math.PI / 180;
        return {
            x: x * Math.cos(angle) - y * Math.sin(angle),
            y: x * Math.sin(angle) + y * Math.cos(angle)
        };
    }

    function getAdjustedDirection(idx, angle) {
        var direction = ['top left', 'top right', 'bottom right', 'bottom left'];
        var shiftBy = Math.round(angle / 90);

        idx = (idx + (direction.length - 1) * shiftBy) % direction.length;
        return direction[idx];
    }

    /**
     * FloatIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=right] 'top left', 'top right', 'bottom left', 'bottom right' or 'center'
     * @param {String} [params.bounce='medium'] 'soft', 'medium', 'hard'
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = transformDirection[params.direction || 'top left'];

        var bounce = params.bounce || 'medium';
        var duration1 = duration * 0.3;
        var duration2 = duration - duration1;

        params = _.omit(params, ['direction', 'bounce']);

        var sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseFade', elements, duration1, delay, {
                from: {opacity: 0},
                to: {opacity: 1},
                ease: 'Cubic.easeIn'
            })
        ]);
        _.forEach(elements, function (element) {
            var bounds = engine.getElementRect(element);
            var angle = (element.getAttribute('data-angle') || 0);

            var normalizedDirection = direction;
            if (direction.idx >= 0 && angle > 0) {
                normalizedDirection = transformDirection[getAdjustedDirection(direction.idx, angle)];
            }

            var sourcePoint = translatePoint(bounds.width / 2 * normalizedDirection.x, bounds.height / 2 * normalizedDirection.y, angle);
            var midPoint = translatePoint(bounds.width / 3 * normalizedDirection.x, bounds.height / 3 * normalizedDirection.y, angle);

            sequence.add([
                factory.animate('BasePosition', element, duration1, delay, {
                    from: {
                        x: sourcePoint.x,
                        y: sourcePoint.y
                    },
                    to: {
                        x: midPoint.x,
                        y: midPoint.y
                    },
                    ease: 'Expo.easeIn'
                }),

                factory.animate('BaseScale', element, duration1, delay, {
                    from: {scale: 0},
                    to: {scale: 0.3},
                    ease: 'Expo.easeIn'
                })
            ], 0);
            sequence.add([
                factory.animate('BasePosition', element, duration2, 0, {
                    to: {
                        x: 0,
                        y: 0
                    },
                    ease: 'Elastic.easeOut',
                    easeParams: easeParams[bounce]
                }),
                factory.animate('BaseScale', element, duration2, 0, {
                    to: {scale: 1},
                    ease: 'Elastic.easeOut',
                    easeParams: easeParams[bounce]
                })
            ]);
        });

        return sequence.get();

    }

    animation.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('BounceIn', animation);
});
