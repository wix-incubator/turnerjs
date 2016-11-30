/**
 * created by omri
 * Date: 5/20/11
 * Time: 11:46 PM
 */
describe("XClass", function() {
    testRequire().resources('W.Classes');

    beforeEach(function(){
        this._xclass = new window.XClass();
    });

    describe("XClass", function() {
        describe("this._xclass.createClass({...}) resulting class constructor", function() {
            it("XClass should return a class constructor function", function() {
                var A = this._xclass.createClass({}, "A");
                expect(typeof A).toBe("function");
            });
            //TODO: it actually doesn't work (debug mode) should fix
            xit("in debug mode class constructor should call XClass.prototype.validateScope(this)", function() {
                var xclass = new window.XClass(true);
                spyOn(XClass.prototype, "validateScope");
                var A = xclass.createClass({}, "A");
                var instance = new A();
                expect(XClass.prototype.validateScope).toHaveBeenCalledWith(instance);
            });
            it("class constructor should call XClass.prototype.initializeFieldsThatNeedToBeDeepCopied", function() {
                spyOn(XClass.prototype, "initializeFieldsThatNeedToBeDeepCopied");
                var A = this._xclass.createClass({}, "A");
                var instance = new A();
                expect(XClass.prototype.initializeFieldsThatNeedToBeDeepCopied).toHaveBeenCalled();
            });
            it("class constructor should call XClass.prototype.implementTraits(classPrototype._traits_, this)", function() {
                spyOn(XClass.prototype, "implementTraits");
                var A = this._xclass.createClass({_traits_: []}, "A");
                var instance = new A();
                expect(XClass.prototype.implementTraits).toHaveBeenCalledWith(A.prototype._traits_, instance);
            });
            it("class constructor should call XClass.prototype.initializeTraits() with class initialize arguments", function() {
                spyOn(XClass.prototype, "initializeTraits");
                var a = {}, b = [], initilizeArgs;
                var A = this._xclass.createClass({_fields_: {_traits_: []}, _methods_: {'initialize': function() {
                    initilizeArgs = arguments
                }}}, "A");
                var instance = new A(a, b);
                expect(XClass.prototype.initializeTraits).toHaveBeenCalledWith(A.prototype._traits_, instance, initilizeArgs);
            });
            it("class constructor should call XClass.prototype.bindMethods(classPrototype._binds_, this)", function() {
                spyOn(XClass.prototype, "bindMethods");
                var A = this._xclass.createClass({_fields_:{_binds_:[]}}, "A");
                var instance = new A();
                expect(XClass.prototype.bindMethods).toHaveBeenCalledWith(A.prototype._binds_, instance);
            });

            it("should return a constructor that runs 'initialize' method, and pass it the constructor params", function() {
                var status;
                var A = this._xclass.createClass({_methods_:{initialize:function() {
                    status = "success";
                }}}, "A");
                var a = new A();
                expect(status).toBe("success");
                var B = this._xclass.createClass({_methods_: {initialize:function(param) {
                    status = param;
                }}}, "B");
                var b = new B("yet another success");
                expect(status).toBe("yet another success");
            });
        });

        describe("parent", function() {
            it("should inherit methods and have access to the parent (super) over multiple levels", function() {
                var A = this._xclass.createClass({className:"A", _methods_: {getStatus:function() {
                    return "R";
                }}}, 'A');
                var B = this._xclass.createClass({className:"B", _fields_: {_extends_:A}, _methods_: {getStatus:function() {
                    return "B" + this.parent();
                }}}, 'B');
                var C = this._xclass.createClass({className:"C", _fields_: {_extends_:B}, _methods_: {getStatus:function() {
                    return "C" + this.parent();
                }}}, 'c');
                var instance = new C();
                expect(instance.getStatus()).toBe("CBR");
            });
            it("should return the parent scope if a non-parent method is called", function() {
                var A = this._xclass.createClass({className:"A", _methods_: {f1:function() {
                    return this.f2()
                }, f2:function() {
                    return "F2a"
                }}}, 'A');
                var B = this._xclass.createClass({className:"B", _fields_:{_extends_:A}, _methods_: {f1:function() {
                    return this.parent()
                }, f2:function() {
                    return "F2b" + this.parent()
                }}}, 'B');
                var instance = new B();
                expect(instance.f1()).toBe("F2bF2a");
            });
        });

        describe("parent2", function() {
            it("should jump over inheritance - one level", function(){
                var A = this._xclass.createClass({
                    className:"A", _methods_: {
                    f1:function(){
                        return "F1A";
                    }
                }},'A');

                var B = this._xclass.createClass({
                    className:"B", _fields_: {
                    _extends_:A
                }},'B');

                var C = this._xclass.createClass({
                    className:"C", _fields_: {_extends_:B}, _methods_: {
                    f1:function(){
                        return "F1C" + this.parent();
                    }
                    }},'C');
                var instance = new C();
                expect(instance.f1()).toBe("F1CF1A");
            });

            it("should jump over inheritance - two levels", function(){
                var A = this._xclass.createClass({
                    className:"A", _methods_: {
                    f1:function(){
                        return "F1A";
                    }
                    }},'A');

                var B = this._xclass.createClass({
                    className:"B", _fields_: {
                    _extends_:A
                    }},'B');

                var C = this._xclass.createClass({
                    className:"C", _fields_: {
                    _extends_:B
                    }},'C');

                var D = this._xclass.createClass({
                    className:"D", _fields_: {_extends_:C}, _methods_: {
                    f1:function(){
                        return "F1D" + this.parent();
                    }
                }},'D');
                var instance = new D();
                expect(instance.f1()).toBe("F1DF1A");
            });

            // TODO: currently fails - need to fix before releasing _super
            xit('should not be confused by repeated calls from the same scope', function() {
                var A = this._xclass.createClass({
                    className:"A", _methods_: {
                    foo:function(t){
                        var result = t ? this.foo(0) : '';
                        return 'fooA' + result;
                    }
                    }},'A');

                var B = this._xclass.createClass({
                    className:"B", _fields_: {_extends_: A}, _methods_: {
                    foo:function(t){
                        return this.parent(t) + 'fooB';
                    }
                    }},'B');

                var b = new B();
                expect(b.foo(1)).toBe('fooAfooAfooB');
            });
        });

        describe("_super", function() {
            it("should inherit methods and have access to the super over multiple levels", function() {
                var A = this._xclass.createClass({className:"A", _methods_: {
                    getStatus:function() {
                        return "R";
                    }
                }}, 'A');
                var B = this._xclass.createClass({className:"B", _fields_: {_extends_:A}, _methods_: {
                    getStatus:function() {
                        return "B" + this._super('getStatus');
                    }
                }}, 'B');
                var C = this._xclass.createClass({className:"C", _fields_: {_extends_:B}, _methods_: {
                    getStatus:function() {
                        return "C" + this._super('getStatus');
                    }
                }}, 'c');
                var instance = new C();
                expect(instance.getStatus()).toBe("CBR");
            });
            it("should return the parent scope if a non-parent method is called", function() {
                var A = this._xclass.createClass({className:"A", _methods_: {
                    f1:function() {
                        return this.f2()
                    },
                    f2:function() {
                        return "F2a"
                    }
                }}, 'A');
                var B = this._xclass.createClass({className:"B", _fields_: {_extends_:A}, _methods_: {
                    f1:function() {
                        return this._super('f1')
                    },
                    f2:function() {
                        return "F2b" + this._super('f2')
                    }
                }}, 'B');
                var instance = new B();
                expect(instance.f1()).toBe("F2bF2a");
            });

            it("should jump over inheritance - one level", function(){
                var A = this._xclass.createClass({
                    className:"A", _methods_: {
                    f1:function(){
                       return "F1A";
                    }
                    }},'A');

                var B = this._xclass.createClass({
                    className:"B", _fields_: {_extends_:A}
                },'B');

                var C = this._xclass.createClass({
                    className:"C", _fields_: {_extends_:B}, _methods_: {
                    f1:function(){
                        return "F1C" + this._super('f1');
                    }
                    }},'C');
                var instance = new C();
                expect(instance.f1()).toBe("F1CF1A");
            });

            it("should jump over inheritance - two levels", function(){
                var A = this._xclass.createClass({
                    className:"A", _methods_: {
                    f1:function(){
                       return "F1A";
                    }
                    }},'A');

                var B = this._xclass.createClass({
                    className:"B", _fields_: {_extends_:A}
                },'B');

                var C = this._xclass.createClass({
                    className:"C", _fields_: {_extends_:B}
                },'C');

                var D = this._xclass.createClass({
                    className:"D", _fields_: {_extends_:C}, _methods_: {
                    f1:function(){
                        return "F1D" + this._super('f1');
                    }
                    }},'D');
                var instance = new D();
                expect(instance.f1()).toBe("F1DF1A");
            });

            // TODO: currently fails - need to fix before releasing _super
            xit('should not be confused by repeated calls from the same scope', function() {
                var A = this._xclass.createClass({
                    className:"A", _methods_: {
                    foo:function(t){
                        var result = t ? this.foo(0) : '';
                        return 'fooA' + result;
                    }
                    }},'A');

                var B = this._xclass.createClass({
                    className:"B", _fields_: {_extends_: A}, _methods_: {
                    foo:function(t){
                        return this._super('foo', t) + 'fooB';
                    }
                    }},'B');

                var b = new B();
                expect(b.foo(1)).toBe('fooAfooAfooB');
            });
        });

        describe('fields', function() {
            it('should deep copy fields', function() {
                var A = this._xclass.createClass({
                    className: 'A', _fields_: {
                    foo: {a:42}
                    }}, 'A');

                var a1 = new A();
                var a2 = new A();
                expect(a1.foo).toEqual(a2.foo);
                expect(a1.foo).not.toBe(a2.foo);
                a1.foo.a = 43;
                expect(a1.foo).not.toEqual(a2.foo);
            });

            it('should have shared statics', function() {
                var A = this._xclass.createClass({
                    className: 'A',
                    _statics_: {
                        foo: {a:42}
                    }
                }, 'A');

                var a1 = new A();
                var a2 = new A();
                expect(a1.foo).toEqual(a2.foo);
                expect(a1.foo).toBe(a2.foo);
                a1.foo.a = 43;
                expect(a1.foo).toEqual(a2.foo);
            });
        });

        describe("statics", function(){
            beforeEach(function(){
                var self = this;
                this._obj = {a:42};
                this.A = this._xclass.createClass({
                    className: 'A',
                    _statics_: {
                        obj: self._obj,
                        primitive: 4
                    },
                    _fields_: {
                        fObj: {a: 100},
                        fPrimitive: 10
                    },
                    _methods_:{
                        'method': function(){}
                    }
                }, 'A');
            });
            it("should put static fields both on class and instance", function(){
                var a1 = new this.A();

                expect(a1.obj).toBe(this._obj);
                expect(this.A.obj).toBe(this._obj);
                expect(a1.primitive).toBe(4);
                expect(this.A.primitive).toBe(4);
            });
            it("should change the value of the primitive only on the instance", function(){
                var a1 = new this.A();
                var a2 = new this.A();
                a1.primitive = 10;
                expect(a1.primitive).toBe(10);
                expect(a2.primitive).toBe(4);
            });
            it("should change the value inside an object for all the instances", function(){
                var a1 = new this.A();
                var a2 = new this.A();
                a1.obj.a = 10;
                expect(a1.obj.a).toBe(10);
                expect(a2.obj.a).toBe(10);
                expect(this.A.obj.a).toBe(10);
            });

            it("should add parent statics to the class statics", function(){
                var self = this;
                var B = this._xclass.createClass({
                    className: 'B',
                    _statics_: {
                        other: {b: 50}
                    },
                    _fields_: {
                        _extends_: self.A
                    }
                }, 'B');
                var a1 = new B();
                var a2 = new B();
                expect(a1.other).toBe(a2.other);
                expect(a1.obj).toBe(a2.obj);
                expect(B.obj).toBe(this._obj);
            });

            it("should throw an error if a static and a field have the same name", function(){
                var self = this;
                expect(function(){
                    self._xclass.createClass({
                        className: 'B',
                        _statics_: {
                            obj: {a: 42},
                            primitive: 4
                        },
                        _fields_: {
                            obj: {a: 100},
                            primitive: 10
                        }
                    }, 'B');
                }).toThrowErrorContaining("conflicts with a static property");

            });

            it("should let a static to override a parent static, including class constructor", function(){
                var self = this;
                var B = this._xclass.createClass({
                    className: 'B',
                    _statics_: {
                        obj: {b: 50},
                        primitive: 50
                    },
                    _fields_: {
                        _extends_: self.A
                    }
                }, 'B');
                var a1 = new B();
                expect(a1.obj.b).toBe(50);
                expect(B.obj.b).toBe(50);
                expect(a1.primitive).toBe(50);
                expect(B.primitive).toBe(50);
            });

            it("should throw an error if a static have the same name as a parent field", function(){
                var self = this;
                expect(function(){
                    self._xclass.createClass({
                        className: 'B',
                        _statics_: {
                            fObj: {b: 50},
                            fPrimitive: 50
                        },
                        _fields_: {
                            _extends_: self.A
                        }
                    }, 'B');
                }).toThrowErrorContaining("conflicts with a static property");
            });

            describe("setStaticPropertyValue", function(){
               it("should override an existing static property", function(){
                   var a1 = new this.A();
                   a1.setStaticPropertyValue('primitive', 50);

                   expect(this.A.primitive).toBe(50);
                   var a2 = new this.A();
                   expect(a2.primitive).toBe(50);
               });
               it("should add a static property if there is none with that name", function(){
                   var a1 = new this.A();
                   a1.setStaticPropertyValue('aaaa', 50);

                   expect(this.A.aaaa).toBe(50);
                   var a2 = new this.A();
                   expect(a2.aaaa).toBe(50);
               });
                it("should throw an error if there is a field with that name", function(){
                    var a1 = new this.A();
                    expect(function(){
                        a1.setStaticPropertyValue('fPrimitive', 50);
                    }).toThrowErrorContaining("you tried to add a static property with an existing field/method name");
                });
                it("should throw an error if there is a method with that name", function(){
                    var a1 = new this.A();
                    expect(function(){
                        a1.setStaticPropertyValue('method', 50);
                    }).toThrowErrorContaining("you tried to add a static property with an existing field/method name");
                });
            });

        });

        describe("_traits_", function() {
            it("should inherit _traits_ of parents", function() {
                var Traits = this._xclass.createClass({
                    className: 'Traits', _methods_: {
                    getTrait1: function() {
                        return "trait1 works!"
                    },
                    getTrait2: function() {
                        return "trait2 works!"
                    }
                    }});
                var A = this._xclass.createClass({_fields_: {_traits_:[Traits]}}, 'A');
                var B = this._xclass.createClass({_fields_: {_extends_: A}}, 'B');

                var instance = new B();
                expect(instance.getTrait1()).toBe("trait1 works!");
                expect(instance.getTrait2()).toBe("trait2 works!");
            });
            describe("implementTraits", function() {
                it("should add methods from multiple implemented objects", function() {
                    var traits = {
                        getTrait1: function() {
                        },
                        getTrait2: function() {
                        }
                    };
                    var moreTraits = {
                        objTrait: {},
                        numricTrait: 2
                    };
                    var instance = {};
                    XClass.prototype.implementTraits([traits, moreTraits], instance);
                    expect(instance.getTrait1).toBe(traits.getTrait1);
                    expect(instance.getTrait2).toBe(traits.getTrait2);
                    expect(instance.objTrait).toBe(moreTraits.objTrait);
                    expect(instance.numricTrait).toBe(moreTraits.numricTrait);
                });
                it("should add methods from multiple implemented functions prototypes", function() {
                    var Traits = this._xclass.createClass({
                        className: 'Traits', _methods_: {
                        getTrait1: function() {
                            return "trait1 works!"
                        },
                        getTrait2: function() {
                            return "trait2 works!"
                        }
                        }});
                    var OtherTraits = this._xclass.createClass({
                        className: 'OtherTraits', _methods_: {
                        getTrait3: function() {
                            return "trait3 works!"
                        },
                        getTrait4: function() {
                            return "trait4 works!"
                        }
                    }});

                    var instance = {};
                    XClass.prototype.implementTraits([Traits, OtherTraits], instance);
                    expect(instance.getTrait1()).toBe("trait1 works!");
                    expect(instance.getTrait2()).toBe("trait2 works!");
                    expect(instance.getTrait3()).toBe("trait3 works!");
                    expect(instance.getTrait4()).toBe("trait4 works!");
                });
                it("should add methods from multiple implemented functions prototypes and object", function() {
                    var traits = {
                        getTrait1: function() {
                        }
                    };
                    var MoreTraits = this._xclass.createClass({
                        getTrait2: function() {
                        }
                    }, "MoreTraits");
                    var instance = {};
                    XClass.prototype.implementTraits([traits, MoreTraits], instance);
                    expect(instance.getTrait1).toBe(traits.getTrait1);
                    expect(instance.getTrait2).toBe(MoreTraits.prototype.getTrait2);
                });
                it("should call initialize function on trait with constructor arguments", function() {
                    var traitInitArgs, classInitArgs;
                    var Trait = this._xclass.createClass({_methods_:{initialize: function() {
                        traitInitArgs = arguments
                    }}}, 'TraitTest');
                    var A = this._xclass.createClass({_fields_: {_traits_:[Trait]}, _methods_: {initialize: function() {
                        classInitArgs = arguments
                    }}}, "B");
                    var instance = new A(1, [], {});
                    expect(traitInitArgs).toBeEquivalentTo(classInitArgs);
                });
            });
        });
        describe("_binds_", function() {
            it("should inherit _binds_ from parent class", function() {
                var A = this._xclass.createClass({_fields_: {_binds_:['myMethod']}, _methods_: {myMethod:function() {
                    return this.innerMethod();
                }, innerMethod:function() {
                    return "inner"
                }}}, 'A');
                var B = this._xclass.createClass({_fields_: {_extends_:A}, _methods_: {myMethod:function() {
                    return "B" + this.innerMethod();
                }}}, "B");
                var instance = new B();
                expect(instance.myMethod.apply({})).toBe("Binner");
            });
            it("should inherit _binds_ from implemented classes", function() {
                var A = this._xclass.createClass({_fields_: {_binds_:['myMethod']}, _methods_: {myMethod:function() {
                    return this.innerMethod();
                }, innerMethod:function() {
                    return "inner"
                }}}, 'A');
                var B = this._xclass.createClass({_fields_: {_traits_:[A]}, _methods_: {myMethod:function() {
                    return "B" + this.innerMethod();
                }}}, "B");
                var instance = new B();
                expect(instance.myMethod.apply({})).toBe("Binner");
            });
            describe("bindMethods", function() {
                it("should bind named functions to the scope of the new instance", function() {
                    var scope = { myMethod:function() {
                        return this.innerMethod()
                    }, innerMethod:function() {
                        return "inner"
                    }};
                    XClass.prototype.bindMethods(['myMethod'], scope);
                    expect(scope.myMethod.apply({})).toBe("inner");
                });
                it("should throw an error for invalid method names", function() {
                    var scope = {};
                    expect(
                            function() {
                                XClass.prototype.bindMethods(['myMethod'], scope);
                            }).toReportError(wixErrors.WCLASS_INVALID_BIND, 'XClass', 'bindMethods');
                });
            });
        });
		describe("toString", function() {
			 it("should use the toString method in this order of relevance-class, parent class, default", function() {
				 var A = this._xclass.createClass({className:"A"} );
				 var B = this._xclass.createClass({className:"B", _fields_: {_extends_: A}, _methods_: {toString:function() {
					return "[object B inherits A]";
				 }}} );
				 var C = this._xclass.createClass({className:"C", _extends_:B } );
				 var a = new A();
				 var b = new B();
				 var c = new C();

				 expect(String(a), "should use the default toString").toBe(XClass.prototype._$wclassToString.apply(a));
				 expect(String(b), "should use the class toString").toBe("[object B inherits A]");
				 expect(String(b), "should use the inherited toString").toBe(b.toString());
			 });
		});


       describe("hasClassAncestor", function() {
            it("should report ancestor class names using the hasClassAncestor method", function() {
				var A1 = this._xclass.createClass({className:"name1.A"} );
				var A2 = this._xclass.createClass({className:"name2.A"} );
				var B1 = this._xclass.createClass({className:"B1", _fields_: {_extends_: A1 }});
				var B2 = this._xclass.createClass({className:"B2", _fields_: {_extends_: A2 }});
				var C = this._xclass.createClass({className:"C", _fields_: {_extends_: B1 }});
				var a1 = new A1();
				var a2 = new A2();
				var b1 = new B1();
				var b2 = new B2();
				var c = new C();

				expect(a1.hasClassAncestor("A", true), "baseclass should match itself as an ancestor").toBeTruthy();
				expect(a2.hasClassAncestor("A", false), "baseclass should not match its partial as an ancestor when a partial match is not requested").toBeFalsy();
				expect(b1.hasClassAncestor("A", true), "subclass should match its parent's partial name").toBeTruthy();
				expect(b2.hasClassAncestor("name1.A", true), "subclass should not match the full name of a class that isn't its parent").toBeFalsy();
				expect(c.hasClassAncestor("B1", true), "subclass should match its parent").toBeTruthy();
				expect(c.hasClassAncestor("name1.A", false), "subclass should match its grandparent").toBeTruthy();
				expect(c.hasClassAncestor("name2.A", false), "subclass should not match a class that isn't in its hierarchy").toBeFalsy();
				expect(c.hasClassAncestor("A", true), "subclass should match the partial name of its grandparent").toBeTruthy();
            });
	   });
    });
});

