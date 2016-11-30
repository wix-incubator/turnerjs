/**
 * @class bootstrap.managers.classmanager.ExperimentClassPlugin
 */
define.experimentPlugin('ExperimentClassPlugin', function (classExperimentPlugin) {
    /** type @bootstrap.managers.experiments.ExperimentPlugin*/
    var expPlugin = classExperimentPlugin;

    function mergeSingleExperiment(originalClassDef, experimentClassDef) {
        var ClassDefinition = this.define.getBootstrapClass('bootstrap.managers.classmanager.ClassDefinition');
        var experimentStrategy = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentStrategy');
        // Original data
        var originalData = originalClassDef;
        if (typeof originalClassDef === 'function') {
            originalData = new ClassDefinition();
            originalClassDef(originalData);
        }
        // Experiment data
        var experimentData = new ClassDefinition();
        experimentClassDef(experimentData, experimentStrategy);
        // Overrides
        originalData.inherits(experimentData._extends_ || originalData._extends_);
        originalData.resources(experimentStrategy._mergeField_(originalData._resources_, experimentData._resources_));
        originalData.binds(experimentStrategy._mergeField_(originalData._binds_, experimentData._binds_));
        originalData.traits(experimentStrategy._mergeField_(originalData._traits_, experimentData._traits_));
        originalData.utilize(experimentStrategy._mergeField_(originalData._imports_, experimentData._imports_));
        originalData.statics(experimentStrategy._mergeObjects_(originalData._statics_, experimentData._statics_));
        originalData.fields(experimentStrategy._mergeObjects_(originalData._fields_, experimentData._fields_));
        originalData.methods(experimentStrategy._mergeObjects_(originalData._methods_, experimentData._methods_));

        return originalData;
    }

    function convertNew(newClassName, definition) {
        define.Class(newClassName, definition);
    }

    expPlugin.init('Class', 'newClass', mergeSingleExperiment, convertNew);
});