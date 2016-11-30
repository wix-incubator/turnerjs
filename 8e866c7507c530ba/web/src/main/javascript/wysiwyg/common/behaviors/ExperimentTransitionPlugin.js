/**
 * @class bootstrap.managers.classmanager.ExperimentTransitionPlugin
 */
define.experimentPlugin('ExperimentTransitionPlugin', function(transitionExperimentPlugin){
    /** type @bootstrap.managers.experiments.ExperimentPlugin*/
    var expPlugin = transitionExperimentPlugin;

    function mergeSingleExperiment(originalTransitionDefinition, experimentTransitionDefinition) {
        //TODO: make this one be an actual experiment plugin - Currently only support overriding of old animation, not extending it
        return experimentTransitionDefinition;
    }

    function convertNew(name, definition) {
        define.transition(name, definition);
    }

    expPlugin.init('transition', 'newTransition', mergeSingleExperiment, convertNew);
});