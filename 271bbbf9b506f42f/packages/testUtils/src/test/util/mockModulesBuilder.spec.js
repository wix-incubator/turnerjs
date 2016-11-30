define(['testUtils/util/mockModulesBuilder'], function(mockModules){
    'use strict';
//TODO: find a way to delete the definitions
    describe("mockModulesBuilder", function(){
        beforeEach(function(){
            define('testModule', [], function(){
                return {
                    'num': 2,
                    'str': 'aaa'
                };
            });
            define('testModuleO', [], function(){
                return {
                    'obj': {
                        'field': 2
                    }
                };
            });
            define('testModuleF', [], function(){
                return {
                    'foo': function(){
                        return 2;
                    }
                };
            });
            define('testModuleC', [], function(){
                function ConsClass(){

                }
                ConsClass.prototype = {
                    'method': 2,
                    'foo': function(){
                        return 2;
                    }
                };
                return ConsClass;
            });
            define('testPackage', ['testModule'], function(testModule){
                return {
                    testModule: testModule
                };
            });
            define('testPackageC', ['testModuleC'], function(testModule){
                return {
                    testModule: testModule
                };
            });
        });

        afterEach(function(){
            requirejs.undef('testPackage');
            requirejs.undef('testPackageC');
            requirejs.undef('testModuleC');
            requirejs.undef('testModuleF');
            requirejs.undef('testModuleO');
            requirejs.undef('testModule');

        });

        describe("mockModule flat", function(){
            it("should mock an object module with primitives", function(done){
                mockModules(['testModule'], {}, function(mocked){
                    expect(mocked.num).toBe(2);
                    expect(mocked.str).toEqual('aaa');
                    done();
                });
            });

            it("should mock an object module with objects", function(done){

                mockModules(['testModuleO'], {}, function(mocked){
                    expect(mocked.obj).toBeDefined();
                    expect(mocked.obj.field).toBe(2);
                    done();
                });
            });

            it("should mock an object module with functions", function(done){

                mockModules(['testModuleF'], {}, function(mocked){
                    expect(mocked.foo).toBeDefined();
                    expect(mocked.foo()).toBeUndefined();
                    done();
                });
            });

            it("should mock a module which is a constructor", function(done){
                mockModules(['testModuleC'], {}, function(Mocked){
                    expect(typeof Mocked).toEqual('function');
                    var obj = new Mocked();
                    expect(obj.method).toBe(2);
                    done();
                });
            });

            it("should override an existing property", function(done){
                mockModules(['testModule'], {
                    'testModule': {
                        'num': 5
                    }
                }, function (mocked) {
                    expect(mocked.num).toBe(5);
                    expect(mocked.str).toEqual('aaa');
                    done();
                });
            });

            it("should add a property", function(done){
                mockModules(['testModule'], {
                    'testModule': {
                        'extra': 5
                    }
                }, function (mocked) {
                    expect(mocked.num).toBe(2);
                    expect(mocked.extra).toBe(5);
                    expect(mocked.str).toEqual('aaa');
                    done();
                });
            });

            it("should override the property of the constructed object", function(done){
                mockModules(['testModuleC'], {
                    testModuleC: {
                        'method': 3,
                        'foo': function(){
                            return 3;
                        }
                    }
                }, function(Mocked){
                    expect(typeof Mocked).toEqual('function');
                    var obj = new Mocked();
                    expect(obj.method).toBe(3);
                    expect(obj.foo()).toBe(3);
                    done();
                });
            });
        });

        describe("packages and recursive structures", function(){
            it("should iterate over the package modules and mock them", function(done){
                mockModules(['testPackage'], {}, function(mockedPackage){
                    var mocked = mockedPackage.testModule;
                    expect(mocked.num).toBe(2);
                    expect(mocked.str).toEqual('aaa');
                    done();
                });
            });
            it("should override a property of an existing module", function(done){
                mockModules(['testPackage'], {
                    testPackage: {testModule: {
                        'num': 3
                    }}
                }, function (mockedPackage) {
                    var mocked = mockedPackage.testModule;
                    expect(mocked.num).toBe(3);
                    expect(mocked.str).toEqual('aaa');
                    done();
                });
            });
            it("should override a property of an inner constructor module", function(done){
                mockModules(['testPackageC'], {
                    testPackageC: {testModule: {
                        'method': 3,
                        'foo': function(){
                            return 3;
                        }
                    }}
                }, function(mockedModule){
                    var MockedConstructor = mockedModule.testModule;
                    expect(typeof MockedConstructor).toEqual('function');
                    var obj = new MockedConstructor();
                    expect(obj.method).toBe(3);
                    expect(obj.foo()).toBe(3);
                    done();
                });
            });
        });

    });


});