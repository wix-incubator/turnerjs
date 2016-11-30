define(['lodash', 'animations/localTweenEngine/localTweenEngine'],
    function (_, tweenEngine) {
        "use strict";

        // var balataConsts = utils.balataConsts;
        /** core.animations.tweenEngineGreenSock */
        var engine = tweenEngine.engine;
        /** core.animationsFactory */
        var factory = tweenEngine.factory;

        var blurDefault = 20;

        /**
         * Move balata media elements vertically (from y:0)
         * @param {Array<HTMLElement>|HTMLElement} elements DOM elements to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
         * @param {Number} [params.blur]
         * @returns {TimelineMax}
         */
        function animation(elements, duration, delay, params) {
            params = params || {};
            var maxBlur = params.blur || blurDefault;
            var sequence = factory.sequence(params);

            // TweenMax on Firefox doesn't like the fact we try to tween WebkitFilter which is undefined in FF.
            var useWebkitFilter = !_.isUndefined(elements[0].style.WebkitFilter);

            _.forEach(elements, function (element) {
                element.setAttribute('data-blur', 0);
                factory.animate('BaseNone', element, 0, 0, {force3D: true});
                sequence.add(factory.animate('BaseAttribute', element, duration, delay, {
                    from: {attr: {'data-blur': maxBlur}},
                    to: {attr: {'data-blur': 0}},
                    ease: 'Circ.easeIn',
                    immediateRender: true,
                    callbacks: {
                        onUpdate: function () {
                            var blur = element.getAttribute('data-blur');
                            engine.tween(element, {
                                duration: 0,
                                delay: 0,
                                WebkitFilter: 'blur(' + blur + 'px)',
                                filter: 'blur(' + blur + 'px)'
                            }, useWebkitFilter ? ['WebkitFilter', 'filter'] : ['filter']);
                        }
                    }
                }));
            });

            return sequence.get();
        }

        animation.properties = {
            hideOnStart: false,
            getMaxTravel: function (elementMeasure, viewportHeight, siteHeight) {
                return Math.min(siteHeight - elementMeasure.top, (viewportHeight + elementMeasure.height) / 2, viewportHeight * 0.9);
            }
        };

        factory.registerAnimation("BackgroundBlurIn", animation);
    }
);
