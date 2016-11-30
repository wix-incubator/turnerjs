define.experiment.newTransition('OutIn.AnimationPageTransitions',function(animations){
    return {
        init: function(toPageNode, fromPageNode, params) {
            params = params || {};
            return (params.reverse) ? this._reverseTransition(toPageNode, fromPageNode, params) : this._transition(toPageNode, fromPageNode, params);
        },

        _transition: function(toPageNode, fromPageNode, params){
            var duration = params.duration || this.defaults.duration;
            var fadeDuration = duration / 2;
            var windowScroll = window.getScrollTop();

            return animations.sequence([
                animations.applyTween('FadeOut', fromPageNode, fadeDuration, 0, {ease: 'Power3.easeIn'}),
                animations.applyTween('FadeIn', toPageNode, fadeDuration + 0.1, fadeDuration - 0.1, {ease: 'Power3.easeOut'}),
                animations.applyTween('BasePosition', toPageNode, 0, 0, {to:{top: windowScroll}})

            ], {autoClear: true});
        },

        _reverseTransition: function(toPageNode, fromPageNode, params){
            this._transition(toPageNode, fromPageNode, params);
        },

        legacyTypes: ['outIn'],

        defaults: {
            duration: 1.5
        },

        options: {
            completeCommandOffset: '-=0.4'
        }
    };
});