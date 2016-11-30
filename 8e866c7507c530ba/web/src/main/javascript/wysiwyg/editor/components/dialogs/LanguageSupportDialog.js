define.component('wysiwyg.editor.components.dialogs.LanguageSupportDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Preview', 'W.Commands', 'W.Css']);

    def.binds(['_showHelp', '_onSupportLinkClick', '_onDialogClosed', '_onLangChange', '_onCopyrightsLinkClick']);

    def.skinParts({
        content: { type: 'htmlElement' },
        headerText: { type: 'htmlElement', autoBindDictionary: 'LANGUAGE_SUPPORT_HEADER' },
        copyrightText: { type: 'htmlElement', autoBindDictionary: 'LANGUAGE_SUPPORT_FONTS_COPYRIGHTS_TEXT' },
        copyrightLink: { type : 'wysiwyg.editor.components.WButton', autoBindDictionary: 'LANGUAGE_SUPPORT_FONTS_COPYRIGHTS_LINK' },
        copyrightSuffix: {type: 'htmlElement', autoBindDictionary: 'LANGUAGE_SUPPORT_FONTS_COPYRIGHTS_SUFFIX' },
        footerText: { type: 'htmlElement', autoBindDictionary: 'LANGUAGE_SUPPORT_FOOTER' },
        supportLink: { type : 'wysiwyg.editor.components.WButton', autoBindDictionary: 'LANGUAGE_SUPPORT_WISHLIST_LINK_TEXT' }
    });

    def.statics({
        copyrightsUrl: '//static.parastorage.com/server/misc/editor_docs/Copyrights.pdf'
    });

    def.dataTypes(['']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._cssManager = this.resources.W.Css;
            this._currentCharacterSets = this._cssManager.getCharacterSets();
            this._requiredCharacterSets = {};
            _.forEach(this._currentCharacterSets,function(setName){
                this._requiredCharacterSets[setName] = true;
            },this);
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosed);
        },

        _createFields: function(){
            var iconObj = {
                path: 'languages/langs_sprite_1.png',
                width: '72px',
                height: '18px'
            };
            var self = this;
            //Latin is default so no need for add fonts logic
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_LATIN_LABEL'), 'latin', _.extend(iconObj, {position: '0 0'}), 'Language_Support_Latin_ttid')
                .runWhenReady(function(logic){
                    logic.setState('notSelectable','selectable');
                });
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_LATIN_EXT_LABEL'), 'latin-ext',_.extend(iconObj, {position: '-15px -46px'}), 'Language_Support_Latin_Extended_ttid')
                .setValue(_.contains(this._currentCharacterSets, 'latin-ext')).addEvent('inputChanged', self._onLangChange);
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_CYRILLIC_LABEL'), 'cyrillic',_.extend(iconObj, {position: '-15px -19px'}), 'Language_Support_Cyrillic_ttid')
                .setValue(_.contains(this._currentCharacterSets, 'cyrillic')).addEvent('inputChanged', self._onLangChange);
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_JAPANESE_LABEL'),'japanese', _.extend(iconObj, {position: '-15px -123px'}), '')
                .setValue(_.contains(this._currentCharacterSets, 'japanese')).addEvent('inputChanged', self._onLangChange);
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_KOREAN_LABEL'), 'korean',_.extend(iconObj, {position: '-15px -96px'}), '')
                .setValue(_.contains(this._currentCharacterSets, 'korean')).addEvent('inputChanged', self._onLangChange);
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_ARABIC_LABEL'), 'arabic',_.extend(iconObj, {position: '-15px -150px'}), '')
                .setValue(_.contains(this._currentCharacterSets, 'arabic')).addEvent('inputChanged', self._onLangChange);
            this.addLanguageSelectionField(this._translate('LANGUAGE_SUPPORT_HEBREW_LABEL'), 'hebrew',_.extend(iconObj, {position: '-15px -70px'}), '')
                .setValue(_.contains(this._currentCharacterSets, 'hebrew')).addEvent('inputChanged', self._onLangChange);
        },


        _onAllSkinPartsReady : function() {
            this._skinParts.help.addEvent(Constants.CoreEvents.CLICK, this._showHelp);
            this._skinParts.supportLink.addEvent(Constants.CoreEvents.CLICK, this._onSupportLinkClick);
            this._skinParts.copyrightLink.addEvent(Constants.CoreEvents.CLICK, this._onCopyrightsLinkClick);
        },

        _onCopyrightsLinkClick: function(event){
            window.open(this.copyrightsUrl);
        },

        _showHelp: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'LANGUAGE_SUPPORT_DIALOG');
        },

        _onSupportLinkClick : function() {
            window.open(this._translate('LANGUAGE_SUPPORT_WISHLIST_LINK_URL'));
        },

        _onLangChange: function(event){
            var lang = event.compLogic.getLang();
            this._requiredCharacterSets[lang] = !!(event.value);
        },

        _handleCharacterSetChange: function(setID, add){
            var biEventPayload = {'c1': setID};
            var wixBiEvent;

            if(add) {
                // Update value
                wixBiEvent = _.contains(this._cssManager.getCharacterSets(),setID) ? undefined : wixEvents.CHARACTER_SET_ADDED;
                this._cssManager.addCharacterSets(setID);
            } else {
                // Update value
                wixBiEvent = (!_.contains(this._cssManager.getCharacterSets(),setID)) ? undefined : wixEvents.CHARACTER_SET_REMOVED;
                this._cssManager.removeCharacterSets(setID);
            }
            // Report BI event
            if (wixBiEvent){
                LOG.reportEvent(wixBiEvent, biEventPayload);
            }
        },

        _onDialogClosed: function(event){
            if (event.result.toLowerCase() === "ok"){
                _.forOwn(this._requiredCharacterSets, function(add,setID){
                    this._handleCharacterSetChange(setID, add);
                },this);
            }
        }

    });

});