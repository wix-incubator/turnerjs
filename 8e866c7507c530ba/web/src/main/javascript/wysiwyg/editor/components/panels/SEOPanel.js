define.component('wysiwyg.editor.components.panels.SEOPanel', function(componentDefinition) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.skinParts({
        panelLabel: { 'type': 'htmlElement', autoBindDictionary: 'SEO_TITLE'},
        help: { type : 'htmlElement'},
        close: { type : 'htmlElement', command : 'this._closeCommand'},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:"done", command : 'this._closeCommand'},
        content: {type: 'htmlElement'}
    });
    def.resources(['W.Commands', 'W.Resources']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._charactersValidator = this._inputValidators.charactersValidator;
            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
        },

        _onAllSkinPartsReady: function(compId, viewNode, args){
            this.parent();
            this.getDataItem().addEvent(Constants.DataEvents.DATA_CHANGED, this._onDataChanged.bind(this));
        },

        _createFields: function(){
            this._createPanelTitleAndDescription();
            this._createSearchEnginesSelection();
            this._createSeoLabels();
            this._createSeoToolTip();
            this._createAdvancedSettings();
        },

        _createPanelTitleAndDescription:function(){
            this.addBreakLine('15px');
            this.addSubLabel(W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_DESCRIPTION'));
        },

        _createSearchEnginesSelection:function(){
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(2, "5px");
                this.addCheckBoxImageField(null, null, "icons/toggle_on_off_sprite.png", {w: 48, h: 23}, "noHover")
                    .bindToField('allowSEFindSite')
                    .addEvent('inputChanged', panel._seoChecked);
                this.addLabel(this._translate('SEO_PANEL_ALLOW_SE_FIND_MY_SITE'), {'height': '20px', 'font-size': '14px', 'color': '#686868'}, null, null, null, null);
            }, 'skinless');
            this.addBreakLine('10px', '1px solid #D6D5C3', '10px');
        },

        _createSeoLabels:function(){
            this._createSeoTitle();
            this._createSeoDescription();
            this.addInputField(W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_KEYWORD_LABEL'), "", undefined, Constants.Page.KEYWORD_SEO_MAX_LENGTH, {validators: [this._charactersValidator]}, null, "Settings_SEO_Keywords_ttid").bindToField('keywordsSEO');
        },

        _createSeoToolTip:function(){
            this._initlearnMoreGroup();
            this._initSeoTipGroup();
            this._showSeoTipOrLearnMoreGroup();
        },

        _createAdvancedSettings:function(){
            this.addBreakLine('10px');
            this.addInlineTextLinkField(null, null, this._translate('SEO_PANEL_TT_ADVANCED_SETTINGS'))
                .addEvent('click', this._openAdvancedSeoSettings);
        },

        _openAdvancedSeoSettings:function(){
            LOG.reportEvent(wixEvents.ADVANCED_SEO_SETTINGS_OPENED);
            W.EditorDialogs.openAdvancedSeoSettings();
        },

        _createSeoTitle: function () {
            this.addInputField(W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_SITE_TITLE_LABEL'), "", undefined, Constants.Page.TITLE_SEO_MAX_LENGTH, {validators: [this._htmlCharactersValidator]}, null, "Settings_SEO_Site_Title_ttid").bindToField('siteTitleSEO');
        },

        _createSeoDescription: function () {
            this.addTextAreaField(W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_SITE_DESCRIPTION_LABEL'),
                null,
                null,
                Constants.Page.DESCRIPTION_SEO_MAX_LENGTH,
                {validators: [this._htmlCharactersValidator]},
                null,
                "Settings_SEO_Site_Description_ttid")
                .bindToField('siteDescriptionSEO');
        },

        _addAdvancedSettings:function(){
            // to be overridden
        },

        _addToolTip:function(){
            this._initlearnMoreGroup();
            this._initSeoTipGroup();
            this._showSeoTipOrLearnMoreGroup();
        },

        _initlearnMoreGroup : function(){
            this._learnMoreBtnGroupProxy = this.addInputGroupField(function(panel){
                this.addButtonField("", W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_LEARN_MORE')).addEvent('click',panel._showHelp);
            }, 'skinless');
        },

        _initSeoTipGroup : function(){
            var that = this;
            this.addBreakLine('5px');
            this._seoTipGroupProxy = this.addInputGroupField(function(){
                this.addBreakLine('5px');
                this.addTitle(W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_IMPROVE_YOUR_SEO'), null, 'bold').runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '0px', 'margin-top': '-12px', 'padding': '.2em 0', 'font-size': '18px'});
                });
                this.addButtonField(null, W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_USE_WIX_SEO_WIZARD'))
                    .addEvent(Constants.CoreEvents.CLICK, that._openPromoteLink)
                    .runWhenReady(function(logic){
                        logic._skinParts.button._view.setStyles({'margin-left': '25px', 'margin-right': '25px'});
                    });
                this.addSubLabel(W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_NOTE_PUBLISH_CHANGES_BEFORE_USING_SEO')).runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '0px'});
                });
            }, null, null, null, null, 'center');
        },

        _onDataChanged : function(e){
            this._showSeoTipOrLearnMoreGroup();
        },

        _showSeoTipOrLearnMoreGroup : function(){
            if(this._isSeoTipAllowed()){
                this._showSeoTipGroup();
            }
            else {
                this._showLearnMoreGroup();
            }
        },

        _showSeoTipGroup : function(){
            this._switchInputGroupCollapse(this._seoTipGroupProxy, false);
            this._switchInputGroupCollapse(this._learnMoreBtnGroupProxy, true);
        },

        _showLearnMoreGroup : function(){
            this._switchInputGroupCollapse(this._seoTipGroupProxy, true);
            this._switchInputGroupCollapse(this._learnMoreBtnGroupProxy, false);
        },

        _switchInputGroupCollapse : function(inputGroup, collapse){
            if(collapse == true){
                inputGroup.runWhenReady(function(inputGroupComp) {
                    inputGroupComp.collapseGroup();
                });
            }
            else {
                inputGroup.runWhenReady(function(inputGroupComp) {
                    inputGroupComp.uncollapseGroup();
                });
            }
        },

        _isSeoTipAllowed : function(){
            var isPublished = this.injects().Editor.getEditorStatusAPI().isPreviouslyPublished();
            return (isPublished===true && this.getDataItem().get('allowSEFindSite'));
        },

        _showHelp : function() {
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_SEO');
        },

        _seoChecked : function(e){
            LOG.reportEvent(wixEvents.SEO_CHECKED_IN_SEO_PANEL, {c1: 'SeoPanel', i1: !!e.value});
        },

        _isSelectedLangAllowed: function(){
            var selectedLang = window.wixEditorLangauge;
            return (selectedLang==="en" || selectedLang==="es");
        },

        _openPromoteLink:function(){
            var selectedLang = window.wixEditorLangauge;
            if(selectedLang!=='es' && selectedLang!=='pt'){
                selectedLang = 'en';
            }
            var url = 'http://www.wix.com/seowizard/promote/' + selectedLang + '?sitename=' + window.editorModel.metaSiteData.siteName;
            url = url.toLowerCase();
            window.open(url, '_blank');
        }
    });
});
