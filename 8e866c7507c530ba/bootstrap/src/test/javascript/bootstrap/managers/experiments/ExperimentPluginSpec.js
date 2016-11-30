describe('ExperimentPluginSpec', function(){
    var classExperimentPlugin;
    beforeEach(function(){
        classExperimentPlugin = define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentPlugin');
        this.mergeSingleExperiment = getSpy('mergeSingleExperiment');
        this.convertNew = getSpy('convertNew');
        classExperimentPlugin.init('Class', 'newClass', this.mergeSingleExperiment, this.convertNew);
    });

    var arrayToSet = function(ar) {
        return _.reduce(ar, function(result, id, index) {
            result[id] = index + 1;
            return result;
        }, {});
    };

    it("test setRunningExperimentsOrder calls covert on all defined experiments", function(){
        define.experiment.newClass('parent.experiment.TestClass1.Experiment1.New', function(classDefinition){});
        define.experiment.newClass('parent.experiment.TestClass2.Experiment1.New', function(classDefinition){});
        define.experiment.newClass('parent.experiment.TestClass3.Experiment3.New', function(classDefinition){});
        define.experiment.newClass('parent.experiment.TestClass3.Experiment3.Old', function(classDefinition){});

        var runningExperimentIds = [ 'experiment1', 'experiment3' ];
        classExperimentPlugin.setRunningExperimentsIds(runningExperimentIds, arrayToSet(runningExperimentIds));
        expect(this.convertNew).toHaveBeenCalledXTimes(3);
        var convertNewCalls = this.convertNew.calls;
        expect(convertNewCalls[0].args[0]).toBeEquivalentTo('parent.experiment.TestClass1');
        expect(convertNewCalls[1].args[0]).toBeEquivalentTo('parent.experiment.TestClass2');
        expect(convertNewCalls[2].args[0]).toBeEquivalentTo('parent.experiment.TestClass3');
    });

    it("test convert is called in newly defined experiments", function(){
        var runningExperimentIds = [ 'experiment10', 'experiment30' ];
        classExperimentPlugin.setRunningExperimentsIds(runningExperimentIds, arrayToSet(runningExperimentIds));

        define.experiment.newClass('parent.experiment.TestClass1.Experiment10.New', function(classDefinition){});
        define.experiment.newClass('parent.experiment.TestClass2.Experiment10.New', function(classDefinition){});
        define.experiment.newClass('parent.experiment.TestClass3.Experiment30.New', function(classDefinition){});
        define.experiment.newClass('parent.experiment.TestClass3.Experiment30.Old', function(classDefinition){});

        expect(this.convertNew).toHaveBeenCalledXTimes(3);
        var convertNewCalls = this.convertNew.calls;
        expect(convertNewCalls[0].args[0]).toBeEquivalentTo('parent.experiment.TestClass1');
        expect(convertNewCalls[1].args[0]).toBeEquivalentTo('parent.experiment.TestClass2');
        expect(convertNewCalls[2].args[0]).toBeEquivalentTo('parent.experiment.TestClass3');
    });

    it("test applyExperiments", function(){
        var runningExperimentIds = [ 'experiment1', 'experiment3' ];
        classExperimentPlugin.setRunningExperimentsIds(runningExperimentIds, arrayToSet(runningExperimentIds));

        var experiment1Def = function() {};
        var experiment2Def = function() {};
        var experiment3Def = function() {};
        var definition = function() {};
        define.experiment.Class("test.myClass.experiment2.New", experiment2Def);
        define.experiment.Class("test.myClass.experiment1.New", experiment1Def);
        define.experiment.Class("test.myClass.experiment3.New", experiment3Def);
        var expected = [experiment1Def, experiment3Def];

        classExperimentPlugin.applyExperiments('test.myClass', definition);
        expect(this.mergeSingleExperiment).toHaveBeenCalledXTimes(2);
        var mergeSingleExperimentCalls = this.mergeSingleExperiment.calls;
        expect(mergeSingleExperimentCalls[0].args[0].originalDefinitionFunc || mergeSingleExperimentCalls[0].args[0]).toBe(definition);
        expect(mergeSingleExperimentCalls[0].args[1].originalDefinitionFunc || mergeSingleExperimentCalls[0].args[1]).toBe(experiment1Def);
        expect(mergeSingleExperimentCalls[1].args[1].originalDefinitionFunc || mergeSingleExperimentCalls[1].args[1]).toBe(experiment3Def);
    })
});