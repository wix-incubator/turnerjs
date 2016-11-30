define.component('wysiwyg.editor.components.panels.MobileDesignPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.skinParts({
        'scrollableArea': {type: 'htmlElement'}
    });

    def.fields({
        _panelName: "MOBILE_DESIGN_PANEL_TITLE"
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._titleKey = "MOBILE_DESIGN_PANEL_TITLE";
            this._descriptionKey = "MOBILE_DESIGN_PANEL_DESCRIPTION";
        },

        _createFields: function(){
            //Background image selector
            this.addSelectionListInputFieldWithDataProvider("", '#MOBILE_DESIGN_SUB_PANELS',
                {repeatersSelectable: false},
                {
                    type: 'wysiwyg.editor.components.WButton',
                    skin: 'wysiwyg.editor.skins.buttons.ButtonMenuSkin',
                    numRepeatersInLine: 1
                }
            );
        }
    });

});
