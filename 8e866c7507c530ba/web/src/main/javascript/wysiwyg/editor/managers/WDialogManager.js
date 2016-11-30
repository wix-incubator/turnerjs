define.Class('wysiwyg.editor.managers.WDialogManager', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits("core.editor.managers.DialogManager");

    def.resources(['W.Resources']);

    def.binds(['openAdvancedSeoSettings', '_saveSuccessDialogHideCallback', 'openAdvancedStylingDialog', 'openLinkDialog', 'openColorAdjusterDialog', 'closeDialogById', 'setNotificationDialogShowAgainStatus', 'openFeedbackDialog']);

    def.methods({

        initialize: function (compId, viewNode, args) {
            this._listOfDialogs = {};
            this._violationsCounter = -1;
            this._lastDialogName = "";
            this.parent(compId, viewNode, args);
        },

        _initializeExtra: function () {
            this.DialogButtons.DISCARD = 'DISCARD';
            this.DialogButtons.SAVE = 'SAVE';
            this.DialogButtons.DONT_SAVE = 'DONT_SAVE';
            this.DialogButtons.DUPLICATE = 'DUPLICATE';
            this.DialogButtons.OK_ADD_ANOTHER = 'OK_ADD_ANOTHER';
            this.DialogButtonSet.SAVE_DISCARD = [this.DialogButtons.SAVE, this.DialogButtons.DISCARD];
            this.DialogButtons.RELOAD = "RELOAD";
            this.DialogButtons.OVERRIDE_CHANGES = "OVERRIDE_CHANGES";
        },

        openLinkDialog: function (params) {
            var helpletComponent = 'LINK_DIALOG';
            this._createAndOpenWDialog(
                '_linkDialog',
                'wysiwyg.editor.components.dialogs.LinkDialog',
                'wysiwyg.editor.skins.dialogs.LinkDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 320,
                    top: params.top,
                    left: params.left,
                    position: params.position || Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    title: params.title || W.Resources.get('EDITOR_LANGUAGE', "LINK_DIALOG_DEFAULT_TITLE"),
                    description: params.description || W.Resources.get('EDITOR_LANGUAGE', "LINK_DIALOG_DEFAULT_DESCRIPTION"),
                    helplet: helpletComponent
                },
                null, true, params, false, false
            );
        },

        openColorAdjusterDialog: function (params) {
            this._createAndOpenWDialog(
                '_colorAdjustmentDailog',
                'wysiwyg.editor.components.dialogs.ColorAdjuster',
                'wysiwyg.editor.skins.dialogs.ColorAdjusterSkin',
                function (innerLogic) {
                },
                {
                    width: 300,
                    height: 200,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "ADJUST_DIALOG_TITLE"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "ADJUST_DIALOG_DESCRIPTION")
                },
                null, true, params, false, false
            );
        },
        openColorSelectorDialog: function (params) {
            this._createAndOpenWDialog(
                '_colorSelectorDialog',
                'wysiwyg.editor.components.dialogs.ColorSelector',
                'wysiwyg.editor.skins.dialogs.ColorSelectorSkin',
                function (innerLogic) {
                },
                {
                    width: 195,
                    minHeight: 195,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: W.EditorDialogs.DialogButtonSet.NONE,
                    title: W.Resources.get('EDITOR_LANGUAGE', "SELECT_COLOR_DIALOG_TITLE")
                },
                null, true, params, false, false
            );
        },

        openColorPickerDialog: function (params) {
            this._createAndOpenWDialog(
                '_colorPickerDialog',
                'wysiwyg.editor.components.dialogs.ColorPickerDialog',
                'wysiwyg.editor.skins.dialogs.ColorPickerDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 310,
                    height: 260,
                    maxHeight: 260,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "SELECT_COLOR_DIALOG_TITLE")
                },
                null, true, params, false, false
            );
        },

        openBoxShadowDialog: function (params) {
            this._createAndOpenWDialog(
                '_boxShadowDialog',
                'wysiwyg.editor.components.dialogs.BoxShadowDialog',
                'wysiwyg.editor.skins.dialogs.BoxShadowDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 260,
                    maxHeight: 370,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "SHADOW_DIALOG_TITLE")
                },
                null, true, params, false, false
            );
        },

        openFontDialog: function (params) {
            this._createAndOpenWDialog(
                '_fontDialog',
                'wysiwyg.editor.components.dialogs.FontPicker',
                'wysiwyg.editor.skins.dialogs.FontPickerSkin',
                function (innerLogic) {
                },
                {
                    width: 270,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    title: params.title || W.Resources.get('EDITOR_LANGUAGE', "FONT_DIALOG_TITLE"),
                    helplet: 'FontPicker'
                },
                null, true, params, false, false
            );
        },

        openAdvancedStylingDialog: function (params) {
            params = params || {};
            if (!params.selectedComponent) {
                params.selectedComponent = this.injects().Editor.getEditedComponent();
            }
            var componentInformation = W.Preview.getPreviewManagers().Components.getComponentInformation(params.selectedComponent.$className);

            var getHelplet = function (componentClassName) {
                var compLabel = componentClassName && componentClassName.split('.').getLast();
                var helpletComponent = 'ADVANCED_STYLING_' + compLabel;
                if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent] &&
                    (!componentInformation || !componentInformation.get('helpIds').advancedStyling)) {
                    helpletComponent = undefined;
                }
                return helpletComponent;
            };

            var helpButtonId;
            if (componentInformation && componentInformation.get('helpIds') && componentInformation.get('helpIds').advancedStyling) {
                helpButtonId = componentInformation.get('helpIds').advancedStyling;
            }
            else {
                helpButtonId = getHelplet(params.selectedComponent.$className);
            }

            this._createAndOpenWDialog(
                '_advancedStyleDialog',
                'wysiwyg.editor.components.panels.design.AdvancedStyling',
                'wysiwyg.editor.skins.panels.AdvancedStylingSkin',
                function (innerLogic) {
                }, {
                    width: 300,
                    maxHeight: 600,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    level: 2,
                    allowScroll: true,
                    semiModal: true,
                    allowDrag: true,
                    title: W.Resources.get('EDITOR_LANGUAGE', 'ADVANCED_STYLES'),
                    description: W.Resources.get('EDITOR_LANGUAGE', 'ADVANCED_STYLES_DESCRIPTION'),
                    helplet: helpButtonId,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    canClickUndoRedo: true

                }, null, true, params, false, false);
        },

        openAdvancedSeoSettings: function () {
            W.Data.getDataByQuery("#USER_META_TAGS", function (dataItem) {
                this._createAndOpenWDialog(
                    '_AdvancedSeoSettingsDialog',
                    'wysiwyg.editor.components.dialogs.AdvancedSeoSettingsDialog',
                    'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                    function () {
                    },
                    {
                        width: 610,
                        height: 374,
                        allowScroll: false,
                        allowDrag: false,
                        position: Constants.DialogWindow.POSITIONS.CENTER,
                        title: W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_TT_ADVANCED_SETTINGS'),
                        buttonSet: this.DialogButtonSet.NONE,
                        helpButtonId: 'COMPONENT_PANEL_HeaderVerificationTags_learn_more'
                    },
                    dataItem, true, null, false, true
                );
            }.bind(this));
        },

        openInputDialog: function (params) {
            this._createAndOpenWDialog(
                '_inputDialog',
                'wysiwyg.editor.components.dialogs.InputDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {
                },
                {
                    width: 400,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    allowDrag: false,
                    title: params.title || "",
                    description: params.description || "",
                    placeholderText: params.placeholderText || "",
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL
                },
                null, true, params, false, false
            );
        },

        openErrorDialog: function (title, content, details, callBack) {
            this._createAndOpenWDialog('_errorDialog', 'core.editor.components.dialogs.ErrorDialog', 'skins.editor.dialogs.ErrorDialogSkin', function (innerLogic) {
                innerLogic.setDialogOptions(title, content, details, callBack, undefined);
            }, {
                width: 500,
                minHeight: 200
            }, null, false, null, false);
        },

        openSomePublishDialog:function (dlgTypeID, innerDlgComponent, showAgainSelection) {
            var dialogParams = {};
            if(showAgainSelection){
                if(!this._isNotificationDialogCanBeShownAgain(dlgTypeID, null, showAgainSelection)){
                    return this.getNotificationDialogByName(dlgTypeID);
                }
                dialogParams["setShowAgainStatusCallBack"] = this.setNotificationDialogShowAgainStatus;
                dialogParams["dialogName"] = dlgTypeID;
                this._updateListOfDialogs(dlgTypeID, dialogParams);
            }
            this._createFloatingDialog(
                dlgTypeID,
                innerDlgComponent,
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {},
                {
                    width:700,
                    minHeight:150,
                    position:Constants.DialogWindow.POSITIONS.TOP,
                    allowScroll:true,
                    allowDrag:false,
                    buttonSet:this.DialogButtonSet.NONE
                },
                null, true, dialogParams, false, true
            );
        },

        openPublishWebsiteSuccessDialog: function () {
            if(W.Experiments.isExperimentOpen('MusicCampaignActive')) {
                W.Editor.initMusicCampaign();
            }
            this.openSomePublishDialog('_publishWebsiteSuccessDialog', 'wysiwyg.editor.components.dialogs.PublishWebsiteSuccessDialog');
        },

        openPublishWebsiteShareDialog: function () {
            this.openSomePublishDialog('_publishWebsiteShareDialog', 'wysiwyg.editor.components.dialogs.PublishWebsiteShareDialog', true);
        },

        openPublishFbSiteDialog: function () {
            this.openSomePublishDialog('_publishFbSiteDialog', 'wysiwyg.editor.components.dialogs.PublishFbSiteDialog');
        },

        openPublishFbSiteSuccessDialog: function () {
            this.openSomePublishDialog('_publishFbSiteSuccessDialog', 'wysiwyg.editor.components.dialogs.PublishFbSiteSuccessDialog');
        },

        openSaveDialog: function (params) {

            // =============================================
            // TODO: Find a better way to avoid this dialog
            // =============================================
            var editorUI = W.Editor.getEditorUI();
            if(editorUI.getMobileQuickTourComponent()) {
                return;
            }
            // =============================================

            if (W.Editor.getEditorStatusAPI().getSaveInProcess()) {
                return;
            }
            W.Editor.getEditorStatusAPI().setSaveInProcess(true);
            W.Editor.getEditorStatusAPI().setSaveOverride(false);

            params = params || {};

            W.Data.getDataByQuery("#SITE_SETTINGS", function (dataItem) {
                // if dialog is closed && firstSave flag is true
                if (params.saveAs || (W.Config.siteNeverSavedBefore())) {
                    /* check to see if the creator wanted us to set a special text to the user */
                    this._createFloatingDialog(
                        '_saveDialog',
                        'wysiwyg.editor.components.dialogs.SaveDialog',
                        'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                        function () {
                        }, //Need an empty function or else you get console errors. eek.
                        {
                            width: 650,
                            minHeight: 150,
                            position: Constants.DialogWindow.POSITIONS.TOP,
                            allowScroll: true,
                            allowDrag: false,
                            description: params.description || '',
                            buttonSet: this.DialogButtonSet.NONE
                        },
                        dataItem, true, params, false, true
                    );
                } else {
                    W.ServerFacade.saveDocument(siteHeader.id, W.Preview.getPreviewSite(),
                        function () {
                            W.Editor.getEditorStatusAPI().setSaveInProcess(false);
                        },
                        function () {
                            W.Editor.getEditorStatusAPI().setSaveInProcess(false);
                        }
                    );
                }
            }.bind(this));
        },

        openSaveSuccessDialog: function (afterSecondSave) {
            if (afterSecondSave) {
                this.openNotificationDialog("SaveSuccessDialog", "SUCCESS_SAVE_TITLE", "SUCCESS_SAVE_DESCRIPTION", 480, 90, null, true, null);
            }
            else {
                this.openSomePublishDialog('_saveSuccessDialog', 'wysiwyg.editor.components.dialogs.SaveSuccessDialog');
            }
        },

        _saveSuccessDialogHideCallback: function (hideShowDialog) {
            W.Editor.setShowAgainSaveSuccessDialogFlag(hideShowDialog);
        },

        openPublishWebsiteDialog: function () {
            W.Data.getDataByQuery("#SITE_SETTINGS", function (dataItem) {
                this._createFloatingDialog(
                    '_PublishDialog',
                    'wysiwyg.editor.components.dialogs.PublishWebsiteDialog',
                    'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                    function () {
                    },
                    {
                        width: 700,
                        minHeight: 150,
                        position: Constants.DialogWindow.POSITIONS.TOP,
                        allowScroll: true,
                        allowDrag: false,
                        buttonSet: this.DialogButtonSet.NONE
                    },
                    dataItem, true, null, false, true
                );
            }.bind(this));
        },

        openListEditDialog: function (dataList, galleryConfigID, startingTab, source) {
            if (!galleryConfigID) {
                galleryConfigID = 'photos';
            }

            var innerDialogParams = {
                galleryConfigID: galleryConfigID,
                addButtonText: W.Resources.get('EDITOR_LANGUAGE', 'ADD_' + galleryConfigID.toUpperCase() + '_BUTTON_TEXT'),
                showDescription: (galleryConfigID !== 'social_icons'),
                showTitle: (galleryConfigID !== 'social_icons'),
                showSplashScreen: (galleryConfigID !== 'social_icons'),
                startingTab: startingTab || 'my',
                source: source || "NO_SOURCE_SPECIFIED"
            };

            var helpletComponent = 'ORGANIZE_' + galleryConfigID;
            if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent]) {
                helpletComponent = undefined;
            }

            this._createAndOpenWDialog(
                '_listEditDialog' + dataList.get('id'),
                'wysiwyg.editor.components.dialogs.ListEditDialog',
                'wysiwyg.editor.skins.dialogs.WListEditDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 550,
                    height: 510,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', 'ORGANIZE_' + galleryConfigID.toUpperCase() + '_DIALOG_TITLE'),
                    description: W.Resources.get('EDITOR_LANGUAGE', 'ORGANIZE_' + galleryConfigID.toUpperCase() + '_DIALOG_DESCRIPTION'),
                    helplet: helpletComponent
                },
                dataList, true, innerDialogParams, false, false
            );
        },

        openWAddPageDialog: function (params) {
            var helpletComponent = 'HELPLET_LEARN_MORE';
            this._createAndOpenWDialog(
                '_addPageDialog',
                'wysiwyg.editor.components.dialogs.WAddPageDialog',
                'wysiwyg.editor.skins.dialogs.WAddPageDialogSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions();
                },
                {
                    width: 500,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    tabs: false,
                    title: W.Resources.get('EDITOR_LANGUAGE', 'ADD_PAGE_DIALOG_HEADER'),
                    description: W.Resources.get('EDITOR_LANGUAGE', 'ADD_PAGE_DIALOG_DESCRIPTION'),
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    allowDrag: false,
                    helpIcon: true,
                    helplet: helpletComponent
                }, null, true, params, true
            );
        },

        openStyleSelector: function (params) {
            params = params || {};
            //Wixapps proxies still send the component instance and not its id because their ids in mobile don't have the "mobile_" prefix so we can't find them in dom
            var selectedComponent = params.selectedComponent || W.Preview.getCompLogicById(params.selectedComponentId);
            var componentInformation = W.Preview.getPreviewManagers().Components.getComponentInformation(selectedComponent.$className);

            var getHelplet = function (componentClassName) {
                var compLabel = componentClassName.split('.').getLast();
                var helpletComponent = 'CHOOSE_STYLE_' + compLabel;
                if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent] &&
                    (!componentInformation || !componentInformation.get('helpIds').chooseStyle)) {
                    helpletComponent = undefined;
                }
                return helpletComponent;
            };

            var helpButtonId;
            if (componentInformation && componentInformation.get('helpIds') && componentInformation.get('helpIds').chooseStyle) {
                helpButtonId = componentInformation.get('helpIds').chooseStyle;
            }
            else {
                helpButtonId = getHelplet(selectedComponent.$className);
            }


            this._createAndOpenWDialog(
                '_chooseStyle',
                'wysiwyg.editor.components.dialogs.ChooseStyleDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                },
                {
                    width: 300,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    level: 1,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_STYLE_TITLE"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_STYLE_DESCRIPTION"),
                    helpButtonId: helpButtonId,
                    canClickUndoRedo: true
                },
                componentInformation || "#STYLES", true, params, false, false, true);
        },

        //Experiment IframeDialog.New was promoted to feature on Mon Aug 20 18:00:04 IDT 2012
        openHelpDialog: function (url, params) {
            params = params || {
                dialogId: '_helpDialog',
                height: 610,
                width: 610,
                title: W.Resources.get('EDITOR_LANGUAGE', "IFRAME_HELP_TITLE"),
                description: ''// W.Resources.get('EDITOR_LANGUAGE', "IFRAME_HELP_DESCRIPTION")
            };
            this.openIframeDialog(url, params);
        },

        openIntroDialog: function (params) {
            var dialog = this._createAndOpenWDialog(
                params.dialogId,
                'wysiwyg.editor.components.dialogs.IntroDialog',
                'wysiwyg.editor.skins.dialogs.IntroDialogSkin',
                function () {
                },
                {
                    width: params.width,
                    maxHeight: params.height,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: true,
                    nonModal: params.nonModal !== false,
                    allowDrag: true,
                    title: params.title,
                    description: params.description,
                    buttonSet: this.DialogButtonSet.NONE,
                    dialogSkin: params.dialogSkin
                },
                null, true, params, false, true);
            var dialogXButton = this.IntroVideoDialog.getLogic().getSkinPart('xButton');
            if (dialogXButton) {
                dialogXButton.addEvent(Constants.CoreEvents.CLICK,
                    function () {
                        LOG.reportEvent(wixEvents.INTRO_VIDEO_CLOSED, {});
                    });
            }
            return dialog;
        },

        _registerNewDialog: function (dialog, dlgTypeID) {
            // dlgTypeID is used in experiment ngPanels
            this._openDialogs.push(dialog);
        },

        // This function isn't 'private' as it is notated. Consider while planning changes on it
        _createAndOpenWDialog: function (dlgTypeID, innerDlgComponent, innerDlgSkin, setDlgOptionsCallBack, options, dataQ, dontWaitForOptions, innerDialogParams, closeOtherDialogs, fromCache, allowOnlyOneInstance, dialogType, disableEsc) {
            var dialog,
                savedKeysEnabledPromise;

            if (fromCache) {
                dialog = this[dlgTypeID];
            }

            //Allow only one dialog of the same dialog type
            if (allowOnlyOneInstance && this[dlgTypeID]) {
                if (this[dlgTypeID].getLogic) {
                    this[dlgTypeID].getLogic().closeDialog();
                } else {
                    delete this[dlgTypeID];
                }
            }

            if (closeOtherDialogs) {
                this._closeAllDialogs();
            }

            savedKeysEnabledPromise = W.Editor.getKeysEnabledPromise();
            W.Editor.setKeysEnabled(false);
            this._disableEsc = disableEsc;

            if (!dialog || !dialog.getLogic) {
                dialog = W.Components.createComponent(
                        dialogType || 'core.editor.components.dialogs.DialogWindow',
                        options.dialogSkin || 'wysiwyg.editor.skins.dialogs.WDialogWindowSkin',
                    undefined,
                    {},
                    function (dialogLogic) {
                        var dialogView = dialogLogic.getViewNode();
                        dialogLogic.insertDialogToDom();
                        dialogView.addEvent('innerDialogReady', function () {
                            if (dontWaitForOptions) {
                                dialogLogic.openDialog(options);
                            } else {
                                dialogLogic.getInnerDialog().addEvent("dialogOptionsSet", function () {
                                    dialogLogic.openDialog(options);
                                });
                            }
                            setDlgOptionsCallBack(dialogLogic.getInnerDialog().getLogic());
                        });

                        dialogView.addEvent('dialogClosed', function () {
                            this._onDialogClosing(dialogView, dlgTypeID, fromCache);
                            savedKeysEnabledPromise.then(function (savedValue) {
                                W.Editor.setKeysEnabled(savedValue);
                            });
                        }.bind(this));

                        options && dialogLogic.setDialogOptions(options);

                        dialogLogic.setDialog(innerDlgComponent, innerDlgSkin, innerDialogParams, dataQ);
                    }.bind(this)
                );
                this[dlgTypeID] = dialog;
            } else {
                setDlgOptionsCallBack(this[dlgTypeID].getLogic().getInnerDialog().getLogic());

                if (dontWaitForOptions) {
                    this[dlgTypeID].getLogic().openDialog(options);
                }
            }

            this._registerNewDialog(dialog, dlgTypeID);

            document.addEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyDown);

            return dialog;
        },

        openMediaDialog: function (callback, multiSelection, galleryConfigID) {
            var params = {
                width: 600,
                minHeight: 250
            };

            if (!galleryConfigID) {
                galleryConfigID = 'photos';
            }

            var helpletComponent = 'IMAGE_GALLERY_' + galleryConfigID;
            if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent]) {
                helpletComponent = undefined;
            }

            this._createAndOpenWDialog(
                '_mediaDialog',
                'core.editor.components.dialogs.MediaDialog',
                'wysiwyg.editor.skins.dialogs.WMediaDialogSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(multiSelection, galleryConfigID, callback, {
                        tabs: true
                    });
                },
                {
                    width: params.width,
                    minHeight: params.minHeight,
                    allowDrag: false,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    helplet: helpletComponent,
                    showToolbar: true,
                    tabs: true,
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL
                },
                null, false, params, false, false, true
            );

            // dialogOptions were moved to MediaDialog. This is wrongful, yet works.
            // TODO: In the refactoring of this mess, move all dialog creation process to MediaDialog
        },

        openPromptDialog: function (title, content, details, buttonSet, callBack) {
            var closeDialogs = false;
            this._createAndOpenWDialog('_promptDialog', 'core.editor.components.dialogs.MessageDialog', 'skins.editor.dialogs.MessageDialogSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(content, details, callBack,
                        {
                            width: 480,
                            minHeight: 10,
                            tabs: false,
                            title: title,
                            'buttonSet': buttonSet
                        }
                    );
                },
                {
                    position: Constants.DialogWindow.POSITIONS.CENTER
                },
                null, false, null, closeDialogs);
        },

        openPromptDialogWithIcon: function(description, buttonSet, icon, onChange, title, approveLabel, dialogWidth, dialogMinHeight, showAgainSelection, dialogName, helpletID) {
            var params = {};
            if (showAgainSelection) {
                if(!this._shouldShowNotificationAgain(showAgainSelection, dialogName)){
                    return this.getNotificationDialogByName(dialogName);
                }
                params.setShowAgainStatusCallBack = this.setNotificationDialogShowAgainStatus;
                params.dialogName = dialogName;
            }
            if (helpletID) {
                params.helpletID = helpletID;
            }
            params.icon = icon;
            params.description = description;
            params.onChange = onChange;
            params.width = dialogWidth || 517;
            params.approveLabel = approveLabel;

            this._createAndOpenWDialog(
                '_mobilePropertiesDialog',
                'wysiwyg.editor.components.dialogs.MobilePropertySplit',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {},
                {
                    width:dialogWidth || 517,
                    minHeight:dialogMinHeight || 85,
                    allowScroll:false,
                    allowDrag:false,
                    position:Constants.DialogWindow.POSITIONS.CENTER,
                    buttonSet:buttonSet,
                    title:W.Resources.get('EDITOR_LANGUAGE', title)
                },
                null, true, params, false, false
            );
            dialogName && this._updateListOfDialogs(dialogName, params);
        },

        _shouldShowNotificationAgain: function(showAgainSelection, dialogName) {
            if( typeOf(showAgainSelection)==="boolean" && showAgainSelection===true &&
                this._listOfDialogs[dialogName] && typeOf(this._listOfDialogs[dialogName].showAgain)==="boolean"){
                return this._listOfDialogs[dialogName].showAgain;
            }
            return true;
        },

        //Experiment TPA.New was promoted to feature on Sun Aug 05 17:02:43 IDT 2012
        openAddAppDialog: function (appDefinitionData, type, widgetId, closeCallback) {
            var helpletComponent = 'SIDE_PANEL_PAGES_ADD_TPA';

            if (W.AppStoreManager.countAppElements(type, appDefinitionData.appDefinitionId) == 0) {
                var appsEditor = W.AppsEditor;
                var title = appsEditor.localize(appDefinitionData.name);
                this._createAndOpenWDialog(
                    '_addAppDialog',
                    'wysiwyg.editor.components.dialogs.AddAppDialog',
                    'wysiwyg.editor.skins.dialogs.AddAppDialogSkin',
                    function (innerLogic) {
                    },
                    {
                        width: 550,
                        position: Constants.DialogWindow.POSITIONS.CENTER,
                        tabs: false,
                        title: title,
                        titleHeight: 50,
                        description: "",
                        allowDrag: true,
                        helpIcon: true,
                        semiModal: true,
                        buttonSet: this.DialogButtonSet.NONE,
                        helplet: helpletComponent,
                        dialogSkin: 'tpa.editor.skins.dialogs.TPADialogWindowSkin'
                    }, null, true, {
                        'closeCallback': closeCallback,
                        'appDefinitionData': appDefinitionData,
                        'widgetId': widgetId, //can be null in case of a section
                        'type': type
                    }, true, false, true
                );
            }
            else {
                // Don't open the dialog, just add the component
                closeCallback();
            }
        },

        openMarketPopup: function (params) {
            params = params || {};
            var width = params.width || 880;
            var height = params.height || 700;
            var url = params.url;

            this._createAndOpenWDialog(
                '_MarketPopup',
                'wysiwyg.editor.components.dialogs.MarketPopup',
                'wysiwyg.editor.skins.IframeSkin',
                function () {
                },
                {
                    width: width,
                    minHeight: height,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    allowDrag: false,
                    buttonSet: this.DialogButtonSet.NONE,
                    title: '&nbsp;',
                    dialogSkin: 'wysiwyg.editor.skins.dialogs.MarketPopupDialogWindowSkin'
                },
                null, true, {url: url, width: width, height: height}, false, false, true
            );
        },

        //Experiment IframeDialog.New was promoted to feature on Mon Aug 20 18:00:04 IDT 2012
        openIframeDialog: function (url, params) {
            params.height = params.height || 610;
            params.width = params.width || 610;
            params.dialogId = params.dialogId || '_iframeDialog';

            return this._createAndOpenWDialog(
                params.dialogId,
                'wysiwyg.editor.components.Iframe',
                'wysiwyg.editor.skins.IframeSkin',
                function (innerLogic) {
                    innerLogic.setUrl(url);
                },
                {
                    width: params.width,
                    maxHeight: params.height,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: true,
                    nonModal: params.nonModal !== false,
                    allowDrag: true,
                    title: params.title,
                    description: params.description,
                    buttonSet: this.DialogButtonSet.NONE,
                    dialogSkin: params.dialogSkin
                },
                null, true, params, false, false, true
            );
        },

        //Experiment IframeDialog.New was promoted to feature on Mon Aug 20 18:00:04 IDT 2012
        _onDialogClosing: function (dialog, dialogTypeId, fromCache) {
            this.parent(dialog);
            if (!fromCache) {
                delete this[dialogTypeId];
            }
        },

        //Experiment PageSecurity.New was promoted to feature on Thu Oct 18 11:20:20 IST 2012
        openContextDialog: function (height, width, dialogClazz, dialogSkin, title, posParams, previewComponent, okCallback, cancelCallback) {
            this._createAndOpenWDialog(
                '_contextDialog',
                dialogClazz,
                dialogSkin,
                function (innerLogic) {

                },
                {
                    width: width,
                    maxHeight: height,
                    top: posParams.top,
                    left: posParams.left,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    tabs: false,
                    title: title,
                    titleHeight: 50,
                    description: null,
                    allowDrag: false,
                    helpIcon: true,
                    semiModal: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    helpButtonId: 'PAGE_SECURITY_DIALOG',
                    helplet: null
                }, null, true, {
                    'previewComponent': previewComponent,
                    'okCallback': okCallback,
                    'cancelCallback': cancelCallback
                }, true, false, true
            );
        },

        //added by nadav for wixApps
        openWixAppsDataDialog: function (targetAppPart) {
            var params = {
                width: 950,
                minHeight: 450,
                height: 650
            };

            return this._createAndOpenWDialog('_WixAppsDataEditor', 'wixapps.integration.components.editor.DataEditorDialog', 'wixapps.integration.skins.editor.DataEditorDialogSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(targetAppPart);
                },
                {
                    width: params.width,
                    height: params.height,
                    minHeight: params.minHeight,
                    allowDrag: false,
                    allowScroll: true,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    showToolbar: false,
                    tabs: false,
                    buttonSet: this.DialogButtonSet.SAVE_DISCARD
                },
                null, false, params, null, false);
        },

        openWixAppsEditItemDialog: function (itemToEdit, appInstance, model, onCloseCallback, autoAddToParent, isNewItem, isRef) {
            var params = {
                width: 950,
                minHeight: 300
            };

            var btnSet;
            if (isNewItem) {
                btnSet = [this.DialogButtons.CANCEL, this.DialogButtons.OK, this.DialogButtons.OK_ADD_ANOTHER];
            } else {
                btnSet = [this.DialogButtons.CANCEL, this.DialogButtons.OK, this.DialogButtons.DUPLICATE, this.DialogButtons.DELETE];
            }
            return this._createAndOpenWDialog('_WixAppsDataItemEditor', 'wixapps.integration.components.editor.DataItemEditorDialog', 'wixapps.integration.skins.editor.DataItemEditorDialogSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(itemToEdit, appInstance, model, onCloseCallback, autoAddToParent, isNewItem, isRef);
                },
                {
                    width: params.width,
                    minHeight: params.minHeight,
                    allowDrag: false,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    showToolbar: false,
                    tabs: false,
                    buttonSet: btnSet
                },
                null, false, params, null, false);
        },

        openProxyStyleSelector: function (component, params) {
            params = params || {};

            var getHelplet = function (componentClassName) {
                var compLabel = componentClassName.split('.').getLast();
                var componentInformation = params.selectedComponent && W.Preview.getPreviewManagers().Components.getComponentInformation(params.selectedComponent.$className);
                var helpletComponent = 'CHOOSE_STYLE_' + compLabel;
                if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent] && (!componentInformation || !componentInformation.get('helpIds').chooseStyle)) {
                    helpletComponent = undefined;
                }
                return helpletComponent;
            };

            this._createAndOpenWDialog(
                '_chooseStyle',
                'wixapps.integration.components.panels.ProxyStylePanel',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {
                },
                {
                    width: 300,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    level: 1,
                    allowScroll: true,
                    showToolbar: true,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_STYLE_TITLE"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_STYLE_DESCRIPTION"),
                    helpButtonId: getHelplet(component.$className),
                    canClickUndoRedo: true,
                    undoRedoSubType: 'wixApps'

                },
                "#STYLES", true,
                {
                    onStyleChanged: params.onStyleChanged || function () { },
                    selectedComponent: component,
                    undoRedoSubType: 'wixApps'
                },
                false, false, true);
        },

        openAppsTextStyleSelector: function (appPart, component, params) {
            var componentInformation = W.Preview.getPreviewManagers().Components.getComponentInformation(component.$className);

            var getHelplet = function (componentClassName) {
                var compLabel = componentClassName.split('.').getLast();
                var helpletComponent = 'CHOOSE_STYLE_' + compLabel;
                if (!W.Data.getDataByQuery('#HELP_IDS').getData().items[helpletComponent] &&
                    (!componentInformation || !componentInformation.get('helpIds').chooseStyle)) {
                    helpletComponent = undefined;
                }
                return helpletComponent;
            };

            var helpButtonId;
            if (componentInformation && componentInformation.get('helpIds') && componentInformation.get('helpIds').chooseStyle) {
                helpButtonId = componentInformation.get('helpIds').chooseStyle;
            }
            else {
                helpButtonId = getHelplet(component.$className);
            }

            this._createAndOpenWDialog(
                '_chooseStyle',
                'wixapps.integration.components.panels.ChooseTextStylePanel',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                    // yet another hack, safari on mac has render problems when flash 11 is installed
                    if (!Browser.safari) {
                        innerLogic.setEditedComponent(appPart, component);
                    }
                    else {
                        setTimeout(function () {
                            innerLogic.setEditedComponent(appPart, component);
                        }, 120);
                    }
                },
                {
                    width: 300,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    level: 1,
                    allowScroll: true,
                    showToolbar: true,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_TEXT_STYLE_TITLE"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_TEXT_STYLE_DESCRIPTION"),
                    helplet: helpButtonId,
                    canClickUndoRedo: true

                }, "#STYLES", true,
                {
                    currentStyle: params.currentStyle
                }, false, false, true
            );
        },

        openSpacerPropertiesDialog: function (appHolder, spacerProxy, params) {
            this._createAndOpenWDialog(
                '_chooseStyle',
                'wixapps.integration.components.panels.SpacerPropertiesDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                    innerLogic.setEditedProxy(appHolder, spacerProxy);
                },
                {
                    width: 300,
                    top: params.top,
                    left: params.left,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    level: 1,
                    allowScroll: true,
                    showToolbar: true,
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_STYLE_TITLE"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CHOOSE_STYLE_DESCRIPTION"),
                    helplet: null,
                    canClickUndoRedo: true

                }, undefined, true,
                {
                    currentStyle: params.currentStyle
                }, false, false, true
            );
        },

        openWixAppsSiteMustBeSaved: function () {
            this._createFloatingDialog(
                '_mustSaveBeforeEditingWixAppsData',
                'wixapps.integration.components.editor.SaveBeforeDataEditingDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {
                },
                {
                    width: 700,
                    minHeight: 150,
                    position: Constants.DialogWindow.POSITIONS.TOP,
                    allowScroll: true,
                    allowDrag: false,
                    buttonSet: this.DialogButtonSet.NONE
                },
                null, true, null, false, true
            );
        },
        openDataSelectionDialog: function (targetComp) {
            this._createAndOpenWDialog(
                '_dataSelectorDialog',
                'wixapps.integration.components.editor.DataSelectionDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(targetComp);
                },
                {
                    width: 400,
                    minHeight: 150,
                    maxHeight: 500,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: true,
                    allowDrag: false,
                    buttonSet: this.DialogButtonSet.OK
                },
                false, null, false, true
            );
        },
        openZoomCustomizer: function (targetComp, zoomData) {
            this._createAndOpenWDialog(
                '_zoomCustomizer',
                'wixapps.integration.components.editor.ZoomCustomizer',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(targetComp, zoomData);
                },
                {
                    width: 300,
                    minHeight: 150,
                    maxHeight: 500,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    allowScroll: true,
                    allowDrag: false,
                    transparentModal: true,
                    buttonSet: this.DialogButtonSet.OK
                },
                null, true, null, false, false
            );
        },
        openAppPartDialog: function (appPartData, dialogTitle) {
            this._createAndOpenWDialog(
                '_appPartDialog',
                'wixapps.integration.components.editor.AppPartDialog',
                'wixapps.integration.skins.editor.AppPartDialogSkin',
                function (innerLogic) {
                    innerLogic.setDialogOptions(dialogTitle);
                },
                {
                    width: 800,
                    minHeight: 700,
                    maxHeight: 700,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: true,
                    allowDrag: false,
                    modal: true,
                    buttonSet: this.DialogButtonSet.OK
                },
                appPartData, true, null, false, false
            );
        },

        openExperimentsDialog: function () {
            this._createAndOpenWDialog(
                '_experimentsDialog',
                'wysiwyg.editor.components.dialogs.ExperimentsDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {
                }, {
                    title: 'Experiments Control Panel',
                    width: 700,
                    minHeight: 300,
                    maxHeight: 600,
                    position: Constants.DialogWindow.POSITIONS.TOP,
                    allowScroll: true,
                    allowDrag: false,
                    modal: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL
                }, null, true, null, true, false, true);
        },

        openAviaryDialog: function (params) {

            this._createAndOpenWDialog(
                '_aviaryDialog',
                'wysiwyg.editor.components.dialogs.AviaryDialog',
                'wysiwyg.editor.skins.dialogs.AviaryDialogSkin',
                function (innerLogic) {
                }, {
                    width: 850, //TODO: Override by AviaryDialog
                    minHeight: 550, //TODO: Override by AviaryDialog
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    modal: true,
                    allowDrag: false,
                    buttonSet: this.DialogButtonSet.NONE,
                    title: W.Resources.get('EDITOR_LANGUAGE', 'AVIARY_TITLE', 'Edit an Image')
                    //                    helplet     : 'Aviary'
                }, null, true, params, false, true, true
            );
        },

        isDialogOpen: function (dialogIdentifier) {
            if (this[dialogIdentifier] && this[dialogIdentifier].getParent()) {
                return true;
            }
            return false;
        },

        closeDialogById: function (dialogIdentifier, buttonId) {
            if (this.isDialogOpen(dialogIdentifier)) {
                this[dialogIdentifier].getLogic && this[dialogIdentifier].getLogic().endDialog(buttonId);
                return true;
            }
            return false;
        },

        /*
         *
         * merge of Notification dialog experiment by LeoniJ
         *
         *
         * */

        //The icon declaration should be as:  var icon = { url:'icons/980-right.png', x: 0, y: 0, width: 95, height: 84 };
        openNotificationDialog:function(dialogName, title, description, notificationWidth, notificationMinHeight, icon, showAgainSelection, helpletID, marginOfViolations, okButtonCallback, okButtonTitle) {

            if(typeOf(dialogName)!=="string" || typeOf(dialogName)===""){
                return null;
            }
            if(!this._isNotificationDialogCanBeShownAgain(dialogName, marginOfViolations, showAgainSelection)){
                return this.getNotificationDialogByName(dialogName);
            }
            var dialogParams = {};
            if(helpletID){
                dialogParams["helpletID"] = helpletID;
            }
            if(icon){
                dialogParams["icon"] = icon;
            }
            if(description){
                dialogParams["description"] = description;
            }
            if(showAgainSelection){
                dialogParams["setShowAgainStatusCallBack"] = this.setNotificationDialogShowAgainStatus;
            }
            if(okButtonCallback){
                dialogParams['okButtonCallback'] = okButtonCallback;
            }
            if(!okButtonTitle){
                okButtonTitle = this.DialogButtonSet.OK;
            }
            dialogParams["dialogName"] = dialogName;
            dialogParams["notificationWidth"] = notificationWidth;
            var isFromCache = this._isDialogShouldBeShownFromCache(dialogName, dialogParams);
            var dialog = this._createAndOpenWDialog(
                '_saveSuccessDialogHide',
                'wysiwyg.editor.components.dialogs.NotificationDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {},
                {
                    width:notificationWidth,
                    minHeight:notificationMinHeight,
                    allowScroll:false,
                    allowDrag:false,
                    position:Constants.DialogWindow.POSITIONS.CENTER,
                    title:W.Resources.get('EDITOR_LANGUAGE', title),
                    buttonSet  : [{label:okButtonTitle, align:Constants.DialogWindow.BUTTON_ALIGN.RIGHT}]
                },
                null, true, dialogParams, false, isFromCache);
            dialogParams["dialog"] = dialog;
            this._updateListOfDialogs(dialogName, dialogParams);
            return dialog;
        },

        setNotificationDialogShowAgainStatus: function (dialogName, showAgain) {
            if (this._listOfDialogs[dialogName]) {
                this._listOfDialogs[dialogName].showAgain = showAgain;
            }

            if (!showAgain && dialogName === 'SaveSuccessDialog') {
                LOG.reportEvent(wixEvents.SAVE_SUCCESS_DONT_SHOW_AGAIN_CHECKED);
            }
            if (!showAgain && dialogName === '_publishWebsiteShareDialog') {
                LOG.reportEvent(wixEvents.PROMOTE_DIAOLOG_DONT_SHOW_AGAIN_CHECKED);
            }
        },

        getNotificationDialogByName: function (dialogName) {
            if (this._listOfDialogs[dialogName] && this._listOfDialogs[dialogName].params) {
                return this._listOfDialogs[dialogName].params.dialog;
            }
            return null;
        },

        _isNotificationDialogCanBeShownAgain: function (dialogName, marginOfViolations, showAgainSelection) {
            if (!this._shouldBeShownAfterNumberOfViolations(marginOfViolations)) {
                return false;
            }
            if (typeOf(showAgainSelection) === "boolean" && showAgainSelection === true &&
                this._listOfDialogs[dialogName] && typeOf(this._listOfDialogs[dialogName].showAgain) === "boolean") {
                return this._listOfDialogs[dialogName].showAgain;
            }
            return true;
        },

        _isDialogShouldBeShownFromCache: function (dialogName, dialogParams) {
            if (dialogName !== this._lastDialogName) {
                return false;
            }
            if (this._listOfDialogs[dialogName]) {
                return this._isEqualDialogParams(dialogParams, this._listOfDialogs[dialogName].params);
            }
            return false;
        },

        _shouldBeShownAfterNumberOfViolations: function (marginOfViolations) {
            if (typeOf(marginOfViolations) !== "number") {
                return true;
            }
            this._violationsCounter++;
            if (this._violationsCounter > 0 && this._violationsCounter < marginOfViolations) {
                return false;
            }
            else if (this._violationsCounter >= marginOfViolations) {
                this._violationsCounter = 0;
            }
            return true;
        },

        _isEqualDialogParams: function (params1, params2) {
            if (typeOf(params1) !== "object" || typeOf(params2) !== "object") {
                if (params1 !== params2) {
                    return false;
                }
            }
            else {
                for (var s in params1) {
                    if (this._isEqualDialogParams(params1[s], params2[s]) === false) {
                        return false;
                    }
                }
            }
            return true;
        },

        _updateListOfDialogs: function (dialogName, params) {
            this._listOfDialogs[dialogName] = {params: params};
            this._lastDialogName = dialogName;
        },

        _cleanListOfDialogs: function () {
            this._listOfDialogs = {};
            this._lastDialogName = "";
            this._violationsCounter = -1;
        },

        openPageSelectionDialog: function (allowedAppPages, okCallback) {
            this._createAndOpenWDialog(
                '_appPageSelectorDialog',
                'wixapps.integration.components.editor.PageSelectionDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                },
                {
                    width: 400,
                    minHeight: 150,
                    maxHeight: 500,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    allowDrag: true,
                    buttonSet: this.DialogButtonSet.OK_CANCEL
                }, null, true, {
                    'allowedAppPages': allowedAppPages,
                    'okCallback': okCallback
                }, true, false, true
            );
        },

        openCharacterSetsDialog: function () {
            this._createAndOpenWDialog(
                '_characterSetsDialog',
                'wysiwyg.editor.components.dialogs.LanguageSupportDialog',
                'wysiwyg.editor.skins.dialogs.LanguageSupportDialogSkin',
                function () {
                }, {
                    title: W.Resources.get('EDITOR_LANGUAGE', 'LANGUAGE_SUPPORT_TITLE', 'Language Support'),
                    width: 375,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    allowDrag: true,
                    modal: true,
                    buttonSet: this.DialogButtonSet.OK
                }, null, true, null, true, false, true);
        },

        openMobileWelcomeDialog: function (params) {
            params = params || {};

            var dialogId = "_mobileWelcomeDialog";

            if (this.dialogWasShownAlready(dialogId)) {
                return;
            }

            this._createFloatingDialog(
                dialogId,
                'wysiwyg.editor.components.dialogs.MobileWelcomeDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {
                }, {
                    width: 650,
                    minHeight: 150,
                    position: Constants.DialogWindow.POSITIONS.TOP,
                    allowScroll: true,
                    allowDrag: false,
                    buttonSet: this.DialogButtonSet.NONE

                }, null, true, params, false, false, true);
        },

        dialogWasShownAlready: function (dialogId) {
            var editorPrefs = W.Editor.getEditorPreferences();
            var dialogsToHide = editorPrefs.get("dontShowAgainDialogs");
            var wasShown = dialogsToHide.contains(dialogId);

            if (wasShown) {
                return true;
            } else {
                dialogsToHide.include(dialogId);
                editorPrefs.fireDataChangeEvent();
                return false;
            }
        },

        openItunesDialog: function (params) {
            var dialog = this._createAndOpenWDialog(
                params.dialogId,
                'wysiwyg.editor.components.dialogs.ItunesDialog',
                'wysiwyg.editor.skins.dialogs.ItunesDialogSkin',
                function () {
                },
                {
                    width: params.width,
                    maxHeight: params.height,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    nonModal: params.nonModal !== false,
                    allowDrag: true,
                    title: params.title,
                    description: params.description,
                    buttonSet: this.DialogButtonSet.NONE,
                    dialogSkin: params.dialogSkin
                },
                null, true, params, false, true);

            return dialog;
        },

        openSpotifySearchDialog: function (params) {
            var dialog = this._createAndOpenWDialog(
                params.dialogId,
                'wysiwyg.editor.components.dialogs.SpotifySearchDialog',
                'wysiwyg.editor.skins.dialogs.SpotifySearchDialogSkin',
                function () {
                },
                {
                    width: params.width,
                    maxHeight: params.height,
                    position: Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: false,
                    nonModal: params.nonModal !== false,
                    allowDrag: true,
                    title: params.title,
                    description: params.description,
                    buttonSet: this.DialogButtonSet.NONE,
                    dialogSkin: params.dialogSkin
                },
                null, true, params, false, false);

            return dialog;
        },

		openVideoSearchDialog: function (params) {
			var dialog = this._createAndOpenWDialog(
				params.dialogId,
				'wysiwyg.editor.components.dialogs.VideoSearchDialog',
				'wysiwyg.editor.skins.dialogs.VideoSearchDialogSkin',
				function () {
				},
				{
					width: params.width,
					maxHeight: params.height,
					position: Constants.DialogWindow.POSITIONS.CENTER,
					allowScroll: false,
					nonModal: params.nonModal !== false,
					allowDrag: true,
					title: params.title,
					description: params.description,
					buttonSet: this.DialogButtonSet.NONE,
					dialogSkin: params.dialogSkin
				},
				null, true, params, false, false);

			return dialog;
		},

        openAnimationDialog: function(params) {
            var dialog = this._createAndOpenWDialog(
                'AnimationDialog',
                'wysiwyg.editor.components.dialogs.AnimationDialog',
                'wysiwyg.editor.skins.panels.AdvancedStylingSkin',
                function() {
                },
                {
                    minHeight  : 300,
                    maxHeight  : 600,
                    width      : 300,
                    semiModal  : true,
                    title      : W.Resources.get('EDITOR_LANGUAGE', 'ANIMATION_DIALOG_TITLE'),
                    description: W.Resources.get('EDITOR_LANGUAGE', 'ANIMATION_DIALOG_DESCRIPTION'),
                    position   : Constants.DialogWindow.POSITIONS.SIDE,
                    allowScroll: false,
                    allowDrag  : true,
                    buttonSet  : this.DialogButtonSet.OK_CANCEL,
                    helplet    : 'ANIMATION_DIALOG',
                    level      : 2
                },
                null, true, params, false, false, true);

            return dialog;
        },

        openFeedbackDialog: function(params){
            LOG.reportEvent(wixEvents.OPEN_FEEDBACK_PANEL);
            params = params || {};

            var browserWidth = window.document.body.clientWidth,
                left = browserWidth - 370;
            var isFromCache = true;
            W.Editor.Comments.showComments();
            W.Editor.Comments.exitViewCommentsMode(false);
            var helpButtonId = 'SIDE_PANEL_feedbackComments';

            this._createAndOpenWDialog(
                'FeedbackDialog',
                'wysiwyg.editor.components.dialogs.FeedbackDialog',
                'wysiwyg.editor.skins.dialogs.FeedbackDialogSkin',
                function (innerLogic) {
                },
                {
                    width:304,
                    height:600,
                    left: left,
                    top: 64,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll:false,
                    nonModal: true,
                    allowDrag:true,
                    title:W.Resources.get('EDITOR_LANGUAGE', 'FEEDBACK_TITLE'),
                    description:W.Resources.get('EDITOR_LANGUAGE', "FEEDBACK_DESCRIPTION"),
                    buttonSet:this.DialogButtonSet.NONE,
                    helpButtonId:helpButtonId,
                    margin: '0px',
                    descriptionStyles: {
                        'padding': '15px 20px',
                        'font-size':'13px',
                        'line-height':'16px'
                    },
                    innerOverflow: 'hidden',
                    innerPadding: '0px'
                },
                null, true, params, false, isFromCache
            );
        },
        openShareFeedbackDialog:function(params) {
            var dialog = this._createAndOpenWDialog(
                params.dialogId,
                'wysiwyg.editor.components.dialogs.ShareFeedbackDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {},
                {
                    width:600,
                    maxHeight:400,
                    position:Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll:false,
                    nonModal:params.nonModal !== false,
                    allowDrag:true,
                    title:W.Resources.get('EDITOR_LANGUAGE', 'SHARE_DIALOG_TITLE'),
                    description:params.description,
                    buttonSet:this.DialogButtonSet.NONE,
                    dialogSkin:params.dialogSkin
                },
                null, true, params, false, false);

            return dialog;
        },
        openSaveBeforeShare:function () {
            this._createFloatingDialog(
                '_mustSaveBeforeShare',
                'wysiwyg.editor.components.dialogs.SaveBeforeShareDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {
                },
                {
                    width:700,
                    minHeight:150,
                    position:Constants.DialogWindow.POSITIONS.TOP,
                    allowScroll:true,
                    allowDrag:false,
                    buttonSet:this.DialogButtonSet.NONE
                },
                null, true, null, false, true
            );
        },
        openAdvanceFontDialog:function(params){
            this._createAndOpenWDialog(
                '_AdvanceFontDialog',
                'wysiwyg.editor.components.dialogs.FontAdvanceStyleDialog',
                'wysiwyg.editor.skins.dialogs.FontAdvanceStyleDialogSkin',
                function(innerLogic){},
                {
                    width       : 338,
                    top         : params.top,
                    left        : params.left,
                    position    : Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll : false,
                    semiModal   : true,
                    allowDrag   : true,
                    buttonSet   : W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    title       : W.Resources.get('EDITOR_LANGUAGE', "FONTADVANCESTYLE_Dialog_Title")
                },
                null, true, params, false, false
            );
        },

        openBackToTopButtonDialog: function(){
            this._createAndOpenWDialog(
                '_backToTopPanel',
                'wysiwyg.editor.components.panels.BackToTopButtonPanel',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function(innerLogic){},
                {
                    width       : 265,
                    position    : Constants.DialogWindow.POSITIONS.SIDE,
                    level       : 1,
                    semiModal   : true,
                    allowDrag   : true,
                    buttonSet   : this.DialogButtonSet.DONE,
                    title       : W.Resources.get("EDITOR_LANGUAGE", "MOBILE_BACK_TO_TOP_BUTTON_PANEL_TITLE"),
                    helpButtonId: "BACK_TO_TOP_LearnMore",
                    helpIcon: true
                },
                null, true, {}, false, false, true);

            LOG.reportEvent(wixEvents.MOBILE_BACK_TO_TOP_BUTTON_OPEN_PANEL);
        },

        openChangeGalleryDialog:function (params) {
            this._createAndOpenWDialog(
                '_changeGalleryDialog',
                'wysiwyg.editor.components.dialogs.ChangeGalleryDialog',
                'wysiwyg.editor.skins.dialogs.ChangeGalleryDialogSkin',
                function (innerLogic) {},
                {
                    width:320,
                    top: 100,
                    left: 200,
                    position:params.position || Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll:false,
                    semiModal:true,
                    allowDrag:true,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CHANGE_GALLERY_TYPE"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CHANGE_GALLERY_DESC"),
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    helplet: '/node/22301'
                },
                null, true, params, false, false
            );
        },

        openRestoreToTemplateConfirmationDialog: function() {
            var dialog = this._createAndOpenWDialog(
                '_restoreToTemplateDialog',
                'wysiwyg.editor.components.panels.RestoreToTemplate',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function (innerLogic) {},
                {
                    width       : 450,
                    position    : Constants.DialogWindow.POSITIONS.CENTER,
                    level       : 1,
                    semiModal   : false,
                    allowDrag   : false,
                    buttonSet   : this.DialogButtonSet.OK_CANCEL,
                    title       : W.Resources.get("EDITOR_LANGUAGE", "USER_PANEL_RESTORE_TO_TEMPLATE_DIALOG_TITLE")
                },
                null, true, {}, false, false, true);
            return dialog ;
        },

        openPagesBackgroundCustomizer: function(params) {
            params                  = params || {} ;
            var learnMoreComp       = null;
            var helpButtonId        = null ;
            var dialogTitle         = this.resources.W.Resources.get('EDITOR_LANGUAGE', "BACKGROUND_EDITOR_CUSTOM_COPY_TITLE") ;
            var dialogDescription   = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_EDITOR_CUSTOM_COPY_DESCRIPTION') ;

            var dialog = this._createAndOpenWDialog(
                '_pagesBackgroundCustomizerDialog',
                'wysiwyg.editor.components.dialogs.PagesBackgroundCustomizer',
                'wysiwyg.editor.skins.dialogs.PagesBackgroundCustomizerSkin',
                function (innerLogic) {},
                {
                    width:280,
                    maxHeight: 180,
                    minHeight: 180,
                    relativeOffset: {x: 100, y: -150},
                    left: -params.relativePosition.x/2,
                    position: Constants.DialogWindow.POSITIONS.RELATIVE,
                    relativePosition: params.relativePosition,
                    allowScroll:false,
                    innerOverflow: 'hidden',
                    semiModal:false,
                    allowDrag:false,
                    title: dialogTitle,
                    description: dialogDescription,
                    buttonSet: W.EditorDialogs.DialogButtonSet.OK_CANCEL,
                    helplet:learnMoreComp,
                    helpButtonId: helpButtonId
                },
                null, true, params, true, false, false
            );
            dialog.$logic.setDialogColorToGray() ;
            return dialog ;
        }
    });
});