describe("instanceOf override", function() {
    beforeEach(function(){
        this._xclass = new window.XClass();
    });
    describe("positive tests (assuming the instance is of the correct type)", function() {
        it("should return true for XClass instance if it's the right XClass", function() {
            var A = this._xclass.createClass({className:"A"}, 'A');
            var instance = new A();
            expect(instanceOf(instance, A)).toBeTruthy();
        });
        it("should return true for XClass instance when tested for Object", function() {
            var A = this._xclass.createClass({className:"A"}, 'A');
            var instance = new A();
            expect(instanceOf(instance, Object)).toBeTruthy();
        });
        it("should return true for XClass ancestor it's the right XClass", function() {
            var A = this._xclass.createClass({className:"A"}, 'A');
            var B = this._xclass.createClass({className:"B", _fields_: {_extends_:A}}, 'B');
            var C = this._xclass.createClass({className:"C", _fields_: {_extends_:B}}, 'C');
            var instance = new C();
            expect(instanceOf(instance, A)).toBeTruthy();
            expect(instanceOf(instance, B)).toBeTruthy();
            expect(instanceOf(instance, C)).toBeTruthy();
        });
        it("should return true for direct non-XClass child", function() {
            var B = this._xclass.createClass({className:"B", _fields_: {_extends_:String}}, 'B');
            var instance = new B();
            expect(instanceOf(instance, String)).toBeTruthy();
        });
        it("should return true for non-XClass ancestor", function() {
            var A = this._xclass.createClass({className:"A", _fields_: {_extends_:Number}}, 'A');
            var B = this._xclass.createClass({className:"B", _fields_: {_extends_:A}}, 'B');
            var C = this._xclass.createClass({className:"C", _fields_: {_extends_:B}}, 'C');
            var instance = new C();
            expect(instanceOf(instance, Number)).toBeTruthy();
        });
        it("XClass instances (i.e. a specific class) should be identified as a XClass", function() {
            var A = this._xclass.createClass({className:"A"}, 'A');
            expect(instanceOf(A, XClass)).toBeTruthy();
        });
    });
    describe("negative tests (assuming the instance is NOT of the correct type)", function() {
        it("should return false for XClass instance if it's the right type", function() {
            var A = this._xclass.createClass({className:"A"}, 'A');
            var B = this._xclass.createClass({className:"B", _fields_: {_extends_:A}}, 'B');
            var instance = new A();
            expect(instanceOf(instance, B)).toBeFalsy();
        });
        it("should return false for direct non-XClass child", function() {
            var B = this._xclass.createClass({className:"B", _fields_: {_extends_:String}}, 'B');
            var instance = new B();
            expect(instanceOf(instance, Number)).toBeFalsy();
        });
    });
});

