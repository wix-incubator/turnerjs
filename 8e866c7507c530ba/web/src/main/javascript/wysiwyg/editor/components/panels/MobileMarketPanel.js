define.component('wysiwyg.editor.components.panels.MobileMarketPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.resources(['W.Preview', 'W.Resources']);

    def.skinParts({
        'scrollableArea': {type: 'htmlElement'}
    });

    def.fields({
        _panelName: "MOBILE_MARKET_PANEL_TITLE"
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._titleKey = "MOBILE_MARKET_PANEL_TITLE";
            this._descriptionKey = null;
        },

        getPanelType: function(){
            return this.PANEL_TYPE.NO_CONTENT;
        },

        _createFields: function(){
            var prefixText =  this.resources.W.Resources.get('EDITOR_LANGUAGE', "MOBILE_MARKET_PANEL_DESCRIPTION_PREFIX");
            var buttonText =  this.resources.W.Resources.get('EDITOR_LANGUAGE', "MOBILE_MARKET_PANEL_DESCRIPTION_BUTTON");
            //var suffixText =  this.resources.W.Resources.get('EDITOR_LANGUAGE', "MOBILE_MARKET_PANEL_DESCRIPTION_SUFFIX");
            this.addInlineTextLinkField("",prefixText, buttonText, null, null, null, null, 'WEditorCommands.SetViewerMode', {mode: Constants.ViewerTypesParams.TYPES.DESKTOP, "src": "MobileAppMarketLink"});
        }
    });

});
