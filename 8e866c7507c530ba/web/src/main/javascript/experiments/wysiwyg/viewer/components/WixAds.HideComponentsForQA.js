define.experiment.component('wysiwyg.viewer.components.WixAds.HideComponentsForQA', function (compDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _hideForQA: function(){
            if(this._isHiddenForQA) {
                this.getViewNode().setStyle('display', 'none');
            }
        }
    });
});

