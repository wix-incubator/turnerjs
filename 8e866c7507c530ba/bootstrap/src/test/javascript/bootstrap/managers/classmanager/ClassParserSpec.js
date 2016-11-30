describe('ClassParser', function () {
    testRequire().resources('W.Classes');
    beforeEach(function () {
        var repo = this.define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassRepository').init();
        this.parser = this.define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassParser').init(repo);

        this.mockClassData = {
            name:'mobile.editor.components.MockClassData',
            imports:['mocked.Importee1', 'mocked.Importee2'],
            traits:['mocked.Trait'],
            Class:{
                Extends:'mocked.extended.ParentClass'
            }
        };
    });

    xdescribe('registerClass', function () {
        it('should validate class and report error for invalid classmanager', function () {
            spyOn(this.parser, '_getClassDataErrorCode').andReturn("fake invalid class");

            expect(function () {
                this.parser.registerClass(this.mockClassData);
            }.bind(this)).toReportError(wixErrors.CLASS_INVALID_PENDING_OBJECT, 'mobile.editor.components.MockClassData', 'class data validation', "fake invalid class");
        });

        it('should register a class to the repository if there are *NO* missing dependencies', function () {
            var rawClass = {
                name:'MockClassWithoutDependencies',
                Class:{}
            };

            this.parser._repository.areClassesReady.andReturn(true);
            var _class = this.parser.registerClass(rawClass);

            expect(_class).toBeInstanceOf(XClass);
            expect(_class.prototype.$className).toBe('MockClassWithoutDependencies');
        });

        it('should register a class to the repository if there are missing dependencies', function () {
            var dependencies = [this.mockClassData.Extends, this.mockClassData.traits, this.mockClassData.imports];

            spyOn(this.parser, '_getClassDataErrorCode').andReturn(false);
            spyOn(this.parser, '_getItemDependencies').andReturn(dependencies);

            this.parser._repository.areClassesReady.andReturn(false);
            this.parser.registerClass(this.mockClassData);

            expect(this.parser._repository.registerDependentClass).toHaveBeenCalledWith(dependencies, this.parser.registerClass, this.mockClassData);
        });

        it('should execute onClassReady if exists on classData', function () {
            var rawClass = {
                name:'MockClassWithoutDependencies',
                Class:{},
                onClassReady:function () {
                }
            };
            spyOn(rawClass, 'onClassReady');
            this.parser._repository.areClassesReady.andReturn(true);

            this.parser.registerClass(rawClass);

            expect(rawClass.onClassReady).toHaveBeenCalled();
        });
    });

    xdescribe('_getItemDependencies', function () {
        it('should return an array of dependencies (class names array)', function () {
            this.mockClassData = {
                name:'mobile.editor.components.MockClassData',
                traits:['mocked.Trait'],
                imports:['mocked.Importee1', 'mocked.Importee2'],
                Class:{
                    Extends:'mocked.extended.ParentClass'
                }
            };

            var results = this.parser._getItemDependencies(this.mockClassData);
            var expected = ['mocked.extended.ParentClass', 'mocked.Importee1', 'mocked.Importee2', 'mocked.Trait'];

            expect(results).toBeOfType('array');
            expect(results).toBeEquivalentTo(expected);
        });
    });

    xdescribe('_prepClassData', function () {
        it('should replace dependencies strings and populate them with matching functions', function () {
            this.parser._repository.registerClass.andReturn(function () {
            });

            var parsedClass = this.parser._prepClassData(this.mockClassData);

            expect(typeOf(parsedClass['Extends'] == 'function')).toBeTruthy();
            expect(typeOf(parsedClass['imports'] == 'function')).toBeTruthy();
            expect(typeOf(parsedClass['traits'] == 'function')).toBeTruthy();
        });

        describe("imports", function () {
            it('should inherit parent imports', function () {
                var repo = new MockBuilder('Repo').extendClass(W.ClassManager.ClassRepository).getInstance();
                this.parser = new W.ClassManager.ClassParser(repo);

                var importedClassData1 = {
                    name:'ImportedClass1',
                    Class:{}
                };

                var importedClassData2 = {
                    name:'ImportedClass2',
                    Class:{}
                };

                var baseClassData = {
                    name:'BaseClass',
                    imports:['ImportedClass1'],
                    Class:{}
                };

                var extendClassData = {
                    name:'ExtendedClass',
                    imports:['ImportedClass2'],
                    Class:{
                        Extends:'BaseClass'
                    }
                };

                var importedClass1 = this.parser.registerClass(importedClassData1);
                var importedClass2 = this.parser.registerClass(importedClassData2);

                this.parser.registerClass(baseClassData);

                var extendClass = this.parser.registerClass(extendClassData);
                expect(extendClass.prototype.imports).toBeEquivalentTo({ImportedClass1:importedClass1, ImportedClass2:importedClass2});
            });

            it('should inherit imports on traits', function () {
                var repo = new MockBuilder('Repo').extendClass(W.ClassManager.ClassRepository).getInstance();
                this.parser = new W.ClassManager.ClassParser(repo);

                var importedDependency = {
                    name:"core.test.Class",
                    Class:{
                        initialize:function () {
                            return "importedDependencyClass";
                        }
                    }
                };

                var traitWithImports = {
                    name:'core.test.trait.Imports',
                    imports:['core.test.Class'],
                    Class:{} // this should be 'trait', but for testing flexbility we're using 'Class'
                };

                var classWithTrait = {
                    name:'mobile.editor.components.ClassWithTraitWithImportsWithKarma',
                    traits:['core.test.trait.Imports'],
                    Class:{}
                };

                this.parser.registerClass(importedDependency);
                this.parser.registerClass(traitWithImports);
                this.parser.registerClass(classWithTrait);

                expect(classWithTrait.Class.imports[0]).toBeEquivalentTo(traitWithImports.Class.imports[0]);
            });

            it('should use full qualified class name if the shorthand classname is used by previous import', function () {
                var repo = new MockBuilder('Repo').extendClass(W.ClassManager.ClassRepository).getInstance();
                this.parser = new W.ClassManager.ClassParser(repo);

                var importedClassData1 = {
                    name:'package1.ImportedClass',
                    Class:{}
                };

                var importedClassData2 = {
                    name:'package2.ImportedClass',
                    Class:{}
                };

                var extendClassData = {
                    name:'ExtendedClass',
                    imports:['package1.ImportedClass', 'package2.ImportedClass'],
                    Class:{}
                };

                var importedClass1 = this.parser.registerClass(importedClassData1);
                var importedClass2 = this.parser.registerClass(importedClassData2);
                var extendClass = this.parser.registerClass(extendClassData);

                expect(extendClass.prototype.imports).toBeEquivalentTo({ImportedClass:importedClass1, 'package2.ImportedClass':importedClass2});
            });
        });
    });

    xdescribe('_getClassDataErrorCode', function () {
        it('should validate class data', function () {
            expect(this.parser._getClassDataErrorCode(this.mockClassData)).toBeFalsy();
        });

        it('should validate imports as a string array', function () {
            this._mockClassData = {
                name:"invalid.Imports",
                imports:[
                    {isObject:true, isValid:false}
                ],
                Class:{}
            };

            expect(this.parser._getClassDataErrorCode(this._mockClassData)).toBe("Invalid imports array");
        });

        it('should validate traits as a strings array', function () {
            this._mockClassData = {
                name:"invalid.Traits",
                traits:[
                    {isObject:true, isValid:false}
                ],
                Class:{}
            };

            expect(this.parser._getClassDataErrorCode(this._mockClassData)).toBe("Invalid traits array")
        });

        it('should validate Extends as a string', function () {
            this._mockClassData = {
                name:"invalid.Extends",
                Extends:[
                    {isObject:true, isValid:false}
                ],
                Class:{}
            };

            expect(this.parser._getClassDataErrorCode(this._mockClassData)).toBe("Extends must be a string");
        });
    });

    xdescribe('_isValidClassName', function () {
        it('should validate package names', function () {
            var _className = this.parser._isValidClassName('some.arbitrary.ClassName');
            expect(_className).toBeTruthy();
        });

        it('should validate packageless class names', function () {
            var _className = this.parser._isValidClassName('ClassName');
            expect(_className).toBeTruthy();
        });

        it('should disqualify invalid package names', function () {
            var _className = this.parser._isValidClassName('InvalidPackageName.className');
            expect(_className).toBeFalsy();
        });

        it('should disqualify invalid class names', function () {
            var _className = this.parser._isValidClassName('#className');
            expect(_className).toBeFalsy();
        });
    });

    xdescribe('_isStringArray', function () {
        it('should validate an empty array', function () {
            expect(this.parser._isStringArray([])).toBeTruthy();
        });

        it('should validate an array of strings', function () {
            var _array = ['string1', 'string2', 'string3'];
            expect(this.parser._isStringArray(_array)).toBeTruthy();
        });

        it('should invalidate an array with non-strings', function () {
            var _arrayWithNumbers = ['string1', 15, 88];
            var _arrayWithObjects = ['string1', {foo:"boo"}, {}];

            expect(this.parser._isStringArray(_arrayWithNumbers)).toBeFalsy();
            expect(this.parser._isStringArray(_arrayWithObjects)).toBeFalsy();
        });
    });

    describe('_getFullNotReadyDependencyList', function () {
        it("simple case", function () {
            this.parser._repository._waitingForDependencies = {'classA':{dependenciesArray:['classB']},
                'classB':{dependenciesArray:['classC']},
                'classC':{dependenciesArray:['classA']}};
            var expected = {'classB':['classC'], 'classC':['classA']};

            var result = this.parser._getFullNotReadyDependencyList('classA', ['classB']);

            expect(result).toBeEquivalentTo(expected);
        });

        it("complex case", function () {
            this.parser._repository._waitingForDependencies = {'classA':{dependenciesArray:['classB']},
                'classB':{dependenciesArray:['classC', 'classD', 'classE']},
                'classC':{dependenciesArray:['classA', 'classD']},
                'classD':{dependenciesArray:['classB', 'classA']}
            };
            var expected = {'classB':['classC', 'classD', 'classE'], 'classC':['classA', 'classD'], 'classD':['classB', 'classA']};

            var result = this.parser._getFullNotReadyDependencyList('classA', ['classB']);

            expect(result).toBeEquivalentTo(expected);
        });
    });

    describe('_checkReadyRamificationsOnDependencies', function(){
        it('should return true for simple case', function(){
            var dependenciesObj = {'classB':['classC'], 'classC':['classA']};

            var result = this.parser._checkReadyRamificationsOnDependencies('classA', dependenciesObj);

            expect(result).toBeTruthy();
        });

        it('complex case1', function(){
            var dependenciesObj = {'classB':['classC', 'classD'], 'classC':['classA'], 'classD':['classB', 'classC']};

            var result = this.parser._checkReadyRamificationsOnDependencies('classA', dependenciesObj);

            expect(result).toBeTruthy();
        });

        it('complex case2', function(){
            var dependenciesObj = {'classB':['classC', 'classD', 'classE'], 'classC':['classA'], 'classD':['classB', 'classC']};

            var result = this.parser._checkReadyRamificationsOnDependencies('classA', dependenciesObj);

            expect(result).toBeFalsy();
        });
    });

    describe('_prepResources', function(){
        beforeEach(function(){
            this.define.Class('Resource1', function(def){});
            this.define.Class('Resource2', function(def){});
            this.define.Class('Resource3', function(def){});
            this.define.Class('Resource4', function(def){});
            this.define.Class('Resource5', function(def){});
            this.define.Class('Resource6', function(def){});

            var resource1, resource2,resource3, resource4, resource5, resource6;
            this.W.Classes.getClass('Resource1', function(resourceClass){
                resource1 = resourceClass;
            }.bind(this));
            this.define.resource('Resource1', resource1);

            this.W.Classes.getClass('Resource2', function(resourceClass){
                resource2 = resourceClass;
            }.bind(this));
            this.define.resource('Resource2', resource2);

            this.W.Classes.getClass('Resource3', function(resourceClass){
                resource3 = resourceClass;
            }.bind(this));
            this.define.resource('Resource3', resource3);

            this.W.Classes.getClass('Resource4', function(resourceClass){
                resource4 = resourceClass;
            }.bind(this));
            this.define.resource('Resource4', resource4);

            this.W.Classes.getClass('Resource5', function(resourceClass){
                resource5 = resourceClass;
            }.bind(this));
            this.define.resource('Resource5', resource5);

            this.W.Classes.getClass('Resource6', function(resourceClass){
                resource6 = resourceClass;
            }.bind(this));
            this.define.resource('Resource6', resource6);
        });

        it("should return all parent resources for child (1)", function(){
            this.define.Class('GreatGrandParent', function(def){
                def.resources(['Resource1']);
            });
            this.define.Class('GrandParent', function(def){
                def.inherits('GreatGrandParent');
                def.resources(['Resource2']);
            });
            this.define.Class('Parent', function(def){
                def.inherits('GrandParent');
                def.resources(['Resource3', 'Resource4']);
            });

            var parent;
            this.W.Classes.getClass('Parent', function(parentClass){
                parent = parentClass;
            }.bind(this));

            var classDef = {
                className:'Child',
                _resources_:['Resource5'],
                _fields_: {_extends_:parent}
            };

            var result = this.parser._prepResources(classDef);

            expect(result.indexOf('Resource1')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource2')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource3')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource4')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource5')).toBeGreaterThan(-1);
        });

        it("should return all parent and trait resources for child (2)", function(){
            this.define.Class('Trait1', function(def){
                def.resources(['Resource1']);
            });
            this.define.Class('Trait2', function(def){
                def.inherits('Trait1');
                def.resources(['Resource2'])
            });
            this.define.Class('GreatGrandParent', function(def){
               // def.resources(['Resource3']);
                def.traits(['Trait2']);
            });
            this.define.Class('GrandParent', function(def){
                def.inherits('GreatGrandParent');
                def.resources(['Resource4']);
            });
            this.define.Class('Parent', function(def){
                def.inherits('GrandParent');
                def.resources(['Resource5', 'Resource6']);
            });

            var parent;
            this.W.Classes.getClass('Parent', function(parentClass){
                parent = parentClass;
            }.bind(this));

            var classDef = {
                className:'Child',
                _resources_:['Resource7'],
                _fields_:{_extends_:parent}
            };
            var result = this.parser._prepResources(classDef);

            expect(result.indexOf('Resource1')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource2')).toBeGreaterThan(-1);
            //expect(result.indexOf('Resource3')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource4')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource5')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource6')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource7')).toBeGreaterThan(-1);

        });

        it("should return all parent and trait resources for child (3)", function(){
            this.define.Class('Trait1', function(def){
                def.resources(['Resource1']);
            });
            this.define.Class('Trait2', function(def){
                def.inherits('Trait1');
                def.resources(['Resource2'])
            });
            this.define.Class('GreatGrandParent', function(def){
                def.resources(['Resource3']);
                def.traits(['Trait2']);
            });
            this.define.Class('GrandParent', function(def){
                def.inherits('GreatGrandParent');
                def.resources(['Resource4']);
            });
            this.define.Class('Parent', function(def){
                def.inherits('GrandParent');
                def.resources(['Resource5', 'Resource6']);
            });

            var parent;
            this.W.Classes.getClass('Parent', function(parentClass){
                parent = parentClass;
            }.bind(this));

            var classDef = {
                name:'Child',
                _resources_:['Resource7'],
                _fields_: {_extends_:parent}
            };
            var result = this.parser._prepResources(classDef);

            expect(result.indexOf('Resource1')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource2')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource3')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource4')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource5')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource6')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource7')).toBeGreaterThan(-1);

        });

        it("should return all parent and trait resources for child (4)", function(){
            this.define.Class('Trait1', function(def){
                def.resources(['Resource1']);
            });
            this.define.Class('Trait2', function(def){
                def.inherits('Trait1');
            });
            this.define.Class('GreatGrandParent', function(def){
               def.resources(['Resource2']);
                def.traits(['Trait2']);
            });
            this.define.Class('GrandParent', function(def){
                def.inherits('GreatGrandParent');
                def.resources(['Resource3']);
            });
            this.define.Class('Parent', function(def){
                def.inherits('GrandParent');
            });

            var parent;
            this.W.Classes.getClass('Parent', function(parentClass){
                parent = parentClass;
            }.bind(this));

            var classDef = {
                className:'Child',
                _resources_:['Resource4'],
                _fields_: {_extends_:parent}
            };
            var result = this.parser._prepResources(classDef);

            expect(result.indexOf('Resource1')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource2')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource3')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource4')).toBeGreaterThan(-1);
        });

        it("should return all trait resources for child (5)", function(){
            this.define.Class('Trait1', function(def){
                def.resources(['Resource1']);
            });
            this.define.Class('Trait2', function(def){
                def.inherits('Trait1');
                def.resources(['Resource2'])
            });

            var trait;
            this.W.Classes.getClass('Trait2', function(Trait2Class){
                trait = Trait2Class;
            }.bind(this));

            var classDef = {
                className:'Child',
                _resources_:['Resource3'],
                _fields_: {_traits_:[trait]}
            };
            var result = this.parser._prepResources(classDef);

            expect(result.indexOf('Resource1')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource2')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource3')).toBeGreaterThan(-1);
        });

        it("should return all parent and trait resources for child (6)", function(){
            this.define.Class('Trait1', function(def){
                def.resources(['Resource1']);
            });
            this.define.Class('Trait2', function(def){
                def.inherits('Trait1');
                def.resources(['Resource2'])
            });

            this.define.Class('Parent', function(def){
                def.traits(['Trait2']);
            });

            var parent;
            this.W.Classes.getClass('Parent', function(parentClass){
                parent = parentClass;
            }.bind(this));

            var classDef = {
                className:'Child',
                _resources_:['Resource3'],
                _fields_: {_extends_:parent}
            };
            var result = this.parser._prepResources(classDef);

            expect(result.indexOf('Resource1')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource2')).toBeGreaterThan(-1);
            expect(result.indexOf('Resource3')).toBeGreaterThan(-1);
        });

    });

    describe('_prepClassImports', function(){
        beforeEach(function(){
            this.define.Class('Import1', function(def){});
            this.define.Class('Import2', function(def){});
            this.define.Class('Import3', function(def){});
            this.define.Class('Import4', function(def){});
            this.define.Class('Import5', function(def){});
            this.define.Class('Import6', function(def){});
            this.define.Class('Import7', function(def){});
            this.define.Class('GreatGreatGrandParent', function(def){
                def.utilize(['Import1']);
            });
            this.define.Class('GreatGrandParent', function(def){
                def.inherits('GreatGreatGrandParent');
                def.utilize(['Import2', 'Import3']);
            });
            this.define.Class('GrandParent', function(def){
                def.inherits('GreatGrandParent');
                def.utilize(['Import4', 'Import5']);
            });
            this.define.Class('Parent', function(def){
                def.inherits('GrandParent');
                def.utilize(['Import6']);
            });

        });
        it("should return all parent imports for child", function(){
            var parent;
            this.W.Classes.getClass('Parent', function(parentClass){
                parent = parentClass;
            }.bind(this));
            var classDef = {
                className:'Child',
                _imports_:['Import7'],
                _fields_: {
                    _extends_:parent
                }
            };

            var expected = ['Import1','Import2','Import3','Import4','Import5','Import6','Import7'];

            this.parser._prepClassImports(classDef);
            var importsResult =  classDef._fields_.imports;
            var importNameArray = [];
            for(var importName in importsResult){
                importNameArray.push(importName);
            }
            expect(importNameArray).toBeEquivalentTo(expected);
        });

    });
});