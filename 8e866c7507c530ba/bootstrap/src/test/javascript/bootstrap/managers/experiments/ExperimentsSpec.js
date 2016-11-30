describe('Experiments', function () {
    var experiments;
    var asyncSpec =  new AsyncSpec(this);
    testRequire().resources('ExperimentsList');

    // lower case keys and values - this is how the model is rendered
    var RUNNING_EXP = {
        'experiment1':'new',
        'experiment2':'new',
        'experiment3':'new'
    };

    // lower case keys - this is how the experimentDescriptor.* resources are defined
    var DESCRIPTORS = {
        'experiment1': {createTime: '2000-01-01T00:01:01', description: ''},
        'experiment2': {createTime: '2000-01-01T00:01:02', description: ''},
        'experiment3': {createTime: '2000-01-01T00:01:03', description: '', constraints: {notDefined: 'required'}}
    };

    var getDescriptor = function(id) {
        return DESCRIPTORS[id];
    };

    beforeEach(function(){
        spyOn(this.ExperimentsList, 'getExperimentsList').andCallFake(function(callback){
            callback(RUNNING_EXP);
        });
    });

    describe('experiments internals', function () {

        beforeEach(function () {
            experiments = this.define.createBootstrapClassInstance(
                'bootstrap.managers.experiments.Experiments',
                [RUNNING_EXP, getDescriptor]);
        });

        it('should return an ordered list of running experiments', function () {
            var expected = ['experiment1', 'experiment2'];
            var result = experiments.getRunningExperimentIds();
            expect(result).toEqual(expected);
        });

        describe('isDeployed', function() {
            describe('should return true if an experiment is running', function() {
                it('object', function() {
                    expect(experiments.isDeployed({'Experiment1':'New'})).toBe(true);
                });
                it('string id', function() {
                    expect(experiments.isDeployed('Experiment1')).toBe(true);
                });
                it('id array of one element', function() {
                    expect(experiments.isDeployed(['Experiment1'])).toBe(true);
                });
            });
            describe('should return false if an experiment is not running', function() {
                it('object single', function() {
                    expect(experiments.isDeployed({Experiment10: 'New'})).toBe(false);
                });
                it('object one of two', function() {
                    expect(experiments.isDeployed({Experiment1: 'New', Experiment10: 'New'})).toBe(false);
                });
                it('string single', function() {
                    expect(experiments.isDeployed('Experiment10')).toBe(false);
                });
                it('array single', function() {
                    expect(experiments.isDeployed(['Experiment10'])).toBe(false);
                });
                it('array one of two', function() {
                    expect(experiments.isDeployed(['Experiment1', 'Experiment10'])).toBe(false);
                });
            });
        });
    });

    describe('isExperimentOpen', function() {

        beforeEach(function () {
            experiments = this.define.createBootstrapClassInstance(
                'bootstrap.managers.experiments.Experiments',
                [RUNNING_EXP, getDescriptor]);
        });

        it('should return false for close experiment', function() {
            expect(experiments.isExperimentOpen('Experiment3', 'New')).toBeFalsy();
        });

        it('should return true for open experiment', function() {
            expect(experiments.isExperimentOpen('Experiment1', 'New')).toBeTruthy();
        });

        it('should return true ignore cases', function() {
            expect(experiments.isExperimentOpen('experiment2', 'neW')).toBeTruthy();
        });
    });
});