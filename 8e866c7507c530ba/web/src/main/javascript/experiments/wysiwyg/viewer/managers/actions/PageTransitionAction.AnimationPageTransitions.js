/** @class wysiwyg.viewer.managers.actions.ScreenInAction */
define.experiment.newClass('wysiwyg.viewer.managers.actions.PageTransitionAction.AnimationPageTransitions', function(classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.managers.actions.base.BaseAction');

    def.resources(['W.Viewer', 'W.Commands', 'W.Config', 'W.Utils']);

    def.binds([]);

    def.methods({

        /**
         * Initialize the Action
         * @param {wysiwyg.common.behaviors.Transitions} transitions
         */
        initialize: function(transitions) {
            this.parent();
            this.resources.W.Commands.registerCommand('WViewerCommands.PageTransitionStart', true);
            this.resources.W.Commands.registerCommand('WViewerCommands.PageTransitionComplete', true);
            this.resources.W.Commands.registerCommand('WViewerCommands.PageTransitionCompleteOffset', true);
            this._transitions = transitions;
            this._transitionsDefinitions = this._transitions.getAllTransitionDefinitions();
        },
        /**
         * @override
         */
        setActionListeners: function() {
            this.resources.W.Commands.registerCommandListenerByName('W.ViewerCommands.PageHandlerAttachPage', this, this._hidePage);
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.NextPageReady', this, this._onNextPageReady);
            this.resources.W.Commands.registerCommandListenerByName('TweenEngine.AnimationInterrupted', this, this._onAnimationComplete);
            this.resources.W.Commands.registerCommandListenerByName('TweenEngine.AnimationComplete', this, this._onAnimationComplete);
            this.resources.W.Commands.registerCommandListenerByName('TweenEngine.AnimationStart', this, this._onAnimationStart);
        },

        /**
         * @override
         */
        setInactiveActionListeners: function() {
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.NextPageReady', this, this._executeInactiveActionCommands);
        },

        /**
         * @override
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         */
        executeAction: function(params) {
            var legacyTransitionName = this.resources.W.Viewer.getPageGroup().getComponentProperty('transition');
            var transition;
            var fromPageNode = this.resources.W.Viewer.getCompByID(params.fromPageId);
            var pageNode = this.resources.W.Viewer.getCompByID(params.pageId);

            //TODO: add a function to get reverse state
            var reverse = false;

            this._showPage({pageNode: pageNode});

            this._currentPageCommandParams = {fromPageId: params.fromPageId, pageId: params.pageId};

            if (!params.fromPageId || legacyTransitionName === 'none') {
                this._executeInactiveActionCommands(params);
                return;
            }

            transition = this._getTransitionByLegacyName(legacyTransitionName);
            try {
                this._currentTimeline = transition.init(pageNode, fromPageNode, {reverse: reverse});
                this._currentTimeline.call(this._onAnimationCompleteOffset, null, this, transition.options.completeCommandOffset);
            } catch (e) {
                this._executeInactiveActionCommands(params);
                //TODO: report transition failed error
                throw e;
            }

        },

        _getTransitionByLegacyName: function(legacyTransition) {
            var transitionDefinition = _.find(this._transitionsDefinitions, function(transition) {
                return _.contains(transition.legacyTypes, legacyTransition);
            });

            return transitionDefinition;
        },

        _onAnimationStart: function(params) {
            if (this._currentTimeline && this._currentTimeline === params.timeline) {
                this.resources.W.Commands.executeCommand('WViewerCommands.PageTransitionStart', this._currentPageCommandParams, 'PageTransitionAction');

            }
        },

        _onAnimationCompleteOffset: function() {
            this.resources.W.Commands.executeCommand('WViewerCommands.PageTransitionCompleteOffset', this._currentPageCommandParams, 'PageTransitionAction');
        },

        _onAnimationComplete: function(params) {
            if (this._currentTimeline && this._currentTimeline === params.timeline) {
                this.resources.W.Commands.executeCommand('WViewerCommands.PageTransitionComplete', this._currentPageCommandParams, 'PageTransitionAction');
                window.scrollTo(0, 0);

            }
        },

        /**
         * @override
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         */
        _executeInactiveActionCommands: function(params) {
            var pageNode = this.resources.W.Viewer.getCompByID(params.pageId);
            this.resources.W.Commands.executeCommand('WViewerCommands.PageTransitionStart', {fromPageId: params.fromPageId, pageId: params.pageId}, 'PageTransitionAction');

            _.defer(function(params) {

                this._showPage({pageNode:pageNode});
                this.resources.W.Commands.executeCommand('WViewerCommands.PageTransitionComplete', params, 'PageTransitionAction');

                window.scrollTo(0, 0);

            }.bind(this), {fromPageId: params.fromPageId, pageId: params.pageId});
        },

        /**
         *
         * @param params
         * @private
         */
        _onNextPageReady: function(params) {
            this.executeAction(params);
        },

        _hidePage: function(params){
            var pageNode = params.pageNode;
            if (pageNode){
                pageNode.addClass('hidePageForTransition');
            }
        },

        _showPage: function(params){
            var pageNode = params.pageNode;
            if (pageNode){
                pageNode.removeClass('hidePageForTransition');
            }
        }
    });
});