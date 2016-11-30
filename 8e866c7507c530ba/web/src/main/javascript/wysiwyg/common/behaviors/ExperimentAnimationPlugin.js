/**
 * @class bootstrap.managers.classmanager.ExperimentAnimationPlugin
 */
define.experimentPlugin('ExperimentAnimationPlugin', function(animationExperimentPlugin){
    /** type @bootstrap.managers.experiments.ExperimentPlugin*/
    var expPlugin = animationExperimentPlugin;

    function mergeSingleExperiment(originalAnimationDefinition, experimentAnimationDefinitionFunc) {
        //TODO: make this one be a decent experiment plugin - Currently doesn't support experimentStrategy
        //var experimentStrategy = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentStrategy');

        var mergedDefinition,
            experimentDefinition = experimentAnimationDefinitionFunc();

        experimentDefinition.init(originalAnimationDefinition._animations);
        mergedDefinition = _.defaults(experimentDefinition, originalAnimationDefinition);
        return mergedDefinition;
    }

    function convertNew(name, definition) {
        define.animation(name, definition);
    }

    expPlugin.init('animation', 'newAnimation', mergeSingleExperiment, convertNew);
});