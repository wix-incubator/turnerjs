define.experiment.component('wysiwyg.viewer.components.WixAds.FixForMobileZoomScroller', function (compDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _showHideAds:function (isShow) {
            if(!this._view) {
                return;
            }
            var collapsed = this._view.isCollapsed();
            if(collapsed === isShow) {
                this.setCollapsed(!isShow);
                if (this.resources.W.Viewer.isSiteReady()){
                    this.resources.W.Viewer.siteHeightChanged(false);
                }
            }
        }
    });
});

