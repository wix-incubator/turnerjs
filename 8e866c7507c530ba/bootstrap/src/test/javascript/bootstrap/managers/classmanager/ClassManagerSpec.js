describe('NewClassManager', function () {
    var classes;
    beforeEach(function () {
        classes = this.define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassManager').init();
    });

    describe('getClass', function () {
        beforeEach(function () {
            this.define.Class('test.classmanager.EmptyClass', function (classDefinition) {
                /**@type bootstrap.managers.classmanager.ClassDefinition*/
                var def = classDefinition;
                def.methods({
                    testMethod:function () {
                    }
                });
            });
        });

        it('should call class repository addClassesToScriptLoadingQueue with the missing class name', function () {
            var className = 'test.classmanager.NotARealClass';
            spyOn(classes._classRepo, 'addToWaitingForReady').andCallThrough();
            spyOn(classes._classRepo, 'addClassesToScriptLoadingQueue');
            var classCallback = getSpy('classCallback');

            var classStatus = classes.getClassStatus(className);
            classes.getClass(className, classCallback);

            expect(classCallback.callCount).toBe(0);
            expect(classStatus).toBe('missing');
            expect(classes._classRepo.addToWaitingForReady).toHaveBeenCalledWithEquivalentOf(className, classCallback);
            expect(classes._classRepo.addClassesToScriptLoadingQueue).toHaveBeenCalledWithEquivalentOf([className]);
        });

        it('should return Class through callback if class definition is loaded but not ready (and has no dependencies in this case - so it return immediately)', function () {
            var className = 'test.classmanager.EmptyClass';
            spyOn(classes._classRepo, 'addToWaitingForReady').andCallThrough();
            var classCallback = getSpy('classCallback');

            var classStatus = classes.getClassStatus(className);
            classes.getClass(className, classCallback);

            expect(classStatus).toBe('loaded');
            expect(classCallback.mostRecentCall.args[0].$originalClassName).toBe(className);
            expect(classes._classRepo.addToWaitingForReady).toHaveBeenCalledWithEquivalentOf(className, classCallback);
        });

        it('should return Class and call callback if class definition is ready', function () {
            var className = 'test.classmanager.EmptyClass';
            var classCallback = getSpy('classCallback');
            classes.getClass(className, function () {
            });

            var classStatus = classes.getClassStatus(className);
            var ReturnClass = classes.getClass(className, classCallback);

            expect(classStatus).toBe('ready');
            expect(ReturnClass).toBe(classCallback.mostRecentCall.args[0]);
            expect(ReturnClass.$originalClassName).toBe(className);
        });
    });

    describe('getStatus', function () {
        it("should return repository's getStatus with requested classname", function () {
            spyOn(classes._classRepo, 'getClassStatus').andReturn(false);

            classes.getClassStatus('testClassName');

            expect(classes._classRepo.getClassStatus).toHaveBeenCalledWith('testClassName');
        });
    });

    describe('clone', function () {
        it('should create new instances of ClassParser', function () {
            var clonedClassManager = classes.clone(this.define);

            expect(clonedClassManager._classParser).toBeInstanceOf(this.define.getBootstrapClass("bootstrap.managers.classmanager.ClassParser"));
        });

        it('should create new instances of ClassRepository', function () {
            var clonedClassManager = classes.clone(this.define);

            expect(clonedClassManager._classRepo).toBeInstanceOf(this.define.getBootstrapClass("bootstrap.managers.classmanager.ClassRepository"));
        });

        it('should call classRepo clone', function () {
            spyOn(classes._classRepo, 'clone').andCallThrough();

            classes.clone(this.define);

            expect(classes._classRepo.clone).toHaveBeenCalled();
        });

        it('should return new instance of ClassManager', function () {
            var clonedClassManager = classes.clone(this.define);

            expect(typeOf(clonedClassManager) == 'object').toBeTruthy();
        });
    });

    describe("class override", function () {
        it("should replace a class with another class constructor", function () {
            var mockClassName = "test.classmanager.MockClass";
            var overrideClassName = "test.classmanager.MockClass";
            this.define.Class(mockClassName, function (classDefinition) {
            });
            this.define.Class(overrideClassName, function (classDefinition) {
            });

            var classCallback = getSpy('classCallback');
            classes.getClass(overrideClassName, classCallback);
            var overrideClass = classCallback.mostRecentCall.args[0];

            classes.override('test.classmanager.MockClass', overrideClass);

            classes.getClass(mockClassName, classCallback);
            var mockClass = classCallback.mostRecentCall.args[0];
            expect(mockClass).toBe(overrideClass);
        });
    });
});