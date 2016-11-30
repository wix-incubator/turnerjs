define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function (_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    //var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * GlideIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {number} [params.angle] 0 - 360
     * @param {number} [params.distance] 0 - 300
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var angle = (params.angle || 0) * Math.PI / 180;
        var distance = params.distance || 0;

        var transformX = Math.sin(angle) * distance;
        var transformY = Math.cos(angle) * distance * -1;
        var fadeDuration = 0;

        params = _.omit(params, ['angle', 'distance']);

        var sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseFade', elements, fadeDuration, 0, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Sine.easeIn'}),
            factory.animate('BasePosition', elements, duration, delay, {
                from: {x: transformX, y: transformY},
                ease: 'Sine.easeInOut'
            })
        ], 0);

        return sequence.get();

    }

    animation.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('GlideIn', animation);
});