describe("helpers (prototype)", function() {
    beforeEach(function(){
        this._xclass = new window.XClass();
    });
        describe("validateScope", function() {
            it("should report an exception for falsy scopes", function() {
                expect(
                        function() {
                            XClass.prototype.validateScope();
                        }).toReportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope', false, true);
                expect(
                        function() {
                            XClass.prototype.validateScope(null);
                        }.bind(this)).toReportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope', false, true);
            });
            it("should throw an exception for window scope", function() {
                expect(
                        function() {
                            XClass.prototype.validateScope(window);
                        }.bind(this)).toReportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope', false, true);
            });
            it("should throw an exception for non empty objects", function() {
                expect(
                        function() {
                            XClass.prototype.validateScope({bla:{}});
                        }.bind(this)).toReportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope', false, true);
                expect(
                        function() {
                            var F = function() {
                                this.invalidField = {};
                            };
                            F.prototype.validField = {};
                            var instance = new F();
                            XClass.prototype.validateScope(instance);
                        }.bind(this)).toReportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope', false, true);
            });
            it("should not throw an exception for empty objects", function() {
                expect(
                        function() {
                            XClass.prototype.validateScope({});
                        }).not.toReportError();
            });
        });
        describe("clonePrototype", function() {
            it("should return an equivalent object", function() {
                var A = function() {
                };
                A.prototype = {a:{}, b:{}};
                expect(XClass.prototype.clonePrototype(A)).toBeEquivalentTo(A.prototype);
            });
        });
        describe("validateClassData", function() {
            it("should report an error for non object classData", function() {
                expect(
                        function() {
                            XClass.prototype.validateClassData(function() {
                            });
                        }).toReportError(wixErrors.WCLASS_CLASS_DATA_INVALID, 'XClass', 'validateClassData', false, true);
            });
            it("should throw an error if the className is not defined", function() {
                expect(
                        function() {
                            XClass.prototype.validateClassData({});
                        }).toReportError(wixErrors.WCLASS_CLASS_EMPTY_STRING, 'XClass', 'validateClassData', false, true);
            });
            it("should throw an error if reserved words are used", function() {
                expect(
                        function() {
                            XClass.prototype.validateClassData({'className':'muku', '$className': true});
                        }).toReportError(wixErrors.WCLASS_CLASS_RESERVED, 'XClass', 'validateClassData', false, true);
                expect(
                        function() {
                            XClass.prototype.validateClassData({'className':'muku', 'parent': true});
                        }).toReportError(wixErrors.WCLASS_CLASS_RESERVED, 'XClass', 'validateClassData', false, true);
                expect(
                        function() {
                            XClass.prototype.validateClassData({'className':'muku', '$parentPrototype': true});
                        }).toReportError(wixErrors.WCLASS_CLASS_RESERVED, 'XClass', 'validateClassData', false, true);
            });
            it("should report an error if _binds_ is defined but not an array", function() {
                  expect(
                        function() {
                            XClass.prototype.validateClassData({'className': 'SomeClass', _binds_:'invalid type'});
                        }).toReportError(wixErrors.WCLASS_CLASS_DATA_INVALID, 'XClass', 'validateClassData');
            });
            it("should not throw an error for valid classData", function() {
                expect(
                        function() {
                            XClass.prototype.validateClassData({'className': 'SomeClass'});
                        }).not.toReportError();
                expect(
                        function() {
                            XClass.prototype.validateClassData({'className': 'SomeClass', _binds_:[]});
                        }).not.toReportError();
            });
        });

        describe("copyStatic(target, proto, statics, baseClass)", function() {
            beforeEach(function() {
                this.target = function() {   };

                this.proto = this.target.prototype = {protoMethod: function() {}};

                this.baseClass = function() {};

                this.baseClass.baseClassStaticMethod = function() {};

                this.statics = {staticProp: "some static property"};
            });
            it("should copy properties from the statics object onto target and proto", function() {
                XClass.prototype.copyStatic(this.target, this.proto, this.statics);
                expect(this.target.staticProp).toBe(this.statics.staticProp);
                expect(this.proto.staticProp).toBe(this.statics.staticProp);
            });
            //isn't supported anymore
            xit("should copy properties from the baseClass onto target (but not onto proto)", function() {
                XClass.prototype.copyStatic(this.target, this.proto, undefined, this.baseClass);
                expect(this.target.baseClassStaticMethod).toBe(this.baseClass.baseClassStaticMethod);
            });
            it("should throw an exception if a static property name conflicts with something in proto", function() {
                expect(function() {
                    XClass.prototype.copyStatic(this.target, this.proto, {protoMethod: function() {
                    }});
                }.bind(this)).toThrowErrorContaining("conflicts with a static property");

            });

        });


    });
