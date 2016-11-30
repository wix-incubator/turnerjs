define.experiment.component('wysiwyg.editor.components.panels.FontsPanel.UploadFonts', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.skinParts({
        content : { type : 'htmlElement'},
        customize : {
            type : 'wysiwyg.editor.components.WButton',
            autoBindDictionary:'FONTS_DESIGN_CUSTOMIZE',
            command : 'WEditorCommands.CustomizeFonts',
            commandParameter : {source: 'fontsPanel'}
        },
        uploadBtn : {type : 'wysiwyg.editor.components.WButton', autoBindDictionary:'FONTS_DESIGN_UPLOAD', command : 'WEditorCommands.OpenMediaFrame', commandParameter : {
            galleryConfigID: 'fonts',
            publicMediaFile: 'fonts',
            i18nPrefix: 'font',
            selectionType: 'manager',
            mediaType: 'ufonts'
        }},
        languagesBtn : {
            type : 'wysiwyg.editor.components.WButton',
            autoBindDictionary:'FONTS_DESIGN_LANGUAGES',
            command : 'WEditorCommands.OpenCharacterSetsDialog',
            commandParameter : {source: 'fontsPanel'}
        },
        cancel : {type : 'wysiwyg.editor.components.WButton', autoBindDictionary:'DISCARD_CHANGES'},
        actions : {type : 'htmlElement'},
        beforeHelp : { type : 'htmlElement'}
    });

    def.binds(strategy.merge(['_onFontUploadPanelClose']));

    def.resources(strategy.merge(['W.Css']));

    def.methods({
        _onFontUploadPanelClose: function(payload){
            this.resources.W.Css.updateUserFonts(payload);
        },
		
		_onAllSkinPartsReady:strategy.after(function() {
            var commandParameter = this._skinParts.uploadBtn.getCommandParameter();
            commandParameter.callback = this._onFontUploadPanelClose;
			this._skinParts.uploadBtn.setCollapsed(false);
		})
    });

});