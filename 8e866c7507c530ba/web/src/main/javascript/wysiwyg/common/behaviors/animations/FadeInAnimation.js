define.animation('FadeIn', function() {
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * FadeIn from opacity 0 animation object
        * @param {HTMLElement} element DOM element to animate
        * @param {Number} [duration]
        * @param {Number} [delay]
        * @param {Object} [params]
        * @returns {Tween}
        */
        animate: function(element, duration, delay, params) {
            params = params || {};

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay, {from: {opacity: 0},  ease: 'Cubic.easeIn'})
            ], params);
        },

        group: ['entrance'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        }
    };
});