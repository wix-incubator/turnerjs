describe('ExperimentConstantsPluginSpec', function () {
    var classExperimentPlugin;
    var experiments;
    beforeEach(function () {
        experiments = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.Experiments').init();
        classExperimentPlugin = experiments._pluginsMap['ExperimentConstantsPlugin'];
    });

    describe("test mergeSingleExperiment", function () {
        it("test merge of two simple constants", function () {
            var originalConstant = {
                A:'a',
                B:'b',
                C:'c'
            };
            var overrideConstant = {
                A:'aa',
                C:'cc',
                D:'dd'
            };
            var expected = {
                A:'aa',
                B:'b',
                C:'cc',
                D:'dd'
            };

            var result = classExperimentPlugin._mergeSingleExperiment(originalConstant, overrideConstant);
            expect(result).toBeEquivalentTo(expected);
        });

        it("test merge of two complex constants", function () {
            var originalConstant = {
                A:'a',
                B:{
                    C:'c',
                    D:'d',
                    E:{
                        F:'f'
                    }
                },
                G:'g'


            };
            var overrideConstant = {
                A:'aa',
                B:{
                    D:'dd',
                    E:{
                        F:'ff',
                        I:'ii'
                    },
                    H:'hh'
                },
                G:{
                    K:'kk'
                }
            };
            var expected = {
                A:'aa',
                B:{
                    C:'c',
                    D:'dd',
                    E:{
                        F:'ff',
                        I:'ii'
                    },
                    H:'hh'
                },
                G:{
                    K:'kk'
                }
            };
            var result = classExperimentPlugin._mergeSingleExperiment(originalConstant, overrideConstant);
            expect(result).toBeEquivalentTo(expected);
        });
    });
});