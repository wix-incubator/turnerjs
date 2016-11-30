define.experiment.newAnimation('TitleSix.AnimationText', function() {
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

            delete params.duration;

            for (var i = 0; i < letters.length; i++) {
                this._animations.set(letters[i], {opacity: 0, x: this._randomRange(-100, 100), y: this._randomRange(-100, 100), scale: this._randomRange(0, 2)});
            }

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', letters, speed.duration, delay, {to: {opacity: 1}, stagger: speed.stagger}),
                this._animations.applyTween('BasePosition', letters, speed.duration, delay, {to: {x: 0, y: 0}, stagger: speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseScale', letters, speed.duration, delay, {to: {scale: 1}, ease: 'Back.easeOut', stagger: speed.stagger, immediateRender: false})
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
                {duration: 1.5, stagger: 0.02},
                {duration: 1.0, stagger: 0.013},
                {duration: 0.75, stagger: 0.01},
                {duration: 0.5, stagger: 0.007}
            ]
        },
        _randomRange: function(from, to) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        }

    };
});