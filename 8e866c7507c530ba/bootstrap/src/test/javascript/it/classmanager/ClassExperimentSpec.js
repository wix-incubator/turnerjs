/**
 * Created by IntelliJ IDEA.
 * User: Idoro
 * Date: 08/02/11
 * Time: 17:38
 * To change this template use File | Settings | File Templates.
 */
describe('classExperiments', function () {
    var classManager;
    var experimentManager;

    testRequire().resources('W.Classes', 'W.Experiments');

    describe('define.experiment.class', function () {
        it('simple override', function () {
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);

            this.define.Class('test.MyClass', function (classDef) {
                classDef.methods({
                    method1: function () {
                    }
                });
            });
            this.define.experiment.Class('test.MyClass.Experiment1.New', function (classDef) {
                classDef.methods({
                    method2: function () {
                    }
                });
            });

            var myClass;
            classManager.getClass('test.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            runs(function () {
                expect(myClass['method1']).toBeDefined();
                expect(myClass['method2']).toBeDefined();
            });
        });

        it("_super should work for experiments", function () {
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);
            this.define.Class('test.parent.MyClass', function (classDef) {
                classDef.methods({
                    method1: function () {
                        this._parentWasCalled = true;
                    }
                });
            });
            this.define.Class('test.super.MyClass', function (classDef) {
                classDef.inherits('test.parent.MyClass');
                classDef.methods({
                    method1: function () {
                        this._originalWasCalled = true;
                    }
                });
            });
            this.define.experiment.Class('test.super.MyClass.Experiment1.New', function (classDef, def) {
                classDef.methods({
                    method1: def.after(function () {
                        this._experimentWasCalled = true;
                        this._super('method1');
                    })
                });
            });

            var myClass;
            classManager.getClass('test.super.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            runs(function () {
                myClass.method1();
                expect(myClass._experimentWasCalled).toBeTruthy();
                expect(myClass._parentWasCalled).toBeTruthy();
                expect(myClass._originalWasCalled).toBeTruthy();
            });
        });

        it("_super should find its method on experiment and not on original", function () {
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);
            this.define.Class('test.parent.MyClass', function (classDef) {
                classDef.methods({
                    method1: function () {
                        this._parentWasCalled = true;
                    }
                });
            });

            this.define.experiment.Class('test.parent.MyClass.Experiment1.New', function (classDef, strategy) {
                classDef.methods({
                    method1: function () {
                        this._parentExperimentWasCalled = true;
                    }
                });
            });

            this.define.Class('test.super.MyClass', function (classDef) {
                classDef.inherits('test.parent.MyClass');
                classDef.methods({
                    method1: function () {
                        this._originalWasCalled = true;
                    }
                });
            });
            this.define.experiment.Class('test.super.MyClass.Experiment1.New', function (classDef, def) {
                classDef.methods({
                    method1: function () {
                        this._experimentWasCalled = true;
                        this._super('method1');
                    }
                });
            });

            var myClass;
            classManager.getClass('test.super.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            runs(function () {
                myClass.method1();
                expect(myClass._parentWasCalled).toBeFalsy();
                expect(myClass._parentExperimentWasCalled).toBeTruthy();
                expect(myClass._originalWasCalled).toBeFalsy();
                expect(myClass._experimentWasCalled).toBeTruthy();
                // TODO: why check internals of _super here?
                expect(myClass.__super_scope.method1).toBe(undefined);
            });
        });

        it('test double after', function () {
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'},
                {id: "experiment2", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);
            var callOrder = [];
            this.define.Class('test.MyClass', function (classDef) {
                classDef.methods({
                    method1: function () {
                        callOrder.push('OriginalWasCalled');
                    }
                });
            });
            this.define.experiment.Class('test.MyClass.Experiment1.New', function (classDef, strat) {
                classDef.methods({
                    method1: strat.after(function () {
                        callOrder.push('Experiment1WasCalled');
                    })
                });
            });

            this.define.experiment.Class('test.MyClass.Experiment2.New', function (classDef, strat) {
                classDef.methods({
                    method1: strat.after(function () {
                        callOrder.push('Experiment2WasCalled');
                    })
                });
            });

            var myClass;
            classManager.getClass('test.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            var expected = ['OriginalWasCalled', 'Experiment1WasCalled', 'Experiment2WasCalled'];
            runs(function () {
                myClass.method1();

                expect(callOrder).toBeEquivalentTo(expected);
            });
        });

        it('test double after with inheritance', function () {
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'},
                {id: "experiment2", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);
            var callOrder = [];
            this.define.Class('test.MyParentClass', function (classDef) {
                classDef.methods({
                    method1: function () {
                        callOrder.push('ParentWasCalled');
                    }
                });
            });
            this.define.Class('test.MyClass', function (classDef) {
                classDef.inherits('test.MyParentClass');
                classDef.methods({
                    method1: function () {
                        this.parent();
                        callOrder.push('OriginalWasCalled');
                    }
                });
            });
            this.define.experiment.Class('test.MyClass.Experiment1.New', function (classDef, strat) {
                classDef.methods({
                    method1: strat.after(function () {
                        callOrder.push('Experiment1WasCalled');
                    })
                });
            });

            this.define.experiment.Class('test.MyClass.Experiment2.New', function (classDef, strat) {
                classDef.methods({
                    method1: strat.after(function () {
                        callOrder.push('Experiment2WasCalled');
                    })
                });
            });

            var myClass;
            classManager.getClass('test.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            var expected = ['ParentWasCalled', 'OriginalWasCalled', 'Experiment1WasCalled', 'Experiment2WasCalled'];
            runs(function () {
                myClass.method1();

                expect(callOrder).toBeEquivalentTo(expected);
            });
        });

        it('test statics merge', function(){
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);

            this.define.Class('test.MyClass', function (classDef) {
                classDef.statics({
                    STATIC1:'value1',
                    STATIC2:'value2'
                });
            });
            this.define.experiment.Class('test.MyClass.Experiment1.New', function (classDef) {
                classDef.statics({
                    STATIC3:'value3'
                });
            });

            var myClass;
            classManager.getClass('test.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            runs(function () {
                expect(myClass.STATIC1).toBeEquivalentTo('value1');
                expect(myClass.STATIC2).toBeEquivalentTo('value2');
                expect(myClass.STATIC3).toBeEquivalentTo('value3');
            });
        });

        it('test statics merge', function(){
            var experimentManager = this.W.Classes._experimentManager;
            var classManager = this.W.Classes;

            experimentManager._pluginsMap['ExperimentClassPlugin'].setRunningExperimentsOrder([
                {id: "experiment1", description: '', dependencies: [], conflicts: [], group: 'new'}
            ]);

            this.define.Class('test.MyClass', function (classDef) {
                classDef.statics({
                    STATIC1:{'a':'1', 'b':'2'},
                    STATIC2:'value2'
                });
            });
            this.define.experiment.Class('test.MyClass.Experiment1.New', function (classDef, str) {
                classDef.statics({
                    STATIC1:str.merge({'c':'3'})
                });
            });

            var myClass;
            classManager.getClass('test.MyClass', function (MyClass) {
                myClass = new MyClass();
            });

            waitsFor(function () {
                return myClass;
            }, 'get my class', 100);

            runs(function () {
                expect(myClass.STATIC1).toBeEquivalentTo({'a':'1', 'b':'2','c':'3'});
                expect(myClass.STATIC2).toBeEquivalentTo('value2');
            });
        });



    });

//    describe('define.experiment.newComponent', function() {
//
//        it('should register a new component', function(){
//            var componentCallback = getSpy('componentCallback');
//            define.experiment.newComponent('test.NewComponent', function(compDef) {
//                compDef.methods({
//                    originalMethod: function(){}
//                });
//            });
//
//            componentManager.getComponent('test.NewComponent', componentCallback);
//
//            expect(componentCallback).toHaveBeenCalledXTimes(1);
//
//        });
//
//    });

});