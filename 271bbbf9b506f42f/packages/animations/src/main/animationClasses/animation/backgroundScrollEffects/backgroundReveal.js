define(['lodash', 'coreUtils', 'animations/localTweenEngine/localTweenEngine'],
    function (_, utils, tweenEngine) {
        "use strict";

        /** core.animationsFactory */
        var factory = tweenEngine.factory;

        var balataConsts = utils.balataConsts;

        var viewPortHeightDefault = 1;
        var componentHeightDefault = 1;

        /**
         * BackgroundReveal animation.
         * @param {Array<HTMLElement>|HTMLElement} elements DOM elements to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
         * @returns {TimelineMax}
         */
        function animation(elements, duration, delay, params) {
            params = params || {};
            var viewPortHeight = params.viewPortHeight || viewPortHeightDefault;
            var componentHeight = params.componentHeight || componentHeightDefault;

            var sequence = factory.sequence(params);
            var childrenToAnimate;

            if (_.get(params, ['browserFlags', 'animateRevealScrubAction'])) {
                //fixed layers on IE and Edge jitter while scrolling , we're animating the layers for steady reveal.
                _.forEach(elements, function (element) {
                    childrenToAnimate = _.map(balataConsts.REVEAL_SELECTORS, function (selector) {
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
                            from: {y: -viewPortHeight},
                            to: {y: componentHeight},
                            force3D: true,
                            immediateRender: true
                        })]);
                });
            } else {
                // no animation , just force 3d layering
                _.forEach(elements, function (element) {
                    childrenToAnimate = _.map(balataConsts.REVEAL_SELECTORS, function (selector) {
                        return element.querySelector(selector);
                    });
                    sequence.add(
                        factory.animate('BaseNone', elements, 0, 0, {
                            transformStyle: 'preserve-3d',
                            force3D: true
                        }),
                        factory.animate('BaseNone', childrenToAnimate, 0, 0, {
                            transformStyle: 'preserve-3d',
                            force3D: true
                        })
                    );
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

        factory.registerAnimation('BackgroundReveal', animation);
    }
);
