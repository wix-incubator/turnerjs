define.experiment.newAnimation('TextWave.AnimationText', function() {
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
            params = params ? _.cloneDeep(params): {};

            var splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
            var letters = splitHtmlText.letters;
            var root = splitHtmlText.root;
            var speed = this._paramsMap.speed[duration];

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],
                types: [
                    this._animations.ClearTypes.SPLIT_TEXT
                ]
            };

            delete params.duration;

            // the tween
            return this._animations.sequence([
                this._animations.set(root, {perspective:400}),
                this._animations.set(letters, {opacity:0}),
                this._animations.applyTween('BaseFade', letters, speed.duration, delay, {to:{opacity:1}, ease:'Back.easeOut', stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseScale', letters, speed.duration, delay, {from:{scale:0}, ease:'Back.easeOut', stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseRotate3D', letters, speed.duration, delay, {from:{rotationX:180, transformOrigin:"0% 50% -50"}, ease:'Back.easeOut', stagger:speed.stagger, immediateRender: false})
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
        }

    };
});