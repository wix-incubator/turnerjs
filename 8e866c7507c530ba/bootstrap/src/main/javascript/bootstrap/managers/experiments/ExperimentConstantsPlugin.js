/**
 * @class bootstrap.managers.classmanager.ExperimentClassPlugin
 */
define.experimentPlugin('ExperimentConstantsPlugin', function(constantsExperimentPlugin){
    /** type @bootstrap.managers.experiments.ExperimentPlugin*/
    var expPlugin = constantsExperimentPlugin;

    function mergeSingleExperiment(originalConstDefinition, experimentConstDefinition) {
        var experimentStrategy = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentStrategy');
        experimentConstDefinition[experimentStrategy.STRATEGY_FLAG] = experimentStrategy.MERGE;
        var merged = experimentStrategy._mergeField_(originalConstDefinition, experimentConstDefinition);
        return merged;
    }

    function convertNew(constNameSpace, definition) {
        define.Const(constNameSpace, definition);
    }

    expPlugin.init('Const', 'newConst', mergeSingleExperiment, convertNew);
});