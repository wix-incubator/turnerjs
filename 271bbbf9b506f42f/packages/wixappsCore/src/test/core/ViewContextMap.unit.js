define([
    'lodash',
    'wixappsCore/core/ViewContextMap',
    'testUtils'
], function (
    _,
    ViewContextMap,
    testUtils
) {
    'use strict';

    describe("ViewContextMap", function () {

        describe("resolvePath", function () {
            it("should resolve string path", function () {
                var contextMap = new ViewContextMap();
                var contextPath = contextMap.newContextForDataItem(null, ["path", "to", "item"], {}, {});

                var path = contextMap.resolvePath(contextPath, "this.items[0].title");
                expect(path).toEqual(["path", "to", "item", "items", "0", "title"]);
            });

            it("should resolve 'this'", function () {
                var contextMap = new ViewContextMap();
                var contextPath = contextMap.newContextForDataItem(null, ["path", "to", "item"], {}, {});

                var path = contextMap.resolvePath(contextPath, ["this"]);
                expect(path).toEqual(["path", "to", "item"]);
            });

            it("should resolve 'parent'", function () {
                var contextMap = new ViewContextMap();
                var contextPath = contextMap.newContextForDataItem(null, ["path", "to", "item"], {}, {});
                contextPath = contextMap.newContextForDataPath(contextPath, ["child"], {}, {});

                var path = contextMap.resolvePath(contextPath, ["parent"]);
                expect(path).toEqual(["path", "to", "item"]);
            });

            it("should resolve index in array", function () {
                var contextMap = new ViewContextMap();
                var contextPath = contextMap.newContextForDataItem(null, [
                    ["item1"],
                    ["item2"]
                ], {}, {});

                var path = contextMap.resolvePath(contextPath, [0]);
                expect(path).toEqual(["item1"]);
            });

            it("should resolve property of object", function () {
                var contextMap = new ViewContextMap();
                var contextPath = contextMap.newContextForDataItem(null, ["path", "to", "item"], {}, {});

                var path = contextMap.resolvePath(contextPath, ["child"]);
                expect(path).toEqual(["path", "to", "item", "child"]);
            });
        });

        describe("newContextForDataItem", function () {
            it("should create a new item in the contextMap with the given properties", function () {
                var contextMap = new ViewContextMap();

                var path = ["path", "to", "item"];
                var vars = {myVar: "value"};
                var events = {myEvent: function () {
                }};
                var functionLibrary = {customFunc: function () {
                }};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events, functionLibrary);

                var expectedContext = {
                    scopePath: path,
                    vars: vars,
                    events: events,
                    functionLibrary: functionLibrary,
                    index: 0
                };

                expect(contextMap.contextMap[contextPath]).toEqual(expectedContext);
            });

            it("should call the updateCallback", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');

                var updateSpy = jasmine.createSpy('updateCallback');
                var path = ["path", "to", "item"];
                var contextMap = new ViewContextMap(updateSpy);

                contextMap.newContextForDataItem(null, path);

                expect(updateSpy.calls.count()).toEqual(1);
            });
        });

        describe("newContextForDataPath", function () {
            it("should create a new item in the contextMap with the given properties", function () {
                var contextMap = new ViewContextMap();

                var path = ["path", "to"];
                var contextPath = contextMap.newContextForDataItem(null, path, {}, {});

                var vars = {myVar: "value"};
                var events = {myEvent: function () {
                }};
                var functionLibrary = {customFunc: function () {
                }};

                contextPath = contextMap.newContextForDataPath(contextPath, ["item"], vars, events, functionLibrary);

                var expectedContext = {
                    scopePath: path.concat(["item"]),
                    vars: vars,
                    events: events,
                    functionLibrary: functionLibrary,
                    index: 0
                };

                expect(contextMap.contextMap[contextPath]).toEqual(expectedContext);
            });

            it("should create a new item in the contextMap with the given properties (compound strings)", function () {
                var contextMap = new ViewContextMap();

                var path = ["path", "to"];
                var contextPath = contextMap.newContextForDataItem(null, path, {}, {});

                var vars = {myVar: "value"};
                var events = {myEvent: function () {
                }};
                var functionLibrary = {customFunc: function () {
                }};

                contextPath = contextMap.newContextForDataPath(contextPath, ["this.item"], vars, events, functionLibrary);

                var expectedContext = {
                    scopePath: path.concat(["item"]),
                    vars: vars,
                    events: events,
                    functionLibrary: functionLibrary,
                    index: 0
                };

                expect(contextMap.contextMap[contextPath]).toEqual(expectedContext);
            });

            it("should call the updateCallback", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');
                var updateSpy = jasmine.createSpy('updateCallback');
                var contextMap = new ViewContextMap(updateSpy);

                var path = ["path", "to", "item"];
                var contextPath = contextMap.newContextForDataItem(null, path);
                contextMap.newContextForDataPath(contextPath, ["this.item"]);

                expect(updateSpy.calls.count()).toEqual(2);
            });
        });

        describe("getVar", function () {
            it("should get var starting with $", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toEqual("value");
            });
            it("should get var NOT starting with $", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                var value = contextMap.getVar(contextPath, "myVar");

                expect(value).toEqual("value");
            });
            it("should get var from current context", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toEqual("value");
            });
            it("should get var from parent context", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);
                contextPath = contextMap.newContextForDataItem(contextPath, path, {}, events);

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toEqual("value");
            });
            it("should return undefined for missing vars", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);
                contextPath = contextMap.newContextForDataItem(contextPath, path, vars, events);

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toBeUndefined();
            });
        });

        describe("setVar", function () {
            it("should set the var value in current context", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                contextMap.setVar(contextPath, "myVar", "newValue");

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toEqual("newValue");
            });
            it("should set the var value in current context - varPath has $", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                contextMap.setVar(contextPath, "$myVar", "newValue");

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toEqual("newValue");
            });
            it("should set the var value in current context - var is object", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: {innerVar: "value"}};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                contextMap.setVar(contextPath, "myVar.innerVar", "newValue");

                var value = contextMap.getVar(contextPath, "myVar");

                expect(value.innerVar).toEqual("newValue");
            });
            it("should set the var value in parent context", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {myVar: "value"};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);
                contextPath = contextMap.newContextForDataItem(contextPath, path, {}, events);

                contextMap.setVar(contextPath, "myVar", "newValue");

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toEqual("newValue");
            });
            it("should do nothing when var does not exist", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);
                contextPath = contextMap.newContextForDataItem(contextPath, path, vars, events);

                contextMap.setVar(contextPath, "myVar", "newValue");

                var value = contextMap.getVar(contextPath, "$myVar");

                expect(value).toBeUndefined();
            });

            it("should call the updateCallback if context exists", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');

                var updateSpy = jasmine.createSpy('updateCallback');
                var path = ["dummy", "path"];
                var vars = {dummyVar: "initialDummyValue"};
                var contextMap = new ViewContextMap(updateSpy);
                var contextPath = contextMap.newContextForDataItem(null, path, vars);

                contextMap.setVar(contextPath, 'dummyVar', 'newDummyValue');

                expect(updateSpy.calls.count()).toEqual(2);
            });

            it("should not call the updateCallback if context does not exists", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');

                var updateSpy = jasmine.createSpy('updateCallback');
                var path = ["dummy", "path"];
                var contextMap = new ViewContextMap(updateSpy);
                var contextPath = contextMap.newContextForDataItem(null, path);

                contextMap.setVar(contextPath, 'dummyVar', 'newDummyValue');

                expect(updateSpy.calls.count()).toEqual(1);
            });
        });

        describe("getEvent", function () {
            it("should get event from current context", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {};
                var events = {myEvent: function () {
                }};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);

                var evt = contextMap.getEvent(contextPath, "myEvent");

                expect(evt).toEqual(events.myEvent);
            });
            it("should get event from parent context", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {};
                var events = {myEvent: function () {
                }};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);
                contextPath = contextMap.newContextForDataItem(contextPath, path, vars, {});

                var evt = contextMap.getEvent(contextPath, "myEvent");

                expect(evt).toEqual(events.myEvent);
            });
            it("should return undefined for missing events", function () {
                var contextMap = new ViewContextMap();

                var path = [];
                var vars = {};
                var events = {};

                var contextPath = contextMap.newContextForDataItem(null, path, vars, events);
                contextPath = contextMap.newContextForDataItem(contextPath, path, vars, events);

                var evt = contextMap.getEvent(contextPath, "myEvent");

                expect(evt).toBeUndefined();
            });
        });

        describe("overrideContextVars", function () {
            it("should call the updateCallback if context exists", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');

                var updateSpy = jasmine.createSpy('updateCallback');
                var path = ["dummy", "path"];
                var vars = {};
                var contextMap = new ViewContextMap(updateSpy);
                var contextPath = contextMap.newContextForDataItem(null, path, vars);

                contextMap.overrideContextVars(contextPath, {});

                expect(updateSpy.calls.count()).toEqual(2);
            });

            it("should not call the updateCallback if context does not exists", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');

                var updateSpy = jasmine.createSpy('updateCallback');
                var contextMap = new ViewContextMap(updateSpy);

                expect(contextMap.overrideContextVars).toThrow();
                expect(updateSpy.calls.count()).toEqual(0);
            });
        });

        describe("resetContext", function () {
            it("should call the updateCallback if context exists", function () {
                testUtils.experimentHelper.openExperiments('sv_shouldComponentUpdate_for_blog');

                var updateSpy = jasmine.createSpy('updateCallback');
                var contextMap = new ViewContextMap(updateSpy);

                contextMap.resetContext();

                expect(updateSpy.calls.count()).toEqual(1);
            });
        });
    });

});
