define.component("wysiwyg.editor.components.MainTabsPresenter", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onViewModeChanged);
        },

        _onViewModeChanged: function() {
            this.collapse();
        }
    });
});