define.experiment.component('wysiwyg.viewer.components.MobileMediaZoom.ExitMobileMode', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        fixZoom:function(){
            var defaultZoom = 1;
            var desktopMode = W.Config.env.$viewingDevice.toUpperCase() === Constants.ViewerTypesParams.TYPES.DESKTOP;
            var mobileMode = this._isMobilePreviewMode || this.getState('viewerType').toUpperCase() === Constants.ViewerTypesParams.TYPES.MOBILE;
            if(mobileMode && !desktopMode){
                return defaultZoom;
            }

            if(!this._initZoom || this._initZoom < 0 || this._initZoom > 5){
                this._setInitZoom();
            }

            var zoom = this._initZoom / this._mobileConfig.getZoom();

            this._skinParts.xButton.style.zoom = zoom;
            this._skinParts.buttonPrev.style.zoom = zoom;
            this._skinParts.buttonNext.style.zoom = zoom;
        }
    });

});
