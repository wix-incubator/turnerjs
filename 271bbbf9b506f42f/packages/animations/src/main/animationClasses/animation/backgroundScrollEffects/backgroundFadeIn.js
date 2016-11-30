define(['lodash', 'animations/localTweenEngine/localTweenEngine'],
    function (_, tweenEngine) {
        "use strict";

        // var balataConsts = utils.balataConsts;
        /** core.animations.tweenEngineGreenSock */
        //var engine = tweenEngine.engine;
        /** core.animationsFactory */
        var factory = tweenEngine.factory;

        /**
         * Move balata media elements vertically (from y:0)
         * @param {Array<HTMLElement>|HTMLElement} elements DOM elements to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
         * @param {Number} [params.speedFactor] the speed of the animation relative to the scroll
         * @returns {TimelineMax}
         */
        function animation(elements, duration, delay, params) {
            params = params || {};
            var sequence = factory.sequence(params);

            sequence.add(factory.animate('BaseFade', elements, duration, delay, {
                from: {opacity: 0},
                to: {opacity: 1},
                ease: 'Circ.easeIn',
                force3D: true,
                immediateRender: true
            }));

            return sequence.get();
        }

        animation.properties = {
            hideOnStart: false,
            getMaxTravel: function (elementMeasure, viewportHeight, siteHeight) {
                return Math.min(siteHeight - elementMeasure.top, (viewportHeight + elementMeasure.height) / 2, viewportHeight * 0.9);
            }
        };

        factory.registerAnimation("BackgroundFadeIn", animation);
    }
);
