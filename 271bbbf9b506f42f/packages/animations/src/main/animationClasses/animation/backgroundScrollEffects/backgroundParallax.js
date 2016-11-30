define(['lodash', 'coreUtils', 'animations/localTweenEngine/localTweenEngine'],
    function (_, utils, tweenEngine) {
        "use strict";

        /** core.animationsFactory */
        var factory = tweenEngine.factory;
        var balataConsts = utils.balataConsts;

        var speedFactorDefault = 0.2;
        var viewPortHeightDefault = 1;
        var componentHeightDefault = 1;

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
            var speedFactor = _.isUndefined(params.speedFactor) ? speedFactorDefault : params.speedFactor;
            var viewPortHeight = params.viewPortHeight || viewPortHeightDefault;
            var componentHeight = params.componentHeight || componentHeightDefault;

            var sequence = factory.sequence(params);
            var childrenToAnimate;

            if (_.get(params, ['browserFlags', 'animateParallaxScrubAction'])) {
                //fixed layers on Edge Browser, jitter while scrolling , we're animating the layers for steady reveal.
                _.forEach(elements, function (element) {
                    childrenToAnimate = _.map(balataConsts.PARALLAX_SELECTORS, function (selector) {
                        return element.querySelector(selector);
                    });
                    sequence.add([
                        factory.animate('BasePosition', element, duration, delay, {
                            from: {y: viewPortHeight},
                            to: {y: -componentHeight},
                            force3D: true,
                            immediateRender: true
                        }),
                        factory.animate('BasePosition', childrenToAnimate, duration, delay, {
                            from: {y: viewPortHeight * (speedFactor - 1)},
                            to: {y: componentHeight * (1 - speedFactor)},
                            force3D: true,
                            immediateRender: true
                        })]);
                });

            } else {
                // animate single layer
                var cssParams = {};
                if (_.get(params, ['browserFlags', 'preserve3DParallaxScrubAction'])) {
                    cssParams = {transformStyle: 'preserve-3d'};
                }
                sequence.add(factory.animate('BaseNone', elements, 0, 0, cssParams));
                _.forEach(elements, function (element) {
                    childrenToAnimate = _.map(balataConsts.PARALLAX_SELECTORS, function (selector) {
                        return element.querySelector(selector);
                    });
                    sequence.add(factory.animate('BasePosition', childrenToAnimate, duration, delay, {
                        from: {y: viewPortHeight * speedFactor},
                        to: {y: 0 - componentHeight * speedFactor},
                        ease: 'Linear.easeNone',
                        force3D: true,
                        immediateRender: true
                    }));
                });
            }

            return sequence.get();
        }

        animation.properties = {
            hideOnStart: false,
            shouldDisableSmoothScrolling: true,
            getMaxTravel: function (elementMeasure, viewportHeight) {
                return viewportHeight + elementMeasure.height;
            }
        };

        factory.registerAnimation("BackgroundParallax", animation);
    }
);
