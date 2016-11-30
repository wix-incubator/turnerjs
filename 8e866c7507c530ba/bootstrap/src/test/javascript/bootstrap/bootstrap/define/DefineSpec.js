describe("define", function () {
    describe("general usage", function () {
        it('define and retrieve definitions', function () {
            var define = new Define();
            define.addDefinitions({
                test: {
                    namespace: function (name, value) {
                    }
                }
            });

            define.test.namespace('defined.value', 'ok');
            var definedValue = define.getDefinition('test.namespace', 'defined.value');

            expect(definedValue).toBe('ok');
        });
    });

    describe("getters", function () {
        var define;
        var TestClass = function () {
        };

        beforeEach(function () {
            define = new Define(['bootstrapClass']);

            define.bootstrapClass('test.TestClass', function () {
                return TestClass;
            });
        });

        describe("getBootstrapClass", function () {
            it("should retrieve a class defined using 'define.bootstrapClass'", function () {
                var result = define.getBootstrapClass('test.TestClass');

                expect(result).toBe(TestClass);
            });

            it("should throw en Error for an undefined class", function () {
                expect(function () {
                    define.getBootstrapClass('undefined.Class');
                }).toThrow('Undefined bootstrapClass requested: undefined.Class');
            });
        });

        describe("createBootstrapClassInstance", function () {
            it("should create an instance of a class defined using 'define.bootstrapClass'", function () {
                var result = define.createBootstrapClassInstance('test.TestClass');

                expect(result).toBeInstanceOf(TestClass);
            });

            it("should throw en Error for an undefined class", function () {
                expect(function () {
                    define.createBootstrapClassInstance('undefined.Class');
                }).toThrow('Undefined bootstrapClass requested: undefined.Class');
            });

            it("should work with js native instanceof", function () {
                var instance = define.createBootstrapClassInstance('test.TestClass');
                var Class = define.getBootstrapClass('test.TestClass');

                expect(instance instanceof Class).toBeTruthy();
            });
        });
    });

    describe('experiments functionality', function () {
        var testDefine;
        beforeEach(function () {
            testDefine = new Define();
        });

        describe('_getExperimentListResource', function () {
            it('should return experimentsListResource if it is defined', function () {
                var expectedDefinition = {
                        value: 'mockValue'
                    },
                    actualDefinition;

                spyOn(testDefine, 'getDefinition').andCallFake(function () {
                    return expectedDefinition;
                });

                actualDefinition = testDefine._getExperimentListResource();

                expect(actualDefinition).toEqual('mockValue');
            });

            it('should return an empty experimentsListResource with isMergedExperimentResource function defined it', function () {
                var actualDefinition;

                spyOn(testDefine, 'getDefinition').andCallFake(function () {
                    return undefined;
                });

                actualDefinition = testDefine._getExperimentListResource();

                expect(actualDefinition.isMergedExperimentResource).toBeDefined();
            });
        });

        describe('_skipDefinition', function () {
            it('should return false if namespace does not begin with "experiment."', function () {
                var mockResourceNamespace = 'some.mock.namespace.not.starting.with.experiment',
                    mockResourceName = 'mockResourceName',
                    actualResult;

                spyOn(testDefine, '_getExperimentListResource').andCallFake(function () {
                    return {
                        isMergedExperimentResource: function () {
                        }
                    };
                });

                actualResult = testDefine._skipDefinition(mockResourceNamespace, mockResourceName);

                expect(actualResult).toBe(false);
            });

            it('should return what isMergedExperimentResource returns if namespace begins with "experiment."', function () {
                var mockResourceNamespace = 'experiment.testing.mock',
                    mockResourceName = 'mockResourceName',
                    expectedResult = 'mockIsMergedReturnValue',
                    actualResult;

                spyOn(testDefine, '_getExperimentListResource').andCallFake(function () {
                    return {
                        isMergedExperimentResource: function () {
                            return expectedResult;
                        }
                    };
                });

                actualResult = testDefine._skipDefinition(mockResourceNamespace, mockResourceName);

                expect(actualResult).toBe(expectedResult);
            });
        });
    });
});