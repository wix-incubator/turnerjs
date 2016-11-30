define(['lodash', 'animations/localTweenEngine/localTweenEngine', 'coreUtils'],
    function (_, tweenEngine, utils) {
        "use strict";

        var balataConsts = utils.balataConsts;

        /** core.animationsFactory */
        var factory = tweenEngine.factory;

        /**
         * Move balata media elements vertically and zoom(from y:0)
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

            _.forEach(elements, function (element) {
                var childrenToZoom = _.map(balataConsts.ZOOM_SELECTORS, function (selector) {
                    return element.querySelector(selector);
                });
                sequence.add([
                    factory.animate('BasePosition', element, 0, delay, {
                        perspective: 100,
                        force3D: true,
                        immediateRender: true
                    }),
                    factory.animate('BasePosition', childrenToZoom, duration, delay, {
                        force3D: true,
                        from: {z: 0},
                        to: {z: 40},
                        ease: 'Sine.easeIn',
                        immediateRender: true
                    })
                ]);
            });

            return sequence.get();
        }

        animation.properties = {
            hideOnStart: false,
            shouldDisableSmoothScrolling: true,
            getMaxTravel: function (elementMeasure, viewportHeight) {
                return viewportHeight + elementMeasure.height;
            }
        };

        factory.registerAnimation('BackgroundZoom', animation);
    });
