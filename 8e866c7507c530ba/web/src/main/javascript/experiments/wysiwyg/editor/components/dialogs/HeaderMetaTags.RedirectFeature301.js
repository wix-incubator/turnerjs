define.experiment.newComponent("wysiwyg.editor.components.dialogs.HeaderMetaTags.RedirectFeature301", function (componentDefinition, experimentStrategy) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.dataTypes(['HeaderMetaTags', '']);
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onAlertLinkClick', '_onApplyButtonClick', '_onTextAreaKeyUp', '_onValidationSuccess', '_onValidationError', '_onDialogOpened', '_onDialogClosed', '_onTimeOutError']);
    def.resources(['W.Commands', 'W.Resources']);
    def.traits(['core.editor.components.traits.DataPanel', 'wysiwyg.editor.components.traits.BindValueToData']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._textArea = null;
            this._textAreaInput = null;
            this._alertLabel = null;
            this._applyButton = null;
            this._validationRequestTimer = null;
            this._dialogWindow = args.dialogWindow;
            this._isErrorAlert = true;
        },

        _onAllSkinPartsReady: function(compId, viewNode, args){
            this.parent();
            this._dialogWindow.addEvent('dialogOpened', this._onDialogOpened);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosed);
        },

        _createFields: function(){
            this.setNumberOfItemsPerLine(0, '3px');
            this.addInputGroupField(function(panel){
                panel._createSubTitle(this);
                panel._createSubTitle2(this);
                panel._createTextArea(this);
                panel._createNote(this);
                panel._createApplyButton(this);
                this.addBreakLine('13px');
                panel._createAlert(this);
            },'skinless', null, null, null, null, null, null, {'margin-left': '25px', 'margin-right': '25px'});
        },

        _createSubTitle:function(container){
            container.addInlineTextLinkField(null, this._translate('ADVANCED_SEO_PANEL_SUBTITLE1'), this._translate('HELPLET_LEARN_MORE'))
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '14px'});
                })
                .addEvent('click', this._showLearnMoreDialog);
            container.addBreakLine('18px');
        },

        _createSubTitle2:function(container){
            container.addLabel(this._translate('ADVANCED_SEO_PANEL_SUBTITLE3'))
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '14px'});
                });
        },

        _createTextArea:function(container){
            var that = this;
            var placeholderText = '<meta name="google-site-verification" content="XXXX" />';
            that._textArea = container.addSubmitTextAreaField( null, placeholderText, null, 2000, '180px', null, null)
                .runWhenReady( function( logic ) {
                    that._textAreaInput = logic;
                    logic._skinParts.button.collapse();
                    logic._skinParts.input.setStyle('padding', '7px 7px 7px 7px');
                    logic._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, that._onTextAreaKeyUp);
                });
            this._textArea.setValue(this._getMetaTagsFromSchema());
            this.setDialogFocus();
        },

        _createNote:function(container){
            var that = this;
            container.addSubLabel("gaga")
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

        _createApplyButton:function(container){
            var that = this;
            container.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, that._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'), null, null, 'blue', '60px')
                    .runWhenReady( function( logic ) {
                        that._applyButton = logic;
                        that._applyButton.disable();
                    })
                    .addEvent(Constants.CoreEvents.CLICK, that._onApplyButtonClick);
            },'skinless', null, null, null, 'right', null, null, {'margin-top': '-10px'});
        },

        _createAlert:function(container){
            var that = this;
            container.addInputGroupField(function(panel){
                this.addSubLabel('gaga')
                    .runWhenReady( function( labelLogic ) {
                        that._alertLabel = labelLogic._skinParts.label;
                        that._alertLabel.setStyles({'font-size': '14px', 'margin-top': '-54px', 'width': '425px', 'overflow': 'hidden', 'text-overflow': 'ellipsis'});
                        that._setNotificationAlertStyle();
                        that._alertLabel.collapse();
                    });
            },'skinless');
        },

        _onDialogOpened: function() {
            this.setDialogFocus();
        },

        _onDialogClosed:function(){
            this._clearValidationRequestTimer();
            this._textArea.setValue(this._getMetaTagsFromSchema());
            this._setNotificationAlertStyle();
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
            this._applyButton.setButtonLabel(this._translate('ADVANCED_SEO_PANEL_APPLYING'));
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
            this._alertLabel.setStyles({'margin-top': '-54px', 'height': 'auto', 'color': '#c90000'});
            this._alertLabel.set('html', errorText);
            this._applyButton.setButtonLabel(this._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'));
        },

        _onValidationSuccess:function(obj){
            clearTimeout(this._validationRequestTimer);
            this._setMetaTagsToSchema();
            this._showSuccessMessage();
        },

        _showSuccessMessage:function(){
            this._isErrorAlert = false;
            this._setSuccessAlertStyle();
            this._alertLabel.uncollapse();
            this._alertLabel.set('html', this._translate('ADVANCED_SEO_PANEL_VALIDATION_SUCCESS_MESSAGE5') + '<br>' + this._addPublishLink() + '.');
            this._alertLabel.getElement('a').addEvent(Constants.CoreEvents.CLICK, this._onAlertLinkClick);
            this._textAreaInput.enable();
            this._applyButton.setButtonLabel(this._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'));
        },

        _addPublishLink:function(){
            return ' <a target="blank">' + this._translate('ADVANCED_SEO_PANEL_VALIDATION_SUCCESS_MESSAGE2') + '</a>';
        },

        _onValidationError:function(errorDescription, errorCode){
            //LOG.reportError(wixErrors.APPS_UNABLE_TO_COMPLETE_PROVISION_POST_SAVE, this.$className, "_completeProvisionAfterMetasiteSave", err.code, err.description);
            this._applyButton.setButtonLabel(this._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'));
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
            var errorText = '';
            switch(errorDescription){
                case '':
                case '#text':
                    errorText = this._translate('ADVANCED_SEO_PANEL_INVALID_CODE_ERROR') + '<br>' + '<a target="blank">' + this._translate('ADVANCED_SEO_PANEL_LEARN_MORE_LINK') + '</a>';
                    break;
                default:
                    errorText = this._translate('ADVANCED_SEO_PANEL_INVALID_TAG_ERROR') + '<br>' + '<a target="blank">' + this._translate('ADVANCED_SEO_PANEL_LEARN_MORE_LINK') + '</a>';
                    errorText = errorText.replace('{INVALID_TAG}', errorDescription);
                    break;
            }
            this._setErrorAlertStyle();
            this._isErrorAlert = true;
            this._alertLabel.uncollapse();
            this._alertLabel.set('html', errorText);
            this._alertLabel.getElement('a').addEvent(Constants.CoreEvents.CLICK, this._onAlertLinkClick);
        },

        _onTextAreaKeyUp:function(e){
            // ignore tab and shift keys
            if (e && e.code && !W.Utils.isInputKey(e.code)) {
                return;
            }
            this._applyButton.enable();
            var validationMessage = this._textAreaInput.getInputValidationErrorMessage();
            this._showValidationErrorMessage(validationMessage);
        },

        _showValidationErrorMessage:function(validationMessage){
            this._alertLabel.collapse();
            this._setNotificationAlertStyle();
            if(!validationMessage){
                return;
            }
            this._isErrorAlert = true;
            this._alertLabel.uncollapse();
            this._applyButton.disable();
            this._setErrorAlertStyle();
            this._alertLabel.set('html', validationMessage + '<br>' + this._addLearnMoreAboutMetaTagsLink());
            this._alertLabel.getElement('a').addEvent(Constants.CoreEvents.CLICK, this._onAlertLinkClick);
        },

        _addLearnMoreAboutMetaTagsLink:function(){
            return '<a target="blank">' + this._translate('ADVANCED_SEO_PANEL_LEARN_MORE_LINK') + '</a>';
        },

        _getMetaTagsFromSchema:function(){
            var userMetaTagsData = this.resources.W.Data.getDataByQuery('#USER_META_TAGS');
            var metaTags = userMetaTagsData.get("userMetaTags");
            return metaTags;
        },

        _setMetaTagsToSchema:function(){
            var metaTags = this._textArea.getValue();
            var dataItem = {
                'type': 'HeaderMetaTags',
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
            this._alertLabel.setStyles({'color': '#c90000'});
            if(this._textAreaInput) {
                this._textAreaInput._skinParts.input.setStyle('border', '1px solid rgb(255, 0, 0)');
            }
        },

        _setNotificationAlertStyle:function(){
            this._alertLabel.setStyles({'color': '#000000'});
            if(this._textAreaInput) {
                this._textAreaInput._skinParts.input.setStyle('border', '1px solid rgb(180, 180, 180)');
            }
        },

        _setSuccessAlertStyle:function(){
            this._alertLabel.setStyles({'color': '#60BC57'});
            if(this._textAreaInput) {
                this._textAreaInput._skinParts.input.setStyle('border', '1px solid rgb(180, 180, 180)');
            }
        },

        _showLearnMoreDialog:function(){
            W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'COMPONENT_PANEL_HeaderVerificationTags_learn_more');
        },

        _onAlertLinkClick:function(){
            if(this._isErrorAlert) {
                W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'COMPONENT_PANEL_HeaderVerificationTags_on_errors_learn_more');
            }
            else if(this.resources.W.Config.siteNeverSavedBefore()) {
                W.Commands.executeCommand('WEditorCommands.Save');
            } else{
                W.Commands.executeCommand('WEditorCommands.OpenPublishDialog');
            }
        },

        setDialogFocus:function(){
            this._textArea.setFocus();
        }
    });
});
