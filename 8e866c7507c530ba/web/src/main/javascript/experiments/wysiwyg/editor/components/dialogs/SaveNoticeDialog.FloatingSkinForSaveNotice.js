define.experiment.newComponent('wysiwyg.editor.components.dialogs.SaveNoticeDialog.FloatingSkinForSaveNotice', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onPublishNowClick', '_closeDialog', '_onDontShowAgainCheckboxChange', '_addDialogBody']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this._dialogName = args.dialogName;
            this._setShowAgainStatusCallBack = args.setShowAgainStatusCallBack;
        },

        _createFields: function () {
            this.setSkinSet('FLOATING_DIALOG');
            this._addDialogHeader();
            this._addDialogBody();
            this._addDialogFooter();
        },

        _addDialogHeader: function() {
            var label = this._translate('SAVENOTICEDIALOG_TITLE');
            this.addLabel(label, null, null, 'icons/save_publish.png', {x: '-2px', y: '-28px'}, {width: '30px', height: '30px'});
            this.addBreakLine('10px');
        },

        _addDialogBody: function () {
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);

                var prefixLinkText  = this._translate('SAVENOTICEDIALOG_PUBLISH_LINK_PREFIX');
                var linkText = this._translate('SAVENOTICEDIALOG_PUBLISH_LINK');

                this.addInlineTextLinkFieldWithoutSpaces(prefixLinkText, linkText, '.', true, false)
                    .addEvent(Constants.CoreEvents.CLICK, panel._onPublishNowClick);

            }, 'skinless', null, null, null, 'left');
        },

        _addDialogFooter: function() {
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addBreakLine('35px');

                this.addCheckBoxField(this._translate('DO_NOT_SHOW_THIS_MESSAGE_AGAIN'))
                    .addEvent('inputChanged', panel._onDontShowAgainCheckboxChange)
                    .runWhenReady( function( labelLogic ) {
                        labelLogic._view.setStyle('float', 'left');
                        labelLogic._view.setStyle('padding-top', '10px');
                    });

                this.addButtonField('', this._translate('OK_BUTTON'), null, null, 'blue', '60px')
                    .addEvent(Constants.CoreEvents.CLICK, panel._closeDialog)
                    .runWhenReady(function (buttonLogic) {
                        buttonLogic.disable();
                        buttonLogic._view.setStyle('float', 'right');

                        //this condition is in case that the site was loaded before the registration to the siteLoaded command:
                        var siteLoadedCommand = panel.injects().Commands.getCommand('EditorCommands.SiteLoaded');
                        if (siteLoadedCommand && siteLoadedCommand.getNumTimesExecuted() > 0) {
                            buttonLogic.enable();
                        }

                    });

            }, 'skinless', null, null, null, 'right');
        },

        _onDontShowAgainCheckboxChange: function(e){
            this._setShowAgainStatusCallBack(this._dialogName, !e.value);
        },

        _onPublishNowClick: function () {
            this.injects().Commands.executeCommand('WEditorCommands.OpenPublishDialog');
            this._closeDialog();
        },

        _closeDialog: function () {
            this._dialogWindow.endDialog();
        }
    });
});