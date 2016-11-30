define.experiment.component('wysiwyg.editor.components.dialogs.SaveSuccessDialog.FloatingSkinForSaveNotice', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({

        _createFields: function () {
            var panel = this;
            this.setSkinSet('FLOATING_DIALOG');

            var mainLabel = (this._siteType == Constants.WEditManager.SITE_TYPE_WEB) ? this._translate('SAVESUCCESSDIALOG_TITLE')
                : this._translate('SAVE_SUCCESS_MAIN_LABEL_FB');

            this.addLabel(mainLabel, null, null, 'icons/save_publish.png', {x: '-2px', y: '-28px'}, {width: '30px', height: '30px'});
            this.addBreakLine('10px');

            this._addSaveSuccessBodyText();

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                this.addBreakLine('25px');

                this.addButtonField('', this._translate('SAVESUCCESSDIALOG_OK_BUTTON'), null, null, 'blue', '60px')
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

            }, 'skinless', null, null, null, 'right');
        },

        _addSaveSuccessBodyText: function () {
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                var prefixLinkText  = this._translate('SAVESUCCESSDIALOG_PUBLISH_LINK_PREFIX');
                var linkText = this._translate('SAVESUCCESSDIALOG_PUBLISH_LINK');
                var postfixLinkText = this._translate('SAVESUCCESSDIALOG_PUBLISH_LINK_POSTFIX');

                this.addInlineTextLinkFieldWithoutSpaces(prefixLinkText, linkText, '.', true, false)
                    .addEvent(Constants.CoreEvents.CLICK, panel._onPublishNowClick);

                this.addBreakLine('3px');

                this.addSubLabel(postfixLinkText);
            }, 'skinless', null, null, null, 'left');
        }
    });

});
