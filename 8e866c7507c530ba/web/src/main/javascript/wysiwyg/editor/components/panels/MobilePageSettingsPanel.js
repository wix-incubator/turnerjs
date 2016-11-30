define.component('wysiwyg.editor.components.panels.MobilePageSettingsPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.resources([ "W.Commands", "W.Preview", "W.Editor" ]);

    def.binds(['closePanel', '_onCheckBoxInputChanged', '_reportUserInteractionToBI', '_setCheckboxState', '_onHideFromMobileMenuReady', '_onHideFromMenuReady']);

    def.skinParts({
        panelLabel: { 'type': 'htmlElement', autoBindDictionary: 'HIDE_MOBILE_PAGES_SETTINGS'},
        help: { type : 'htmlElement'},
        close: { type : 'htmlElement', command : 'this._closeCommand'},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:"done", command : 'this._closeCommand'},
        content: { type : 'htmlElement'},
        topBar: { type : 'htmlElement'},
        bottom: { type : 'htmlElement'}
    });

    def.fields({
        _closeCommand: null
    });

    def.methods(/*** @lends wysiwyg.editor.components.panels.MobilePageSettingsPanel.prototype */{
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
            this.addEvent('subPanelOpened', this._setCheckboxState);
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            this._skinParts.help.on(Constants.CoreEvents.CLICK, this, this._showHelp);
        },

        _createFields: function () {
            var panel = this;

            this._pageConfigPromise.then(function (config) {
                this._canBeHidden = config.canBeHidden();

                panel.addBreakLine('15px');
                panel.addLabel(this._canBeHidden ? panel._translate('HIDE_MOBILE_PAGES_SETTINGS_DESC') :
                    panel._translate('HIDE_MOBILE_PAGES_SETTINGS_DESC_DISABLED'), null);

                panel.addBreakLine('10px');

                if (this._canBeHidden){
                    panel.addCheckBoxField(panel._translate('HIDE_MOBILE_PAGES_HIDE_FROM_DESKTOP_MENU'), "Mobile_Page_Settings_Hide_from_menu_ttid").bindToField('hidePage')
                        .runWhenReady(panel._onHideFromMenuReady);

                    panel.addBreakLine('5px');

                    if (panel._data.getData().mobileHidePage === null){
                        panel._addHideFromMobileMenuCheckBoxField('hidePage', panel._onCheckBoxInputChanged);
                    } else {
                        panel._addHideFromMobileMenuCheckBoxField('mobileHidePage', panel._reportUserInteractionToBI);
                    }
                }
            });
        },

        _addHideFromMobileMenuCheckBoxField: function(fieldToBind, callback){
            return this.addCheckBoxField(this._translate('HIDE_MOBILE_PAGES_HIDE_FROM_MOBILE_MENU')).bindToField(fieldToBind)
                .addEvent('inputChanged', callback)
                .runWhenReady(this._onHideFromMobileMenuReady);
        },

        _reportUserInteractionToBI: function(event){
            var isTrue = event.value ? 1 : 0;
            LOG.reportEvent(wixEvents.USER_CLICK_HIDE_PAGE, {i1: isTrue, c1: "mobile", c2:this._data.get('id')});
        },

        _onCheckBoxInputChanged: function(event){
            this._reportUserInteractionToBI(event);

            //rebuild the checkbox after "split" in the bounded value
            this._hideFromMobileMenuBtn.dispose();

            this._data.set('mobileHidePage', event.value);
            this._data.set('hidePage', !event.value);

            this._addHideFromMobileMenuCheckBoxField('mobileHidePage', this._reportUserInteractionToBI);
        },

        _showHelp: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'MOBILE_PAGE_SETTINGS_SUB_PANEL');
        },

        closePanel: function () {
            this.resources.W.Commands.executeCommand(this._closeCommand);
        },

        _onHideFromMenuReady:function (logic) {
            var hideFromMenuBtn = logic;
            if (!hideFromMenuBtn) {
                return;
            }
            hideFromMenuBtn.disable(); //read only information
        },

        _onHideFromMobileMenuReady:function (logic) {
            this._hideFromMobileMenuBtn = logic;
        },

        _setCheckboxState: function(){
            if (this._hideFromMobileMenuBtn && this._data.getData().mobileHidePage === true){
                var that  = this;
                setTimeout(function() {
                    that._hideFromMobileMenuBtn.setChecked(true);
                    //this was added as a solution to a bug which occurred when switching too fast between panels
                    //and then returning to the panel - the data binding wasn't applied on the checkbox
                    //(doesn't send the BI event)
                }, 100);
            }
        }
    });
});