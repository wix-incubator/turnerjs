define.component('wysiwyg.previeweditorcommon.components.SiteFeedbackPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Resources', 'W.Viewer', 'W.Components', 'W.Config', 'W.Utils', 'W.Commands']);

    def.binds(['_onWindowResize', '_onSiteReady', '_showAddCommentsPanel', 'onCommentSelected', '_adjustSubmitPanelLeftPosition', '_onPageTransition']);

    def.utilize(['core.managers.serverfacade.FeedbackClient','core.managers.components.ComponentBuilder']);

    def.skinParts({
        background: { type: 'htmlElement' },
        commentsModePanel: {type: 'htmlElement'},
        helpText: {type: 'htmlElement'},
        helpIcon: {type: 'htmlElement'},
        helpToolTip: {type: 'htmlElement'},
        newComment: {type: 'wysiwyg.previeweditorcommon.components.SiteFeedbackButton', argObject:{
            label: 'FEEDBACK_REVIEW_ADD_BUTTON',
            enabled:true,
            hasIcon:true
        }},
        doneButton: {type: 'wysiwyg.previeweditorcommon.components.SiteFeedbackButton', argObject: {
            label: 'FEEDBACK_REVIEW_SUBMIT_BUTTON'
        }},
        submitPanel : {type: 'htmlElement'},
        submitPanelTitle : {type: 'htmlElement'},
        nameTitle : {type: 'htmlElement'},
        submitterIcon: {type: 'htmlElement'},
        submitter: {type: 'htmlElement'},
        finalCommentQuestion : {type: 'htmlElement'},
        finalComment: {type: 'htmlElement'},
        sendButton: {type: 'wysiwyg.previeweditorcommon.components.SiteFeedbackButton', argObject:{
            label: 'FEEDBACK_REVIEW_SUBMIT_SEND_BUTTON',
            enabled:true,
            hasIcon:true
        }},
        cancelButton : {type: 'htmlElement'},
        thanksMessage: {type: 'htmlElement'},
        thanksMessageContainer: {type: 'htmlElement'},
        dragArea: {type: 'htmlElement'},
        errorMessage: {type: 'htmlElement'},
        sendingAnimation: {type: 'htmlElement'}
    });

    def.states({
        submitState:  ['beforeSubmit', 'afterSubmit'],
        submitPanel:  ['addCommments', 'submitPanel'],
        quickTour: ['quickTourVisible', 'quickTourHidden'],
        submitSuccess: ['submitSuccess', 'submitError'],
        sendIcon: ['showIcon', 'hideIcon']
    });

    def.statics({
        DRAG_OFFSET:2,
        SUBMIT_PANEL_HEIGHT:365,
        EDITCOMMENT: "Drag the red icon to position your comment.",
        ADDMORECOMMENTS: "Add more comments & Submit when you're done",
        EMPTY_COMMENT_TEXT:'No comment',
        DISTANCE_BETWEEN_COMMENTS:70 //70 to 200
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._comments = {};
            if (this.resources.W.Viewer.isSiteReady()){
                this._onSiteReady();
            } else {
                this.resources.W.Viewer.addEvent('SiteReady', this._onSiteReady);
            }
            this.resources.W.Commands.registerCommand("WPreviewCommands.FeedbackQuickTourEnded", true);
        },

        _onSiteReady: function(){
            this._initializePagesCommentsObjects();
        },

        _initializePagesCommentsObjects: function(){
            _.forOwn(this.resources.W.Viewer.getPages(), function(value,key){
                this._comments[key] = {};
            },this);
            this._restClient = new this.imports.FeedbackClient();
        },

        _onWindowResize: function(){
            this._fixY();
            this._enableDrag();
        },

        _fixY: function() {
            var wixads = document.getElementById('wixFooter'),
                wixadsComp;
            this._bottomAdHeight = 0;
            if (!this.resources.W.Config.isPremiumUser() && wixads && wixads.$logic) {
                    wixadsComp = wixads.$logic;
                    this._bottomAdHeight = parseInt(wixadsComp.getSkinPart('footerLabel').getComputedSize().height,10);
            }
            this._setCommentsPanelPosition(this._bottomAdHeight);
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;
            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._fixY();
                this.resources.W.Viewer.addEvent(this.resources.W.Viewer.SCREEN_RESIZE_EVENT,this._onWindowResize);
                this._skinParts.newComment.on('click', this, this._placeNewComment);
                this._skinParts.cancelButton.on('click', this, this._hideSubmitPanel);
                this._skinParts.sendButton.on('click', this, this._submitComments);
                this._enableDrag();
                this._addHelpToolTip();
                this._feedbackQuickTourView = this._createQuickTour();
                if (Browser.ie){
                    // stupid explorer for some reason puts position absoulte on the panel skinpart
                    this._skinParts.commentsModePanel.setStyle('position','fixed');
                }
                this._setSubmitPanelBottomPosition(-1 * this.SUBMIT_PANEL_HEIGHT);
                this._translateSkinParts();

                if (!this.sendButtonIconPos) {
                    this.sendButtonIconPos = this._getSendButtonIconPos();
                    this._skinParts.sendingAnimation.setStyles({
                        left: this.sendButtonIconPos.left + 'px',
                        top: this.sendButtonIconPos.top + 'px'
                    });
                    if (Browser.ie) {
                        // since ie doesn't support pointer-events property
                        this._skinParts.sendingAnimation.on('click', this, this._submitComments);
                    }
                }
                this._skinParts.sendButton.hideIcon();
            }
        },

        _translateSkinParts: function () {
            this._skinParts.helpToolTip.innerHTML = this._translate('FEEDBACK_REVIEW_HELP_TOOLTIP');
            this._skinParts.helpText.innerHTML = this._translate('FEEDBACK_REVIEW_INTRUCTION1');
            this._skinParts.cancelButton.innerHTML = this._translate('FEEDBACK_REVIEW_SUBMIT_BACK');
            this._skinParts.submitPanelTitle.innerHTML = this._translate('FEEDBACK_REVIEW_SUBMIT_TITLE');
            this._skinParts.nameTitle.innerHTML = this._translate('FEEDBACK_REVIEW_SUBMIT_NAME');
            this._skinParts.submitter.setAttribute('placeholder', this._translate('FEEDBACK_REVIEW_SUBMIT_NAME_TEXT'));
            this._skinParts.finalCommentQuestion.innerHTML = this._translate('FEEDBACK_REVIEW_SUBMIT_GENERAL');
            this._skinParts.finalComment.setAttribute('placeholder', this._translate('FEEDBACK_REVIEW_SUBMIT_GENERAL_TEXT'));
            this._skinParts.thanksMessage.innerHTML = this._translate('FEEDBACK_REVIEW_SUBMIT_THANKS');
            this._skinParts.errorMessage.innerHTML = this._translate('feedback_review_error');
        },

        _placeNewComment: function(event){
            LOG.reportEvent(wixEvents.FEEDBACK_ADD_COMMENT_PREVIEW);
            if (this.selectedComment){
                this.selectedComment.removeEvent('commentHidden', this._showAddCommentsPanel);
            }
            this._setCommentsPanelPosition(this._bottomAdHeight - 75);
            this._skinParts.helpText.innerHTML = this._translate('FEEDBACK_REVIEW_INSTRUCTION2', this.EDITCOMMENT);
            this._skinParts.doneButton.on('click', this, this._showSubmitPanel);
            this._skinParts.doneButton.toggleEnabled(true);

            this.resources.W.Components.createComponent(
                'wysiwyg.previeweditorcommon.components.SiteFeedbackComment',
                'wysiwyg.previeweditorcommon.SiteFeedbackCommentSkin',
                null, null,
                function(compLogic){
                    this._addCommentToSitePage(compLogic);
                    this._addComment(compLogic);
                    this.onCommentSelected(compLogic);
                    compLogic.focusOnText();
                    compLogic.on('commentDeleted',this, this._commentDeleted);
                    compLogic.addEvent('commentHidden', this._showAddCommentsPanel);
                    compLogic.addEvent('commentSelected', this.onCommentSelected);
                }.bind(this)
            );
        },

        _commentDeleted:function(event){
            var currentPage = this.resources.W.Viewer.getCurrentPageNode().getLogic(),
                currentPageId = currentPage.getID(),
                pageComments = this._comments[currentPageId],
                commentLogic = event.data.commentLogic;
            if (commentLogic.$className && commentLogic.$className.indexOf('SiteFeedbackComment') !== -1){
                commentLogic.removeEvent('commentHidden', this._showAddCommentsPanel);
            }

            delete pageComments[commentLogic.getComponentId()];
            this._showAddCommentsPanel();
        },

        _addComment: function(compLogic){
            var currentPage = this.resources.W.Viewer.getCurrentPageNode().getLogic(),
                currentPageId = currentPage.getID(),
                pageComments = this._comments[currentPageId];
            pageComments[compLogic.getComponentId()] = compLogic;
        },

        _addCommentToSitePage: function(compLogic){
            var windowSize = this.resources.W.Utils.getWindowSize(true),
                windowScroll = window.getScroll(),
                currentPage = this.resources.W.Viewer.getCurrentPageNode().getLogic(),
                currentPagePosition = currentPage.getGlobalPosition(),
                commentPosition = {
                x: windowSize.width/2 - currentPagePosition.x + windowScroll.x - 141,
                y: windowSize.height/2 - currentPagePosition.y + windowScroll.y - 70
            };

            compLogic.getViewNode().insertInto(currentPage.getViewNode());
            if (windowScroll.y !== this._lastCommentWindowScroll || !(this._commentsLocationCounter)){
                this._commentsLocationCounter = 1;
            } else {
                this._spreadNewCommentsPositions(commentPosition);
                this._commentsLocationCounter++;
            }
            compLogic.setX(commentPosition.x);
            compLogic.setY(commentPosition.y);
            this._lastCommentWindowScroll = windowScroll.y;
        },

        _spreadNewCommentsPositions: function(commentPosition){
            var xDirection = 1,
                yDirection = 1;
            switch ((this._commentsLocationCounter - 1) % 4) {
                case 0:
                    yDirection = -1;
                    break;
                case 1:
                    xDirection = -1;
                    yDirection = -1;
                    break;
                case 2:
                    xDirection = -1;
                    break;
            }
            commentPosition.x += ((this.DISTANCE_BETWEEN_COMMENTS + Math.random()*140) * xDirection);
            commentPosition.y += ((this.DISTANCE_BETWEEN_COMMENTS + Math.random()*140) * yDirection);
        },

        _enableDrag:function () {
            var screenSize = this.resources.W.Utils.getWindowSize(true),
                that = this,
                limits = {
                    x:[this.DRAG_OFFSET, screenSize.width - this.getWidth() - this.DRAG_OFFSET],
                    y: [this._bottomAdHeight || 0, this._bottomAdHeight || 0]
                },
                modifiers = {
                    'x':'left',
                    'y':'bottom'
                };
            this._drag = new Drag.Move(this._skinParts.commentsModePanel, {
                snap:0,
                handle:this._skinParts.dragArea,
                limit:limits,
                modifiers: modifiers,
                onComplete: that._adjustSubmitPanelLeftPosition.bind(that)
            });
        },

        /**
         * return an array of objects. each object contains the properties of a comment in this page
         * @param pageId
         * @private
         */
        _getPageCommentsArray: function(pageId){
            var commentsArr = [],
                compLogic,
                commentObj;
            _.forOwn(this._comments[pageId],function(value,key){
                compLogic = value;
                commentObj = {
                    pageId: pageId,
                    x: compLogic.$view.style.left,
                    y: compLogic.$view.style.top,
                    text: compLogic.getCommentText(),
                    submitter: this._skinParts.submitter.value || this._translate('FEEDBACK_REVIEW_COMMENT_ANONYMOUS'),
                    time: compLogic.getCreationTime(),
                    face: compLogic.getMood(),
                    unread: true
                };
                commentsArr.push(commentObj);
            },this);

            return commentsArr;
        },

        _getCommentsArray: function(){
            var commentsObj = [];
            _.forOwn(this._comments, function(value,key){
                commentsObj = commentsObj.concat(this._getPageCommentsArray(key));
            },this);

            return commentsObj;
        },

        _submitComments: function () {
            var jsonData = this._getCommentsArray(),
                siteId = this.resources.W.Config.getSiteId();
            this.submitSuccess = false;
            this.submitError = false;
            this.setState('submitSuccess', 'submitSuccess');

            this._replaceEmptyCommentsText(jsonData);
            this._startSendAnimation();
            this._restClient.appendComments(siteId, jsonData, this._skinParts.finalComment.value, this._skinParts.submitter.value, this._onSubmitSuccess.bind(this, jsonData), this._onSubmitError.bind(this));
        },

        _replaceEmptyCommentsText: function(commentsArray){
            _.forEach(commentsArray, function(commentProperties){
                if (!commentProperties.text){
                    commentProperties.text = this._translate('FEEDBACK_REVIEW_EMPTY_COMMENT', this.EMPTY_COMMENT_TEXT);
                }
            },this);
        },

        _updateSentComments:function(){
            _.map(this._comments, function(pagesComments){
                _.map(pagesComments,function(commentLogic){
                    commentLogic.markAsSent();
                },this);
            },this);
            this._comments = {};
            _.forOwn(this.resources.W.Viewer.getPages(), function(value,key){
                this._comments[key] = {};
            },this);
        },

        _showSubmitPanel:function(){
            this._setSubmitPanelBottomPosition(this._bottomAdHeight);
            LOG.reportEvent(wixEvents.FEEDBACK_SUBMIT_COMMENTS_PREVIEW);
        },

        _hideSubmitPanel:function(){
            this._setSubmitPanelBottomPosition(this._skinParts.submitPanel.getHeight() * -1);
            this.setState('beforeSubmit', 'submitState');
            this.setState('submitSuccess', 'submitSuccess');
            this.setState('showIcon', 'sendIcon');
        },

        _showAddCommentsPanel: function () {
            this._setCommentsPanelPosition(this._bottomAdHeight);
            var editCommentText = this._translate('FEEDBACK_REVIEW_INSTRUCTION2', this.EDITCOMMENT);
            if (this._skinParts.helpText.innerHTML === editCommentText) {
                this._skinParts.helpText.innerHTML = this._translate('FEEDBACK_REVIEW_INSTRUCTION3', this.ADDMORECOMMENTS);
            }
            this._saveCommentsToLocalStorage();
        },

        onCommentSelected:function(comment){
            if (this.selectedComment && this.selectedComment !== comment){
                this.selectedComment.onCommentUnselected();
            }
            this.selectedComment = comment;
        },

        _addHelpToolTip: function() {
            var helpIcon = this._skinParts.helpIcon,
                toolTip = this._skinParts.helpToolTip;
            toolTip.collapse();

            helpIcon.addEvent('mouseenter', function () {
                toolTip.uncollapse();
            }.bind(this));

            helpIcon.addEvent('mouseleave', function () {
                toolTip.collapse();

            }.bind(this));
        },

        _createQuickTour: function(){
            var viewNode = new Element("div"),
                compBuilder;

            viewNode.setProperty("skinPart", 'FeedbackQuickTour');
            compBuilder = new this.imports.ComponentBuilder(viewNode);
            compBuilder.
                withType('wysiwyg.previeweditorcommon.components.FeedbackQuickTour').
                withSkin('wysiwyg.previeweditorcommon.FeedbackQuickTourSkin').
                withArgs({
                    feedbackPanel: this
                }).
                create();

            return viewNode;
        },

        showQuickTour: function(){
            document.getElementById('reviewsContainer').appendChild(this._feedbackQuickTourView);
            this._feedbackQuickTourView.$logic.on('quickTourClosed', this, this._onQuickTourClosed);
            this.setState('quickTourVisible','quickTour');
        },

        _onQuickTourClosed: function () {
            this.setState('quickTourHidden', 'quickTour');
            LOG.reportEvent(wixEvents.FEEDBACK_USER_CLICKED_FEEDBACK_QUICKTOUR_GOT_IT);
            this.resources.W.Viewer.addEvent('pageTransitionEnded', this._onPageTransition);

            this.resources.W.Commands.executeCommand('WPreviewCommands.FeedbackQuickTourEnded');

            var loadedComments = this._loadSavedComments();
            if (loadedComments && loadedComments.length) {
                this._skinParts.doneButton.on('click', this, this._showSubmitPanel);
                this._skinParts.doneButton.toggleEnabled(true);
            }
        },

        _onPageTransition: function (pageId) {
            this._showAddCommentsPanel();
            var currentPageView = this.resources.W.Viewer.getPages()[pageId];
            var pageComments = currentPageView.querySelector("[comp='wysiwyg.previeweditorcommon.components.SiteFeedbackComment']");
            if (!pageComments && _.keys(this._comments[pageId]).length) {
                _.forEach(this._comments[pageId], function (commentLogic) {
                    commentLogic.getViewNode().insertInto(currentPageView);
                });
            }
        },

        /**
         * @param bottomPixels - number of pixels from window bottom to comments panel
         * @private
         */
        _setCommentsPanelPosition: function(bottomPixels){
            this._skinParts.commentsModePanel.setStyle('bottom',bottomPixels + 'px');
        },

        /**
         * @param bottomPixels - number of pixels from window bottom to submit panel
         * @private
         */
        _setSubmitPanelBottomPosition: function(bottomPixels){
            this._skinParts.submitPanel.setStyle('bottom',bottomPixels + 'px');
        },

        /**
         * Adjusts the horizontal position of the submit panel to fit the one of the comments panel
         * @private
         */
        _adjustSubmitPanelLeftPosition: function(){
            var commentsPanelLeft = this._skinParts.commentsModePanel.getStyle('left');
            this._skinParts.submitPanel.setStyle('left', commentsPanelLeft);
        },

        _saveCommentsToLocalStorage: function () {
            var storage = window.localStorage;
            var commentsStorageName = rendererModel.siteId + 'feedmeComments';
            if (!storage) {
                return;
            }
            var currentComments = JSON.stringify(this._getCommentsArray());

            if (currentComments !== storage[commentsStorageName]) {
                storage[commentsStorageName] = currentComments;
            }
        },

        _loadSavedComments: function () {
            var storage = window.localStorage;
            var commentsStorageName = rendererModel.siteId + 'feedmeComments';
            if (!storage || !storage[commentsStorageName]) {
                return;
            }

            var comments = JSON.parse(storage[commentsStorageName]);
            _.forEach(comments, function (commentDataObject) {
                this._createCommentFromStorage(commentDataObject);
            }, this);

            return comments;
        },

        _createCommentFromStorage: function (commentDataObject) {
            var pages = this.resources.W.Viewer.getPages();
            if (!pages[commentDataObject.pageId]) {
                return;
            }

            this.resources.W.Components.createComponent(
                'wysiwyg.previeweditorcommon.components.SiteFeedbackComment',
                'wysiwyg.previeweditorcommon.SiteFeedbackCommentSkin',
                null, null,
                this._commentCreatedFromStorage.bind(this, commentDataObject)
            );
        },

        _commentCreatedFromStorage: function (commentDataObject, compLogic) {
            var pages = this.resources.W.Viewer.getPages();
            var currentPageId = this.resources.W.Viewer.getCurrentPageId();
            compLogic.hideComment();
            if (commentDataObject.pageId === currentPageId) {
                var commentPage = pages[commentDataObject.pageId];
                compLogic.getViewNode().insertInto(commentPage);
            }

            compLogic.on('commentDeleted', this, this._commentDeleted);
            compLogic.addEvent('commentHidden', this._showAddCommentsPanel);
            compLogic.addEvent('commentSelected', this.onCommentSelected);

            compLogic.setCommentProperties(commentDataObject);
            this._registerComment(commentDataObject, compLogic);
        },

        _registerComment: function (commentDataObject, compLogic) {
            var commentPageId = commentDataObject.pageId;
            var pageComments = this._comments[commentPageId];
            pageComments[compLogic.getComponentId()] = compLogic;
        },

        _getSendButtonIconPos: function () {
            var sendButtonLeft = 73;
            var iconPos = this._skinParts.sendButton.getRelativeIconPosition();
            return {
                left: sendButtonLeft + iconPos.left,
                top: 254
            };
        },

        _startSendAnimation: function () {
            this.runningAnimation = true;
            var self = this;
            var speed = 40;
            var frameCounter = 0;
            var spritePos = -10;
            var textChangeEndFrame = 16;
            var minSendingTime = 2000;
            var sendStart = Date.now();
            var animationInterval = setInterval(function () {
                frameCounter++;
                spritePos -= 91;
                if (frameCounter === 33) {
                    clearInterval(animationInterval);
                    setTimeout(function () {
                        self._endSendAnimation();
                    }, minSendingTime - (Date.now() - sendStart));
                }
                if (frameCounter === textChangeEndFrame) {
                    self._skinParts.sendButton.setLabel('feedback_review_sending');
                    self._skinParts.sendButton.render();
                    self._skinParts.sendButton.clearIcon();
                }
                self._skinParts.sendingAnimation.setStyle('background-position', '-12px ' + spritePos + 'px');
            }, speed);
        },

        _endSendAnimation: function () {
            this.runningAnimation = false;
            if (this.submitSuccess) {
                this._handleSuccessfulSubmit();
            } else if (this.submitError) {
                this._showSendError();
            }
        },

        _resetSendAnimation: function () {
            this._skinParts.sendButton.hideIcon();
            this._skinParts.sendButton.setLabel('FEEDBACK_REVIEW_SUBMIT_SEND_BUTTON');
            this._skinParts.sendButton.render();
            this._skinParts.sendingAnimation.setStyle('background-position', '-12px -10px');
        },

        _handleSuccessfulSubmit: function () {
            this.setState('hideIcon', 'sendIcon');
            this.setState('afterSubmit', 'submitState');
            this.setState('submitSuccess', 'submitSuccess');
            this._resetSendAnimation();
            this._updateSentComments();
            this._clearCommentsStorage();

            this._skinParts.doneButton.toggleEnabled(false);
            this.setTimeout(function () {
                this._hideSubmitPanel();
            }.bind(this), 2000);
        },

        _onSubmitSuccess: function (jsonData) {
            this.submitSuccess = true;
            if (!this.runningAnimation) {
                this._handleSuccessfulSubmit();
            }
            var params = {
                i1: jsonData.length,
                i2: this._skinParts.submitter.value ? 1 : 0
            };
            LOG.reportEvent(wixEvents.FEEDBACK_SEND_COMMENTS, params);
        },

        _onSubmitError: function () {
            this.submitError = true;
            if (!this.runningAnimation) {
                this._showSendError();
            }
        },

        _showSendError: function () {
            this.setState('submitError', 'submitSuccess');
            this._resetSendAnimation();
        },

        _clearCommentsStorage: function () {
            var storage = window.localStorage;
            var commentsStorageName = rendererModel.siteId + 'feedmeComments';
            if (!storage) {
                return;
            }

            delete storage[commentsStorageName];
        },

        _translate: function (key, fallback) {
            return this.resources.W.Resources.get('FEEDBACK_REVIEW', key, fallback);
        }

    });
});