define.component('wysiwyg.editor.components.inputs.FeedbackComment', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.utilize(['core.utils.css.Font']);

    def.inherits('wysiwyg.editor.components.WButton');

    def.binds(['_onClick']);

    def.resources(['W.Commands', 'W.Resources']);

    def.skinParts({
        label: {type: 'htmlElement'},
        comment : {type: 'htmlElement'},
        date: {type: 'htmlElement'},
        commentIcon : {type: 'htmlElement'},
        faceIcon : {type: 'htmlElement'}
    });

    def.fields({
        _canFocus : true,
        _triggers: ['click'],
        MAX_FONT_SIZE: 20,
        monthNames: [
            "FEEDBACK_REVIEW_MONTH_JAN", "FEEDBACK_REVIEW_MONTH_FEB", "FEEDBACK_REVIEW_MONTH_MAR", "FEEDBACK_REVIEW_MONTH_APR",
            "FEEDBACK_REVIEW_MONTH_MAY", "FEEDBACK_REVIEW_MONTH_JUN", "FEEDBACK_REVIEW_MONTH_JULY", "FEEDBACK_REVIEW_MONTH_AUG",
            "FEEDBACK_REVIEW_MONTH_SEP", "FEEDBACK_REVIEW_MONTH_OCT", "FEEDBACK_REVIEW_MONTH_NOV", "FEEDBACK_REVIEW_MONTH_DEC" ]
    });

    def.states({
        readState:['read','unread'],
        selected: ['commentUnselected','commentSelected'],
        'DEFAULT': ['up', 'over', 'selected', 'pressed'],
        'icon': ['hasIcon', 'noIcon'],
        'labelVisibility': ["showLabel", "hideLabel"],
        'FirstTimeUser': ['showPreview','hidePreview'],
        'FirstInteraction': ['hovered'],
        mood:['noMood','happy','sad']
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            args.label = args.submitter;
            this.parent(compId, viewNode, args);
            this._comment = args.text.replace(/\n/g, ' ');
            this._date = args.time;
            this._pageId = args.pageId;
            this._commentProperties = args;
        },

        _onAllSkinPartsReady: function() {
            this._skinParts.comment.set('html', this._comment);
            this._skinParts.date.set('text', " | " + this._getDateFormat(new Date(this._date)));
            this.$view.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            this._setMood();
            if (this._commentProperties.unread) {
                this.setState('unread', 'readState');
            }
        },

        _getDateFormat: function(date){
            var monthName = this.resources.W.Resources.get('EDITOR_LANGUAGE', this.monthNames[date.getMonth()], '' + (date.getMonth() + 1));
            return date.getDate() + ' ' + monthName + ' ' + date.getFullYear();
        },

        _onClick: function(event) {
            event.target = this.getViewNode();
            this.fireEvent(Constants.CoreEvents.CLICK, event);
            this._onCommentSelected();
        },

        _onCommentSelected: function(){
            LOG.reportEvent(wixEvents.FEEDBACK_COMMENT_SELECTED_EDITOR, {c1: 'panel'});

            if (this._pageId !== W.Preview.getPreviewManagers().Viewer.getCurrentPageId()){
                this.resources.W.Commands.executeCommand("EditorCommands.gotoSitePage", this._pageId, this);
            }
            this.highlightComment();
            this._commentsPanel.panelCommentSelected(this._commentProperties.commentId, this._pageId);
        },

        _markAsRead: function() {
            if (this._commentProperties.unread) {
                this._commentProperties.unread = false;
                this.setState('read', 'readState');
            }
        },

        highlightComment:function(){
            this._markAsRead();
            this.setState('commentSelected','selected');
        },

        unSelectComment: function(){
            this._downPlayComment();
        },

        _downPlayComment: function(){
            this.setState('commentUnselected','selected');
        },

        setCommentsPanel: function(panelLogic){
            this._commentsPanel = panelLogic;
        },

        deleteComment:function(){
            this.$view.parentElement.removeChild(this.$view);
        },

        _setMood: function(){
            this.setState(this._commentProperties.face,'mood');
        },

        getCommentId: function(){
            return this._commentProperties.commentId;
        }


    });
});
