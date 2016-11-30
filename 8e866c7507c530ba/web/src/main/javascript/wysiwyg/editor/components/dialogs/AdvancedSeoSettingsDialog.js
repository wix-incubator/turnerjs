define.component("wysiwyg.editor.components.dialogs.AdvancedSeoSettingsDialog", function (componentDefinition, experimentStrategy) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.dataTypes(['AdvancedSeoSettingsDialog']);
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onApplyButtonClick', '_onTextAreaKeyUp', '_onValidationSuccess', '_onValidationError', '_onCloseDialogButtonClick', '_onTimeOutError']);
    def.resources(['W.Commands', 'W.Resources']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._textArea = null;
            this._textAreaInput = null;
            this._alertLabel = null;
            this._applyButton = null;
            this._validationRequestTimer = null;
            this._dialogWindow = args.dialogWindow;
        },

        _onAllSkinPartsReady: function(compId, viewNode, args){
            this.parent();
            this._dialogWindow._skinParts.xButton.addEvent(Constants.CoreEvents.CLICK, this._onCloseDialogButtonClick);
        },

        _createFields: function(){
            this._createTitle();
            this._createSubTitle();
            this._createLearnMoreLink();
            this._createTextArea();
            this._createNote();
            this._createApplyButton();
            this._createAlert();
        },

        _createTitle:function(){
            this.addTitle(this._translate('ADVANCED_SEO_PANEL_TITLE'))
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '15px'});
                });
        },

        _createSubTitle:function(){
            this.addLabel(this._translate('ADVANCED_SEO_PANEL_SUBTITLE'))
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '14px'});
                });
        },

        _createLearnMoreLink:function(){
            this.addInlineTextLinkField(null, null, this._translate('HELPLET_LEARN_MORE'))
                .addEvent('click', this._showLearnMoreDialog);
            this.addBreakLine('10px');
        },

        _createTextArea:function(){
            var that = this;
            var placeholderText = '<meta name="google-site-verification" content="XXXX" />';
            this._textArea = this.addSubmitTextAreaField( null, placeholderText, null, 2000, '180px', null, null, {validators: [this._inputValidators._headerTagsValidator]})
                .runWhenReady( function( logic ) {
                    that._textAreaInput = logic;
                    logic._skinParts.button.collapse();
                    logic._skinParts.input.setStyle('padding', '7px 7px 7px 7px');
                    logic._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, that._onTextAreaKeyUp);
                });
            this._textArea.setValue(this._getMetaTagsFromSchema());
        },

        _createNote:function(){
            var that = this;
            this.addSubLabel("gaga")
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.set('html', that._createNoteText());
                    labelLogic._skinParts.label.setStyles({'margin-top': '-5px'});
                });
        },

        _createNoteText:function(){
            var noteText = this._translate('ADVANCED_SEO_PANEL_NOTE');
            var googleLink = '<a href="https://support.google.com/webmasters/answer/35179" target="blank">' + this._translate('ADVANCED_SEO_PANEL_GOOGLE_LINK') +  '</a>';
            var bingLink = '<a href="http://www.bing.com/webmaster/help/how-to-verify-ownership-of-your-site-afcfefc6" target="blank">' + this._translate('ADVANCED_SEO_PANEL_BING_LINK') +  '</a>';
            var pinterestLink = '<a href="http://business.pinterest.com/verify/" target="blank">' + this._translate('ADVANCED_SEO_PANEL_PINTEREST_LINK') +  '</a>';
            noteText = noteText.replace('{GOOGLE_LINK}', googleLink);
            noteText = noteText.replace('{BING_LINK}', bingLink);
            noteText = noteText.replace('{PINTEREST_LINK}', pinterestLink);
            return noteText;
        },

        _createApplyButton:function(){
            var that = this;
            this.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, this._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'), null, null, 'blue', '60px')
                    .runWhenReady( function( logic ) {
                        that._applyButton = logic;
                        that._applyButton.disable();
                    })
                    .addEvent(Constants.CoreEvents.CLICK, that._onApplyButtonClick);
            },'skinless', null, null, null, 'right', null, null, {'margin-top': '-10px'});
        },

        _createAlert:function(){
            var that = this;
            this.addSubLabel('gaga')
                .runWhenReady( function( labelLogic ) {
                    that._alertLabel = labelLogic._skinParts.label;
                    that._setErrorAlertStyle();
                    that._alertLabel.collapse();
                    that._alertLabel.addEvent(Constants.CoreEvents.CLICK, that._showOnErrorsLearnMoreDialog);
                });
        },

        _onCloseDialogButtonClick:function(){
            this._clearValidationRequestTimer();
            this._textArea.setValue(this._getMetaTagsFromSchema());
            this._alertLabel.collapse();
        },

        _onApplyButtonClick:function(){
            LOG.reportEvent(wixEvents.USER_HEADER_METATAGS_APPLIED);
            this._clearValidationRequestTimer();
            var trimmedText = this._textArea.getValue().trim();
            this._textArea.setValue(trimmedText);
            if(trimmedText.length === 0){
                this._onValidationSuccess();
                return;
            }
            this._validateTags();
        },

        _validateTags:function(){
            this._alertLabel.uncollapse();
            this._alertLabel.set('html', this._translate('ADVANCED_SEO_PANEL_APPLYING'));
            var userMetaTags = this._textArea.getValue();
            if(this._validateTagsLocally(userMetaTags)){
                this._validateTagsByServer(userMetaTags);
            }
        },

        _validateTagsLocally:function(userMetaTags){
            userMetaTags = userMetaTags.toLowerCase();
            if( userMetaTags.indexOf('<htm') > -1 ||
                userMetaTags.indexOf('<head') > -1 ||
                userMetaTags.indexOf('<body') > -1 ){
                this._setErrorAlertStyle();
                this._alertLabel.uncollapse();
                var errorMsg = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_HTML_BODY_HEAD_ERROR') + this._addLearnMoreAboutMetaTagsLink();
                this._alertLabel.set('html', errorMsg);
                return false;
            }
            return true;
        },

        _validateTagsByServer:function(userMetaTags){
            this._createValidationRequestTimer();
            this._applyButton.disable();
            this._textAreaInput.disable();
            this._setNotificationAlertStyle();
            W.ServerFacade.validateUserMetaTags(userMetaTags, this._onValidationSuccess, this._onValidationError);
        },

        _onTimeOutError:function(){
            this._textAreaInput.enable();
            var errorText = this._translate('ADVANCED_SEO_PANEL_TIMEOUT_ERROR');
            this._alertLabel.uncollapse();
            this._alertLabel.setStyles({'margin-top': '-43px', 'height': '5px', 'color': '#c90000'});
            this._alertLabel.set('html', errorText);
        },

        _onValidationSuccess:function(obj){
            clearTimeout(this._validationRequestTimer);
            this._setMetaTagsToSchema();
            this._showSuccessMessageWithTimerAndCloseDialog();
        },

        _showSuccessMessageWithTimerAndCloseDialog:function(){
            this._setNotificationAlertStyle();
            this._alertLabel.uncollapse();
            this._alertLabel.set('html', this._translate('ADVANCED_SEO_PANEL_VALIDATION_SUCCESS_MESSAGE'));
            var timeoutLength = 3500;
            var that = this;
            setTimeout(function(){
                that._setErrorAlertStyle();
                that._alertLabel.collapse();
                that._textAreaInput.enable();
                that._dialogWindow.closeDialog();
            }, timeoutLength);
        },

        _onValidationError:function(errorDescription, errorCode){
            //LOG.reportError(wixErrors.APPS_UNABLE_TO_COMPLETE_PROVISION_POST_SAVE, this.$className, "_completeProvisionAfterMetasiteSave", err.code, err.description);

            this._textAreaInput.enable();
            clearTimeout(this._validationRequestTimer);
            if(errorCode === 0){
                this._onTimeOutError();
                return;
            }
            if(errorDescription.indexOf("Original request was:") > 0){
                errorDescription = errorDescription.substring(0, errorDescription.indexOf("Original request was:"));
            }
            errorDescription = errorDescription.substring(errorDescription.indexOf("'")+1, errorDescription.length);
            errorDescription = errorDescription.substring(0, errorDescription.indexOf("'"));
            errorDescription = errorDescription.replace('<', '');
            var errorText = '';
            switch(errorDescription){
                case '':
                case '#text':
                    errorText = this._translate('ADVANCED_SEO_PANEL_INVALID_CODE_ERROR') + '<br><a target="blank">' + this._translate('ADVANCED_SEO_PANEL_LEARN_MORE_LINK') + '</a>';
                    break;
                default:
                    errorText = this._translate('ADVANCED_SEO_PANEL_INVALID_TAG_ERROR') + '<br><a target="blank">' + this._translate('ADVANCED_SEO_PANEL_LEARN_MORE_LINK') + '</a>';
                    errorText = errorText.replace('{INVALID_TAG}', errorDescription);
                    break;
            }
            this._setErrorAlertStyle();
            this._alertLabel.uncollapse();
            this._alertLabel.set('html', errorText);
        },

        _onTextAreaKeyUp:function(e){
            // ignore tab and shift keys
            if (e && e.code && !W.Utils.isInputKey(e.code)) {
                return;
            }
            this._alertLabel.collapse();
            this._applyButton.enable();
            this._showValidationErrorMessage(this._textAreaInput.getInputValidationErrorMessage());
        },

        _showValidationErrorMessage:function(validationMessage){
            if(!validationMessage){
                return;
            }
            this._alertLabel.uncollapse();
            this._applyButton.disable();
            this._setErrorAlertStyle();
            this._alertLabel.set('html', validationMessage + this._addLearnMoreAboutMetaTagsLink());
        },

        _addLearnMoreAboutMetaTagsLink:function(){
            return '<br><a target="blank">' + this._translate('ADVANCED_SEO_PANEL_LEARN_MORE_LINK') + '</a>';
        },

        _getMetaTagsFromSchema:function(){
            var userMetaTagsData = this.resources.W.Data.getDataByQuery('#USER_META_TAGS');
            var metaTags = userMetaTagsData.get("userMetaTags");
            return metaTags;
        },

        _setMetaTagsToSchema:function(){
            var metaTags = this._textArea.getValue();
            var dataItem = {
                'type': 'AdvancedSeoSettingsDialog',
                'userMetaTags': metaTags
            };
            this.resources.W.Data.addDataItem('USER_META_TAGS', dataItem);
        },

        _clearValidationRequestTimer:function(){
            if(this._validationRequestTimer){
                clearTimeout(this._validationRequestTimer);
            }
        },

        _createValidationRequestTimer:function(){
            var timeoutLength = 30000;
            var that = this;
            this._validationRequestTimer = setTimeout(function(){
                that._onTimeOutError();
            }, timeoutLength);
        },

        _setErrorAlertStyle:function(){
            this._alertLabel.setStyles({'margin-top': '-43px', 'height': '5px', 'color': '#c90000'});
        },

        _setNotificationAlertStyle:function(){
            this._alertLabel.setStyles({'margin-top': '-43px', 'height': '5px', 'color': '#000000'});
        },

        _showLearnMoreDialog:function(){
            W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'COMPONENT_PANEL_HeaderVerificationTags_learn_more');
        },

        _showOnErrorsLearnMoreDialog:function(){
            W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'COMPONENT_PANEL_HeaderVerificationTags_on_errors_learn_more');
        }
    });
});
