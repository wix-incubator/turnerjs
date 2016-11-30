define.experiment.newTransition('CrossFade.AnimationPageTransitions', function(animations) {
    return {
        init: function(toPageNode, fromPageNode, params) {
            params = params || {};

            return (params.reverse) ? this._reverseTransition(toPageNode, fromPageNode, params) : this._transition(toPageNode, fromPageNode, params);
        },

        _transition: function(toPageNode, fromPageNode, params) {
            var duration = params.duration || this.defaults.duration;
            var windowScroll = window.getScrollTop();

            return animations.sequence([
                animations.applyTween('FadeOut', fromPageNode, duration, 0, {ease: 'Power3.easeInOut'}),
                animations.applyTween('FadeIn', toPageNode, duration, 0, {ease: 'Power3.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, 0, 0, {to: {top: windowScroll}})

            ], {autoClear: true});
        },

        _reverseTransition: function(toPageNode, fromPageNode, params) {
            this._transition(toPageNode, fromPageNode, params);
        },

        legacyTypes: ['crossfade', 'shrinkfade'],

        defaults: {
            duration: 1.2
        },

        options: {
            completeCommandOffset: '-=0.4'
        }
    };
});