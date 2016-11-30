define.experiment.newAnimation('TextRollIn.AnimationText', function() {
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
         * FadeIn from opacity 0 animation object
         * @param {HTMLElement} elements DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @returns {Tween}
         */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params): {};

            var splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
            var letters = splitHtmlText.letters;
            var speed = this._paramsMap.speed[duration];

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],
                types: [this._animations.ClearTypes.SPLIT_TEXT]
            };

            // the tween
            return this._animations.sequence([
                this._animations.set(letters, {opacity:0}),
                this._animations.applyTween('BaseFade', letters, speed.duration, delay, {to:{opacity:1}, stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BasePosition', letters, speed.duration, delay, {from:{x:'-20'}, stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseRotate', letters, speed.duration, delay, {from:{rotation:-120}, stagger:speed.stagger, immediateRender: false})

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
                {duration: 1.5, stagger: 0.06},
                {duration: 1.0, stagger: 0.04},
                {duration: 0.75, stagger: 0.02},
                {duration: 0.5, stagger: 0.01}
            ]
        }
    };
});