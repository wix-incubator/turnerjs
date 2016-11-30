/**
 * @Class wysiwyg.editor.components.panels.PageSettingsPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.PageSettingsPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.resources(["W.Data", "W.Commands", "W.EditorDialogs", "W.Resources", "W.Preview", "W.Utils", "W.Editor", "W.Config"]);

    def.binds(['closePanel', '_onDelete', '_onDuplicateButtonClick', '_onSitePageChanged', '_validatePageUrlString', '_onHomepageChange', '_onDelete', '_showHelp', '_createFields', '_onHideFromMenuReady', '_addPageName', '_reportUserInteractionToBI', '_createFieldsFromConfig']);

    def.skinParts({
        panelLabel: { 'type': 'htmlElement', autoBindDictionary: 'PAGE_SETTINGS'},
        help: { type : 'htmlElement'},
        close: { type : 'htmlElement', command : 'this._closeCommand'},
        duplicate : {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:'duplicate'},
        deletePage: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:"delete"},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:"done", command : 'this._closeCommand'},
        content: { type : 'htmlElement'},
        topBar: { type : 'htmlElement'},
        pageActions: { type : 'htmlElement'},
        bottom: { type : 'htmlElement'}
    });

    def.states(['hidden', 'shown']);

    def.fields({
        _closeCommand: null,
        _charactersValidator: null,
        _htmlCharactersValidator: null,

        /**
         * @type {wysiwyg.editor.utils.PageConfiguration}
         */
        _pageConfig: null
    });

    def.methods(/*** @lends wysiwyg.editor.components.panels.PageSettingsPanel.prototype */{
        /**
         *
         * @param compId
         * @param viewNode
         * @param args
         * @constructs
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._closeCommand = args && args.closeCommand;
            this._data = args.data;

            var pageData = this._data.getData();
            this._pageConfigPromise = this.resources.W.Editor.getPageConfigPromise(pageData);

            this._charactersValidator = this._inputValidators.charactersValidator;
            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;

            this._pageNameLogic = null;
            this.addEvent('subPanelOpened', this._selectPageName);
        },

        render : function() {
            this.parent();
            this.setState('hidden');

            var self = this;
            this._pageConfigPromise.then(function (config) {
                self._setButtonVisibility(self._skinParts.deletePage, config.canBeDeleted());
                self._setButtonVisibility(self._skinParts.duplicate, config.canBeDuplicated());

                setTimeout(function() {
                    self.setState('shown');
                }, 0);
            });
        },

        _setButtonVisibility: function(button, condition) {
            if (condition) {
                button.uncollapse();
            }
            else {
                button.collapse();
            }
        },

        _setDuplicateAndDeleteIcons: function(){
            var basePath = W.Config.getServiceTopologyProperty('staticThemeUrlWeb');
            this._skinParts.duplicate.setIcon(basePath + '/editor_web/icons/duplicate-icon.png', {height: 11});
            this._skinParts.deletePage.setIcon(basePath + '/editor_web/icons/delete-icon.png', {height: 11});
        },
        _onAllSkinPartsReady : function() {
            this.parent();
            this._setDuplicateAndDeleteIcons();
            // show/hide in render
            this._skinParts.deletePage.addEvent(Constants.CoreEvents.CLICK, this._onDelete);

            // show/hide in render
            this._skinParts.duplicate.addEvent(Constants.CoreEvents.CLICK,this._onDuplicateButtonClick);

            this._skinParts.help.addEvent(Constants.CoreEvents.CLICK, this._showHelp);

            this._currentPageId = this._data.get('id');

            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetHomepage", this, this._onHomepageChange, null);

            this._skinParts.content.addEvent(Constants.CoreEvents.MOUSE_WHEEL,this.resources.W.Utils.stopMouseWheelPropagation);
        },

        /**
         * overrides BaseComponent
         * this mechanism updates this._uriBeforeChanges this._pageNameBeforeChanges and only upon change in the page, and not just change in a field
         */
        _onDataChange: function(dataItem) {
            this.parent(dataItem);

            if (this._currentPageId != this._data.get('id')) {
                this._currentPageId = this._data.get('id');
                this._uriBeforeChanges = this.getDataItem().get('pageUriSEO');
                this._pageNameBeforeChanges = this.getDataItem().get('title');
            }
        },

        /**
         *
         * @param autoPanelComp
         * @private
         */
        _createSeoTitle: function (autoPanelComp) {
            autoPanelComp.addCustomizableInputField({
                labelText: this._translate('PAGE_SETTINGS_SEO_PAGE_TITLE_LABEL'),
                maxLength: Constants.Page.TITLE_SEO_MAX_LENGTH,
                validatorArgs: {validators: [this._htmlCharactersValidator]},
                toolTip: "Pages_Settings_Page_Title_ttid",
                skinGroup: 'strong',
                stylesForSkinparts: {input: {marginBottom: '10px'}}
            }).bindToField('pageTitleSEO');
        },

        /**
         *
         * @param autoPanelComp
         * @private
         */
        _createSeoDescription: function (autoPanelComp) {
            autoPanelComp.addCustomizableTextArea({
                labelText: this._translate('PAGE_SETTINGS_SEO_SITE_DESCRIPTION_LABEL'),
                height: '3em',
                maxLength: Constants.Page.DESCRIPTION_SEO_MAX_LENGTH,
                validatorArgs: {validators: [this._htmlCharactersValidator]},
                toolTip: "Pages_Settings_Page_Description_ttid",
                stylesForSkinparts: {textarea: {marginBottom: '5px'}}
            }).bindToField('descriptionSEO');
        },
        /**
         *
         * @param autoPanelComp
         * @private
         */
        _createPageSecutrityCheckbox: function(autoPanelComp){
            var pageSecurity = this._data.get("pageSecurity"),
                dialogObject = {
                    dialogHeight: "400",
                    dialogWidth: "280",
                    dialogClass: "wysiwyg.editor.components.panels.PageSecurityPanel",
                    dialogSkin: "wysiwyg.editor.skins.panels.base.AutoPanelSkin",
                    dialogTitle: this._translate('PAGE_SETTINGS_PROTECT_PAGE')
                };

            autoPanelComp.addDialogCheckBoxField(this._translate('PAGE_SETTINGS_PROTECT_PAGE'), "Pages_Settings_Protect_Page_ttid", dialogObject)
                .bindToField("pageSecurity")
                .bindHooks(function inputToData(isChecked) {
                    return {
                        requireLogin: isChecked,
                        passwordDigest: null
                    };
                }, function dataToInput(pageSecurity) {
                    return pageSecurity.requireLogin || pageSecurity.passwordDigest;
                });
        },
        /**
         *
         * @param config
         * @private
         */
        _addPageSecurity: function(config){
            if(!config.canBeProtected()){
                return;
            }
            this.addInputGroupField(function(panel){
                //note: 'this' here is the inputGroup!
                this.addLabel(this._translate('PAGE_SETTINGS_PERMISSIONS_TITLE', 'Page Privacy'), null, 'bold', null, null, null, null, {padding: '0px 0px 0.4em'});
                panel._createPageSecutrityCheckbox(this);
            });
            this.addBreakLine('12px');

        },

        /**
         *
         * @param autoPanelComp
         * @private
         */
        _createNoIndexCheckbox: function (autoPanelComp) {
            var panel = this;
            autoPanelComp.addCheckBoxField(this._translate('PAGE_SETTINGS_NO_INDEX_CHECKBOX'), "Page_Settings_NoIndex_ttid")
                .bindHooks(function(val){
                    var valForBI = val ? 1 : 0;
                    LOG.reportEvent(wixEvents.NO_INDEX_FOR_PAGE, {i1: valForBI, c1: panel._currentPageId});
                    return !val;
                }, function(val){return !val;})//reverse the boolean value, since check by the user means 'add no index', but on server the option indicates 'allow to be indexed'
                .bindToField('indexable');
        },


        /**
         *
         * @param autoPanelComp
         * @private
         */
        _createKeywordInput: function (autoPanelComp) {
            autoPanelComp.addCustomizableInputField({
                labelText: this._translate('PAGE_SETTINGS_SEO_KEYWORDS_LABEL'),
                maxLength: Constants.Page.KEYWORD_SEO_MAX_LENGTH,
                validatorArgs: {validators: [this._charactersValidator, this._inputValidators.numKeywordValidator]},
                toolTip:  "Pages_Settings_Keywords_ttid",
                skinGroup: 'strong',
                stylesForSkinparts: {input: {marginBottom: '16px'}}
            }).bindToField('metaKeywordsSEO');
        },
        _createFields: function () {
            this._pageConfigPromise.then(this._createFieldsFromConfig);
        },

        /**
         * To be overridden in landingpages experiment.
         * @private
         */
        _showLayoutSettings: function(config){},

        /**
         *
         * @param config
         * @private
         */
        _createFieldsFromConfig: function(config){
            this._showBasicSettings(config);
            this._addPageSecurity(config);
            this._showLayoutSettings(config);
            this._showSeoSettings(config);
            this.addPageStyleSelector('CHANGE_PAGE_STYLE', false);
            this.addBackgroundSelector(null, "page_settings");
        },

        /**
         *
         * @returns {string}
         * @private
         */
        _getPageUrl: function(){
            var pageData = this.getDataItem();
            var baseUrl = this.resources.W.Config.getUserPublicUrl();
            if (baseUrl) {
                if (this._currentIsHomepage()) {
                    return baseUrl;
                }
                var pageAddress = pageData.get('pageUriSEO').replace(' ', '-');
                return  baseUrl + '#!' + pageAddress + '/' + pageData.get('id');
            }
            return '';
        },
        /**
         *
         * @param autoPanelComp
         * @private
         */
        _addPageUrlLink: function(autoPanelComp){
            autoPanelComp.addHtmlIslandField(null, null, '<a href="' + this._getPageUrl() + '" target="_blank">' + this._translate('PAGE_SETTINGS_VIEW_THIS_PAGE','View this page') + '</a>', {
                styles: {marginTop: '-8px', width: '125px'},
                toolTip: {
                    id: 'Page_Settings_ViewLivePage_ttid',
                    positionOffset: {left: 50}
                }
            }).runWhenReady(function(island){
                island.$view.addEvent(Constants.CoreEvents.CLICK, function(){
                    LOG.reportEvent(wixEvents.PAGE_SETTINGS_VIEW_PAGE_CLICKED);
                });
            });
            autoPanelComp.addBreakLine('10px');
        },
        /**
         * @param autoPanelComp
         * @private
         */
        _addPageAddress: function(autoPanelComp){
            autoPanelComp.addCustomizableInputField({
                labelText: this._translate('PAGE_SETTINGS_SEO_PAGE_URL_LABEL'),
                maxLength: Constants.Page.NAME_MAX_LENGTH,
                validatorArgs: {validators: [this._inputValidators.pageNameCharactersValidator]},
                toolTip: "Pages_Settings_Page_Address_ttid",
                skinGroup: 'strong',
                stylesForSkinparts: {input: {marginBottom: '10px'}}
            }).bindToField('pageUriSEO')
                .addEvent(Constants.CoreEvents.BLUR, this._validatePageUrlString);
        },
        /**
         *
         * @param config
         * @private
         */
        _showBasicSettings: function(config){
            if(!config.showBasicSettings()){
                return;
            }
            this.addInputGroupField(function(panel){
                //note: 'this' here is the inputGroup!
                panel._addPageName(this);
                panel._addPageAddress(this);
                if(this.resources.W.Editor.getEditorStatusAPI().isPreviouslyPublished()) {
                    panel._addPageUrlLink(this);
                }
                panel._addSetAsHomepageCheckbox(this, config);
                panel._addHideFromMenuCheckbox(this, config);
            });
            this.addBreakLine('12px');
        },

        /**
         *
         * @param config
         * @private
         */
        _showSeoSettings: function(config){
            if(!config.showSeoSettings()){
                return;
            }
            this.addCollapsibleInputGroup(
                this._translate('PAGE_SETTINGS_SEO_SETTINGS_LABEL'),
                function(panel){
                    //note: 'this' here is the inputGroup!
                    panel._createSeoTitle(this);
                    panel._createSeoDescription(this);
                    panel._createKeywordInput(this);
                    panel._createNoIndexCheckbox(this);
                },
                {collapseAtStart: true, showSeparator: true, titleStyle: {padding: '0px'}, eventOnToggle: wixEvents.PAGE_SETTINGS_TOGGLE_SEO_GROUP}
            );
            this.addBreakLine('12px');
        },

        /**
         * @param autoPanelComp
         * @param config
         * @private
         */
        _addHideFromMenuCheckbox: function(autoPanelComp, config){
            if(!config.canBeHidden()){
                return;
            }
            this._hideFromMenuButton = autoPanelComp.addCheckBoxField(this._translate('PAGE_SETTINGS_HIDE_PAGE_LABEL'), "Page_Settings_Hide_from_menu_ttid").bindToField('hidePage');
            this._hideFromMenuButton.addEvent('inputChanged', this._reportUserInteractionToBI);
            this._hideFromMenuButton.runWhenReady(this._onHideFromMenuReady);
        },

        /**
         * @param autoPanelComp
         * @param config
         * @private
         */
        _addSetAsHomepageCheckbox: function(autoPanelComp, config){
            if (!config.canBeSetAsHomePage()){
                return;
            }
            this._setHomepageButton = autoPanelComp.addButtonField(null, this._translate("PAGE_SETTINGS_SET_HOMEPAGE_LABEL"), null, null, "toggle", null, "Pages_Settings_Set_as_homepage_ttid", 'WEditorCommands.SetHomepage', {currentPageId: this._getCurrentPageId()});
            this._setHomepageButton.runWhenReady(this._onHomepageChange);
        },

        _reportUserInteractionToBI: function(event){
            var isTrue = event.value ? 1 : 0;
            LOG.reportEvent(wixEvents.USER_CLICK_HIDE_PAGE, {i1: isTrue, c1: "desktop", c2:this._data.get('id')});
        },

        /**
         * @param autoPanelComp
         * @private
         */
        _addPageName:function(autoPanelComp){
            autoPanelComp.addCustomizableInputField({
                labelText: this._translate('PAGE_SETTINGS_PAGE_NAME_LABEL'),
                minLength: 1,
                maxLength: Constants.Page.NAME_MAX_LENGTH,
                validatorArgs: {validators: [this._htmlCharactersValidator]},
                toolTip: "Pages_Settings_Page_Name_ttid",
                skinGroup: 'strong',
                stylesForSkinparts: {input: {marginBottom: '10px'}}
            }).bindToField('title')
                .runWhenReady(function(logic){
                    this._pageNameLogic = logic;
                    this._selectPageName();
                }.bind(this));
        },

        _selectPageName:function(e){
            if(this._pageNameLogic){
                var that  = this;
                setTimeout(function() {
                    that._pageNameLogic.setFocus();
                    that._pageNameLogic._skinParts.input.select();
                }, 100);
            }
        },

        _showHelp: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'PAGE_SETTINGS_SUB_PANEL');
        },

        _onSitePageChanged: function (pageId) {
            if (!this._view.isCollapsed()) {
                this.closePanel();
            }
        },

        _onDelete: function () {
            this.resources.W.Commands.executeCommand("WEditorCommands.DeletePage", this._data);
            this.closePanel();
        },

        _onDuplicateButtonClick: function () {
            var placeholderText = this._translate('DUPLICATE_PAGE_COPY_OF') + ' ' + this._data.get('title');
            this.resources.W.EditorDialogs.openInputDialog({
                'title': this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_DIALOG_DUPLICATE_PAGE'),
                'labelText': this._translate('PAGE_SETTINGS_PAGE_NAME_LABEL'),
                'placeholderText': placeholderText,
                'okCallback': function (newPageName) {
                    LOG.reportEvent(wixEvents.USER_REQUESTED_PAGE_DUPLICATE, {});
                    newPageName = newPageName ? newPageName.substr(0,40) : placeholderText.substr(0,40);
                    var menuData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
                    var pageId = this._data.get('id');
                    var currentPageItem = menuData.getItemByRefId("#" + pageId);
                    var isSubPage = menuData.getItemLevel(currentPageItem) !== 0;
                    var currentPageParentId;
                    if (isSubPage) {
                        currentPageParentId = menuData.getItemParent(currentPageItem).get('refId');
                    }
                    //quick-fix for long names after duplicate causing save validation error:
                    this.resources.W.Commands.executeCommand("WEditCommands.DuplicatePage", {
                        pageHtmlId: pageId,
                        newPageName: newPageName,
                        pageParent: currentPageParentId
                    });
                }.bind(this)
            });
        },

        _validatePageUrlString: function () {
            var _pageUriSEO = this.getDataItem().get('pageUriSEO');
            var _url = this.resources.W.Utils.convertToValidUrlPart(_pageUriSEO);
            if (_url != _pageUriSEO) {
                this.getDataItem().set('pageUriSEO', _url);
                this._uriBeforeChanges = _url;
            }
        },

        closePanel: function () {
            this.resources.W.Commands.executeCommand(this._closeCommand);
        },

        _onHomepageChange: function () {
            if (this._setHomepageButton && this._setHomepageButton.getHtmlElement && this._setHomepageButton.getHtmlElement().getLogic) {
                var hpBtn = this._setHomepageButton.getHtmlElement().getLogic();

                var self = this;
                this._pageConfigPromise.then(function (config) {
                    if (config.canBeSetAsHomePage() && !self._currentIsHomepage()) {
                        hpBtn.enable();
                        self.setState('shown');
                    }
                    else {
                        hpBtn.disable();
                    }
                });
            }
        },

        _onHideFromMenuReady:function () {
            var hideFromMenuBtn = this._hideFromMenuButton.getHtmlElement().getLogic();
            if (!hideFromMenuBtn) {
                return;
            }
            this._pageConfigPromise.then(function (config) {
                if (!config.canBeHidden()) {
                    hideFromMenuBtn.disable();
                }
                else {
                    hideFromMenuBtn.enable();
                }
            });
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _getMainPageDataItemId: function () {
            return this.resources.W.Preview.getPreviewManagers().Data.getDataMap().SITE_STRUCTURE.get('mainPage');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _getCurrentPageId: function () {
            return this._data.get('id');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _currentIsHomepage: function () {
            return this._getCurrentPageId() === this._getMainPageDataItemId().replace('#', '');
        },

        dispose: function () {
            this.parent();
        }
    });
});