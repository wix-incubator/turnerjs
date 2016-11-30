define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function (_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    //var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var transformOrigins = {
        'top left': '0 0',
        'top right': '100% 0',
        'bottom left': '0 100%',
        'bottom right': '100% 100%',
        'center': '50% 50%'
    };

    var easeParams = {
        soft: [0.6],
        medium: [1],
        hard: [1.5]
    };

    /**
     * BounceOut animation object, NOTE: doesn't bounce, only slides.
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

        var direction = params.direction || 'top left';
        var bounce = params.bounce || 'medium';
        var transformOrigin = transformOrigins[direction];
        var fadeInDuration = 0.15;

        params = _.omit(params, ['direction', 'bounce']);

        var sequence = factory.sequence(params);
        sequence
            .add(factory.animate('BaseNone', elements, 0, 0, {transformOrigin: transformOrigin}), 0)
            .add(factory.animate('BaseScale', elements, duration, delay, {
                to: {scale: 0},
                ease: 'Quint.easeIn',
                easeParams: easeParams[bounce]
            }), 0)
            .add(factory.animate('BaseFade', elements, fadeInDuration, delay, {
                to: {opacity: 0},
                ease: 'Sine.easeOut'
            }), '-=' + fadeInDuration);
        return sequence.get();

    }

    animation.properties = {
        hideOnStart: false
    };

    factory.registerAnimation('BounceOut', animation);
});
