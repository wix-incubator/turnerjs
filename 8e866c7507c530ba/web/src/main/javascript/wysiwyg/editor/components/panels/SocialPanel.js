define.component('wysiwyg.editor.components.panels.SocialPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.resources(['W.Commands']);

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.binds(['_showLearnMore', '_showHelp']);

    def.skinParts({
        panelLabel: { 'type': 'htmlElement'},
        help: { type : 'htmlElement'},
        close: { type : 'htmlElement', command : 'this._closeCommand'},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:"done", command : 'this._closeCommand'},
        content: {type: 'htmlElement'}
    });

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._appType = this.injects().Config.getApplicationType();
        },

        _onAllSkinPartsReady: function() {
            this.parent();
            this._skinParts.panelLabel.set('html', this._translate('SOCIAL'));
        },

        _onCancel : function() {
            this._data.restoreSnapshot();
            this.injects().Commands.executeCommand(this._closeCommand);
        },

        _onSave : function() {
            this.injects().Commands.executeCommand(this._closeCommand);
        },

        _showHelp :function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_Social');
        },

        _createFields: function() {
            this.addTitle(this._translate('SOCIAL_PANEL_FAVICON_THUMBNAIL'), null, 'bold');
            this.addSubLabel(this._translate('SOCIAL_PANEL_THUMBNAIL_DESCRIPTION_NEW'), null);
            this.addImageField(null, 150, 150, this._translate('SOCIAL_PANEL_UPLOAD_THUMBNAIL'), 'picture ', this._translate('IMAGE_REMOVE'), null, null, null, 'social_icons', 'single_icon', null, null, null, null, 'free').bindToRemappedDataFields({'thumbnail' : 'uri'});

            this.addBreakLine('20px');
            this.addTitle(this._translate('SOCIAL_PANEL_FACEBOOK'), null, 'bold');

            this.addInlineTextLinkField(null, this._translate('SOCIAL_PANEL_FACEBOOK_DESCRIPTION'), this._translate('SOCIAL_PANEL_FACEBOOK_LEARN_MORE'))
                .addEvent(Constants.CoreEvents.CLICK, this._showLearnMore);
            this.addBreakLine('20px');


            this.addInputField( this._translate('SOCIAL_PANEL_FACEBOOK_LABEL'),
                this._translate('SOCIAL_PANEL_FACEBOOK_PLACEHOLDER'),
                0 ,
                250,
                {validators: [this._inputValidators.alphanumericAndPeriodValidator]}).bindToField('fbAdminsUserId');
        },

        // will be overriden
        _showLearnMore:function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_SOCIAL_LEARN_MORE');
        }
    });
});

