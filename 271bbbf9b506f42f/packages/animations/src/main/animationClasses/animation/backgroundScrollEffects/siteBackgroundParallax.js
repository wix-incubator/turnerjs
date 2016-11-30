define(['animations/localTweenEngine/localTweenEngine'], function (tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Move an element vertically (from y:0)
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {Number} [params.speedFactor=1] the parallax movement factor, lower is slower tan scroll speed
     * @param {Number} [params.maxScroll=document.body.scrollHeight] the parallax movement factor, lower is slower tan scroll speed
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        var sequence = factory.sequence(params);
        var speedFactor = 0.2;
        var maxY = Math.max(window.document.body.scrollHeight * speedFactor, 0);
        var desiredY = window.innerHeight * speedFactor;
        var y = Math.min(maxY, desiredY);

        sequence.add(factory.animate('BasePosition', elements, duration, delay, {
            from: {y: 0},
            to: {y: -y},
            force3D: true,
            ease: 'Linear.easeNone'
        }));

        return sequence.get();

    }

    animation.properties = {
        hideOnStart: false,
        getMaxTravel: function (elementMeasure, viewportHeight, siteHeight) {
            return Math.max(siteHeight - viewportHeight, 0);
        }
    };

    factory.registerAnimation('SiteBackgroundParallax', animation);
});
