define.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Config', 'W.Preview', 'W.EditorDialogs']);

    def.binds([]);

    def.utilize([
        'wysiwyg.editor.managers.MediaFrameManager',
        'wysiwyg.editor.managers.OrganizeImagesManager',
        'wysiwyg.editor.managers.BlogManagerFrameManager'
    ]);

    def.statics({
        COMPONENTS_TO_LOG_CHANGE_MEDIA_EVENTS: [
            "wysiwyg.viewer.components.WPhoto",
            'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer',
            'wysiwyg.viewer.components.AudioPlayer',
            'wysiwyg.viewer.components.ClipArt',
            'wysiwyg.viewer.components.documentmedia.DocumentMedia',
            'wysiwyg.viewer.components.svgshape.SvgShape'
        ]
    });

    def.methods({
        initialize: function () {
        },

        registerCommands: function () {
            var cmdmgr = this.resources.W.Commands;

            // Open Dialogs Commands:
            //-----------------------

            //publish dialogs:
            this._openPublishDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenPublishDialog", this, this._onOpenPublishDialogCommand);
            this._openPublishWebsiteDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenPublishWebsiteDialog", this, this._onOpenPublishWebsiteDialogCommand);
            this._openPublishWebsiteSuccessDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenPublishWebsiteSuccessDialog", this, this._onOpenPublishWebsiteSuccessDialogCommand);
            this._openPublishWebsiteShareDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenPublishWebsiteShareDialog", this, this._onOpenPublishWebsiteShareDialogCommand);
            this._openPublishFbSiteDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenPublishFbSiteDialog", this, this._onOpenPublishFbSiteDialogCommand);
            this._openPublishFbSiteSuccessDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenPublishFbSiteSuccessDialog", this, this._onOpenPublishFbSiteSuccessDialogCommand);

            this._openSaveSuccessDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.SaveSuccessDialog", this, this._onOpenSaveSuccessDialogCommand);

            this._addPageDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.AddPageDialog", this, this._onOpenAddPageDialog);

            this._openFontDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenFontDialogCommand", this, this._openFontDialog);
            this._openColorSelectorDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenColorSelectorDialogCommand", this, this._openColorSelectorDialog);
            this._openLinkDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenLinkDialogCommand", this, this._openLinkDialog);
            this._openColorAdjusterDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenColorAdjusterDialogCommand", this, this._openColorAdjusterDialog);
            this._openListEditDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenListEditDialog", this, this._openListEditDialog);
            this._openImageDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenImageDialog", this, this._openImageDialog);
            this._openFlashDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenFlashDialog", this, this._openFlashDialog);

            this._showHelpDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowHelpDialog", this, this._showHelpDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowIntroDialog", this, this._openIntroDialog);

            this._showColorPickerDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowColorPickerDialog", this, this._openColorPickerDialog);
            this._showBoxShadowDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowBoxShadowDialog", this, this._openBoxShadowDialog);
            this._openAviaryDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.OpenAviaryDialog", this, this._openAviaryDialog);

            this._openMediaFrame = cmdmgr.registerCommandAndListener("WEditorCommands.OpenMediaFrame", this, this._openMediaGalleryFrame);
            this._closeMediaFrame = cmdmgr.registerCommandAndListener("WEditorCommands.CloseMediaFrame", this, this._closeMediaGalleryFrame);

            this._showCharacterSets = this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenCharacterSetsDialog", this, this._openCharacterSetsDialog);
            this._showAdvancedFontDialogCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowAdvanceFontDialog", this, this._openAdvanceFontDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowItunesDialog", this, this._openItunesDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowSpotifySearchDialog", this, this._openSpotifySearchDialog);
			this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowVideoSearchDialog", this, this._openVideoSearchDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenExternalLink", this, this._openExternalLink);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowAnimationDialog", this, this._openAnimationDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowShareFeedbackDialog", this, this._openShareFeedbackDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.openFeedbackDialog", this, this._onOpenFeedbackDialogCommand);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowSaveBeforeYouShare", this, this._openSaveBeforeShareDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenChangeGalleryDialog", this, this._openChangeGalleryDialog);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.RegisterOpenDialogAfterFirstSave", this, this._registerOpenDialogAfterSave);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.OpenPagesBackgroundCustomizer', this, this._openPagesBackgroundCustomizer);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenOrganizeImagesDialog", this, this._openOrganizeImagesDialog);
            this.openBlogManager = this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenBlogManagerFrame", this, this._openBlogManagerFrame);

        },

        _openPagesBackgroundCustomizer: function(params) {
            this.resources.W.EditorDialogs.openPagesBackgroundCustomizer(params);
        },

        _registerOpenDialogAfterSave: function(){
            var selectedComp = W.Editor.getSelectedComp();
            this._firstSaveProcessEndCmd = W.Commands.registerCommandAndListener("FirstSaveProcess.End", this, this._onAfterFirstSave.bind(this, selectedComp));
        },
        _onAfterFirstSave: function(comp, nextAction){
            this._firstSaveProcessEndCmd.unregisterListener(this);
            delete this._firstSaveProcessEndCmd;
            if(comp && nextAction && nextAction.edit){
                W.Commands.executeCommand("WAppsEditorCommands.OpenEditDataDialog", {selectedComp: comp});
            }
        },

        //############################################################################################################
        //# O P E N   D I A L O G   C O M M A N D S
        //############################################################################################################

        _onOpenPublishDialogCommand: function (param, cmd) {
            //report BI event (from now on, in the beginning of each function)
            LOG.reportEvent(wixEvents.PUBLISH_BUTTON_CLICKED_IN_MAIN_WINDOW);

            if (!this.resources.W.Preview.isSiteReady()) {
                return;
            }

            if (this.resources.W.Config.siteNeverSavedBefore()) {
                param.isPublished = true;
                this.injects().Commands.executeCommand('WEditorCommands.Save', param);
                return;
            }

            this._openPublishDialogByAppType();
        },

        _openPublishDialogByAppType:function() {
            if (this.resources.W.Config.getApplicationType() === Constants.WEditManager.SITE_TYPE_FACEBOOK) {
                this._onOpenPublishFbSiteDialogCommand();
            }
            else { // (this.resources.W.Config.getApplicationType() == Constants.WEditManager.SITE_TYPE_WEB)
                this._onOpenPublishWebsiteDialogCommand();
            }
        },

        _onOpenPublishWebsiteDialogCommand: function (param, cmd) {
            this.resources.W.EditorDialogs.openPublishWebsiteDialog();
        },

        _onOpenPublishWebsiteSuccessDialogCommand: function (param, cmd) {
            this.resources.W.EditorDialogs.openPublishWebsiteSuccessDialog();
        },

        _onOpenPublishWebsiteShareDialogCommand: function (param, cmd) {
            this.resources.W.EditorDialogs.openPublishWebsiteShareDialog();
        },

        _onOpenPublishFbSiteDialogCommand: function (param, cmd) {
            this.resources.W.EditorDialogs.openPublishFbSiteDialog();
        },

        _onOpenPublishFbSiteSuccessDialogCommand: function (param, cmd) {
            this.resources.W.EditorDialogs.openPublishFbSiteSuccessDialog();
        },

        _onOpenSaveSuccessDialogCommand: function (param, cmd) {
            this.resources.W.EditorDialogs.openSaveSuccessDialog();
        },

        _onOpenAddPageDialog: function (param, cmd) {
            this.resources.W.EditorDialogs.openWAddPageDialog(param);
        },

        _openColorSelectorDialog: function (params) {
            this.resources.W.EditorDialogs.openColorSelectorDialog(params);
        },

        _openFontDialog: function (params) {
            this.resources.W.EditorDialogs.openFontDialog(params);
        },

        _openLinkDialog: function (params) {
            this.resources.W.EditorDialogs.openLinkDialog(params);
        },

        _openColorAdjusterDialog: function (params) {
            this.resources.W.EditorDialogs.openColorAdjusterDialog(params);
        },
        _openAdvanceFontDialog: function (params) {
            this.resources.W.EditorDialogs.openAdvanceFontDialog(params);
        },

        _openListEditDialog: function (params) {
            this.resources.W.EditorDialogs.openListEditDialog(params.data, params.galleryConfigID, params.startingTab, params.source);
            LOG.reportEvent(wixEvents.ORGANIZE_IMAGES_CLICKED, {
                c1: params.source,
                c2: params.galleryConfigID
            });
        },

        _openOrganizeImagesDialog: function(params, cmd) {
            if (this._organizeImagesManager && params.noCache){
                this._organizeImagesManager.removeDialog();
                delete this._organizeImagesManager;
            }

            LOG.reportEvent(wixEvents.ORGANIZE_IMAGES_CLICKED, {
                c1: params.source,
                c2: params.galleryConfigID
            });

            if (!this._organizeImagesManager){
                this._organizeImagesManager = new this.imports.OrganizeImagesManager(params);
            } else{
                this._organizeImagesManager.setup(params);
                this._organizeImagesManager.openDialog();
            }
        },

        _openMediaGalleryFrame: function (commandArgs) {
            var mediaFrameManager = new this.imports.MediaFrameManager(commandArgs);

            if (commandArgs.commandSource) {
                this._logChangeMediaEvent(commandArgs.commandSource);
            }
        },

        _logChangeMediaEvent: function (commandSource) {
            var component = W.Editor.getSelectedComp().className;

            if (this.COMPONENTS_TO_LOG_CHANGE_MEDIA_EVENTS.indexOf(component) >= 0) {
                LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK, {c1: commandSource, c2: component});
            }
        },
        _openImageDialog: function (params) {
            params = params || {};
            params.galleryConfigID = params.galleryConfigID || params.galleryTypeID;
            this._openMediaDialog(params.callback, params.galleryConfigID || 'photos');
        },

        _openFlashDialog: function (params) {
            params = params || {};
            this._openMediaDialog(params.callback, 'swf');
        },

        _openMediaDialog: function (callback, galleryTypeID, showTabs) {
            this.resources.W.EditorDialogs.openMediaDialog(callback || this._onMediaSelectDefault, false, galleryTypeID, showTabs);
        },

        _onMediaSelectDefault: function (rawData) {
            if (rawData.width || rawData.height) {
                rawData.width = Number(rawData.width);
                rawData.height = Number(rawData.height);
            }
            var compData = W.Editor.getEditedComponent().getDataItem();

            compData.setFields({
                'width': rawData.width,
                'height': rawData.height,
                'uri': rawData.uri,
                'title': rawData.title,
                'borderSize': rawData.borderSize,
                'description': rawData.description,
                'originalImageDataRef': rawData.originalImageDataRef || null,
                // remove linkable component fields from data in order to prevent overriding them
                'linkType': undefined,
                'href': undefined,
                'target': undefined
            });
        },

        _showHelpDialog: function (param, cmd) {
            param = param || {};
            if (typeof param === 'string') {
                param = {helpId: param};
            }
            var helpServer = this.injects().Config.getHelpServerUrl();
            var closeCallback = param.closeCallback;
            var helpId = param.helpId;

            // Checks if one of the strings is substring of the helpId param
            var isHelpKey = _.every(['/app/', '/node/', '/singlefaq/'], function (str) {
                return !_.contains(helpId, str);
            });

            if (helpId && isHelpKey) {
                var helpIds = W.Data.getDataByQuery('#HELP_IDS');
                helpId = helpIds.get('items')[param.helpId];
            }

            var helpCenter = helpServer + helpId;
            helpCenter = helpCenter + this.injects().Config.getMobileHelpParamIfNeeded();
            this.resources.W.EditorDialogs.openHelpDialog(helpCenter, null, closeCallback);

            LOG.reportEvent(wixEvents.OPEN_HELP_CENTER_FRAME, {c1: param.helpId});

        },

        _openIntroDialog: function () {
            var params = {
                dialogId: 'IntroVideoDialog',
                height: 600,
                width: 910,
                title: W.Resources.get('EDITOR_LANGUAGE', "INTRO_VIDEO_TITLE"),
                description: ''
            };
            this.resources.W.EditorDialogs.openIntroDialog(params);
        },

        _openColorPickerDialog: function (params) {
            this.resources.W.EditorDialogs.openColorPickerDialog(params);
        },

        _openBoxShadowDialog: function (params) {
            this.resources.W.EditorDialogs.openBoxShadowDialog(params);
        },

        _openAviaryDialog: function (params) {
            this.resources.W.EditorDialogs.openAviaryDialog(params);

        },

        _openCharacterSetsDialog: function (param) {
            var source = (param && param.source) || 'unknown';
            LOG.reportEvent(wixEvents.LANGUAGE_SUPPORT_OPENED, {'c1': source});
            W.EditorDialogs.openCharacterSetsDialog();
        },

        _openItunesDialog: function (params) {
            params = {
                dialogId: 'ItunesDialog',
                height: 520,
                width: 1030,
                nonModal: false,
                title: W.Resources.get('EDITOR_LANGUAGE', "ITUNES_BUTTON_DIALOG_TITLE"),
                description: '',
                iframeUrl: params.iframeUrl
            };
            this.resources.W.EditorDialogs.openItunesDialog(params);
        },

        _openSpotifySearchDialog: function (params) {
            params = {
                dialogId: 'SpotifySearchDialog',
                height: 550,
                width: 760,
                nonModal: false,
                title: W.Resources.get('EDITOR_LANGUAGE', params.title),
                description: '',
                iframeUrl: params.iframeUrl
            };

            this.resources.W.EditorDialogs.openSpotifySearchDialog(params);
        },

		_openVideoSearchDialog: function (params) {
			params = {
				dialogId: 'VideoSearchDialog',
				height: 550,
				width: 790,
				nonModal: false,
				title: W.Resources.get('EDITOR_LANGUAGE', params.title),
				description: '',
				iframeUrl: params.iframeUrl
			};

			this.resources.W.EditorDialogs.openVideoSearchDialog(params);
		},

        _openExternalLink: function (params) {
            var wnd = window.open(params.href, params.target || '_blank');
            wnd.focus();
        },

        _openAnimationDialog: function(params) {
            this.resources.W.EditorDialogs.openAnimationDialog(params);
        },

        _openShareFeedbackDialog: function(params) {
            params = {
                dialogId:'ShowFeedbackDialog',
                height:550,
                width:760,
                nonModal: false,
                title: W.Resources.get('EDITOR_LANGUAGE', "ShareFeedback_DIALOG_TITLE"),
                description:''
            };

            this.resources.W.EditorDialogs.openShareFeedbackDialog(params);
        },

        _onOpenFeedbackDialogCommand: function(){
            this.resources.W.EditorDialogs.openFeedbackDialog();
        },

        _openSaveBeforeShareDialog: function(){
            this.resources.W.EditorDialogs.openSaveBeforeShare();
        },

        _openChangeGalleryDialog: function(params) {
            this.resources.W.EditorDialogs.openChangeGalleryDialog(params);
        },

        _openBlogManagerFrame: function (commandArgs) {
            var blogManagerFrameManager = new this.imports.BlogManagerFrameManager(commandArgs);
        }
    });
});

