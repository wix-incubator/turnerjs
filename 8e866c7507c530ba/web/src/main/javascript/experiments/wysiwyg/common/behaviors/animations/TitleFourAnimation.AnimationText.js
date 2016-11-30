define.experiment.newAnimation('TitleFour.AnimationText', function() {
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
//l.staggerFrom(mySplitText.lines, 0.5, {opacity:0, rotationX:-120, transformOrigin:"top center -150"}, 0.1);
            delete params.duration;

            // the tween
            return this._animations.sequence([
                this._animations.set(letters, {opacity: 0}),
                this._animations.applyTween('BaseFade', letters, speed.duration, delay, {to: {opacity: 1}, stagger: speed.stagger}),
                this._animations.applyTween('BasePosition', letters, speed.duration, delay, {from: {x: -10}, ease: 'Back.easeOut', stagger: speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseScale', letters, speed.duration, delay, {from: {scale:4}, ease: 'Back.easeOut', stagger: speed.stagger, immediateRender: false}),
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
                {duration: 1.5, stagger: 0.03},
                {duration: 1.0, stagger: 0.02},
                {duration: 0.75, stagger: 0.015},
                {duration: 0.5, stagger: 0.01}
            ]
        }

    };
});