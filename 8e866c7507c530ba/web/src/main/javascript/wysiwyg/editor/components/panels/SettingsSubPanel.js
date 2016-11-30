define.component('wysiwyg.editor.components.panels.SettingsSubPanel', function(componentDefinition){
    /*@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.skinParts({
        panelLabel: { 'type': 'htmlElement'},
        help: { type : 'htmlElement'},
        close: { type : 'htmlElement', command : 'this._closeCommand'},
        doneButton: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary:"done", command : 'this._closeCommand'},
        topBar: {type: 'htmlElement'},
        bottom: {type: 'htmlElement'},
        content: {type: 'htmlElement'}
    });

    def.binds(['_showHelp','_onSubPanelOpened']);

    def.dataTypes(['SiteSettings']);

    def.methods({

		initialize: function(compId, viewNode, args){
			this.parent(compId, viewNode, args);
			args = args || {};
            this._closeCommand = args.closeCommand;

		},

        _onAllSkinPartsReady: function(){
            this.parent();
            this._skinParts.help.addEvent('click', this._showHelp);
            this.addEvent('subPanelOpened', this._onSubPanelOpened);
            // prevent scrolling the site on wheel scroll & drag
            this.resources.W.Utils.preventMouseDownOn(this._skinParts.content) ;
            this._skinParts.content.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
        },

		_createFields: function(){
            //Override me!!
		},

        _showHelp : function(){
            //Override me!!
        },

        _onSubPanelOpened : function(){
            //Override me!!
        }

    });

});
