define.component("wysiwyg.editor.components.dialogs.FeedbackDialog", function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.skinParts({
        comments : { type : 'htmlElement'},
        pagesDropDown:{ type:'wysiwyg.editor.components.FeedbackNavigationDropDown' }
    });

    def.resources(['W.Editor', 'W.Config']);

    def.binds(['_onPageSelection','_onCommentDeleted','_onCommentSelected','_onCommentCreated','_onCloseDialog','unSelectComment']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            var commentsManager = this.resources.W.Editor.Comments;
            commentsManager.addEvent('commentDeleted', this._onCommentDeleted);
            commentsManager.addEvent('commentSelected', this._onCommentSelected);
            commentsManager.addEvent('commentCreated', this._onCommentCreated);
            commentsManager.addEvent('commentUnselected', this.unSelectComment);

            this._dialogWindow.setCloseCallBack(this._onCloseDialog);
        },

        _onAllSkinPartsReady: function() {
            this._skinParts.pagesDropDown.addEvent('pageSelected', this._onPageSelection);
        },
        _convertToCommentsObject: function (commentsByPage) {
            var allComments = {};
            _.forEach(commentsByPage, function (pageComments) {
                _.forEach(pageComments, function (commentComponent, commentId) {
                    allComments[commentId] = commentComponent;
                });
            });
            return allComments;
        },
        _updateAllComments: function() {
            this._removeAllComments();
            var commentsByPage = this.resources.W.Editor.Comments.getSiteComments();
            var allComments = this._convertToCommentsObject(commentsByPage);
            this._createComments(allComments);
        },
        _onPageSelection: function(pageId) {
            if (pageId === "_allComments") {
                this._updateAllComments();
            } else {
                this._updatePageComments(pageId);
            }
        },
        _createComments: function (commentComponents) {
            if (commentComponents) {
                var sortedByTime = _.sortBy(commentComponents, function (commentComponent) {
                    var sortValue = commentComponent.getCommentProperties().time.getTime();
                    if (!commentComponent.isCommentUnread()) {
                        //message that were read should be smaller than unread messages and before them in the list
                        //divide it by 10 will make it smaller by ~30 years
                        sortValue = sortValue/10;
                    }

                    return sortValue;
                });

                _.forEach(sortedByTime, function (commentComponent) {
                    this._createCommentPanelComponent(commentComponent);
                }, this);
            }
        },
        _updatePageComments: function (pageId) {
            this._removeAllComments();
            var commentComponents = this.resources.W.Editor.Comments.getPageComments(pageId);
            this._createComments(commentComponents);
        },
        _removeAllComments: function () {
            this.setSelectedComment(undefined);
            this._removeAllChildNodes(this._skinParts.comments);
            this._comments = {};
        },

        _removeAllChildNodes: function (parent) {
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
        },

        _createCommentPanelComponent: function(commentComponent){
            var comment = this.resources.W.Components.createComponent(
                'wysiwyg.editor.components.inputs.FeedbackComment',
                'wysiwyg.editor.skins.FeedbackCommentSkin',
                null,
                _.clone(commentComponent.getCommentProperties()),
                function(compLogic){
                    this._addCommentComponent(compLogic);
                    compLogic.setCommentsPanel(this);
                    compLogic.render(); //render the comment to fix browser glich with insert before, without this the lable is not shown - weird
                }.bind(this)
            );

            this._skinParts.comments.insertBefore(comment, this._skinParts.comments.firstChild);
        },

        _addCommentComponent: function(compLogic){
            var commentId = compLogic.getCommentId();
            this._comments[commentId] = compLogic;
        },

        _createFields: function(){
            this.addButtonField(null, this._translate("ShareFeedback_DIALOG_TITLE", "Share your work"), null, 'getfeedback/Shaer-your-site_icon.png', 'blueCentered')
                .addEvent(Constants.CoreEvents.CLICK, function(){
                    LOG.reportEvent(wixEvents.SHARE_BUTTON_CLICKED);
                    if (this.resources.W.Config.siteNeverSavedBefore()) {
                        this.resources.W.Commands.executeCommand('WEditorCommands.ShowSaveBeforeYouShare');
                    } else {
                        this.resources.W.Commands.executeCommand('WEditorCommands.ShowShareFeedbackDialog');
                    }
                }.bind(this))
                .runWhenReady(function (logic) {
                    logic.$view.style.fontSize = "13px";
                });

            this.addBreakLine('10px', '1px solid #D6D5C3', '10px');
            this._showCommentCheckBox = this.addCheckBoxField(this._translate("FEEDBACK_SHOW_COMMENTS_CHECKBOX", "Show comments when this panel is closed."), null, "noHover")
                .runWhenReady(function (logic) {
                    logic.setValue(false);
                    logic.$view.parentElement.removeChild(logic.$view);
                    logic.$view.style.fontSize = '12px';
                    this._skinParts.pagesGroup.appendChild(logic.$view);
                }.bind(this));

            this._showCommentCheckBox.addEvent("inputChanged", function(e) {
                LOG.reportEvent(
                    wixEvents.FEEDBACK_SHOW_COMMENTS_COMBO_PRESSED,
                    {
                        i1: (!!e.value? 1 : 0)
                    }
                );
            });

            this._updateAllComments();
        },

        _getCurrentPageId: function () {
            return this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
        },

        setSelectedComment: function(commentId){
            this.unSelectComment();
            this._selectedId = commentId;
        },

        unSelectComment: function(){
          if (this._selectedId){
              this._comments[this._selectedId].unSelectComment();
          }
        },

        /**
         * Called from the panel comment
         * @param commentId
         * @param pageId
         */
        panelCommentSelected: function(commentId, pageId){
            if (commentId){
                this.setSelectedComment(commentId);
                this.resources.W.Editor.Comments.commentSelectedFromDialog(commentId, pageId);
            }
        },

        _onCommentCreated: function(commentComponent){
            if (this._skinParts.pagesDropDown.isAllCommentsMode()) {
                this._updateAllComments();
            } else if (this._getCurrentPageId() === commentComponent.getPageId()) {
                this._createCommentPanelComponent(commentComponent);
            }
        },

        _onCommentSelected: function(event){
            //TODO check if it's the current page before doing anything
            var commentId = event.commentId;
            if (commentId){
                this.setSelectedComment(event.commentId);
                this._comments[commentId].highlightComment();
            }
        },

        _onCommentDeleted: function(params){
            if (this._comments[params.commentId]) {
                this._comments[params.commentId].deleteComment();
                this.setSelectedComment(undefined);
                delete this._comments[params.commentId];
            }
        },

        _onCloseDialog: function(){
            if (this._showCommentCheckBox.getValue()) {
                this.resources.W.Editor.Comments.enterViewCommentsMode();
            } else {
                this.resources.W.Editor.Comments.hideComments();
            }

            LOG.reportEvent(wixEvents.CLOSE_FEEDBACK_PANEL);
            return true;
        }
    });
});
