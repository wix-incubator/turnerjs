/**
 * @class bootstrap.managers.classmanager.ExperimentClassPlugin
 */
define.experimentPlugin('ExperimentAnimationEditorPartPlugin', function(animationsExperimentEditorPartPlugin){
    /** type @bootstrap.managers.experiments.ExperimentPlugin*/
    var expPlugin = animationsExperimentEditorPartPlugin;

    function mergeSingleExperiment(originalAnimationEditorPartDefinition, experimentAnimationEditorPartDefinitionFunc) {
        var experimentStrategy = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentStrategy');
        var originalData = originalAnimationEditorPartDefinition;
        var experimentData = experimentAnimationEditorPartDefinitionFunc(experimentStrategy);
        var merged = {};

        merged.iconUrl = experimentStrategy._mergeField_(originalData.iconUrl , experimentData.iconUrl);
        merged.displayName = experimentStrategy._mergeField_(originalData.displayName , experimentData.displayName);
        merged.previewParams = experimentStrategy._mergeObjects_(originalData.previewParams, experimentData.previewParams);
        merged.panelControls = experimentStrategy._mergeObjects_(originalData.panelControls, experimentData.panelControls);

        return merged;
    }

    function convertNew(name, definitionFunc) {
        define.animationEditorPart(name, definitionFunc());
    }

    expPlugin.init('animationEditorPart', 'newAnimationEditorPart', mergeSingleExperiment, convertNew);

});