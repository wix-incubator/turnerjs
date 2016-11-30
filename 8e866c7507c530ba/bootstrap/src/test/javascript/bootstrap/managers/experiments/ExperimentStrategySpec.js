describe('ExperimentStrategySpec', function () {
    var experimentStrategy;
    beforeEach(function () {
        experimentStrategy = define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentStrategy');
        experimentStrategy.init();
    });

    describe("test before", function () {
        it("should set strategy to before", function () {
            var beforeFunc = getSpy();

            experimentStrategy.before(beforeFunc);

            expect(beforeFunc[experimentStrategy.STRATEGY_FLAG]).toBe(experimentStrategy.BEFORE);
        });

        it("should return an error when before param is not a function", function () {
            var beforeString = "aaa";

            expect(function () {
                experimentStrategy.before(beforeString);
            }.bind(this)).toThrow();

        });
    });

    describe("test after", function () {
        it("should set strategy to after", function () {
            var afterFunc = getSpy();

            experimentStrategy.after(afterFunc);

            expect(afterFunc[experimentStrategy.STRATEGY_FLAG]).toBe(experimentStrategy.AFTER);
        });

        it("should return an error when after param is not a function", function () {
            var afterString = "aaa";

            expect(function () {
                experimentStrategy.after(afterString);
            }.bind(this)).toThrow();

        });
    });

    describe("test around", function () {
        it("should set strategy to around", function () {
            var aroundFunc = getSpy();

            experimentStrategy.around(aroundFunc);

            expect(aroundFunc[experimentStrategy.STRATEGY_FLAG]).toBe(experimentStrategy.AROUND);
        });

        it("should return an error when around param is not a function", function () {
            var aroundString = "aaa";

            expect(function () {
                experimentStrategy.around(aroundString);
            }.bind(this)).toThrow();

        });

    });

    describe("test merge", function () {
        it("should wrap the object with a function and set it to be merge strategy", function () {
            var obj = {test: 'myObject'};

            var result = experimentStrategy.merge(obj);

            expect(typeof result).toBe('function');
            expect(result()).toBeEquivalentTo(obj);
        });
    });

    describe("test custom strategy", function () {
        it("should set strategy to custom strategy", function () {
            var customFunc = getSpy();

            experimentStrategy.customizeField(customFunc);

            expect(customFunc[experimentStrategy.STRATEGY_FLAG]).toBe(experimentStrategy.CUSTOM);
        });

        it("should return an error when around param is not a function", function () {
            var aroundString = "aaa";

            expect(function () {
                experimentStrategy.around(aroundString);
            }.bind(this)).toThrow();

        });
    });

    describe("test delete", function () {
        it("should wrap the object with a function and set it to be delete strategy", function () {
            var obj = {test: 'myObject'};

            var result = experimentStrategy.remove(obj);

            expect(typeof result).toBe('function');
            expect(result[experimentStrategy.STRATEGY_FLAG]).toBe(experimentStrategy.DELETE);
            expect(result()).toBeEquivalentTo(obj);
        });
    });

    describe("test _mergeObjects_", function () {
        it("test _mergeObjects_ calls _mergeSingleObject according to the number of fields in the experiment object", function () {
            spyOn(experimentStrategy, '_mergeSingleObject');
            var originalObj = {a: {}, b: {}, c: "", d: 2};
            var experimentObj = {a: {}, e: {}, d: 3};

            experimentStrategy._mergeObjects_(originalObj, experimentObj);

            expect(experimentStrategy._mergeSingleObject).toHaveBeenCalledXTimes(3);
        });

        it("test _mergeObjects_ deletes keys that return delete flag from _mergeSingleObject", function () {
            spyOn(experimentStrategy, '_mergeSingleObject').andCallFake(function (experimentField, originalField) {
                if (experimentField === 'to-be-deleted') {
                    return experimentStrategy._getFieldDeleteObj();
                } else {
                    return experimentField;
                }
            });
            var originalObj = {a: 'originalA', b: 1};
            var experimentObj = {a: 'to-be-deleted', e: 2};
            var expected = { b: 1, e: 2 };

            var result = experimentStrategy._mergeObjects_(originalObj, experimentObj);

            expect(result).toBeEquivalentTo(expected);
        });
    });

    describe("test _mergeSingleObject", function () {
        var fakeReturn = {};
        it("should not call _resolveMethod or _mergeField_ when both parameters are methods without strategy flags", function () {
            spyOn(experimentStrategy, '_resolveMethod');
            spyOn(experimentStrategy, '_mergeField_');
            var originalFunction = getSpy();
            var experimentFunction = getSpy();
            var result = experimentStrategy._mergeSingleObject(experimentFunction, originalFunction);

            expect(experimentStrategy._resolveMethod).not.toHaveBeenCalled();
            expect(experimentStrategy._mergeField_).not.toHaveBeenCalled();
            expect(result).toBe(experimentFunction);
        });

        it("should call _mergeField_ when experiment field should be merged into original field (which is not a function)", function () {
            spyOn(experimentStrategy, '_mergeField_').andReturn(fakeReturn);
            var originalObj = {};
            var experimentFunction = getSpy();
            experimentFunction[experimentStrategy.STRATEGY_FLAG] = experimentStrategy.MERGE;

            var result = experimentStrategy._mergeSingleObject(experimentFunction, originalObj);

            expect(experimentStrategy._mergeField_).toHaveBeenCalledWith(originalObj, experimentFunction);
            expect(result).toBe(fakeReturn);

        });

        it("should return experiment field when experiment field is not a function", function () {
            var originalObj = {};
            var experimentObj = {};

            var result = experimentStrategy._mergeSingleObject(experimentObj, originalObj);

            expect(result).toBe(experimentObj);

        });
    });

    describe('_resolveMethod', function () {
        it("should throw an error", function () {
            var original = undefined;
            var experimentFunction = getSpy();
            experimentFunction[experimentStrategy.STRATEGY_FLAG] = experimentStrategy.AROUND;

            expect(function () {
                experimentStrategy._mergeSingleObject(experimentFunction, original)
            }).toThrow();

        });

        it("should return experiment function", function () {
            var original = undefined;
            var experimentFunction = getSpy();

            var result = experimentStrategy._mergeSingleObject(experimentFunction, original);

            expect(result).toBe(experimentFunction);
        });


        it("experiment strategy is before - should create a function that calls the experiment function and then the original function", function () {
            var callOrder = [];
            var originalFunction = function () {
                callOrder.push('originalFunction')
            };
            var experimentFunction = experimentStrategy.before(function () {
                callOrder.push('experimentFunction')
            });
            var expected = ['experimentFunction', 'originalFunction'];

            var result = experimentStrategy._resolveMethod(originalFunction, experimentFunction);
            result();

            expect(callOrder).toBeEquivalentTo(expected);
        });

        it("experiment strategy is after - should create a function that calls the original function and then the experiment function", function () {
            var callOrder = [];
            var originalFunction = function () {
                callOrder.push('originalFunction')
            };
            var experimentFunction = experimentStrategy.after(function () {
                callOrder.push('experimentFunction')
            });
            var expected = ['originalFunction', 'experimentFunction'];

            var result = experimentStrategy._resolveMethod(originalFunction, experimentFunction);
            result();

            expect(callOrder).toBeEquivalentTo(expected);
        });

        it("experiment strategy is around - should create a function that calls the experiment function and passes the original function as the first argument", function () {
            var callOrder = [];
            var originalFunction = function () {
                callOrder.push('originalFunction')
            };
            var experimentFunction = experimentStrategy.around(function (originalFunc, param1, param2) {
                callOrder.push(param1);
                callOrder.push(param2);
                callOrder.push('experimentFunctionBefore');
                originalFunc();
                callOrder.push('experimentFunctionAfter');
            });
            var expected = ['param1', 'param2', 'experimentFunctionBefore', 'originalFunction', 'experimentFunctionAfter'];
            var result = experimentStrategy._resolveMethod(originalFunction, experimentFunction);
            result('param1', 'param2');

            expect(callOrder).toBeEquivalentTo(expected);
        });

        it("no experiment strategy - should return the experiment field", function () {
            var originalFunction = getSpy();
            var experimentFunction = getSpy();

            var result = experimentStrategy._resolveMethod(originalFunction, experimentFunction);

            expect(result).toBe(experimentFunction);
        });
    });

    describe('_mergeField_', function () {
        it('should return merged array value of original array and experiment array when experiment strategy is merge', function () {
            var originalField = ['a', 'b', 'c'];
            var experimentField = experimentStrategy.merge(['a', 'd', 'e']);
            var expected = ['a', 'b', 'c', 'd', 'e'];

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(expected);

        });

        it('should return merged object value of original object and experiment object when experiment strategy is merge', function () {
            var originalField = {a: 'a', b: 'b', c: 'c'};
            var experimentField = experimentStrategy.merge({a: '2', d: 'd', e: 'e'});
            var expected = {a: '2', b: 'b', c: 'c', d: 'd', e: 'e'};

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(expected);

        });

        it('should return the experiment field when the experiment strategy is NOT merge', function () {
            var originalField = {a: 'a', b: 'b', c: 'c'};
            var experimentField = {a: '2', d: 'd', e: 'e'};

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(experimentField);

        });

        it('should return the experiment field when the original field is not defined', function () {
            var originalField = undefined;
            var experimentField = {a: '2', d: 'd', e: 'e'};

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(experimentField);

        });

        it('should return the original field when the experiment field is not defined', function () {
            var originalField = {a: 'a', b: 'b', c: 'c'};
            var experimentField = undefined;

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(originalField);

        });

        it('should return the experiment field when the original field is not defined', function () {
            var originalField = {};
            var experimentField = {a: '2', d: 'd', e: 'e'};

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(experimentField);

        });

        it('should return the original field when the experiment field is not defined', function () {
            var originalField = {a: 'a', b: 'b', c: 'c'};
            var experimentField = [];

            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(originalField);

        });

        it('should return _getFieldDeleteObj if strategy flag is DELETE', function () {
            var originalField = {a: 'a', b: 'b', c: 'c'};
            var experimentField = [];
            experimentField = experimentStrategy.remove(experimentField);
            var result = experimentStrategy._mergeField_(originalField, experimentField);
            var isDeleteFlag = experimentStrategy._isDeleteFieldObj(result);

            expect(isDeleteFlag).toBeTruthy();

        });

        it('should return experiment field if the original field is null and strategy merge', function () {
            var originalField = null;
            var experimentField = ['a', 'b', 'c'];
            var expected = ['a', 'b', 'c'];
            experimentField = experimentStrategy.merge(experimentField);
            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(expected);
        });

        it('should return experiment field if the original field is empty array and strategy merge', function () {
            var originalField = [];
            var experimentField = ['a', 'b', 'c'];
            var expected = ['a', 'b', 'c'];
            experimentField = experimentStrategy.merge(experimentField);
            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(expected);
        });

        it('should return experiment field if the original field is empty object and strategy merge', function () {
            var originalField = {};
            var experimentField = {a: 'a', b: 'b', c: 'c'};
            var expected = {a: 'a', b: 'b', c: 'c'};
            experimentField = experimentStrategy.merge(experimentField);
            var result = experimentStrategy._mergeField_(originalField, experimentField);

            expect(result).toBeEquivalentTo(expected);
        });

        it('should return _getFieldDeleteObj if the original field is empty object and strategy delete', function () {
            var originalField = null;
            var experimentField = ['a', 'b', 'c'];
            var expected = ['a', 'b', 'c'];
            experimentField = experimentStrategy.remove(experimentField);
            var result = experimentStrategy._mergeField_(originalField, experimentField);
            var isDeleteFlag = experimentStrategy._isDeleteFieldObj(result);

            expect(isDeleteFlag).toBeTruthy();
        });


        describe("test custom strategy", function () {
            it("should call the custom function with the original field and the experiment param and return its return value", function () {
                var expected = "customStrategyReturnValue";
                var originalField = getSpy();
                var customFunction = getSpy().andReturn(expected);
                var experimentField = experimentStrategy.customizeField(customFunction);
                var result = experimentStrategy._mergeField_(originalField, experimentField);

                expect(customFunction).toHaveBeenCalledWith(originalField);
                expect(result).toBe(expected);
            })
        });
    });

    describe('_isEmpty', function () {
        it("should return true for null", function () {
            var result = experimentStrategy._isEmpty(null);

            expect(result).toBeTruthy();
        });

        it("should return true for an empty obj", function () {
            var result = experimentStrategy._isEmpty({});

            expect(result).toBeTruthy();
        });

        it("should return true for an empty array", function () {
            var result = experimentStrategy._isEmpty([]);

            expect(result).toBeTruthy();
        });

        it("should return false for a non empty string", function () {
            var result = experimentStrategy._isEmpty("bla");

            expect(result).toBeFalsy();
        });

        it("should return false for a non empty obj", function () {
            var result = experimentStrategy._isEmpty({a: 'a'});

            expect(result).toBeFalsy();
        });

        it("should return false for a non empty string", function () {
            var result = experimentStrategy._isEmpty(['a']);

            expect(result).toBeFalsy();
        });

        describe("_combine", function () {
            it("should merge the arrays", function () {
                var arr1 = ['a', 'b', 'c'];
                var arr2 = ['a', 'd', 'e'];
                var expected = ['a', 'b', 'c', 'd', 'e'];

                var result = experimentStrategy._combine(arr1, arr2);

                expect(result).toBeEquivalentTo(expected);
            });

            it("should merge the objects", function () {
                var obj1 = {a: 'a', b: 'b', c: 'c'};
                var obj2 = {a: 'a', d: 'd', e: 'e'};
                var expected = {a: 'a', b: 'b', c: 'c', d: 'd', e: 'e'};

                var result = experimentStrategy._combine(obj1, obj2);

                expect(result).toBeEquivalentTo(expected);
            });

            it("should merge arrays if first is null", function () {
                var arr1 = null;
                var arr2 = ['a', 'd', 'c'];
                var expected = ['a', 'd', 'c'];

                var result = experimentStrategy._combine(arr1, arr2);

                expect(result).toBeEquivalentTo(expected);
            });

            it("should merge arrays if first is empty array", function () {
                var arr1 = [];
                var arr2 = ['a', 'd', 'c'];
                var expected = ['a', 'd', 'c'];

                var result = experimentStrategy._combine(arr1, arr2);

                expect(result).toBeEquivalentTo(expected);
            });

            it("should merge objects if first is null", function () {
                var obj1 = null;
                var obj2 = {a: 'a', b: 'b', c: 'c'};
                var expected = {a: 'a', b: 'b', c: 'c'};

                var result = experimentStrategy._combine(obj1, obj2);

                expect(result).toBeEquivalentTo(expected);
            });

            it("should merge objects if first is empty array", function () {
                var obj1 = {};
                var obj2 = {a: 'a', b: 'b', c: 'c'};
                var expected = {a: 'a', b: 'b', c: 'c'};

                var result = experimentStrategy._combine(obj1, obj2);

                expect(result).toBeEquivalentTo(expected);
            })
        });
    });

});