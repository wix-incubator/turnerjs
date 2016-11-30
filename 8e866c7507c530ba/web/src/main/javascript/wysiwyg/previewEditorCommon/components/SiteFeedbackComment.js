define.component('wysiwyg.previeweditorcommon.components.SiteFeedbackComment', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Utils', 'W.Resources']);

    def.binds(['_changeDisplayMode', 'hideComment', 'deleteComment', 'onCommentUnselected', '_enableReviewDrag', '_enableEditorDrag',
        '_setHappyMood', '_setSadMood', '_iconMouseDownHandler', '_mouseClickHandler', '_iconMouseUpHandler']);


    def.skinParts({
        commentContainer: {type: 'htmlElement'},
        commentIcon: {type: 'htmlElement'},
        okButton: {type: 'wysiwyg.previeweditorcommon.components.SiteFeedbackButton', argObject: {
            label: 'FEEDBACK_REVIEW_COMMENT_BUTTON',
            enabled: true,
            hasIcon: false
        }},
        commentText: {type: 'htmlElement'},
        textContainer: {type: 'htmlElement'},
        happyIcon: {type: 'htmlElement'},
        sadIcon: {type: 'htmlElement'},
        trash: {type: 'htmlElement'},
        nameText: {type: 'htmlElement'},
        date: {type: 'htmlElement'}
    });

    def.states({
        displayed: ['full', 'iconOnly'],
        mood: ['noMood', 'happy', 'sad'],
        sent: ['notSent', 'sent'],
        horizontalPosition: ['regular', 'rightScreenSide'],
        verticalPosition: ['topScreenSide', 'bottomScreenSide']
    });

    def.statics({
        DRAG_OFFSET: 30,
        WIDTH: 5,
        HEIGHT: 5
    });

    def.fields({
        monthNames: [
            "FEEDBACK_REVIEW_MONTH_JAN", "FEEDBACK_REVIEW_MONTH_FEB", "FEEDBACK_REVIEW_MONTH_MAR", "FEEDBACK_REVIEW_MONTH_APR",
            "FEEDBACK_REVIEW_MONTH_MAY", "FEEDBACK_REVIEW_MONTH_JUN", "FEEDBACK_REVIEW_MONTH_JULY", "FEEDBACK_REVIEW_MONTH_AUG",
            "FEEDBACK_REVIEW_MONTH_SEP", "FEEDBACK_REVIEW_MONTH_OCT", "FEEDBACK_REVIEW_MONTH_NOV", "FEEDBACK_REVIEW_MONTH_DEC"
        ]
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._creationTime = new Date();
            if (args) {
                this._displayMode = "editor";
            } else {
                this._displayMode = "viewer";
            }
            this._viewerManager = this._displayMode === "viewer" ? W.Viewer : W.Preview && W.Preview.getPreviewManagers().Viewer;
            this._bottomAdHeight = 0;
            this._screenSize = this.resources.W.Utils.getWindowSize(true);
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;
            if (this._displayMode === "viewer") {
                this.setWidth(this.WIDTH);
                this.setHeight(this.HEIGHT);
            }
            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                if (this._displayMode === "viewer") {
                    this._initializeViewerMode();
                } else {
                    this._initializeEditorMode();
                }
                this._skinParts.trash.on('click', this, this.deleteComment);
                this.$view.addEvent('click', this._mouseClickHandler);
                this._skinParts.commentIcon.addEvent('mousedown', this._iconMouseDownHandler);
                this._checkAdsHeight();
            }
        },

        /**
         * @public
         * @param {core.components.base.traits.BaseCompInvalidation} invalidations
         * @returns {Boolean}
         */
        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.POSITION,
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.PART_POSITION
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        _initializeViewerMode: function () {
            this._enableReviewDrag();
            this._viewerManager.addEvent(this._viewerManager.SCREEN_RESIZE_EVENT, this._enableReviewDrag);
            this._skinParts.happyIcon.on('click', this, this._setHappyMood);
            this._skinParts.sadIcon.on('click', this, this._setSadMood);
            this._skinParts.commentText.setAttribute('placeholder', this._translate('FEEDBACK_REVIEW_COMMENT_TEXT'));
        },

        _initializeEditorMode: function () {
            this._enableEditorDrag();
            this._viewerManager.addEvent(this._viewerManager.SCREEN_RESIZE_EVENT, this._enableEditorDrag);
            this.hideComment();
        },

        _checkAdsHeight: function () {
            this._bottomAdHeight = 0;
            var wixfooterAd = document.getElementById('wixFooter');
            if (!this.resources.W.Config.isPremiumUser() && this._displayMode === "viewer" && wixfooterAd) {
                this._bottomAdHeight = parseInt(wixfooterAd.$logic.getSkinPart('footerLabel').getStyle('height'));
            }
        },

        updateCommentSide: function () {
            var commentWidth = 325,
                commentContainerY = 33,
                windowSize = this._screenSize,
                windowScroll = this.resources.W.Utils.getWindowScrollOffset(),
                verticalFlipPoint,
                commentPosition = this.getGlobalPosition();
            this.commentContainerHeight = this.commentContainerHeight || this._skinParts.commentContainer.getSize().y;
            if (commentPosition.x > (windowSize.width - commentWidth)) {
                this.setState('rightScreenSide', 'horizontalPosition');
            } else {
                this.setState('regular', 'horizontalPosition');
            }

            verticalFlipPoint = windowSize.height + windowScroll.y - this._bottomAdHeight - this.commentContainerHeight;
            if ((commentPosition.y + commentContainerY) > verticalFlipPoint) {
                if (this._displayMode !== "viewer") {
                    this._setBottomDisplayMode();
                } else {
                    this.setState('bottomScreenSide', 'verticalPosition');
                }
            } else {
                if (this._displayMode !== "viewer") {
                    this._setTopDisplayMode();
                } else {
                    this.setState('topScreenSide', 'verticalPosition');
                }
            }
        },

        _setBottomDisplayMode: function () {
            var commentContainer = this._skinParts.commentContainer;
            commentContainer.setStyles({
                top: 19 - this.commentContainerHeight,
                '-webkit-transform-origin-y': this.commentContainerHeight + 'px'
            });
        },

        _setTopDisplayMode: function () {
            var commentContainer = this._skinParts.commentContainer;
            commentContainer.setStyles({
                top: '33px',
                '-webkit-transform-origin-y': '0px'
            });
        },

        _setHappyMood: function () {
            this.setState('happy', 'mood');
            this.setMood('happy');
            LOG.reportEvent(wixEvents.FEEDBACK_COMMENT_EMOTION_SELECTED, {i1: 1});
        },

        _setSadMood: function () {
            this.setState('sad', 'mood');
            this.setMood('sad');
            LOG.reportEvent(wixEvents.FEEDBACK_COMMENT_EMOTION_SELECTED, {i1: 0});
        },

        _enableReviewDrag: function () {
            var pageComp = this._viewerManager.getCurrentPageNode().getLogic(),
                footerComp = this._viewerManager.getFooterContainer().getLogic(),
                pagePosition = pageComp.getGlobalPosition(),
                limits = {
                    x: [-pagePosition.x + this.DRAG_OFFSET, this._screenSize.width - pagePosition.x - this.DRAG_OFFSET * 2],
                    y: [-pagePosition.y + this.DRAG_OFFSET, pagePosition.y + pageComp.getHeight() + footerComp.getHeight()]
                };
            this._drag = new Drag.Move(this._skinParts.view, {
                snap: 0,
                handle: this._skinParts.commentIcon,
                limit: limits,
                'onDrag': function () {
                    this.updateCommentSide();
                }.bind(this)
            });
        },

        _enableEditorDrag: function () {
            var screenScroll = this.resources.W.Utils.getWindowScrollOffset(),
                pageComp = this._viewerManager.getCurrentPageNode().getLogic(),
                footerComp = this._viewerManager.getFooterContainer().getLogic(),
                pagePosition = pageComp.getGlobalPosition();
            var limits = {
                x: [this.DRAG_OFFSET, this._screenSize.width - this.DRAG_OFFSET * 2],
                y: [this.DRAG_OFFSET, pagePosition.y + pageComp.getHeight() + footerComp.getHeight()]
            };
            this._drag = new Drag.Move(this._skinParts.view, {
                snap: 0,
                handle: this._skinParts.commentIcon,
                limit: limits,
                'onDrag': function () {
                    this.updateCommentSide();
                }.bind(this)
            });
        },

        _iconMouseDownHandler: function (event) {
            this._mouseDownPosition = event.page;
            this._skinParts.commentIcon.addEvent('mouseup', this._iconMouseUpHandler);
        },

        _iconMouseUpHandler: function (event) {
            this._skinParts.commentIcon.removeEvent('mouseup', this._iconMouseUpHandler);
            if (_.isEqual(this._mouseDownPosition, event.page)) {
                this._changeDisplayMode();
            }
        },

        showComment: function () {
            if (this.getState('displayed') === 'iconOnly') {
                this._updateCommentsHtmlOrder();
                this.setState('full', 'displayed');
            }
            if (this.isCommentUnread()) {
                this.fireEvent('commentRead', this);
                this._markAsRead();
            }
        },

        _changeDisplayMode: function () {
            if (this.getState('displayed') === 'iconOnly') {
                this.onCommentSelected();
            } else {
                this.onCommentUnselected();
            }
        },

        getCommentText: function () {
            return this._skinParts.commentText.value;
        },

        getSubmitter: function () {
            return this._submitter;
        },

        getCommentId: function () {
            return this._commentId;
        },

        setCommentId: function (id) {
            this._commentId = id;
        },

        getPageId: function () {
            return this._pageId;
        },

        setPageId: function (pageId) {
            this._pageId = pageId;
        },

        getCreationTime: function () {
            return this._creationTime;
        },

        getMood: function () {
            return this._mood || 'noMood';

        },

        setSubmitter: function (submitter) {
            this._submitter = submitter;
            this._skinParts.nameText.innerHTML = submitter;
        },

        setCreationTime: function (date) {
            this._creationTime = date;
        },

        _displayCreationTime: function () {
            this._skinParts.date.set('text', " | " + this._getDateFormat(new Date(this._creationTime)));
        },

        setMood: function (mood) {
            this._mood = mood;
            this.setState(mood, 'mood');
        },

        setCommentText: function (text) {
            if (this._displayMode === "editor") {
                text = text.replace(/\n/g, '<br>');
            }
            this._skinParts.commentText.innerHTML = text;
        },

        getCommentProperties: function () {
            return this._commentProperties;
        },

        setCommentProperties: function (properties) {
            this._commentProperties = properties;
            this.setX(properties.x);
            this.setY(properties.y);
            this.setMood(properties.face);
            this.setCommentText(properties.text);
            this.setCommentId(properties.commentId);
            this.setPageId(properties.pageId);
            this.setUnread(properties.unread);
            this.setCreationTime(properties.time);

            if (this._displayMode === "editor") {
                this.setSubmitter(properties.submitter);
                this._displayCreationTime(properties.time);
            }
        },

        isCommentUnread: function () {
            return this._unread;
        },

        setUnread: function (unread) {
            this._unread = unread;
        },

        _markAsRead: function () {
            this._commentProperties.unread = false;
            this._unread = false;
        },

        /**
         * fires a selected event, and updates the html so this comment is above the others.
         */
        onCommentSelected: function () {
            this.fireEvent('commentSelected', this);
            this.showComment();
            if (this._displayMode === "editor") {
                LOG.reportEvent(wixEvents.FEEDBACK_COMMENT_SELECTED_EDITOR, {c1: 'comment'});
            }
        },

        onCommentUnselected: function () {
            this.fireEvent('commentUnselected', this);
            this.hideComment();
        },

        hideComment: function () {
            this.setState('iconOnly', 'displayed');
            this.fireEvent('commentHidden', this);
        },

        _updateCommentsHtmlOrder: function () {
            var siblings = _.filter(this.$view.getSiblings(), function (node) {
                return (node.$logic && node.$logic.$className.toLowerCase().indexOf('sitefeedbackcomment') !== -1);
            }, this);
            var parent = this.$view.parentElement;

            //moving this element in the HTML cancels the animation, so the others have to move
            _.forEach(siblings, function (commentView) {
                parent.insertBefore(commentView, this.$view);
            }, this);
        },

        deleteComment: function () {
            this.trigger('commentDeleted', {commentLogic: this});
            if (this._displayMode === "editor") {
                LOG.reportEvent(wixEvents.FEEDBACK_COMMENT_DELETED_EDITOR);
            } else {
                LOG.reportEvent(wixEvents.FEEDBACK_COMMENT_DELETED_PREVIEW);
            }
            this.exterminate();
        },

        markAsSent: function () {
            this._skinParts.commentText.disabled = true;
            this._drag.detach();
            this._skinParts.happyIcon.off('click', this, this._setHappyMood);
            this._skinParts.sadIcon.off('click', this, this._setSadMood);
            this._skinParts.trash.off('click', this, this.deleteComment);
            this.setState('sent', 'sent');
        },

        focusOnText: function () {
            this._skinParts.commentText.focus();
        },

        _getDateFormat: function (date) {
            var monthName = W.Resources.get('EDITOR_LANGUAGE', this.monthNames[date.getMonth()], '' + (date.getMonth() + 1));
            return date.getDate() + ' ' + monthName + ' ' + date.getFullYear();
        },

        _mouseClickHandler: function (event) {
            var displayed = this.getState('displayed') === 'full';
            switch (event.target) {
                case this._skinParts.okButton:
                    if (displayed) {
                        this.onCommentUnselected();
                    }
                    break;
                default:
                    if (displayed && !_.contains(this._skinParts, event.target)) {
                        this.onCommentUnselected();
                    }
                    break;
            }
        },

        _translate: function (key, fallback) {
            return this.resources.W.Resources.get('FEEDBACK_REVIEW', key, fallback);
        }
    });
});