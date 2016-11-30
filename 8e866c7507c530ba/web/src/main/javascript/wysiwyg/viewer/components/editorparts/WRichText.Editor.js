define.component('Editor.wysiwyg.viewer.components.WRichText', function(componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _setMobileComponentAppearance: strategy.before(function(){
            this._scalingModifier.calculateMostCommonTextSize();
        }),

        getMostCommonTextSizeBeforeScaling: function() {
            return W.Utils.mobile.getMobileFontSize(this._scalingModifier.getMostCommonTextSizeBeforeScaling());
        },

        normalizeScaleIfNeeded: function(newScale) {
            var mostCommonTextSizeBeforeScaling = this.getMostCommonTextSizeBeforeScaling();
            var mostCommonTextNewSize = Math.round(mostCommonTextSizeBeforeScaling * newScale);
            return mostCommonTextNewSize / mostCommonTextSizeBeforeScaling;
        }
    });
});
