define.component('wysiwyg.editor.components.panels.FaviconAndThumbnailPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.binds(['_onUpgradeClick']);

    def.resources(['W.Commands', 'W.Config']);

    def.skinParts({
        panelLabel: {type: 'htmlElement'},
        help      : {type: 'htmlElement'},
        close     : {type: 'htmlElement', command: 'this._closeCommand'},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary: "done", command: 'this._closeCommand'},
        content   : {type: 'htmlElement'}
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);

            this._appType = this.resources.W.Config.getApplicationType();
            this._initGlobalResources();
        },

        _initGlobalResources: function(){
            this._commands = this.resources.W.Commands;
        },

        //Experiment SocialPanel.New was promoted to feature on Mon Jul 23 14:27:52 IDT 2012
        _onAllSkinPartsReady: function(){
            this.parent();
            this._skinParts.panelLabel.set('html', this._translate('FAVICON_TITLE'));
        },

        _onCancel: function(){
            this._data.restoreSnapshot();
            this._commands.executeCommand(this._closeCommand);
        },

        _onSave: function(){
            this._commands.executeCommand(this._closeCommand);
        },

        _showHelp: function(){
            this._commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_FaviconAndThumbnail');
        },

        //Experiment SocialPanel.New was promoted to feature on Mon Jul 23 14:27:52 IDT 2012
        _createFields: function(){

            if (this._appType === Constants.WEditManager.SITE_TYPE_WEB){
                this.addBreakLine('15px');
                this.addSubLabel(this._translate('FAVICON_PANEL_FAVICON_DESCRIPTION'), null);

                if (this.injects().Config.isPremiumUser()){
                    this._addFavicon();
                } else {
                    this._addUpgradeMessage();
                }
            }
        },

        _addFavicon: function(){

            var buttonText = this._translate('FAVICON_PANEL_CHANGE');
            this._addField( 'wysiwyg.editor.components.inputs.ImageInput', this.getSkinFromSet('ImageInput'), {

                    buttonText: buttonText,
                    galleryConfigID: 'favicon',
                    i18nPrefix: 'favicon',
                    selectionType: 'single',
                    mediaType: 'site_icon',
                    deleteText: this._translate('IMAGE_REMOVE')
                }
            ).bindToRemappedDataFields({'favicon': 'uri'});
        },

        _addUpgradeMessage: function(){
            this.addSubLabel(this._translate('FAVICON_PANEL_UPGRADE_TO_UPLOAD_FAVICON_DESCRIPTION'), null);
            if (_.contains(_.pluck(editorModel.permissionsInfo.loggedInUserRoles, 'role'), 'owner')) {
                this.addButtonField("", this._translate('FAVICON_PANEL_UPGRADE_NOW'), null, null, 'purple').addEvent('click', this._onUpgradeClick);
            }
        },

        _onUpgradeClick: function(){
            this._commands.executeCommand('WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.FAVICON_AND_THUMBNAIL_PANEL});
        }
    });

});
