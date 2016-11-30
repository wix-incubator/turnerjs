describe('defineClass', function () {
    /** @type {bootstrap.managers.classes.ClassManager} */
    var classes;
    /** @type {Define} */
//    var define;

    beforeEach(function () {
//        define = new Define(['Class', 'oldClass']).copyDefinitionsFrom(window.define, ['bootstrapClass', 'resource']);
//        classes = define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassManager').init();
        classes = null;
        this.resource.getResourceValue('W.Classes', function(classesIns) {
            classes = classesIns;
        });
        waitsFor(function(){
            return classes;
        },'W.Classes to be defined', 1);
    });

    describe('define.Class', function () {

        it('should define a class with no dependencies and retrieve it synchronously through the class manager', function () {
            define.Class('test.defineclass.Class1', function (classDefinition) {
                /**@type bootstrap.managers.classmanager.ClassDefinition*/
                var def = classDefinition;
                def.methods({
                    testMethod:function () {
                    }
                });
            });

            var classCallback = getSpy();

            classes.getClass('test.defineclass.Class1', classCallback);

            expect(classCallback.mostRecentCall.args[0].$originalClassName).toBe('test.defineclass.Class1');

        });

    });

    describe('define.Class.Resources', function () {

        it('should set resources on the class', function () {
            var _class;
            var classCallback = function(Class){
                _class = Class;
            };

            define.Class('test.defineclass.OldClass2', function(def){
                def.resources(['W.Classes', 'W.Commands']);
                def.methods({
                    initialize:function () {
                    },
                    testMethod:function () {
                    }
                });
            });

            classes.getClass('test.defineclass.OldClass2', classCallback);

            waitsFor(function () {
                return !!_class;
            }, 'old class to be ready', 100);
            runs(function () {
                this.resource.getResources(['W.Classes', 'W.Commands'], function(res){
                    expect(_class.prototype.resources.W.Classes === res.W.Classes).toBe(true);
                    expect(_class.prototype.resources.W.Commands === res.W.Commands).toBe(true);
                });
            });
        });

        it('should wait for a resource before getting the class', function () {
            define.Class('test.defineclass.OldClass3', function(def){
                def.resources(['HolyResource', 'HolyResource2']);
                def.methods({
                    initialize:function () {
                    },
                    testMethod:function () {
                    }
                });
            });


            var _class;
            var classCallback = function(Class){ _class = Class; };

            classes.getClass('test.defineclass.OldClass3', classCallback);

            var HolyResource =  {msg:'You Shell Not Pass'};
            var HolyResource2 = {msg:'You Shell Pass'};

            setTimeout(function(){
                define.resource('HolyResource', HolyResource);
            }, 10);

            setTimeout(function(){
                define.resource('HolyResource2', HolyResource2);
            }, 20);

            waitsFor(function () {
                return !!_class;
            }, 'class to get all the resources', 300);

            runs(function () {
                expect(_class.prototype.resources.HolyResource === HolyResource).toBe(true);
                expect(_class.prototype.resources.HolyResource2 === HolyResource2).toBe(true);
            });
        });



        xit('should resolve circular reference of resources', function () {

            define.Class('test.defineclass.ClassA', function(def){
                def.utilize(['test.defineclass.ClassB']);
                def.methods({
                    initialize:function () {
                    }
                });
            });

            define.Class('test.defineclass.ClassB', function(def){
                def.utilize(['test.defineclass.ClassA']);
                def.methods({
                    initialize:function () {
                    }
                });
            });



            var _class1; var _class2;
            classes.getClass('test.defineclass.OldClassA', function(Class){
                _class1 = Class;
            });
            classes.getClass('test.defineclass.OldClassB', function(Class){
                _class2 = Class;
            });

            waitsFor(function () {
                return !!(_class1 && _class2);
            }, 'class to get all the resources', 50);

            runs(function () {

                expect(_classA.imports.ClassB).toBe(_classB);
                expect(_classB.imports.ClassA).toBe(_classA);
            });
        });




    });





});