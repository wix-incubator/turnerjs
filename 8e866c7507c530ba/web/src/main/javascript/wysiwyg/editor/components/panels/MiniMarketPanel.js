//TODO: remove this file when experiment TPAArtifactLeftovers2 is merged (need to take into account EditorUIRefactorPhase1 and EditorUIRefactorPhase2)
define.component('wysiwyg.editor.components.panels.MiniMarketPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

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

            var text =  this._translate("APP_MARKET_NOT_AVAILABLE_ON_FACEBOOK");

            //var suffixText =  this.resources.W.Resources.get('EDITOR_LANGUAGE', "MOBILE_MARKET_PANEL_DESCRIPTION_SUFFIX");
            this.addInlineTextLinkField("", text, '', null, null, null, null, 'WEditorCommands.SetViewerMode', {mode: Constants.ViewerTypesParams.TYPES.DESKTOP, "src": "MobileAppMarketLink"});
        }
    });

});
