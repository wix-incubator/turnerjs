describe('ExperimentClassPluginSpec', function(){
    var classExperimentPlugin;
    var experiments;
    beforeEach(function(){
        define.resource('experimentsOrder', [
            {id:"experiment1", group:'New', description:'', dependencies:[], conflicts:[]},
            {id:"experiment2", group:'New', description:'', dependencies:[], conflicts:[]},
            {id:"experiment3", group:'New', description:'', dependencies:[], conflicts:[]}
        ]);
        experiments = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.Experiments').init();
        classExperimentPlugin = experiments._pluginsMap['ExperimentClassPlugin'];
    });

    describe("test mergeSingleExperiment", function(){
        var ClassDefinition = define.getBootstrapClass('bootstrap.managers.classmanager.ClassDefinition');

       it("inherits", function(){
           var originalDefinition = new ClassDefinition();
           originalDefinition.inherits("extends1");
           var overrideDefinition = function(classDef){
               classDef.inherits("extends2");
           };

           var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

           expect(newDefinition._extends_).toBeEquivalentTo("extends2");
       });

        it("binds", function(){
            var originalDefinition = new ClassDefinition();
            originalDefinition.binds(["bind1", "bind2"]);
            var overrideDefinition = function(classDef){
                classDef.binds(["bind1", "bind3"]);
            };

            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._binds_).toBeEquivalentTo(["bind1", "bind3"]);
        });

        it("traits", function(){
            var originalDefinition = new ClassDefinition();
            originalDefinition.traits(["trait1", "trait2"]);
            var overrideDefinition = function(classDef){
                classDef.traits(["trait1", "trait3"]);
            };

            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._traits_).toBeEquivalentTo(["trait1", "trait3"]);
        });

        it("utilize", function(){
            var originalDefinition = new ClassDefinition();
            originalDefinition.utilize(["import1", "import2"]);
            var overrideDefinition = function(classDef){
                classDef.utilize(["import1", "import3"]);
            };

            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._imports_).toBeEquivalentTo(["import1", "import3"]);
        });

        it("statics", function(){
            var originalDefinition = new ClassDefinition();
            originalDefinition.statics({'static1':1, 'static2':2});
            var overrideDefinition = function(classDef){
                classDef.statics({'static1':4, 'static3':3});
            };

            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._statics_).toBeEquivalentTo({'static1':4, 'static2':2, 'static3':3});
        });

        it("statics", function(){
            var originalDefinition = new ClassDefinition();
            var overrideDefinition = function(classDef){
                classDef.statics({'static1':4, 'static3':3});
            };
            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._statics_).toBeEquivalentTo({'static1':4, 'static3':3});
        });

        it("fields", function(){
            var originalDefinition = new ClassDefinition();
            originalDefinition.fields({'field1':1, 'field2':2, 'field3':3});
            var overrideDefinition = function(classDef){
                classDef.fields({'field1':4, 'field4':4, 'field3':5});
            };

            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._fields_).toBeEquivalentTo({'field1':4, 'field2':2, 'field4':4, 'field3':5});
        });

        it("methods", function(){
            var method1 = getSpy();
            var method2 = getSpy();
            var method3 = getSpy();
            var method4 = getSpy();
            var originalDefinition = new ClassDefinition();
            originalDefinition.methods({'method1':method1, 'method2':method2});
            var overrideDefinition = function(classDef){
                classDef.methods({'method1':method3, 'method4':method4});
            };

            var newDefinition = classExperimentPlugin._mergeSingleExperiment(originalDefinition, overrideDefinition);

            expect(newDefinition._methods_).toBeEquivalentTo({'method1':method3, 'method2':method2, 'method4':method4});
        });
    });
});