//define.experiment.component('wysiwyg.viewer.components.PageGroup.AnimationPageTransitions', function(compDefinition, experimentStrategy) {
//    /** @type core.managers.component.ComponentDefinition */
//    var def = compDefinition;
//    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
//    var strategy = experimentStrategy;
//
//    def.binds(strategy.merge(['_onPageLoadByIdSuccess', '_pageChangeComplete']));
//
//    def.fields({
//        _currentPageId: null,
//        _isNavigating: false
//    });
//
//    def.methods({
//        initialize: function(compId, viewNode, argsObject) {
//            this.parent(compId, viewNode, argsObject);
//
//            //Register commands
//            this.resources.W.Commands.registerCommand('WViewerCommands.PageChangeRequested', true);
//            this.resources.W.Commands.registerCommand('WViewerCommands.PageChangeComplete', true);
//            this.resources.W.Commands.registerCommand('WViewerCommands.NextPageReady', true);
//
//            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageTransitionComplete', this, this._pageChangeComplete);
//        },
//
//        render: function() {
//            this.parent();
//            this.setWidth(this.resources.W.Viewer.getDocWidth());
//            this.setMaxH(this.imports.Page.MAX_HEIGHT); //Page Component height
//            this._skinParts.overlay.collapse();
//        },
//
//        /**
//         * goes to a page using its ID
//         * runs transition if needed
//         * @param {string} pageID
//         */
//        gotoPage: function(pageId) {
//            if (pageId === this._currentPageId) {
//                return;
//            }
//
//            if (this._isNavigating) {
//                return;
//            }
//
//            this._isNavigating = true;
//            var nextPageNode = this.resources.W.Viewer.getCompByID(pageId);
//
//            //This has to be async because of weird hash change stuff. Ask Alissa V.
//            _.defer(this.resources.W.Viewer.loadPageById.bind(this.resources.W.Viewer), pageId, nextPageNode, this._onPageLoadByIdSuccess);
//
//            this.resources.W.Commands.executeCommand('WViewerCommands.PageChangeRequested', {fromPageId: this._currentPageId, pageId: pageId}, 'pageGroup');
//        },
//
//        _onPageLoadByIdSuccess: function(pageInfo) {
//            var nextPageLogic = pageInfo.pageNode.$logic;
//
//            nextPageLogic.preparePageForShow();
//            this._waitForNextPageContentReady(nextPageLogic);
//
//        },
//
//        /**
//         *
//         * @param nextPageNode
//         * @private
//         */
//        _waitForNextPageContentReady: function(pageLogic) {
//            // Legacy event must execute *before* page.uncollapse()
//            this._fireLegacyTransitionStartEvents(pageLogic.getComponentId());
//
//            //Must uncollapse page or render events will not fire.
//            pageLogic.$view.addClass('hidePageForTransition');
//            pageLogic.uncollapse();
//            this.resources.W.ComponentLifecycle.forceRender(1);
//
//            // In Editor we load all the pages collapsed and they might not be ready on first visit.
//            if (pageLogic.isContentReady()) {
//                this._onNextPageContentReady(pageLogic);
//            }
//            else {
//                pageLogic.addEvent('pageContentReady', this._onNextPageContentReady);
//            }
//        },
//
//        _onNextPageContentReady: function(nextPageLogic) {
//            var previousPageId = this._currentPageId;
//            var nextPageId = nextPageLogic.getComponentId();
//            var params = {fromPageId: previousPageId, pageId: nextPageId};
//
//            nextPageLogic.removeEvent('pageContentReady', this._onNextPageContentReady);
//            this.resources.W.Commands.executeCommand('WViewerCommands.NextPageReady', params, 'pageGroup');
//
//            //TODO: Here we go idle and wait for PageTransitionComplete, rethink this process
//        },
//        /**
//         *
//         * @param params.pageId
//         * @param params.fromPageId
//         * @private
//         */
//        _pageChangeComplete: function(params) {
//            if (params.fromPageId !== this._currentPageId) {
//                console.log('WTF? how did you get here??', 'PageGroup._pageChangeComplete');
//            }
//            this._setNextPageToBeCurrent(params);
//            this._fireLegacyTransitionEndEvents(this._currentPageId);
//            //PutSetSizesAndLayoutOnComponentLifeCycle - added instead of callForMeasure  W.ComponentLifecycle.invalidateLayout();
//            this.resources.W.Layout.callForMeasure();
//            this._isNavigating = false;
//
//            this.resources.W.Commands.executeCommand('WViewerCommands.PageChangeComplete', {fromPageId: params.fromPageId, pageId: this._currentPageId}, 'pageGroup');
//        },
//
//        //TODO: Do we need _onNavigationFailed ?
//        _onNavigationFailed: function() {
//            this._isNavigating = false;
//            LOG.reportError(wixErrors.PAGE_NAVIGATION_FAILED, 'PageGroup', '_waitForNextPageContentReady', '');
//        },
//
//        _setNextPageToBeCurrent: function(params) {
//            var pageLogic = this.resources.W.Viewer.getCompLogicById(params.pageId);
//            this._collapsePageById(params.fromPageId);
//
//            this._currentPageId = pageLogic.getComponentId();
//            this._resizePage(pageLogic.getHeight());
//            pageLogic.on('resize', this, this._resizePage);
//        },
//
//        _collapsePageById: function(pageId) {
//            var pageLogic = (pageId) ? this.resources.W.Viewer.getCompLogicById(pageId) : null;
//            if (pageLogic) {
//                pageLogic.collapse();
//            }
//        },
//
//        /**
//         * Legacy transition start event
//         * @param {String} nextPageId
//         */
//        _fireLegacyTransitionStartEvents: function(nextPageId) {
//            this.$view.fireEvent('pageTransitionStarted', nextPageId);
//            this.resources.W.Viewer.fireEvent('pageTransitionStarted', nextPageId);
//        },
//
//        /**
//         * Legacy transition end event
//         * @param {String} nextPageId
//         */
//        _fireLegacyTransitionEndEvents: function(nextPageId) {
//            this.$view.fireEvent('pageTransitionEnded', nextPageId);
//
//        },
//
//        _resizePage: function(height) {
//            var currentPageLogic = this.resources.W.Viewer.getCompLogicById(this._currentPageId);
//
//            height = height || currentPageLogic.getHeight();
//
//            this.setHeight(height);
//           // PutSetSizesAndLayoutOnComponentLifeCycle - should be
//            //   this.fireEvent('autoSized');
//            //W.ComponentLifecycle.once(W.ComponentLifecycle.EVENTS.AFTER_LAYOUT_UPDATE, this, this._notifyPageGroupLayoutChange);
//            this.resources.W.Layout.enforceAnchors([this]);
//          this.resources.W.Commands.executeCommand('WPreviewCommands.PageGroupLayoutChange');
//        },
//
//        getMinPhysicalHeight: function() {
//            var currentPageLogic = this.resources.W.Viewer.getCompLogicById(this._currentPageId);
//            return currentPageLogic.getHeight();
//        },
//
//        getCurrentChildren: function() {
//            var currentPage = this.resources.W.Viewer.getCompByID(this._currentPageId);
//            return currentPage ? [currentPage] : [];
//        },
//
//        getInlineContentContainer: strategy.remove(),
//
//        editModeChange: strategy.remove(),
//
//        _onDataChanged: strategy.remove(),
//
////        _onDataChanged: function(){
////            var transition = this.getComponentProperty('transition');
////            if(transition == 'slide')
////                this.setComponentProperty('transition', Constants.TransitionTypes.SWIPE_HORIZONTAL_FULLSCREEN, true);
////        },
//
//        _onAllSkinPartsReady: strategy.remove(),
//
//        _resetNavigationProcess: strategy.remove(),
//
//        _onTransitionFinished: strategy.remove(),
//
//        _hideNextPage: strategy.remove(),
//
//        _unhideNextPage: strategy.remove(),
//
//        _waitForPageContentReady: strategy.remove(),
//
//        _ensurePreviousTransitionFinalized: strategy.remove(),
//
//        _transitionToNextPage: strategy.remove(),
//
//        _getPageTransitionDuration: strategy.remove(),
//
//        dispose: strategy.remove()
//
//
//
//        /** no change **/
////        useLayoutOnDrag: function() {
////            return true;
////        },
//
//        /** no change **/
////        isSelectable: function() {
////            return false;
////        },
//
//        /** no change **/
////        isContainer: function() {
////            return false;
////        },
//
//        /** no change **/
////        isAnchorable: function() {
////            return {to:{allow:true,lock:Constants.BaseComponent.AnchorLock.BY_THRESHOLD},from:{allow:true,lock:Constants.BaseComponent.AnchorLock.ALWAYS}};
////        },
//
//        /** no change **/
////        isDeleteable: function() {
////            return false;
////        },
//
//    });
//});