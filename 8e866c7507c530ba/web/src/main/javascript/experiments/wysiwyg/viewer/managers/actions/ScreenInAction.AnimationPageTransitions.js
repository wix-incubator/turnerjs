/** @class wysiwyg.viewer.managers.actions.ScreenInAction */
define.experiment.Class('wysiwyg.viewer.managers.actions.ScreenInAction.AnimationPageTransitions', function(classDefinition, experimentStrategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;


    def.methods({
        initialize: strategy.remove(),

        /**
         * @override
         */
        setActionListeners: function() {
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageChangeRequested', this, this._onPageChange);
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageTransitionCompleteOffset', this, this._onPageTransitionComplete);
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageTransitionStart', this, this._onPageTransitionStart);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.FeedbackQuickTourEnded', this, this._onFeedbackQuickTourEnded);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.ViewerStateChanged', this, this._onViewerStateChanged);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.WEditModeChanged', this, this._onEditModeChanged);
        },

        /**
         * @override
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         * @param {Boolean} params.isPageTransitionEnd
         */
        executeAction: function(params) {
            if (!params.pageId || this._getCurrentPageId() !== params.pageId || !this._animations.isReady()) {
                return;
            }

            //Do nothing in Editor
            if (this.resources.W.Config.env.$editorMode !== 'PREVIEW') {

                return;
            }

            if (!params.isPageTransitionEnd){
                // reset page targets to animate
                this._resetPageTargetsToPlay();
            }

            // populate site targets  array
            var curPageTargetsIds = this.getCurrentPageTargetsIds();
            this._populateSiteTargetsPlayData(curPageTargetsIds);

            // populate page targets to animate
            this._populatePageTargetsToPlay(curPageTargetsIds, params);

            this._startAnimationEvents();
        },

        /**
         * Handler of pageTransitionComplete
         * - Resets all animations on page
         * - Populates all animation information for this page
         * - Starts the listeners for running animations on scroll etc.
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         * @private
         */
        _onPageTransitionComplete: function(params) {
            params = params || {};
            params.isPageTransitionEnd = true;
            this.executeAction(params);
        },

        /**
         * Handler of pageTransitionStart
         * - Resets all animations on page
         * - Populates all animation information for this page
         * - Starts the listeners for running animations on scroll etc.
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         * @private
         */
        _onPageTransitionStart: function(params) {
            params = params || {};
            params.isPageTransitionEnd = false;
            this.executeAction(params);
        }

    });
});