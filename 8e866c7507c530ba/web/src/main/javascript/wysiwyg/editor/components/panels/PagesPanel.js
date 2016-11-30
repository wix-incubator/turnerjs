/**
 * @Class wysiwyg.editor.components.panels.PagesPanel
 * @extends wysiwyg.editor.components.panels.SideContentPanel
 */
define.component('wysiwyg.editor.components.panels.PagesPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.SideContentPanel");

    def.binds(['_onTransitionsChanged', '_onSitePageChanged']);

    def.resources(['W.Config', 'W.Commands']);

    def.skinParts({
        siteMenu:{ type:'wysiwyg.editor.components.panels.navigation.SiteNavigationEditor' },
        scrollableArea:{ type:'htmlElement' },
        pageTransitionLabel:{ type:'htmlElement', autoBindDictionary:'CHOOSE_TRANSITION'},
        transitionMenu:{ type:'htmlElement', command:'WEditorCommands.PageTransition' },
        addPage:{ type:'wysiwyg.editor.components.WButton', command:'WEditorCommands.AddPageDialog', autoBindDictionary:'ADD_PAGE_BUTTON', argObject:{iconSrc:'icons/top-bar-icons.png', spriteOffset:{x:'0', y:'-122px'}} },
        pageSettings:{ type:'wysiwyg.editor.components.WButton', command:'this._pageSettingsCommand', autoBindDictionary:'PAGE_SETTINGS'  },
        actions:{type:'htmlElement'},
        additionalInfo: {type: 'htmlElement'},
        upDownLabel: {type: 'htmlElement'},
        rightLabel: {type: 'htmlElement'}
    });

    def.states({
        'DEFAULT':['normal', 'masterPageMode'],
        'controls': ['readOnlyControls', 'normalControls']
    });

    /**
     * @lends wysiwyg.editor.components.panels.PagesPanel
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._titleKey = "PAGES_TITLE";
            this._descriptionKey = "NEW_PAGES_DESCRIPTION";
            var _onSitePageChanged = this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SitePageChanged", this, this._onSitePageChanged);

            //Settings and SEO button
            this._pageSettingsCommand = this.injects().Commands.createCommand("page settings");
            this._pageSettingsCommand.registerListener(this, this._onPageSettings);
        },

        _onAllSkinPartsReady:function () {
            this.collapse();

            var transDataCB = function (data) {
                this._transitionData = data;
                this._buildTransitionMenu(data);
                data.addEvent(Constants.DataEvents.DATA_CHANGED, this._onTransitionsChanged);
            };
            this.injects().Data.getDataByQuery("#PAGE_TRANSITIONS", transDataCB.bind(this));

            var iconFullPath = this.injects().Theme.getProperty("WEB_THEME_DIRECTORY") + "icons/property_panel_help_sprite.png";
            var el = new Element('span', {
                'html':'&nbsp;',
                'class':'tooltipIcon',
                'styles':{backgroundImage:'url(' + iconFullPath + ')'}
            });
            this._skinParts.pageTransitionLabel.grab(el, 'after').setStyles({'width':'80%', 'display':'inline'});
            this._skinParts.siteMenu.setScrollArea(this._skinParts.scrollableArea);
            this._skinParts.siteMenu.initMenu();
            this._addToolTipToSkinPart(el, 'Pages_Page_Transistions_ttid');

            this._skinParts.upDownLabel.set('html', W.Resources.get('EDITOR_LANGUAGE', 'PAGE_PAGES_DRAG_UP_DOWN'));
            this._skinParts.rightLabel.set('html', W.Resources.get('EDITOR_LANGUAGE', 'PAGE_PAGES_DRAG_RIGHT'));
            this._skinParts.additionalInfo.setCollapsed(true);

            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._onSetViewerMode);
            this._onSetViewerMode(null);
        },

        _onTransitionsChanged:function () {
            this._buildTransitionMenu(this._transitionData);
        },

        _buildTransitionMenu:function (data) {
            var resources = this.injects().Resources;
            var items = data.get('items');
            var menu = this._skinParts.transitionMenu;
            menu.empty();
            var len;
            if (!items || !(len = items.length)) {
                return;
            }
            var selected = false;
//			var firstOption = null;
            for (var i = 0; i < len; ++i) {
                var transItem = items[i];
                var option = new Element('option');
                var label = resources.get('EDITOR_LANGUAGE', transItem.langKey);
                option.value = transItem.value;
                option.set('html', label);
                selected = !!transItem.selected;
                option.set('selected', selected);
                menu.appendChild(option);
            }
        },


        _onSitePageChanged:function (params) {
            if (!params.subPanelVisible) {
                return;
            }

            if (params.panel && params.panel.closePanel) {
                params.panel.closePanel();
                this._onPageSettings('#' + params.pageId, true);
            }
        },

        _onPageSettings:function (pageId, settingsButtonOverride) {
            if (typeof pageId != "string") {
                pageId = "#" + W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
            }

            if (pageId) {
                var commandName = this.getState('controls') === 'normalControls' ?
                    "WEditorCommands.PageSettings" : "WEditorCommands.MobilePageSettings";

                this.injects().Commands.executeCommand(commandName, {
                    pageId: pageId,
                    settingsButtonOverride: settingsButtonOverride
                });
            }
        },

        _onSetViewerMode: function(params){
            var _params = params || {};
            var mode = _params.mode || this.resources.W.Config.env.$viewingDevice;
            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this._descriptionKey = "HIDE_MOBILE_PAGES_PAGES_PANEL";
                    this.setState('readOnlyControls', 'controls');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this._descriptionKey = "NEW_PAGES_DESCRIPTION";
                    this.setState('normalControls', 'controls');
                    break;
            }
        }
    });
});