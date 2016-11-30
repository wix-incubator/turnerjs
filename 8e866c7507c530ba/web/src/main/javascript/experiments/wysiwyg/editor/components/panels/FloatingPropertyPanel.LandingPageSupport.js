define.experiment.component('wysiwyg.editor.components.panels.FloatingPropertyPanel.LandingPageSupport', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.methods({
        _shouldMoveScopeBeDisabled: function(){
            return !this._editedComponent.canMoveToOtherScope() || this.resources.W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage();
        }
    });
});
