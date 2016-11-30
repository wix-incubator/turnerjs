define.experiment.newAnimation('TextScrabble.AnimationText', function() {
    return {
        init: function(animations) {
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
            var scale, ease, speed;
            var innerElements;
            params = params ? _.cloneDeep(params) : {};

            var splitHtmlText;

            if (params.split === 'words') {
                splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'words');
                innerElements = splitHtmlText.words;
                speed = this._paramsMap.words.speed[duration];
                scale = this._paramsMap.words.scale;
                ease = this._paramsMap.words.scaleEase;
            }
            else {
                splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
                innerElements = splitHtmlText.letters;
                speed = this._paramsMap.letters.speed[duration];
                scale = this._paramsMap.letters.scale;
                ease = this._paramsMap.letters.scaleEase;
            }

            innerElements = _.shuffle(innerElements);


            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],
                types: [
                    this._animations.ClearTypes.SPLIT_TEXT,
                    this._animations.ClearTypes.CSS_STYLE
                ]
            };

            delete params.duration;
            delete params.split;
            delete params.sort;

            // the tween
            return this._animations.sequence([
                this._animations.set(innerElements, {opacity:0}),
                this._animations.applyTween('BaseFade', innerElements, speed.duration, delay, {to:{opacity:1}, ease: 'Power1.easeOut', stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseScale', innerElements, speed.duration, delay, {from: {scale: scale}, ease: ease, stagger: speed.stagger, immediateRender: false})
            ], params);
        },

        group: ['entrance', 'text'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _paramsMap: {
            words: {
                speed: [
                    {duration: 2, stagger: 0.05},
                    {duration: 1.3, stagger: 0.03},
                    {duration: 1, stagger: 0.02},
                    {duration: 0.5, stagger: 0.01}
                ],
                scale: 2,
                scaleEase: 'Back.easeOut'
            },
            letters: {
                speed: [
                    {duration: 1.5, stagger: 0.02},
                    {duration: 1.0, stagger: 0.013},
                    {duration: 0.75, stagger: 0.01},
                    {duration: 0.5, stagger: 0.007}
                ],
                scale: 3,
                scaleEase: 'Bounce.easeOut'
            }
        }

    };
});