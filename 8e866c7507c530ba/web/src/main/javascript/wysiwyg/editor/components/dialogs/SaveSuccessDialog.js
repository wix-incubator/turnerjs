define.component('wysiwyg.editor.components.dialogs.SaveSuccessDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Commands', 'W.Editor', 'W.Resources']);
    def.binds(['_onPreviewClick', '_onContinueEditingClick', '_onPublishNowClick', '_onSiteLoaded', '_onDialogClosing']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.statics({
        ACTIONS: {
            publish: "publish",
            preview: "preview",
            edit: "edit",
            defaultAction : "edit"
        }
    });
    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._dialogWindow = attr.dialogWindow;
            this._siteType = this.injects().Config.getApplicationType();

            this.resources.W.Commands.registerCommandListenerByName('EditorCommands.SiteLoaded', this, this._onSiteLoaded);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            this._nextAction = this.ACTIONS.defaultAction;
        },

        _onSiteLoaded: function () {
            this.buttonLogic.enable();
        },

        _onAllSkinPartsReady: function () {
            this.parent();
        },

        _createFields: function () {
            var panel = this;
            this.setSkinSet('FLOATING_DIALOG');

            var mainLabel = (this._siteType == Constants.WEditManager.SITE_TYPE_WEB) ? this._translate('SAVE_SUCCESS_MAIN_LABEL_WEB')
                : this._translate('SAVE_SUCCESS_MAIN_LABEL_FB');

            this.addLabel(mainLabel, null, null, 'icons/save_publish.png', {x: "-2px", y: "-28px"}, {width: '30px', height: '30px'});

            this._addSaveSuccessBodyText();

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                this.addBreakLine('30px');


                //var publishSiteLabel = (this._siteType == Constants.WEditManager.SITE_TYPE_WEB) ? W.Resources.get('EDITOR_LANGUAGE', 'SAVE_SUCCESS_PUBLISH_BUTTON_WEB')
                //    : W.Resources.get('EDITOR_LANGUAGE', 'SAVE_SUCCESS_PUBLISH_BUTTON_FB');

                this.addButtonField("", W.Resources.get('EDITOR_LANGUAGE', 'OK_BUTTON'), null, null, 'blue', "60px")
                    .addEvent(Constants.CoreEvents.CLICK, panel._onContinueEditingClick)
                    .runWhenReady(function (buttonLogic) {
                        buttonLogic.disable();
                        panel.buttonLogic = buttonLogic;

                        //this condition is in case that the site was loaded before the registration to the siteLoaded command:
                        var siteLoadedCommand = panel.injects().Commands.getCommand('EditorCommands.SiteLoaded');
                        if (siteLoadedCommand && siteLoadedCommand.getNumTimesExecuted() > 0) {
                            buttonLogic.enable();
                        }

                    });


                //this.addInlineTextLinkField("","",W.Resources.get('EDITOR_LANGUAGE', 'SAVE_SUCCESS_CONTINUE_EDIT_BUTTON'),"")
                //    .addEvent(Constants.CoreEvents.CLICK, panel._onContinueEditingClick);


            }, 'skinless', null, null, null, 'right');
        },

        _addSaveSuccessBodyText: function () {
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addSubLabel(panel._translate('SITE_SUCCESS_NOTE'));
                this.addBreakLine('10px');

                var prefixText  = panel._translate('SITE_SUCCESS_DIALOG_DESCRIPTION1');
                var buttonLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SITE_SUCCESS_DIALOG_DESCRIPTION2');
                var postfixText = "." + this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SITE_SUCCESS_DIALOG_DESCRIPTION3');

                this.addInlineTextLinkFieldWithoutSpaces(prefixText, buttonLabel, postfixText, true, false)
                    .addEvent(Constants.CoreEvents.CLICK, panel._onPublishNowClick);

                this.addSubLabel(panel._translate('SITE_SUCCESS_DIALOG_DESCRIPTION4'));
            }, 'skinless', null, null, null, 'left');
        },

        _onPreviewClick: function (event) {
            this._nextAction = this.ACTIONS.preview;
            this.injects().Commands.executeCommand('WEditorCommands.WSetEditMode', {editMode: this.resources.W.Editor.EDIT_MODE.PREVIEW});
            this._dialogWindow.endDialog();
        },

        _onContinueEditingClick: function (event) {
            this._nextAction = this.ACTIONS.edit;
            this._dialogWindow.endDialog();
        },

        _onPublishNowClick: function () {
            this._nextAction = this.ACTIONS.publish;
            this.injects().Commands.executeCommand('WEditorCommands.OpenPublishDialog');
            this._dialogWindow.endDialog();
            LOG.reportEvent(wixEvents.PUBLISH_NOW_SAVE_SUCCESS);
        },
        _onDialogClosing: function(){
            var action = {};
            action[this._nextAction] = true; //this way makes it easier for someone listening to the command to check what it is... i.e. if(action.edit || action.publish)
            W.Commands.executeCommand("FirstSaveProcess.End", action);
            this._nextAction = this.ACTIONS.defaultAction ;
        },
        dispose: function(){
            this._dialogWindow.removeEvent('onDialogClosing', this._onDialogClosing);
            this.parent();
        }
    });

});
