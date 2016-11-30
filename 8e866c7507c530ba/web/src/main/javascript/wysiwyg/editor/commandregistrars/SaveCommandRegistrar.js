/**
 * @class wysiwyg.editor.commandregistrars.SaveCommandRegistrar
 */
define.Class('wysiwyg.editor.commandregistrars.SaveCommandRegistrar', function (classDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['_onSaveSuccess', '_onSaveFail']);

    def.utilize(['wysiwyg.editor.managers.serverfacade.ServerFacadeErrorHandler']);

    def.resources(['W.Commands', 'W.Preview', 'W.InputBindings', 'W.Config', 'W.ServerFacade', 'W.Data', 'W.Resources', 'W.EditorDialogs']);

    def.methods({
        initialize: function () {
        },

        /**
         *
         */
        registerCommands: function () {
            var cmdmgr = this.resources.W.Commands;

            // Save Commands:
            //---------------
            this._saveCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Save", this, this._onSaveCommand);
            this._saveAsCommand = cmdmgr.registerCommandAndListener("WEditorCommands.SaveAs", this, this._onSaveAsCommand);
            this._saveAsTemplateCommand = cmdmgr.registerCommandAndListener("WEditorCommands.SaveAsTemplate", this, this._onPublishTemplateCommand);
            this._afterSaveSuccessCommand = cmdmgr.registerCommandAndListener("WEditorCommands.AfterSaveSuccess", this, this._onAfterSaveSuccess);
            this._afterSaveFailCommand = cmdmgr.registerCommandAndListener("WEditorCommands.AfterSaveFail", this, this._onAfterSaveFail);
            cmdmgr.registerCommandAndListener("WEditorCommands.NoRedirectFirstSave", this, this._onAfterCloneSuccess);
            cmdmgr.registerCommandAndListener("WEditorCommands.UnlockSaveFreezeAfterException", this, this._unlockSaveFreezeAndNotifyUser);
            cmdmgr.registerCommandAndListener("WEditorCommands.BeforeSave", this, this._prepareForSaveProcess);
        },

        setKeyboardEvents: function () {
            var ib = this.resources.W.InputBindings;

            if (this.resources.W.Config.getDebugMode() == "debug") {
                ib.addBinding(["ctrl+e", "command+e"], { command: this._saveAsCommand, commandParameter: {'promptResultDialog': true} }, true);
            }

            // this is a hack allowing the wix studio users to save templates using ctrl+p. now it's hard-wired to the following users:
            if (W.Editor._siteIsTemplate === false &&
                (editorModel.siteHeader.userId === '84770f67-ecbd-44b6-b35a-584f2dc15af1' || // demonew@wix.com
                 editorModel.siteHeader.userId === '3f1dbf94-cc88-4410-b6e8-37a8959afe1c' || // shulamita@wix.com
                 editorModel.siteHeader.userId === '596320f0-82cd-47bd-8ffb-058c8d35ae95' || // temptest@wix.com
                 editorModel.siteHeader.userId === '8a3e6d16-735e-4618-8be7-964643d23fc7' || // templatespt@wix.com
                 editorModel.siteHeader.userId === '68c56f39-fe67-4f3d-8ae7-991684463a63' || // templatesru@wix.com
                 editorModel.siteHeader.userId === 'eb619033-dfe7-43df-8bd5-c264da83aeb7' || // templatesjp@wix.com
                 editorModel.siteHeader.userId === '24536dc0-3451-4fa0-aaa1-e826b7828bfb' || // templateses@wix.com
                 editorModel.siteHeader.userId === 'f2923da0-3a70-4d26-8d80-b3227e9fe973' || // templatesfr@wix.com
                 editorModel.siteHeader.userId === '537c64ba-b52b-4643-92fc-cc4e011b7a93' || // templatesde@wix.com
                 editorModel.siteHeader.userId === '25bfc531-1822-4acc-9196-792b459863f3' || // templatestr@wix.com
                 editorModel.siteHeader.userId === 'faf5a4cb-1fd4-4fbc-9e31-77a23ee976eb' || // templatesko@wix.com
                 editorModel.siteHeader.userId === 'e4958217-c1c0-48c7-b90a-2470a250f4e7' || // templatesit@wix.com
                 editorModel.siteHeader.userId === '3c122f8e-61c8-4253-8743-c808ab9d2736' )) // templatestr@wix.com
            {
                ib.addBinding(["ctrl+p", "command+p"], { command: this._saveAsTemplateCommand, commandParameter: {'promptResultDialog': true} }, true);
            }
            ib.addBinding(["ctrl+s", "command+s"], { command: this._saveCommand, commandParameter: {'promptResultDialog': true} }, true);

        },

        //############################################################################################################
        //# S A V E   C O M M A N D S
        //############################################################################################################

        _onSaveCommand: function (param, cmd) {
            if (!W.Preview.isSiteReady()) {
                return;
            }
            if (W.Editor._editMode == W.Editor.EDIT_MODE.PREVIEW) {
                return;
            }
            /** Changed If **/
            // Checking metasite since post-save (after metasite save) operation
            // might have failed.
            if (W.Config.siteNeverSavedBefore() && !W.Editor.getEditorStatusAPI().getDocumentSaveSucceeded()) {
                this.resources.W.EditorDialogs.openSaveDialog(param);
            }
            /** Changed If **/
            else {
                if (W.Editor.getEditorStatusAPI().getSaveInProcess()) {
                    return;
                }
                this._saveFailedBecauseTimeout = false;
                this._lastSaveParam = param;
                W.Editor.getEditorStatusAPI().setSaveInProcess(true);
                W.Editor.getEditorStatusAPI().setSaveOverride(false);
                W.ServerFacade.saveDocument(window.siteHeader.id, W.Preview.getPreviewSite(),
                    this._onSaveSuccess,
                    this._onSaveFail,
                    param
                );
            }

            if (param && (param.src == 'saveBtn')) {
                //report BI event
                LOG.reportEvent(wixEvents.SAVE_BUTTON_CLICKED_IN_MAIN_WINDOW, {g1: W.Editor._templateId});
            }
        },

        //Experiment SaveFreeze.New was promoted to feature on Wed Oct 10 17:10:03 IST 2012
        _onSaveSuccess: function (response) {
            //if save failed due to timeout and the success response followed the timeout error, we should not present success
            if (this._saveFailedBecauseTimeout) {
                return;
            }

            var siteHeader = W.Config.getEditorModelProperty("siteHeader");
            siteHeader.revision = response.revision;
            siteHeader.version = response.version;

            /** New **/
            W.Editor.getEditorStatusAPI().setDocumentSaveSucceeded();
            /** New **/
            this._executePostSaveOperations(function () {
                this._removeSaveFreeze();
                var param = this._lastSaveParam;
                W.Editor.getEditorStatusAPI().setSaveInProcess(false);
                this._saveCurrentSiteStructure();
                if (param && param.onCompleteCallback) {
                    param.onCompleteCallback();
                }
                else {

                    /** New **/
                    if (W.Config.siteNeverSavedBefore()) {
                        window.location = W.ServerFacade.getEditUrl(window.siteHeader.id) + "#save=1";
                        return;
                    }
                    else if (param && param.promptResultDialog) {
                        this._openSaveSuccessDialog();
                    }
                }
                // reload dashboard upon first save
                try {
                    if (window.opener && window.opener.document.domain == document.domain) {
                        window.opener.location.reload();
                    }
                } catch (e) {
                }

                W.Preview.clearPreviewDataChange();
                W.Data.clearDirtyObjectsMap(); // Clear SITE_SETTINGS
                /**/
            }.bind(this), this._onSaveFail);

            this._afterSaveSuccessCommand.execute();
        },

        _saveCurrentSiteStructure: function(){
            W.Preview.getFullStructureSerializer().saveStructureOnSuccessfulSave();
        },


        _executePostSaveOperations: function (onSuccess, onError) {
            var metaSiteId = W.Config.getEditorModelProperty('metaSiteId');
            var isOverride = W.Editor.getEditorStatusAPI().getSaveOverride();
            W.AppsEditor2.saveDraft(metaSiteId, isOverride, false, onSuccess, onError);
        },

        _openSaveSuccessDialog: function () {
            this.resources.W.EditorDialogs.openSaveSuccessDialog(true);
        },

        _onSaveFail: function(errorDescription, errorCode, payload, responseText){
            LOG.reportError(wixErrors.SAVE_FAIL_EDITOR,'SaveCommandRegistrar','_onSaveFail',{p1:errorCode, p2:errorDescription, p3: responseText || ''});
            if (this._saveFailedBecauseTimeout){
                return;
            }
            this._saveFailedBecauseTimeout = (errorCode === "Timeout");

            //if save failed due to timeout and the fail response followed the timeout error, we should not present failure again
            this._removeSaveFreeze();
            var param = this._lastSaveParam;
            W.Editor.getEditorStatusAPI().setSaveInProcess(false);
            if (param && param.onErrorCallback){
                param.onErrorCallback();
            }

            var errorHandler = new this.imports.ServerFacadeErrorHandler(this.resources.W.Preview);
            var shouldTrySavingAgain = false,
                wasFixAttempted = false;

            switch(errorCode){
                case -10116:
                    this._handleConcurrentEditingError();
                    break;
                case -10104:
                    shouldTrySavingAgain = errorHandler.handleSaveValidationError10104(payload);
                    wasFixAttempted = true;
                    break;
                case -10130:
                    this._showHeaderTagsValidationErrorPopup();
                    break;
                case -10132:
                    this._showKillerFeaturePopup();
                    break;
                default:
                    if (param && param.promptResultDialog){
                        this._showErrorMessageToUser(errorCode);
                    }
                    break;
            }
            if(wasFixAttempted){
                if(shouldTrySavingAgain){
                    this._promptUserToSaveAgainAfterFix();
                } else{
                    this._showErrorMessageToUser(errorCode);
                }
            }
            this._afterSaveFailCommand.execute();
        },

        _showHeaderTagsValidationErrorPopup: function(){
            this.resources.W.EditorDialogs.openNotificationDialog('headerTagsValidationErrorDialog', 'ERROR_SAVE_HEADER_META_TAGS_TITLE', 'ERROR_SAVE_HEADER_META_TAGS_DESCRIPTION', 480, 50, null, null, null, null, W.EditorDialogs.openAdvancedSeoSettings, 'ERROR_SAVE_HEADER_META_TAGS_OK');
        },

        _showKillerFeaturePopup: function(){
            this.resources.W.EditorDialogs.openNotificationDialog('KillerFeatureErrorDialog', 'ERROR_SAVE_ON_KILLER_FEATURE_TITLE', 'ERROR_SAVE_ON_KILLER_FEATURE_DESCRIPTION', 500, 40, null, null, null, null, null, 'ERROR_SAVE_ON_KILLER_FEATURE_OK');
        },

        /**
         * This shows a dialog which explains that the save failed, but the issue was fixed.
         * The dialog offers the user to either keep working and save later or to issue another save now.
         * @private
         */
        _promptUserToSaveAgainAfterFix: function(){
            var msg =   this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PROMPT_SAVE_AFTER_FIX_DESC') + '<br/>' + '<br/>'+
                this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PROMPT_SAVE_AFTER_FIX_DESC2') + '<br/>';

            var title = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PROMPT_SAVE_AFTER_FIX_TITLE');
            var buttons = [this.resources.W.EditorDialogs.DialogButtons.SAVE, this.resources.W.EditorDialogs.DialogButtons.CANCEL];

            this.resources.W.EditorDialogs.openPromptDialog(title, msg, "", buttons,function(params)
            {
                if(params.result == this.resources.W.EditorDialogs.DialogButtons.DONT_SAVE)
                {
                    W.Editor.getEditorStatusAPI().setSaveInProcess(false);
                    return;
                }
                else if(params.result == this.resources.W.EditorDialogs.DialogButtons.SAVE)
                {
                    this._saveFailedBecauseTimeout = false;
                    this._saveCommand.execute({promptResultDialog:true});
                }
            }.bind(this));
        },
        _showErrorMessageToUser: function(errorCode){
            var errorUtils = W.Utils.EditorErrorUtils;
            var msg = errorUtils.getErrorMsg(errorCode, 'ERROR_SAVE_DOCUMENT');
            this.resources.W.EditorDialogs.openPromptDialog(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERROR_SAVE_TITLE'), msg, "", this.resources.W.EditorDialogs.DialogButtonSet.OK);
        },

        _unlockSaveFreezeAndNotifyUser: function () {

            W.Editor.getEditorStatusAPI().setSaveInProcess(false);
            this._removeSaveFreeze();

            var msg =   this.resources.W.Resources.get('EDITOR_LANGUAGE', 'UNKNOWN_SAVE_EXCEPTION_DESC') + '<br/>' + '<br/>'+
                this.resources.W.Resources.get('EDITOR_LANGUAGE', 'UNKNOWN_SAVE_EXCEPTION_DESC2') + '<br/>';

            var title = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'UNKNOWN_SAVE_EXCEPTION_TITLE');
            var buttons = [this.resources.W.EditorDialogs.DialogButtons.OK];

            this.resources.W.EditorDialogs.openPromptDialog(title, msg, "", buttons,function(params){}.bind(this));
        },
        _handleConcurrentEditingError:function(){
            var msg =   this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERR_CONCURRENT_EDITING_SAVE_ERROR_DESCRIPTION_MSG1') + '<br/>' + '<br/>' + '<ol>' + '<li style="list-style: decimal !important; margin-left: 22px;">' +
                this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERR_CONCURRENT_EDITING_SAVE_ERROR_DESCRIPTION_MSG2') + '<br/>' +
                this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERR_CONCURRENT_EDITING_SAVE_ERROR_DESCRIPTION_MSG3') + '<br/>' + '<br/>' + '</li>' + '<li style="list-style: decimal !important; margin-left: 22px;">' +
                this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERR_CONCURRENT_EDITING_SAVE_ERROR_DESCRIPTION_MSG4') + '</li>' + '</ol>';

            var title = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ERR_CONCURRENT_EDITING_SAVE_ERROR_TITLE');
            var buttons = [this.resources.W.EditorDialogs.DialogButtons.SAVE, this.resources.W.EditorDialogs.DialogButtons.DONT_SAVE];

            this.resources.W.EditorDialogs.openPromptDialog(title, msg, "", buttons,function(params)
            {
                if(params.result == this.resources.W.EditorDialogs.DialogButtons.DONT_SAVE)
                {
                    window.enableNavigationConfirmation = false;
                    location.reload();
                }
                else if(params.result == this.resources.W.EditorDialogs.DialogButtons.SAVE)
                {
                    this._saveFailedBecauseTimeout = false;
                    var param = this._lastSaveParam;
                    W.Editor.getEditorStatusAPI().setSaveInProcess(true);
                    W.Editor.getEditorStatusAPI().setSaveOverride(true);
                    this.resources.W.ServerFacade.overrideSaveDocument(window.siteHeader.id, this.resources.W.Preview.getPreviewSite(), this._onSaveSuccess, this._onSaveFail, param);
                }
            }.bind(this));
        },

        _onSaveAsCommand: function (param, cmd) {
            var params = {
                saveAs: true
            };
            this.resources.W.EditorDialogs.openSaveDialog(params);
        },

        _onPublishTemplateCommand: function () {
            if (!this.resources.W.Preview.isSiteReady()) {
                return;
            }

            W.BackgroundManager._handlePagesBGsOnPublishTemplate();
            var param = {};

            // before every publish we must save the document. In order to do that, all the
            // logic of the publish is entered as a callback, which will be run after a save command
            // succeeded.
            param.onCompleteCallback = function () {
                this.resources.W.ServerFacade.publishTemplate(window.siteHeader.id, // onSuccess callback:
                    function () {
                        //window['alert']('publish to template success :)');
                    }, // onFailure callback:
                    function (e) {
                        //window['alert']('publish to template FAILED !!!');
                    });
            }.bind(this);

            //add preset meta tag to mobile background
            this._addPresetMetaTagToMobileBackgroundDataIfNeeded();

            //save document before publish (the publish logic is passed via callbacks)
            this._onSaveCommand(param);
        },

        _addPresetMetaTagToMobileBackgroundDataIfNeeded: function() {
            if (this._isMobileBgSplitFromDesktop()) {
                W.Preview.getPreviewManagers().Theme.getDataItem().set('themePresets', {'mobileBg': true});
            }
        },

        _isMobileBgSplitFromDesktop: function() {
            return W.Preview.getPreviewManagers().Theme.getRawProperty('mobileBg').indexOf('[') === -1;
        },

        /**
         * override
         */
        _saveCurrentDocument: function () {
            if (!this.resources.W.Config.siteNeverSavedBefore()) {
                this._onSaveCommand();
            }
        },

        //Experiment SaveFreeze.New was promoted to feature on Wed Oct 10 17:10:03 IST 2012
        _removeSaveFreeze: function () {
            var blockArea = $('TEMP_SAVE_FREEZE');
            if (blockArea && blockArea.dispose) {
                blockArea.dispose();
            }
        },

        _onAfterSaveSuccess: function(){
            //In normal save, these currently all happen twice. There is no problem with this, and it will be fixed in the refactor.
            this._removeSaveFreeze();
            this._saveCurrentSiteStructure();
            this.resources.W.Preview.clearPreviewDataChange();
            this.resources.W.Data.clearDirtyObjectsMap();
            //end of stuff that happens twice
            this._enableKeyboardShortcuts();
        },

        _onAfterCloneSuccess: function(){
            //after successful clone during NoRedirectOnFirstSave
            this._onAfterSaveSuccess();
        },

        _onAfterSaveFail: function(){
            this._removeSaveFreeze();
            this._enableKeyboardShortcuts();
        },

        _prepareForSaveProcess: function(){
            this._validateSite();
            this._disableKeyboardShortcuts();
        },
        _validateSite: function(){
            try {
                var previewW = this.resources.W.Preview.getPreviewManagers();
                if (!previewW.SiteInvalidations) {
                    this._checkPageGroupInvalidation(previewW);
                }
            } catch(e){}
            /*
            else {
                _.forEach(previewW.SiteInvalidations, function(invalidation){
                     //fix according to invalidation type
                 });
            }
            */
        },

        _checkPageGroupInvalidation: function(previewW){
            var pageGroup = previewW.Viewer.getPageGroup(),
                childCompNodes = pageGroup.getChildComponents();

			var invalidComps = _.map(_.filter(childCompNodes, function(compNode){
				return (compNode.$logic && !compNode.$logic.isInstanceOfClass('core.components.Page')); //We assume that if a comp has no $logic, it can only be a page which means it's valid.
			}), 'id');

            if(invalidComps.length){
                LOG.reportError(wixErrors.CORRUPT_SITE_PAGEGROUP_HAS_NONPAGE_CHILDREN_DURING_THIS_SESSION, 'SaveCommandRegistrar', '_checkPageGroupInvalidation', JSON.stringify(invalidComps));
                //fix / disallow save?
            }

        },

        _disableKeyboardShortcuts: function(){
            W.Editor.setKeysEnabled(false);
        },

        _enableKeyboardShortcuts: function(){
            W.Editor.setKeysEnabled(true);
        }
    });
});
