define.Class('wysiwyg.editor.managers.WCommentsManager', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.utilize(['core.managers.serverfacade.FeedbackClient']);

    def.resources(['W.Config', 'W.Preview', 'W.Components', 'W.Commands', 'W.Utils', 'W.EditorDialogs', 'W.Resources']);

    def.binds(['_onCommentSelected','_onCommentUnselected','_onPageTransitionEnded',
        '_onPageTransitionStarted','_onCommentRead', '_handleCommentFromServer']);

    def.methods({
        initialize: function(Editor){
            this._restClient = new this.imports.FeedbackClient();
            this._siteComments = {};
            this._commentsContainers = {};
            this._previewReadyListener = this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._onPreviewReady);
            this._editorManager = Editor;
            this._unreadCommentsCounter = 0;
            this._currentSelectedComment = undefined;
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._handleModeChange);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SetViewerMode", this, this._handleModeChange);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.DeletePageCompleted', this, this._onPageDeleted);
            this._fakeCommentNeeded = true;
        },

        _getViewerManager: function(){
            if (!this._viewerManager){
                this._viewerManager = this.resources.W.Preview.getPreviewManagers().Viewer;
            }
            return this._viewerManager;
        },

        /**
         * creates a comments container div for each page and saves the current page
         * starts polling for comments from the server
         * @private
         */
        _onPreviewReady: function(){
            var viewerManager = this._getViewerManager();
            this._siteCommentsContainer = this._editorManager.getEditorUI().getCommentsContainer();
            this._previewReadyListener.unregisterListener(this);
            var pages = viewerManager.getPages();
            _.forEach(pages,function(page, pageId){
                this._commentsContainers[pageId] = this._addPageCommentsContainer(pageId);
            }, this);
            this._currentPageId = this._getCurrentPageId();
            this._commentsContainers[this._currentPageId].style.display = '';
            viewerManager.addEvent('pageTransitionEnded', this._onPageTransitionEnded);
            viewerManager.addEvent('pageTransitionStarted', this._onPageTransitionStarted);
            this._startPollingIfNeeded();
            this._createViewCommentsModeBox();
        },

        _startPollingIfNeeded: function () {
            this._restClient.isSiteShared(this.resources.W.Config.getSiteId(), function (isSiteShared) {
                if (isSiteShared.value) {
                    this.getCommentsFromServer();
                } else {
                    this._addFakeFirstComment();
                }
            }.bind(this));
        },

        _onPageTransitionStarted: function(pageId){
            this._commentsContainers[this._currentPageId].style.display = 'none';
            this._currentPageId = pageId;
        },

        _onPageTransitionEnded: function(pageId){
            var pageCommentContainer = this._getPageCommentsContainer(pageId),
                selectedComment = this._currentSelectedComment;
            pageCommentContainer.style.display = '';
            if (selectedComment && selectedComment.getPageId() === pageId){
                this._scrollToComment(this._currentSelectedComment.getCommentId(),pageId);
            }
        },

        _onPageDeleted: function (pageData) {
            var deletedPageId = pageData.page.get('id');
            var pageCommentsContainer = this._commentsContainers[deletedPageId];
            if (!pageCommentsContainer) {
                return;
            }
            pageCommentsContainer.parentElement.removeChild(pageCommentsContainer);
            delete this._commentsContainers[deletedPageId];

            _.forEach(this._siteComments[deletedPageId], function (comment) {
                this._cleanCommentReferences(comment);
            }, this);

            delete this._siteComments[deletedPageId];
        },

        _getPageCommentsContainer: function(pageId){
            if (!this._commentsContainers[pageId]){
                this._commentsContainers[pageId] = this._addPageCommentsContainer(pageId);
            }
            return this._commentsContainers[pageId];
        },

        /**
         * uses the restClient to get the comments from the server.
         * For each new comment, creates a component and adds it to this._siteComments.
         * @private
         */
        getCommentsFromServer: function(){
            this._stopPolling();
            var siteId = this.resources.W.Config.getSiteId();
            this._restClient.loadSiteComments(siteId, this._handleCommentFromServer);
        },

        _getFakeComment: function() {
            if (this._fakeCommentPageId && this._siteComments[this._fakeCommentPageId]) {
                return this._siteComments[this._fakeCommentPageId]["-1"];
            }

            return undefined;
        },

        _handleCommentFromServer: function(serverComments) {
            if (_.isEmpty(serverComments)) {
                this._addFakeFirstComment();
            } else {
                this._parseAndCreateServerComments(serverComments);
                this._removeFakeFirstComment();
                this._fakeCommentNeeded = false;
            }

            this._startPolling(serverComments);
        },

        _addFakeFirstComment: function() {
            var fakeCommentText = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'FEEDBACK_COMMENT_TEXT');
            var fakeCommentSubmitter = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'FEEDBACK_COMMENT_FROM');

            if (!this._fakeCommentNeeded || this._getFakeComment()) {
                return;
            }

            this._fakeCommentNeeded = false;

            this._fakeCommentPageId = this._getCurrentPageId();
            var fakeCommentData = {
                "commentId" : "-1",
                "x" : "480px",
                "y" : "200px",
                "face" : "happy",
                "submitter": fakeCommentSubmitter,
                "text": fakeCommentText,
                "unread" : false,
                "pageId": this._fakeCommentPageId,
                "time" : new Date()
            };

            this._getOrCreatePageComments(this._fakeCommentPageId);
            this._createAndAddComment(fakeCommentData, this._fakeCommentPageId);
        },

        _removeFakeFirstComment: function() {
            var fakeComment = this._getFakeComment();

            if (fakeComment) {
                fakeComment.deleteComment();
            }
        },

        _parseAndCreateServerComments: function (serverComments) {
            var self = this,
                pages = this._getViewerManager().getPages();
            _.forEach(serverComments, function (serverPageComments, commentsPageId) {
                var pageComments,
                    isPageExists = _.find(pages, function(pageNode, pageId){
                        return pageId === commentsPageId;
                    });
                if (!isPageExists){
                    _.forEach(serverPageComments, function (comment) {
                        self._restClient.deleteComment(comment.commentId);
                    });
                } else {
                    pageComments = self._getOrCreatePageComments(commentsPageId);
                    _.forEach(serverPageComments, function (comment) {
                        if (!pageComments[comment.commentId]) {
                            self._createAndAddComment(comment, commentsPageId);
                        }
                    });
                }
            });
        },

        _stopPolling: function () {
            if (this._serverPollCall) {
                window.clearTimeout(this._serverPollCall);
                delete this._serverPollCall;
            }
        },

        _startPolling: function (serverComments) {
            var serverPollInterval = 1000 * 60 * 5; //poll every 5 minutes
            if (!_.isEmpty(serverComments)) {
                //If the user has comments poll every 30 seconds for new comments
                serverPollInterval = 1000 * 30;
            }

            this._serverPollCall = setTimeout(this.getCommentsFromServer.bind(this), serverPollInterval);
        },

        _getOrCreatePageComments: function (pageId) {
            var pageComments = this._siteComments[pageId];
            if (!pageComments) {
                pageComments = {};
                this._siteComments[pageId] = pageComments;
            }
            return pageComments;
        },

        _createAndAddComment: function(commentDataObject, pageId){
            this.resources.W.Components.createComponent(
                'wysiwyg.previeweditorcommon.components.SiteFeedbackComment',
                'wysiwyg.editor.skins.SiteFeedbackCommentEditorSkin',
                null, {mode:"editor"},
                function(commentLogic){
                    commentLogic.setCommentProperties(commentDataObject);
                    this._addComment(commentLogic, pageId);
                    commentLogic.on('commentDeleted', this, this._onCommentDeleted);
                    commentLogic.addEvent('commentSelected', this._onCommentSelected);
                    commentLogic.addEvent('commentUnselected', this._onCommentUnselected);
                    commentLogic.addEvent('commentRead', this._onCommentRead);
                    this.fireEvent('commentCreated', commentLogic);
                }.bind(this));
        },

        _onCommentDeleted: function(event){
            var commentLogic = event.data.commentLogic;
            this._cleanCommentReferences(commentLogic);

        },

        _cleanCommentReferences: function (commentLogic) {
            if (commentLogic.getCommentProperties().unread) {
                //delete unread message fix unread counter
                this._unreadCommentsCounter--;
            }

            delete this._siteComments[commentLogic.getPageId()][commentLogic.getCommentId()];
            this.fireEvent('commentDeleted',{
                commentId: commentLogic.getCommentId(),
                pageId: commentLogic.getPageId()
            });
            this._setSelectedComment(undefined);
            this._restClient.deleteComment(commentLogic.getCommentId());
        },

        _onCommentUnselected: function(commentLogic){
            this._currentSelectedComment = undefined;
            this.fireEvent('commentUnselected',{
                commentId: commentLogic.getCommentId(),
                pageId: commentLogic.getPageId()
            });
        },

        _onCommentSelected: function(commentLogic){
            var commentId = commentLogic.getCommentId(),
                pageId = commentLogic.getPageId();
            this.fireEvent('commentSelected',{
                commentId: commentId,
                pageId: pageId
            });
            this._setSelectedComment(commentId, pageId);
        },

        _setSelectedComment: function(commentId, pageId){
            if (this._currentSelectedComment){
                this._currentSelectedComment.hideComment();
            }
            if (commentId){
                this._currentSelectedComment = this._siteComments[pageId][commentId];
            } else {
                this._currentSelectedComment = undefined;
            }
        },


        commentSelectedFromDialog: function(commentId, pageId){
            this._setSelectedComment(commentId, pageId);
            this._scrollToComment(commentId, pageId);
            this._siteComments[pageId][commentId].showComment();
        },

        _addComment: function(commentLogic, pageId){
            var commentId = commentLogic.getCommentId();
            this._siteComments[pageId][commentId] = commentLogic;
            if (commentLogic.isCommentUnread()){
                this._unreadCommentsCounter++;
            }
            this._addCommentToHtml(commentLogic);
        },

        _addCommentToHtml:function(commentLogic){
            var pageGroup = this.resources.W.Preview.getPageGroup(),
                pagePosition = pageGroup.getGlobalPosition(),
                editorBarHeight = this._editorManager.getEditorUI().getMainBarHeight();

            commentLogic.getViewNode().insertInto(this._getPageCommentsContainer(commentLogic.getPageId()));
            commentLogic.setY(commentLogic.getY() + pagePosition.y + editorBarHeight);
            commentLogic.setX(commentLogic.getX() + pagePosition.x);
            commentLogic.updateCommentSide();
        },

        showComments: function(){
            this._siteCommentsContainer.style.display = 'block';
        },

        hideComments: function(){
            this._siteCommentsContainer.style.display = 'none';
        },

        areCommentsDisplayed: function(){
            return this._siteCommentsContainer.isVisible();
        },

        _onCommentRead: function(commentLogic){
            this._unreadCommentsCounter--;
            this._restClient.markAsReadComment(commentLogic.getCommentId());
            this.fireEvent('commentRead',commentLogic);
        },

        getPageComments: function(pageId){
            return this._siteComments[pageId];
        },

        getSiteComments: function(){
            return this._siteComments;
        },

        _addPageCommentsContainer: function(pageId){
            var containerId = 'page_' + pageId + '_CommentsContainer',
                div = new Element('div', {'id': containerId});
            div.style.display = 'none';
            this._siteCommentsContainer.appendChild(div);
            return div;
        },

        _getCurrentPageId: function () {
           return this._getViewerManager().getCurrentPageId();
        },

        _scrollToComment: function(commentId, pageId){
            var commentComp = this._siteComments[pageId][commentId];
            if (this._isCommentInView(commentComp)) {
                return;
            }

            var compGlobalPosition = commentComp.getGlobalPosition(),
                compTopGlobalPosition = compGlobalPosition.y;
            //TODO don't use window directly
            window.scroll(window.getScroll().x, compTopGlobalPosition - 50);
        },

        _isCommentInView:function(comp){
            var compTopGlobalPosition = comp.getGlobalPosition().y,
                compBottomGlobalPosition = compTopGlobalPosition + 140,
                //TODO don't use window directly
                topOfViewport = window.getScroll().y,
                bottomOfViewport = window.innerHeight + window.getScroll().y;

            return ((compBottomGlobalPosition < bottomOfViewport) && (compTopGlobalPosition > topOfViewport));
        },

        _createViewCommentsModeBox: function(){
            this.resources.W.Components.createComponent(
                'wysiwyg.editor.components.CommentsViewModeBox',
                'skins.editor.CommentsViewModeBoxSkin',
                null, {commentsManager: this},
                function(compLogic){
                    compLogic.getViewNode().insertInto(this._editorManager.getEditorUI().getViewNode());
                    this._viewCommentsModeBox = compLogic;
                }.bind(this));
        },

        enterViewCommentsMode: function(){
            this._viewCommentsModeBox.showBox();
        },

        exitViewCommentsMode: function(hideComments){
            if (hideComments){
                this.hideComments();
            }
            this._viewCommentsModeBox.hideBox();
        },

        getUnreadCommentsCounter: function(){
            return this._unreadCommentsCounter;
        },

        getPreviewUrl: function(callback){
            this._restClient.getPreviewUrl(editorModel.metaSiteId, window.siteId, callback);
        },
        _handleModeChange: function(){
            if (W.Config.env.isEditorInPreviewMode() || !W.Config.env.isViewingDesktopDevice()){
                this._commentsLastState = this.areCommentsDisplayed();
                this.exitViewCommentsMode(true);

                this._isFeedbackDialogOpen = this.resources.W.EditorDialogs.isDialogOpen('FeedbackDialog');
                this.resources.W.EditorDialogs.closeDialogById('FeedbackDialog');
                this.fireEvent('hideComments');
            } else {
                if (this._commentsLastState) {
                    this.showComments();

                    if (this._isFeedbackDialogOpen) {
                        this.resources.W.Commands.executeCommand('WEditorCommands.openFeedbackDialog');
                    } else {
                        this.enterViewCommentsMode();
                    }
                }

                this.fireEvent('showComments');
            }
        },

        markSiteShared: function(){
            this._restClient.markSiteShared(this.resources.W.Config.getSiteId());
        }
    });
});
