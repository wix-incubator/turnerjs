describe('ClassRepository', function() {
    testRequire().resources('W.Classes');

    beforeEach(function() {
//        var scriptLoader = new MockBuilder('MockScriptLoader').mockClass(this.W.Classes._classRepo._scriptLoader).getClass();

        this._xclass = new window.XClass();
        this.classRepo =  define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassRepository').init({});
    });

    describe('getClass & registerClass', function() {
        it('should return a class if it is registered', function() {
            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');
            this.classRepo.registerClass(registeredClass);

            expect(this.classRepo.getClass('TestClass')).toBe(registeredClass);
        });

        it('should return null if a class is not registered', function() {
            expect(this.classRepo.getClass('UnregisteredClass')).toBe(null);
        });
    });

    describe('getClassWhenReady', function() {
        it('should call the callback with the class if its ready', function() {
            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');
            this.classRepo.registerClass(registeredClass);
            var callback = getSpy();
            var result = this.classRepo.getClassWhenReady('TestClass', callback);

            expect(result).toBe(registeredClass);
            expect(callback).toHaveBeenCalledWith(registeredClass);
        });

        it('should skip adding ready classmanager to the loading queue', function() {
            this.func = getSpy();
            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');
            this.classRepo.registerClass(registeredClass);
            this.classRepo.getClassWhenReady('TestClass', this.func);

            expect(this.classRepo._scriptLoadingQueue.contains('TestClass')).toBe(false);
        });

        it('should add the class to the loading queue if it is pending', function() {
            this.func = getSpy();

            var dependantClassData = {name: 'TestClass1', Class:{}};
            this.classRepo.registerDependentClass(['SomeOtherClass'], this.func, dependantClassData, 'TestClass1');
            this.classRepo.getClassWhenReady('TestClass1', this.func);

            this.classRepo.getClassWhenReady('TestClass2', this.func);

            expect(this.classRepo._scriptLoadingQueue.contains('TestClass1')).toBe(false);
            expect(this.classRepo._scriptLoadingQueue.contains('TestClass2')).toBe(true);
        });

        it('should add the class to the loading queue if it is missing', function() {
            this.func = getSpy();

            this.classRepo.getClassWhenReady('TestClass2', this.func);

            expect(this.classRepo._scriptLoadingQueue.contains('TestClass2')).toBe(true);
        });

        it('should call the callback once the class is ready', function() {
            this.func = getSpy();

            this.classRepo.getClassWhenReady('TestClass', this.func);

            expect(this.func).toHaveBeenCalledXTimes(0);

            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');
            this.classRepo.registerClass(registeredClass);

            expect(this.func).toHaveBeenCalledWith(registeredClass);
        });
    });

    describe('isClassReady', function() {
        it('should return false if the class is not ready', function() {
            expect(this.classRepo.isClassReady('UnregisteredClass')).toBe(false);
        });

        it('should return true if the class is ready', function() {
            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');
            this.classRepo.registerClass(registeredClass);

            expect(this.classRepo.isClassReady('TestClass')).toBe(true);
        });
    });

    describe('areClassesReady', function() {
        it('should return true if the class list is empty', function() {
            expect(this.classRepo.areClassesReady([])).toBe(true);
        });

        it('should return false if some of the requested classmanager are not ready', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            this.classRepo.registerClass(registeredClass);

            expect(this.classRepo.areClassesReady(['RegisteredClass', 'UnregisteredClass'])).toBe(false);
        });

        it('should return true if all the classmanager in the list are ready', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass1'}, 'RegisteredClass1');
            this.classRepo.registerClass(registeredClass);

            var registeredClass1 = this._xclass.createClass({className: 'RegisteredClass2'}, 'RegisteredClass2');
            this.classRepo.registerClass(registeredClass1);

            expect(this.classRepo.areClassesReady(['RegisteredClass1', 'RegisteredClass2'])).toBe(true);
        });
    });

    describe('registerDependentClass', function() {
        it('should call the callback immediately if the dependencies are ready when its called', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            this.classRepo.registerClass(registeredClass);
            var registeredClass1 = this._xclass.createClass({className: 'RegisteredClass1'}, 'RegisteredClass1');
            this.classRepo.registerClass(registeredClass1);
            var dependantClassData = {name: 'dependantClass', Class:{}};
            var callback = getSpy();

            this.classRepo.registerDependentClass(['RegisteredClass', 'RegisteredClass1'], callback, dependantClassData, 'dependantClass');

            expect(callback).toHaveBeenCalledWith('dependantClass', dependantClassData);
        });

        it('should call the provided callback with the provided classData once all dependencies are ready', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            var registeredClass1 = this._xclass.createClass({className: 'RegisteredClass1'}, 'RegisteredClass1');
            var registeredClass2 = this._xclass.createClass({className: 'RegisteredClass2'}, 'RegisteredClass2');
            var dependantClassData = {name: 'dependantClass', Class:{}};
            this.func = getSpy();

            this.classRepo.registerClass(registeredClass);
            this.classRepo.registerDependentClass(['RegisteredClass', 'RegisteredClass1', 'RegisteredClass2'], this.func, dependantClassData, 'dependantClass');
            this.classRepo.registerClass(registeredClass1);

            this.classRepo.registerClass(registeredClass2);
            expect(this.func).toHaveBeenCalledWith('dependantClass', dependantClassData);
        });

        it('should not call the callback unless dependencies are ready', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            var dependantClassData = {name: 'dependantClass', Class:{}};
            this.func = getSpy();

            this.classRepo.registerDependentClass(['RegisteredClass', 'RegisteredClass1'], this.func, dependantClassData, 'dependantClass');
            this.classRepo.registerClass(registeredClass);

            expect(this.func).toHaveBeenCalledXTimes(0);
        });

        it('should call _addClassesToScriptLoadingQueue to load missing dependencies', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            var dependantClassData = {name: 'dependantClass', Class:{}};
            this.classRepo.registerClass(registeredClass);
            spyOn(this.classRepo, 'addClassesToScriptLoadingQueue');

            var classList = ['RegisteredClass', 'otherDependantClass', 'unregisteredClass'];
            this.classRepo.registerDependentClass(classList, function() {
            }, dependantClassData, 'dependantClass');

            expect(this.classRepo.addClassesToScriptLoadingQueue).toHaveBeenCalledWith(classList);
        });
    });

    describe('addClassesToScriptLoadingQueue', function() {
        it('should add a class to _scriptLoadingQueue if it is missing', function() {
            this.classRepo.addClassesToScriptLoadingQueue(['UnregisteredClass']);

            expect(this.classRepo._scriptLoadingQueue).toBeEquivalentTo(['UnregisteredClass']);
        });

        it('should add missing class dependencies to _scriptLoadingQueue', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            var dependantClassData = {name: 'OtherDependantClass', Class:{}};

            this.classRepo.registerClass(registeredClass);
            this.classRepo.registerDependentClass(['MissingDependency', 'RegisteredClass'], function() {
            }, dependantClassData, 'OtherDependantClass');

            expect(this.classRepo._scriptLoadingQueue).toBeEquivalentTo(['MissingDependency']);
        });

        it('should try loading missing classmanager within 10ms', function() {
            this.classRepo._scriptLoader.loadResource = jasmine.createSpy('loadResource');
            this.classRepo.loadMissingClasses();
            spyOn(this.classRepo, 'loadMissingClasses').andCallThrough();

            this.classRepo.addClassesToScriptLoadingQueue(['UnregisteredClass']);
            waitsFor(function() {
                return this.classRepo.loadMissingClasses.callCount > 0;
            }.bind(this), "loadMissingClasses to be called", 20);

            runs(function() {
                expect(this.classRepo._scriptLoader.loadResource).toHaveBeenCalledWith({'url': 'UnregisteredClass'});
            }.bind(this));
        });

        it('should try loading missing classmanager ONLY ONCE within 10ms interval', function() {
            this.classRepo.loadMissingClasses();
            spyOn(this.classRepo, 'loadMissingClasses').andCallThrough();

            this.classRepo.addClassesToScriptLoadingQueue(['UnregisteredClass1']);
            this.classRepo.addClassesToScriptLoadingQueue(['UnregisteredClass2']);

            sleep(10);

            runs(function() {
                expect(this.classRepo.loadMissingClasses).toHaveBeenCalledXTimes(1);
            }.bind(this));
        });
    });

    describe('_filterLoadedClassesFromList', function() {
        it('should filter _scriptLoadingQueue and remove already loaded classmanager', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            var dependantClassData = {name: 'DependantClass', Class:{}};
            this.classRepo.registerClass(registeredClass);
            this.classRepo.registerDependentClass(['SomeOtherClass'], function() {
            }, dependantClassData, 'DependantClass');

            var filtered = this.classRepo._filterLoadedClassesFromList(['RegisteredClass', 'DependantClass', 'UnregisteredClass']);

            expect(filtered).toBeEquivalentTo(['UnregisteredClass']);
        });
    });

    describe('getClassStatus', function() {
        it('should VALIDATE the status of a class in the repository', function() {
            spyOn(this.classRepo, 'isClassReady');

            this.classRepo.getClassStatus('MissingClass');

            expect(this.classRepo.isClassReady).toHaveBeenCalled();
        });

        it('should return the status of a MISSING class in the repository', function() {
            var status = this.classRepo.getClassStatus('missingClass');

            expect(status == 'missing').toBeTruthy();
        });

        it('should return the status of a READY class in the repository', function() {
            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');

            this.classRepo.registerClass(registeredClass);
            var status = this.classRepo.getClassStatus('TestClass');

            expect(status == 'ready').toBeTruthy();
        });

        it('should return the status of a PENDING class in the repository', function() {
            var dependantClassData = {name: 'TestClass1', Class:{}};

            this.classRepo.registerDependentClass(['someOtherClass'], function() {
            }, dependantClassData, 'TestClass1');
            var status = this.classRepo.getClassStatus('TestClass1');

            expect(status == 'pending').toBeTruthy();
        });
    });

    describe('getClassStatusDetails', function() {
        it('should VALIDATE the status of a class in the repository', function() {
            spyOn(this.classRepo, 'isClassReady');

            this.classRepo.getClassStatusDetails('MissingClass');

            expect(this.classRepo.isClassReady).toHaveBeenCalled();
        });

        it('should return the status of a MISSING class in the repository', function() {
            var status = this.classRepo.getClassStatusDetails('missingClass');

            expect(status == 'missing').toBeTruthy();
        });

        it('should return the status of a READY class in the repository', function() {
            var registeredClass = this._xclass.createClass({className: 'TestClass'}, 'TestClass');

            this.classRepo.registerClass(registeredClass);
            var status = this.classRepo.getClassStatusDetails('TestClass');

            expect(status == 'ready').toBeTruthy();
        });

        it('should return the status of a PENDING class in the repository, and the status of the class thats the cause of the pendingness', function() {
            var dependantClassData = {name: 'TestClass1', Class:{}};

            this.classRepo.registerDependentClass(['someOtherClass'], function() {
            }, dependantClassData, 'TestClass1');
            var status = this.classRepo.getClassStatusDetails('TestClass1');

            expect(status.indexOf('pending')>-1).toBeTruthy();
            expect(status.indexOf('someOtherClass')>-1).toBeTruthy();
        });
    });


    describe('loadMissingClasses', function() {

        beforeEach(function(){
            this.classRepo._scriptLoader.loadResource = jasmine.createSpy('loadResource');
        });

        it('should call ScriptLoader.loadMissingClasses', function() {

            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            this.classRepo.registerClass(registeredClass);

            var dependantClassData2 = {name: 'dependantClass2', Class:{}};
            this.classRepo.registerDependentClass(['someOtherClass'], function() {
            }, dependantClassData2, 'dependantClass2');

            this.classRepo.loadMissingClasses();

            expect(this.classRepo._scriptLoader.loadResource).toHaveBeenCalled();
        });

        it('should call ScriptLoader.loadResource with the filtered queue', function() {
            var recievedArg = [];

            this.classRepo._scriptLoader.loadResource.andCallFake(function(resource) {
                recievedArg.push(resource.url);
            });

            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            this.classRepo.registerClass(registeredClass);

            var dependantClassData2 = {name: 'dependantClass2', Class:{}};
            this.classRepo.registerDependentClass(['someOtherClass'], function() {
            }, dependantClassData2, 'dependantClass2');

            var dependantClassData = {name: 'dependantClass', Class:{}};
            var classList = ['RegisteredClass', 'dependantClass2', 'unregisteredClass'];

            this.classRepo.registerDependentClass(classList, function() {
            }, dependantClassData, 'dependantClass');

            this.classRepo.loadMissingClasses();

            expect(recievedArg.sort()).toBeEquivalentTo(['someOtherClass', 'unregisteredClass'].sort());
        });

        it('should clear the queue after ScriptLoader.loadMissingClasses has been called', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            this.classRepo.registerClass(registeredClass);

            var dependantClassData2 = {name: 'dependantClass2', Class:{}};
            this.classRepo.registerDependentClass(['someOtherClass'], function() {
            }, dependantClassData2, 'dependantClass2');

            var dependantClassData = {name: 'dependantClass', Class:{}};
            var classList = ['RegisteredClass', 'dependantClass2', 'unregisteredClass'];

            this.classRepo.registerDependentClass(classList, function() {
            }, dependantClassData, 'dependantClass');

            this.classRepo.loadMissingClasses();

            expect(this.classRepo._scriptLoadingQueue.length).toBe(0);
        });

        it('should not call ScriptLoader.loadMissingClasses if the filtered queue length is 0', function() {
            var registeredClass = this._xclass.createClass({className: 'RegisteredClass'}, 'RegisteredClass');
            this.classRepo.registerClass(registeredClass);

            var dependantClassData2 = {name: 'dependantClass2', Class:{}};
            this.classRepo.registerDependentClass(['someOtherClass'], function() {
            }, dependantClassData2, 'dependantClass2');

            var dependantClassData = {name: 'dependantClass', Class:{}};
            var classList = ['RegisteredClass', 'dependantClass2', 'unregisteredClass'];

            this.classRepo.registerDependentClass(classList, function() {
            }, dependantClassData, 'dependantClass');

            var someOtherClass = this._xclass.createClass({className: 'someOtherClass'}, 'someOtherClass');
            this.classRepo.registerClass(someOtherClass);

            var unregisteredClass = this._xclass.createClass({className: 'unregisteredClass'}, 'unregisteredClass');
            this.classRepo.registerClass(unregisteredClass);

            this.classRepo.loadMissingClasses();

            expect(this.classRepo._scriptLoader.loadResource).toHaveBeenCalledXTimes(0);
        })
    });


    describe("class override", function() {
        it("should replace a class with another class constructor", function() {
            var mockClassName = 'MockClass';
            var originalClass = this._xclass.createClass({className: mockClassName}, mockClassName);
            var overrideClass = this._xclass.createClass({className:mockClassName, isOverride:true}, mockClassName);

            this.classRepo.override(mockClassName, originalClass);
            this.classRepo.override(mockClassName, overrideClass);

            expect(this.classRepo.getClass(mockClassName)).toBe(overrideClass);
        });
    });
});