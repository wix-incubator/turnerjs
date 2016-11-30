/**
 * @class wysiwyg.viewer.components.PageGroup
 */
define.component('wysiwyg.viewer.components.PageGroup', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("core.components.ContainerOBC");

    def.utilize([
        'wysiwyg.viewer.utils.TransitionUtils',
        'core.components.Page'
    ]);

    def.resources(['W.Utils', 'W.Viewer', 'W.Layout', 'W.Commands', 'W.Config', 'W.ComponentLifecycle']);

    def.propertiesSchemaType('PageGroupProperties');

    def.binds(['_resizePage', '_executeTransitionIfPossible', '_onTransitionFinished', '_resetNavigationProcess', '_executeNavigationProcess', '_onNavigationFailed']);

    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.setMaxH(this.imports.Page.MAX_HEIGHT);

            this._initTransitionDurationMap();
            this._registerCommands();

            if (!this.resources.W.Config.isLoadedFromStatic()) {
                this._shouldScrollAfterPageTransition = true;
            }
        },

        render: function() {
            this.parent();
            var docWidth = this.resources.W.Viewer.getDocWidth();
            this.setWidth(docWidth);
        },
        editModeChange: function(newMode) {
            if (newMode !== "MASTER_PAGE") {
                this._skinParts.overlay.collapse();
            }
        },

        /**
         * goes to a page using its ID
         * runs transition if needed
         * @param {string} nextPageId
         */
        gotoPage: function(nextPageId) {
            var nextPage = this.resources.W.Viewer.getCompByID(nextPageId);
            var currentPageId = this._currentPage && this._currentPage.$logic.getComponentId();
            if(nextPage === this._currentPage){
                this._cancelNextPageNavigation();
                return;
            }
            this.resources.W.Commands.executeCommand('WViewerCommands.PageChangeRequested', {fromPageId: currentPageId, pageId: nextPageId}, 'pageGroup');
            var self = this;
            _.defer(function() {
                self.resources.W.Viewer.loadPageById(nextPageId, nextPage, self._actualGotoPage, self);
            });
        },
        _actualGotoPage: function(pageInfo) {
            var nextPage = pageInfo.pageNode;

            if(this._isNavigating){
                this._nextPageToNavigateTo = nextPage;
                return;
            }
            this._executeNavigationProcess(nextPage);
        },

        /**
         * This is the flow for navigating pages. The promise will fulfill with the page data to navigate to and start off the process.
         * @param pageNode - the node of the page we want to navigate to.
         * @param {boolean} [isFromReset] - flag that will let us know if the navigation process was reset, because the user tried to navigate while a transition was ocurring.
         *                                This flag is for BI purposes.
         * @private
         */
        _executeNavigationProcess: function (pageNode, isFromReset) {
            this._prepareForNavigation(pageNode, isFromReset);
            this._waitForPageContentReady(pageNode)
                .then(this._executeTransitionIfPossible)
                .then(this._onTransitionFinished)
                .then(this._resetNavigationProcess, this._onNavigationFailed)
                .done(); //.done, to make sure the promise chain is eventually closed.
        },
        /**
         *
         * @param nextPage
         * @returns {promise} a promise that the page will be ready, which will be resolved with the same page data that was received
         * @private
         */
        _waitForPageContentReady: function (nextPage) {
            var deferred = Q.defer();
            if (nextPage.$logic.isContentReady() === true) {
                deferred.resolve(nextPage);
            } else {
                nextPage.$logic.addEvent('pageContentReady', function () {
                    nextPage.$logic.removeEvent('pageContentReady', arguments.callee);
                    deferred.resolve(nextPage);
                });
            }
            return deferred.promise;
        },
        /**
         *
         * @param pageNode - the node of the page we want to navigate to.
         * @param {boolean} [isFromReset] - flag that will let us know if the navigation process was reset, because the user tried to navigate while a transition was ocurring.
         *                                This flag is for BI purposes.
         * @private
         */
        _prepareForNavigation: function(pageNode, isFromReset){
            this._isNavigating = true;
            this._nextPageToNavigateTo = null;
            pageNode.$logic.preparePageForShow();  //here the page content is rendered
            this._notifyPageChangeStart(pageNode.$logic.getComponentId(), isFromReset);
            this._hideNextPage(pageNode);
        },

        _executeTransitionIfPossible: function (nextPage) {
            this._unhideNextPage(nextPage);
            var currentPageLogic = this._currentPage && this._currentPage.$logic,
                currentPageId = currentPageLogic && currentPageLogic.getComponentId(),
                deferred = Q.defer();

            if (currentPageLogic && !currentPageLogic.getIsDisposed()) {
                this._transitionToNextPage(nextPage, deferred);
            } else {
                //ensure previous transition has been finalized
                this._setCurrentPage(nextPage);
                this._resizePage();
                deferred.resolve(currentPageId);
            }
            return deferred.promise;
        },
        /**
         *
         * @param nextPageId
         * @param {boolean} [isFromReset] - flag that will let us know if the navigation process was reset, because the user tried to navigate while a transition was ocurring.
         *                                This flag is for BI purposes.
         * @private
         */
        _notifyPageChangeStart: function(nextPageId, isFromReset){
            var currentPageId = this._currentPage && this._currentPage.$logic.getComponentId();
            this.resources.W.Commands.executeCommand('WViewerCommands.PageChangeStart', {fromPageId: currentPageId, pageId: nextPageId, isFromReset: !!isFromReset}, this);
            //Legacy events. Must keep these here:
            this._view.fireEvent('pageTransitionStarted', nextPageId);
            this.resources.W.Viewer.fireEvent('pageTransitionStarted', nextPageId);
        },

        _initTransitionDurationMap: function () {
            this._transitionDurationMap = _.invert(Constants.TransitionTypes) ;
        },

        _registerCommands: function(){
            this.resources.W.Commands.registerCommand('WViewerCommands.PageChangeRequested', true);
            this.resources.W.Commands.registerCommand('WViewerCommands.PageChangeComplete', true);
            this.resources.W.Commands.registerCommand('WViewerCommands.PageTransitionStart', true);
            this.resources.W.Commands.registerCommand('WViewerCommands.PageTransitionComplete', true);
        },
        _onDataChanged: function() {
            var transition = this.getComponentProperty('transition');
            if (transition == 'slide') {
                this.setComponentProperty('transition', Constants.TransitionTypes.SWIPE_HORIZONTAL_FULLSCREEN, true);
            }
        },
        _cancelNextPageNavigation: function(){
            this._nextPageToNavigateTo = undefined;
        },

        _onAllSkinPartsReady: function() {
            this._transitionUtils = new this.imports.TransitionUtils();
            this._Tween = this.resources.W.Utils.Tween;
            this._skinParts.overlay.collapse();
            this.parent();
        },

        /**
         *
         * @private
         */
        _onNavigationFailed: function (e) {
            this._isNavigating = false;
            LOG.reportError(wixErrors.PAGE_NAVIGATION_FAILED, 'PageGroup', '_executeNavigationProcess', { p1: e.name, p2: e.message, p3: e.stack || '' });
        },
        /**
         * resets the navigation process- if the user tried to navigate to another page mid navigation, it will navigate to it at the end.
         * If the user didn't try to navigate mid-navigation, it will end the process and the done() from _executeNavigationProcess will close the promise chain.
         * @private
         */
        _resetNavigationProcess: function () {
            if (this._nextPageToNavigateTo) {
                var pageData = this._nextPageToNavigateTo;
                this._nextPageToNavigateTo = undefined;
                this._executeNavigationProcess(pageData, true);
            } else {
                this._isNavigating = false;
            }
        },
        _onTransitionFinished: function(fromPageId) {
            var currentPageId = this._currentPage.$logic.getComponentId();
            var commandParams = {fromPageId: fromPageId, pageId: currentPageId};
            this._currentPage.$logic.on('resize', this, this._onCurrentPageResize);

            if (!this._nextPageToNavigateTo){
                if (this._shouldScrollAfterPageTransition) {
                    window.scrollTo(0, 0); // all pages start scrolled up
                }
                this._view.fireEvent('pageTransitionEnded', currentPageId);
                this.resources.W.Commands.executeCommand('WViewerCommands.PageTransitionComplete', commandParams, 'pageGroup');
                this._resizePage();
            }

            this._shouldScrollAfterPageTransition = true;
            W.Layout.callForMeasure();
            this.resources.W.Commands.executeCommand('WViewerCommands.PageChangeComplete', commandParams, 'pageGroup');
            return fromPageId;
        },

        /**
         * extracted into a function so it can be overridden in the various experiments that are touching page group now
         * @param nextPage
         * @private
         */
        _hideNextPage: function(nextPage) {
            nextPage.setStyle('opacity', '0.0');
            nextPage.getLogic().uncollapse();
            this.resources.W.ComponentLifecycle.forceRender(1);
        },

        /**
         * extracted into a function so it can be overridden in the various experiments that are touching page group now
         * @param nextPage
         * @private
         */
        _unhideNextPage: function(nextPage) { //called unhideNextPage and not showNextPage, because you don't actually see it till the transition is executed and completed
            nextPage.setStyles({'opacity': '1.0'});
        },

        _setCurrentPage: function(nextPage) {
            this._currentPage = nextPage;
        },

        /**
         * For lack of a better name, because all the good names were already taken... but this is actually what's happening.
         * This is private for a reason and should never be called from outside of this component!
         * @param nextPage
         * @param deferred
         * @private
         */
        _transitionToNextPage: function (nextPage, deferred) {
            var currentPageLogic = this._currentPage.$logic,
                transition = this.getComponentProperty('transition'),
                duration = this._getPageTransitionDuration(transition),
                newHeight = nextPage.getLogic().getHeight(),
                direction = (transition === Constants.TransitionTypes.SWIPE_VERTICAL_FULLSCREEN) ? 1 : 0,
                currentPageId = currentPageLogic && currentPageLogic.getComponentId();

            currentPageLogic.off('resize', this, this._onCurrentPageResize);

            var currentHeight = currentPageLogic.getHeight(),
                scrollDeferred = Q.defer();

            if (duration > 0) {
                this._Tween.execute(currentHeight, newHeight, duration, { onUpdate: this._resizePage, ease: 'strong_easeInOut' });
                this._Tween.execute(window.pageYOffset, 0.0, duration, {
                    onUpdate: function (value) {
                        window.scrollTo(0, value);
                    },
                    onComplete: function(){
                        scrollDeferred.resolve(currentPageId);
                    },
                    ease: 'strong_easeInOut'});
            } else {
                this._resizePage(newHeight);
                scrollDeferred.resolve(currentPageId);
            }

            var transFunc = this._transitionUtils.getTransition(transition);
            transFunc(this._currentPage, nextPage, direction, duration,
                function () {
                    this._currentPage.$logic.collapse();
                    this._setCurrentPage(nextPage);
                    deferred.resolve(scrollDeferred.promise);
                }.bind(this));
        },

        _getPageTransitionDuration: function (transition) {
            var duration = 0.0 ;
            var transitionKey           = this._transitionDurationMap[transition] ;
            var transitionDefaultValues = Constants.TransitionDefaults[transitionKey];
            if(transitionDefaultValues) {
                duration = transitionDefaultValues.durationInSec || 0.0 ;
            }
            return duration ;
        },

        _onCurrentPageResize: function(ev) {
            this._resizePage();
        },
        _resizePage: function(hght) {
            if (!hght) {
                hght = this._currentPage.$logic.getHeight();
            }
            this.setHeight(hght);
            this.resources.W.Layout.enforceAnchors([this]);
            this.resources.W.Commands.executeCommand('WPreviewCommands.PageGroupLayoutChange');
        },
        useLayoutOnDrag: function() {
            return true;
        },
        isSelectable: function() {
            return false;
        },
        isContainer: function() {
            return false;
        },
        isAnchorable: function() {
            return {to: {allow: true, lock: Constants.BaseComponent.AnchorLock.BY_THRESHOLD}, from: {allow: true, lock: Constants.BaseComponent.AnchorLock.ALWAYS}};
        },
        isDeleteable: function() {
            return false;
        },
        getMinPhysicalHeight: function() {
            return this._currentPage.getLogic().getHeight();
        },
        getCurrentChildren: function() {
            if (!this._currentPage) {
                return [];
            }
            return [this._currentPage];
        },
        getCurrentPageNode: function(){
            return this._currentPage;
        }
    });
});