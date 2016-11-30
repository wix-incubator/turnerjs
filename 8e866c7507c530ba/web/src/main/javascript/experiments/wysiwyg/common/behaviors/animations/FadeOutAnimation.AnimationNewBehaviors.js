define.experiment.newAnimation('FadeOut.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * FadeOut to opacity 0 animation object
         * @param {HTMLElement} elements DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @returns {Tween}
         */
        animate: function(elements, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: elements,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', elements, duration, delay, {to: {opacity: 0}, ease: 'Cubic.easeIn'})
            ], params);
        },

        group: ['exit'],

        options: {
            hideOnStart: false
        }
    };
});