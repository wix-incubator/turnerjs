define.experiment.newAnimation('TextFusilli.AnimationText', function() {
    return {
        init: function(animations){
            this._animations = animations;
        },
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params): {};

            var splitHtmlText = new this._animations.utils.InsertSplitHtmlText(element, 'letters');
            var root = splitHtmlText.root;
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

            // the tween
            return this._animations.sequence([
                this._animations.set(root, {perspective:400}),
                this._animations.set(letters, {opacity:0}),
                this._animations.applyTween('BaseFade', letters, speed.duration, delay, {to:{opacity:1}, ease:'Back.easeOut', stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseScale', letters, speed.duration, delay, {from:{scale:4}, ease:'Back.easeOut', stagger:speed.stagger, immediateRender: false}),
                this._animations.applyTween('BaseRotate3D', letters, speed.duration, delay, {from:{rotationX:-180, transformOrigin:"100% 50%"}, ease:'Back.easeOut', stagger:speed.stagger, immediateRender: false})
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
                {duration: 1.7, stagger: 0.04},
                {duration: 1.2, stagger: 0.03},
                {duration: 0.6, stagger: 0.02},
                {duration: 0.3, stagger: 0.01}
            ]
        }

    };
});