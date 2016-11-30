define.experiment.newAnimation('TextFlyIn.AnimationText', function() {
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

            var splitHtmlText;
            var innerElements;
            switch (params.split){
                case 'randomWords':
                    splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'words');
                    innerElements = _.shuffle(splitHtmlText.words);
                    break;
                case 'randomLetters':
                    splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
                    innerElements = _.shuffle(splitHtmlText.letters);
                    break;
                case 'words':
                    splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'words');
                    innerElements = splitHtmlText.words;
                    break;
                case 'letters':
                    splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
                    innerElements = splitHtmlText.letters;
                    break;
                default:
                    splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
                    innerElements = splitHtmlText.letters;
            }

            var speed = this._paramsMap.speed[duration];
            var direction = this._paramsMap.direction[params.direction];

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],
                types: [
                    this._animations.ClearTypes.SPLIT_TEXT
                ]
            };

            delete params.direction;
            delete params.split;
            delete params.shuffle;

            // the tween
            return this._animations.sequence([
                this._animations.set(innerElements, {opacity:0}),
                this._animations.applyTween('BaseFade', innerElements, speed.duration, delay, {to:{opacity:1}, stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BasePosition', innerElements, speed.duration, delay, {from: {x: direction.x, y: direction.y}, stagger: speed.stagger, immediateRender: false})
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
                {duration: 0.5, stagger: 0.05},
                {duration: 0.3, stagger: 0.03},
                {duration: 0.1, stagger: 0.01},
                {duration: 0.1, stagger: 0.005}
            ],
            direction: {
                left: { x: -300},
                right: { x: 300},
                bottom: { y: 300},
                top: { y: -300}
            }
        }

    };
});