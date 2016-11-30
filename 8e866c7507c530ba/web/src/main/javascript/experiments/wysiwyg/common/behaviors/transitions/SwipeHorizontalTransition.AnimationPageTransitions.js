define.experiment.newTransition('SwipeHorizontal.AnimationPageTransitions', function(animations) {
    return {
        init: function(toPageNode, fromPageNode, params) {
            params = params || {};
            return (params.reverse) ? this._reverseTransition(toPageNode, fromPageNode, params) : this._transition(toPageNode, fromPageNode, params);
        },

        _transition: function(toPageNode, fromPageNode, params) {
            var duration = params.duration || this.defaults.duration;

            var docWidth = parseInt(W.Viewer.getDocWidth(), 10);
            var windowWidth = window.innerWidth;
            var docMargin = (windowWidth - docWidth) / 2;
            var windowScroll = window.getScrollTop();
//            var masterPageComps = _.filter(W.Viewer.getSiteNode().getChildren(), function(node){
//                return node.id !== 'PAGES_CONTAINER';
//            });

            return animations.sequence([
                animations.applyTween('BasePosition', fromPageNode, duration, 0, {to: {left: (docMargin + docWidth) * -1}, ease: 'Power1.easeInOut'}),
//                animations.applyTween('BasePosition', masterPageComps[0], duration, 0, {from: {left: windowWidth - docMargin}, ease: 'Power1.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, duration, 0, {from: {left: windowWidth - docMargin}, ease: 'Power1.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, 0, 0, {to: {top: windowScroll}})

            ], {autoClear: true});
        },

        _reverseTransition: function(toPageNode, fromPageNode, params) {
            var duration = params.duration || this.defaults.duration;

            var docWidth = parseInt(W.Viewer.getDocWidth(), 10);
            var windowWidth = window.innerWidth;
            var docMargin = (windowWidth - docWidth) / 2;
            var windowScroll = window.getScrollTop();

            return animations.sequence([
                animations.applyTween('BasePosition', fromPageNode, duration, 0, {to: {left: docMargin + docWidth}, ease: 'Power3.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, duration, 0, {from: {left: (windowWidth - docMargin)  * -1}, ease: 'Power3.easeInOut'}),
                animations.applyTween('BasePosition', toPageNode, 0, 0, {to: {top: windowScroll}})
            ], {autoClear: true});
        },

        legacyTypes: ['swipeHorizontal', 'swipeHorizontalFullScreen'],

        defaults: {
            duration: 1.1
        },

        options: {
            completeCommandOffset: '-=0.8'
        }
    };
});