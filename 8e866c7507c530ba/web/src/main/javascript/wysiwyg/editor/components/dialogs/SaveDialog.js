define.component('wysiwyg.editor.components.dialogs.SaveDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.CookiesManager', 'W.Editor', 'W.ServerFacade', 'W.Preview', 'W.Config', 'W.AppStoreManager', 'W.Utils', 'W.EditorDialogs', 'W.Commands','W.SMEditor','W.AppsEditor2']);
    def.binds(['_inputChanged', '_sanitizeSiteName',
        '_cloneSite', '_onCloneSuccess', '_onCloneError', '_onCloneFail',
        '_onLoadSite', '_onContinueEditingClick', '_onSaveClick', 'executeOnEnterKey',
        '_validateSiteName', '_onDialogClosing', '_validationSiteNameOkCallback', '_validationSiteNameFailCallback']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['SiteSettings']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._dialogWindow = args.dialogWindow;
            this._saveAs = args.saveAs || false;
            this._dialogTitle = this._translate(args.titleKey || 'SAVE_YOUR_SITE');
            this._appType = this.injects().Config.getApplicationType();
            this._placeHolderKey = (this._appType == Constants.WEditManager.SITE_TYPE_FACEBOOK) ? 'FACEBOOK_PAGE_NAME_PLACEHOLDER' : 'SITE_NAME_PLACEHOLDER';
            this._hasMetaSite = this.injects().Config.getMetaSiteId() ? true : false;
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            //            console.log("DEBUG PURPOSES ONLY. REMOVE ME BEFORE PUSH");
            //            this._hasMetaSite = true;

            this._disbaleSiteNameInsersion = (this._hasMetaSite && !this._saveAs) && !this.injects().Config.isMetaSiteTemplate();

            // lock the save process with mutex
            this.injects().Editor.disableAutoSave();

            if(this._isFirstSave()){
                this.resources.W.Commands.executeCommand("FirstSaveProcess.Begin");
            }
        },

        _addDialogHeaderSection: function () {
            if (this._appType == Constants.WEditManager.SITE_TYPE_FACEBOOK) {
                this.addLabel(this._translate('SAVE_YOUR_FACEBOOK_PAGE'));
            }
            else {
                this.addLabel(this._dialogTitle, null, null, 'icons/save_publish.png', {x: "-2px", y: 0}, {width: "30px", height: "30px"});

                var subLabelText = (this._disbaleSiteNameInsersion) ? this._translate('SAVE_YOUR_SITE_DESC_META_SITE_EXISTS') : '';
                this.addSubLabel(subLabelText);
            }
        },


        _addSiteNameInputSection: function () {
            this.addInputGroupField(function (panel) {

                var spacing = panel._disbaleSiteNameInsersion ? '30px' : null;
                //                var numItemsPerLine = panel._disbaleSiteNameInsersion? 1 : 0;

                this.setNumberOfItemsPerLine(0, spacing);
                //                 this.setNumberOfItemsPerLine(0);
                //                 this.setNumberOfItemsPerLine(numItemsPerLine);

                if (panel._disbaleSiteNameInsersion) {
                    var userPublicUrl = panel.injects().Config.getUserPublicUrl();
                    this.addSubLabel(userPublicUrl);
                }

                panel._inputFieldProxy = this.addInputField("", panel._translate(panel._placeHolderKey), null, null, {validators: [panel._validateSiteName], validationOkCallback: panel._validationSiteNameOkCallback, validationFailCallback: panel._validationSiteNameFailCallback}, 'floating', null, true)
                    .addEvent(Constants.CoreEvents.KEY_UP, panel._inputChanged)
                    .addEvent(Constants.CoreEvents.KEY_UP, panel.executeOnEnterKey);

                var inputFieldProxyReady = false;
                panel._inputFieldProxy.runWhenReady(function (inputComp) {
                    inputFieldProxyReady = true;
                    if (panel._subLabelProxy) {
                        panel._inputChanged({
                            value: inputComp.getValue()
                        });
                    }

                    if (panel._disbaleSiteNameInsersion) {
                        inputComp.hide();
                    } else {
                        inputComp.setFocus();
                    }
                });

                panel._saveButton = this.addButtonField(null, panel._translate('SAVE_NOW_BUTTON'), null, null, 'blue', '80px')
                    .addEvent(Constants.CoreEvents.CLICK, panel._onSaveClick);

                panel._saveButton.runWhenReady(function (btn) {
                    if (panel._disbaleSiteNameInsersion) {
                        btn.enable();
                    }
                    else {
                        btn.disable();
                    }
                });

                this.addBreakLine();

                if (panel._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                    panel._subLabelProxy = this.addSubLabel();
                    if (inputFieldProxyReady) {
                        panel._inputChanged();
                    }
                }

            }, 'skinless');
        },

        _addDescriptionTextSection: function () {
            this.addInputGroupField(function (panel) {
                this.addBreakLine('0', '1px solid #bfbfbf', '0');
                this.addBreakLine('0', '1px solid #ffffff', '20px');
                this.addLabel(panel._getSiteNameChangeMessage(), null, 'list', 'icons/green_bullet_icon.png', {x: 0, y: '7px'}, {width: "6px", height: "16px"});
                this.addLabel(panel._translate('SAVE_WAIT_FOR_EDITOR_RELOAD'), null, 'list', 'icons/green_bullet_icon.png', {x: 0, y: '7px'}, {width: "6px", height: "16px"});
            }, 'skinless');
        },

        _getSiteNameChangeMessage:function(){
            var wixClientCookie = this.resources.W.CookiesManager.getCookie('wixClient');
            var key = 'SITE_NAME_CHANGE_LATER_OR';
            if(wixClientCookie){
                if(wixClientCookie.indexOf("GOOGLE_DOMAIN")>0){
                    key = 'SITE_NAME_CHANGE_FOR_GOOGLE_CAMPAIGN';
                }
                else
                if(wixClientCookie.indexOf("REGRU")>0){
                    key = 'SITE_NAME_CHANGE_FOR_REGRU_CAMPAIGN';
                }
            }
            return this._translate(key);
        },

        _addContinueEditingSection: function () {
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addInlineTextLinkField(null, null, panel._translate('SAVE_DIALOG_CONTINUE_EDIT_LINK'), null)
                    .addEvent(Constants.CoreEvents.CLICK, panel._onContinueEditingClick);
            }, 'skinless', null, null, null, 'right');
        },


        _createFields: function () {
            this.setSkinSet('FLOATING_DIALOG');
            this._addDialogHeaderSection();
            this._addSiteNameInputSection();
            this._addDescriptionTextSection();
            this._addContinueEditingSection();
        },

        _validateSiteName: function (text) {
            var reg = '[^a-zA-Z0-9 -]';
            var regXp = new RegExp(reg);

            if (text.match(regXp)) {
                this._saveButton.disable();
                return text.match(reg)[0] + ' ' + this._translate('SITE_NAME_INVALID_CHAR');
            }

            var lastChar = text.slice(-1);
            if (lastChar === '-'){
                return this._translate('SITE_NAME_CANNOT_END_WITH_HYPHEN', "Site name cannot end with a '-'");
            }

            text = this._sanitizeSiteName(text);

            if (text.length < 4) {
                //                this._saveButton.disable();
                //                if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                //                    this._subLabelProxy.collapse();
                //                }
                return this._translate('SITE_NAME_TOO_SHORT');
            }

            if (text.length > 20) {
                //                this._saveButton.disable();
                //                if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                //                    this._subLabelProxy.collapse();
                //                }
                return this._translate('SITE_NAME_TOO_LONG');
            }

            var usedMetaSiteNames = window.editorModel.usedMetaSiteNames;

            if (usedMetaSiteNames == null) {
                return;
            }

            if (W.Utils.isSiteNameAlreadyExist(text)) {
                //                if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                //                    this._subLabelProxy.collapse();
                //                }
                //                this._saveButton.disable();
                var hasNotFoundUnusedSiteName = true;
                var counter = 0;
                var suggestedSiteName = "";
                var matchTextToNumberPostfix = text.match(/(.*)(_\d*)/);
                if (matchTextToNumberPostfix) {
                    text = matchTextToNumberPostfix[1];
                }
                while (hasNotFoundUnusedSiteName) {
                    counter++;
                    suggestedSiteName = text + "-" + counter;
                    if (!W.Utils.isSiteNameAlreadyExist(suggestedSiteName)) {
                        hasNotFoundUnusedSiteName = false;
                    }
                }
                return this._translate('SITE_NAME_EXISTS_SUGGEST') + suggestedSiteName + "?";
            }

            //            this._saveButton.enable();
            //            if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
            //                this._subLabelProxy.uncollapse();
            //            }
            return null;
        },

        _validationSiteNameOkCallback: function () {
            this._saveButton.enable();
            if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                this._subLabelProxy.uncollapse();
            }
        },

        _validationSiteNameFailCallback: function () {
            if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                this._subLabelProxy.collapse();
            }
            this._saveButton.disable();
        },

        _onContinueEditingClick: function () {
            this._dialogWindow.forceTriggerCancelButton();

            //report BI event
            LOG.reportEvent(wixEvents.CLOSE_SAVE_DIALOG_CLICKED, {g1: this.resources.W.Editor._templateId});
        },

        executeOnEnterKey: function (e) {
            e = e || window.event;

            //'enter' code is 13
            if (e.code == 13) {
                var sitename = this._inputFieldProxy.getValue();
                if (!this._validateSiteName(sitename)) {
                    this._onSaveClick();
                }
            }
        },

        _onSaveClick: function () {
            if (this._disbaleSiteNameInsersion) {
                this._cloneSite(window.editorModel.metaSiteData.siteName); // save site with existing site name
            }

            else {
                // prevent saving placeholders and empty strings
                if (!this._siteLabel || this._siteLabel === "" || this._siteLabel == this._translate(this._placeHolderKey) ||
                    this._siteLabel == this._sanitizeSiteName(this._translate(this._placeHolderKey))) {
                    return;
                }

                this._data.set('siteName', this._siteLabel);
                this._cloneSite(this._siteLabel); // save site
            }
            this.closeDialogAndLog();
            LOG.reportEvent(wixEvents.SAVE_NOW_REGULAR);
        },

        closeDialogAndLog: function () {
            this._dialogWindow.closeDialog(); // close dialog window

            //report BI event
            LOG.reportEvent(wixEvents.SAVE_CLICKED_IN_SAVE_DIALOG, {g1: this.resources.W.Editor._templateId});
        },

        _inputChanged: function (event) {
            var sitename = this._inputFieldProxy.getValue();

            if (this._appType == Constants.WEditManager.SITE_TYPE_FACEBOOK) {
                this._siteLabel = this._sanitizeSiteName(sitename);
            }
            else {  //WEB
                if (this._subLabelProxy && this._subLabelProxy.runWhenReady) {

                    this._subLabelProxy.runWhenReady(
                        function (subLabelComp) {

                            if (sitename.length === 0) {
                                sitename = this._translate('SITE_NAME_SANITIZED');
                            }

                            this._siteLabel = this._sanitizeSiteName(sitename);
                            var label = "<b>" + this._siteLabel + "</b>";

                            if (!this._saveAs) {
                                subLabelComp.setValue(this.injects().Config.getUserPublicUrl() + label);
                            }
                            else {
                                var publicUrl = this.injects().Config.getUserPublicUrl();
                                var publicUrlWithoutSiteName = publicUrl.substr(0, publicUrl.indexOf(window.editorModel.metaSiteData.siteName));
                                subLabelComp.setValue(publicUrlWithoutSiteName + "/" + label);
                            }

                        }.bind(this)
                    );
                }
            }
        },

        _sanitizeSiteName: function (str) {
            return str.replace(/([^\s\w\d_\-])/g, '').replace(/\s+/g, '-').replace(/-+$/g, '').toLowerCase();
        },

        _cloneSite: function (siteLabel) {
            this._cloneFailedBecauseTimeout = false;
            //            siteLabel = (this.injects().Config.getMetaSiteId())? null : siteLabel;
            var action = (this._saveAs) ? 'saveAs' : 'cloneDocument';
            this._cloneTimeout = setTimeout(function () {
                this._onCloneError("", "Timeout");
            }.bind(this), 120000);
            this.resources.W.ServerFacade[action](
                this.resources.W.Preview.getPreviewSite(),
                window.siteHeader.id,
                siteLabel,
                this._onCloneSuccess,
                this._onCloneError
            );
        },

        _onCloneSuccess: function(res){
            clearTimeout(this._cloneTimeout);
            if(this._cloneFailedBecauseTimeout){
                return;
            }
            var editorStatusAPI = this.resources.W.Editor.getEditorStatusAPI();

            editorStatusAPI.setSaveInProcess(false);

            editorStatusAPI.setDocumentSaveSucceeded();

            window.editorModel.metaSiteId = res.metaSiteId;
            window.siteHeader.id = res.siteHeader.id;

            // No redirect save can be preformed if the response contains all needed values
            // We begin by setting the editor and preview models with the data from the server before
            // post save operations take place and change the models.
            var isNoRedirectSave = this._containsValidSavedSiteData(res);
            if (isNoRedirectSave) {
                this._updateEditorInPlace(res);
                this._updatePreviewInPlace(res);
            }

            this._performPostSaveOperations(res, isNoRedirectSave);
        },

        _updateEditorInPlace: function(firstSaveResponseData) {
            var newSiteName = firstSaveResponseData.publicUrl.match(/^.*\/([^\/]+)/)[1];

            window.editorModel.metaSiteId = firstSaveResponseData.metaSiteId;
            window.editorModel.siteHeader = firstSaveResponseData.siteHeader;
            window.editorModel.firstSave = false;
            window.editorModel.metaSiteData = firstSaveResponseData.metaSiteData;
            window.editorModel.publicUrl = firstSaveResponseData.publicUrl;
            window.editorModel.usedMetaSiteNames.push(newSiteName);
            window.siteId = firstSaveResponseData.siteHeader.id;
            window.siteHeader = firstSaveResponseData.siteHeader;
        },

        _removeAppsConvertedFromDemoMode: function(resultClientSpecMap, currentClientSpecMap) {
            return _.omit(resultClientSpecMap, function(appData) {
                if (!appData.demoMode) {
                    return false;
                }
                var existingAppData = _.find(currentClientSpecMap, { appDefinitionId: appData.appDefinitionId });
                return existingAppData && !existingAppData.demoMode;
            });
        },

        _updatePreviewInPlace: function(firstSaveResponseData) {
            var preview = this.resources.W.Preview.getPreviewSite();

            var responseMetaSiteModel = firstSaveResponseData.previewModel.metaSiteModel;
            var currentClientSpecMap = preview.rendererModel.clientSpecMap;

            responseMetaSiteModel.clientSpecMap = this._removeAppsConvertedFromDemoMode(
                responseMetaSiteModel.clientSpecMap,
                currentClientSpecMap
            );

            preview.rendererModel.siteId          = preview.siteId     = firstSaveResponseData.previewModel.siteId;
            preview.rendererModel.metaSiteId      = preview.metaSiteId = firstSaveResponseData.previewModel.metaSiteModel.metaSiteId;
            preview.rendererModel.premiumFeatures                      = firstSaveResponseData.previewModel.metaSiteModel.premiumFeatures;
            preview.rendererModel.siteName                             = firstSaveResponseData.previewModel.metaSiteModel.siteName;
            preview.rendererModel.documentType                         = firstSaveResponseData.previewModel.metaSiteModel.documentType;

            // In order not to run over already provisioned apps we merge the response into the existing clientSpecMap
            preview.rendererModel.clientSpecMap = _.merge({}, preview.rendererModel.clientSpecMap, firstSaveResponseData.previewModel.metaSiteModel.clientSpecMap);
        },

        _containsValidSavedSiteData: function(data) {
            return data && data.siteHeader && data.siteHeader.id && data.metaSiteId && data.metaSiteData && data.publicUrl && data.previewModel && data.previewModel.metaSiteModel && true;
        },

        _performPostSaveOperations: function(firstSaveResponseData, isNoRedirectSave) {
            this.resources.W.AppStoreManager.completeProvisionAfterMetasiteSave(
                firstSaveResponseData.metaSiteId,
                this._appStoreManagerCompleteProvisionAfterMetasiteSaveSuccess.bind(this, firstSaveResponseData, isNoRedirectSave)
            );
        },

        _appStoreManagerCompleteProvisionAfterMetasiteSaveSuccess: function(firstSaveResponseData, isNoRedirectSave){
            this.resources.W.SMEditor.completeProvisionAfterMetasiteSave(
                this._smEditorCompleteProvisionAfterMetaSiteSaveSuccess.bind(this, firstSaveResponseData, isNoRedirectSave)
            );
        },

        _smEditorCompleteProvisionAfterMetaSiteSaveSuccess: function(firstSaveResponseData, isNoRedirectSave){
            this.resources.W.AppsEditor2.saveDraft(
                firstSaveResponseData.metaSiteId,
                false,
                true,
                this._navigateToEditOnFirstSave.bind(this, firstSaveResponseData, isNoRedirectSave),
                this._onCloneError.bind(this)
            );
        },

        _navigateToEditOnFirstSave: function(firstSaveResponseData, isNoRedirectSave){
            var editorEditURL = this._getEditorEditURL();

            if (isNoRedirectSave) {
                this._finalizeNoRedirectSave(editorEditURL, firstSaveResponseData);
            } else {
                this._updateWindowLocation(editorEditURL + "#save=1");
            }
        },

        _finalizeNoRedirectSave: function(editorEditURL, firstSaveResponseData) {
            this.resources.W.ServerFacade.handleFirstSave(firstSaveResponseData);
            if (history && history.replaceState) {
                history.replaceState({},'',editorEditURL);
            } else {
                window.location.hash = 'REDIRECTTO' + editorEditURL;
            }
            this.resources.W.Commands.executeCommand('WEditorCommands.NoRedirectFirstSave');
            this.resources.W.Commands.executeCommand('WEditorCommands.SaveSuccessDialog');
        },

        _updateWindowLocation: function(url) {
            window.enableNavigationConfirmation = false;
            window.location = url;
        },

        _getUrlSearch: function() {
            return window.location.search;
        },

        _getEditorEditURL: function() {
            var queryStringParamsArray = this._getUrlSearch().replace(/^\?/,'').split('&').map(function(v) { return v.split('='); });
            var keysToRemove = ['siteId','metaSiteId','editorSessionId'];

            queryStringParamsArray = queryStringParamsArray.filter(function(param) {
                return !_.contains(keysToRemove, param[0]);
            });

            var queryString = _.reduce(queryStringParamsArray, function(result, pair) {
                return result + '&' + pair[0] + (pair[1] ? '=' + pair[1] : '');
            }, '');

            return this.resources.W.ServerFacade.getEditUrl(window.siteHeader.id).replace('&mode=debug','') + queryString;
        },

        _onLoadSite: function (res) {
            this._setGlobalStatusFlags(res);
        },

        _onCloneError: function (errorDescription, errorCode, payload) {
            clearTimeout(this._cloneTimeout);
            if (this._cloneFailedBecauseTimeout) {
                return;
            }
            if (errorCode === "Timeout") {
                this._cloneFailedBecauseTimeout = true;
            } else {
                this._cloneFailedBecauseTimeout = false;
            }
            this.resources.W.Editor.getEditorStatusAPI().setSaveInProcess(false);
            var errorUtils = W.Utils.EditorErrorUtils;
            var msg = "";
            switch (errorCode) {
                case -40003: //sitename already used
                    msg = errorUtils.getErrorMsg(errorCode, 'ERROR_SAVE_40003');
                    this.resources.W.EditorDialogs.openPromptDialog(
                        this._translate('ERROR_SAVE_TITLE'),
                        msg,
                        "",
                        this.resources.W.EditorDialogs.DialogButtonSet.OK,
                        function () {
                            this.injects().Commands.executeCommand('WEditorCommands.Save');
                        }
                    );
                    break;

                default:
                    msg = errorUtils.getErrorMsg(errorCode, 'ERROR_CLONE_SITE');
                    this.resources.W.EditorDialogs.openPromptDialog(
                        this._translate('ERROR_SAVE_TITLE'),
                        msg,
                        "",
                        this.resources.W.EditorDialogs.DialogButtonSet.OK,
                        function () {
                        }
                    );
            }
            this.resources.W.Commands.executeCommand('WEditorCommands.AfterSaveFail', null, this);
            this.resources.W.Commands.executeCommand("FirstSaveProcess.End", {error: true});
        },

        _onCloneFail: function () {
            // report error
            // console.log('onCloneFail');
        },

        _isFirstSave: function() {
            return (this.resources.W.Config.siteNeverSavedBefore() || this._saveAs);
        },

        _setGlobalStatusFlags: function (res) {
            window.siteHeader.id = res.id;
            this.injects().Config.setMetaSiteId(res.metaSiteId);
        },

        //Experiment TPA.New was promoted to feature on Sun Aug 05 17:02:30 IDT 2012

        // Move later to ExperimentManager
        getExperimentsFromUrl: function () {
            var query = window.location.search.slice(1);
            var queryParams = query.split('&');
            var experiments = [];
            if (queryParams) {
                experiments = queryParams.filter(function (item, index) {
                    //                    return (item.indexOf("experiment") == 0);
                    return item.test(/^experiment|override_featureToggles/);
                });
            }
            return experiments;
        },

        _onDialogClosing: function (e) {
            if (e.result == "CANCEL" || e.result == "NO") {
                this.injects().Editor.getEditorStatusAPI().setSaveInProcess(false);
                //report BI event
                LOG.reportEvent(wixEvents.CLOSE_SAVE_DIALOG_CLICKED, {g1: this.resources.W.Editor._templateId});
                if(this._isFirstSave()){
                    this.resources.W.Commands.executeCommand("FirstSaveProcess.End", {cancel: true});
                }
            }
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:57 IST 2012
        _completeOtherProvisionAfterMetasiteSave: function (metaSiteId, onSuccess) {
            this.injects().SMEditor.completeProvisionAfterMetasiteSave(function () {
                onSuccess();
            }.bind(this));
        }
    });


});
