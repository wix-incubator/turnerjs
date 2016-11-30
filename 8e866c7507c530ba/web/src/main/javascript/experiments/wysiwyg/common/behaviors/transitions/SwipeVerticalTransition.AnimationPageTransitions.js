define.experiment.newTransition('SwipeVertical.AnimationPageTransitions',function(animations){
    return {
        init: function(toPageNode, fromPageNode, params) {
            params = params || {};
            return (params.reverse) ? this._reverseTransition(toPageNode, fromPageNode, params) : this._transition(toPageNode, fromPageNode, params);
        },

        _transition: function(toPageNode, fromPageNode, params){
            var duration = params.duration || this.defaults.duration;
            var windowHeight = window.innerHeight;
            var nextPageHeight = toPageNode.getHeight();
            var nextPageTop = toPageNode.getTop();
                nextPageTop = Math.max(windowHeight, nextPageHeight + nextPageTop) * -1;

            return animations.sequence([
                animations.applyTween('BasePosition', fromPageNode, duration, 0, {to:{top:windowHeight}, ease: 'Power3.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, duration, 0, {from:{top: nextPageTop}, ease: 'Power3.easeInOut'}),
                animations.applyTween('BaseScroll', document.body, duration, 0, {to:{scrollTo:{y:0}}, ease: 'Power3.easeInOut'})
            ], {autoClear: true});
        },

        _reverseTransition: function(toPageNode, fromPageNode, params){
            var duration = params.duration || this.defaults.duration;
            var windowHeight = window.innerHeight;
            var fromPageHeight = fromPageNode.getHeight();
            var fromPageTop = fromPageNode.getTop();
            var fromPageBottom = Math.max(windowHeight, fromPageHeight + fromPageTop);

            return animations.sequence([
                animations.applyTween('BasePosition', fromPageNode, duration, 0, {to:{top:(fromPageHeight + fromPageTop) * -1}, ease: 'Power3.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, duration, 0, {from:{top: fromPageBottom}, ease: 'Power3.easeInOut'}),
                animations.applyTween('BaseScroll', document.body, duration, 0, {to:{scrollTo:{y:0}}, ease: 'Power3.easeInOut'})
            ], {autoClear: true});
        },

        legacyTypes: ['swipeVertical', 'swipeVerticalFullScreen'],

        defaults: {
            duration: 1.1
        },

        options: {
            completeCommandOffset: '-=0'
        }
    };
});