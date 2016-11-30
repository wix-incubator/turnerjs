define.experiment.component('wysiwyg.editor.components.panels.ComponentPanel.LandingPageSupport', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.methods({
        _shouldMoveScopeBeDisabled: function(){
            return !this._editedComponent.canMoveToOtherScope() || this._isMobile() || this.resources.W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage();
        }
    });

});
