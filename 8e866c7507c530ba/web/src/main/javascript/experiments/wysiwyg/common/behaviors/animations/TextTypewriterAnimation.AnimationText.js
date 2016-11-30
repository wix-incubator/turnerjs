define.experiment.newAnimation('TextTypewriter.AnimationText', function() {
    return {
        init: function(animations) {
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
            params = params ? _.cloneDeep(params) : {};

            var splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
            var letters = splitHtmlText.letters;

            var speed = this._paramsMap.speed[duration];
            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],
                types: [
                    this._animations.ClearTypes.SPLIT_TEXT
                ]
            };

            delete params.split;
            // the tween
            return this._animations.sequence([
                this._animations.set(letters, {opacity:0}),
                this._animations.applyTween('BaseFade', letters, speed.duration, delay, {to:{opacity:1}, ease: 'Linear.easeNone', stagger:speed.stagger, immediateRender: false}),
            ], params);
        },

        group: ['entrance', 'text'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _paramsMap: {
            speed: [
                {duration: 0.1, stagger: 0.15},
                {duration: 0.05, stagger: 0.085},
                {duration: 0, stagger: 0.04},
                {duration: 0, stagger: 0.02}
            ]
        }

    };
});