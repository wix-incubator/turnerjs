define.experiment.component('wysiwyg.editor.components.ComponentEditBox.LandingPageSupport', function (compDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.methods({
        _isReturnEitherPageOrMasterPageContainers: function() {
            return this.resources.W.Config.env.isViewingSecondaryDevice() || !this._editedComponent.getShowOnAllPagesChangeability() || this.resources.W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage();
        },
        //for DragToFooter experiment
        _shouldCheckForCompBottomChange: function(){
            return (!this.resources.W.Config.env.isViewingSecondaryDevice() && this._duringDrag &&
                this._editedComponent.canMoveToOtherScope() && this._editedComponent.getShowOnAllPagesChangeability() && !this.resources.W.Preview.getPreviewManagers().Viewer.isCurrentPageLandingPage());
        }
    });
});
