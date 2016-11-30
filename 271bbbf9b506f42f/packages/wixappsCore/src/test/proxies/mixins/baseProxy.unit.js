define(["lodash", "wixappsCore/core/proxyFactory", 'testUtils', 'react'], function (_, /** wixappsCore.proxyFactory */proxyFactory, /** testUtils */testUtils, React) {
    'use strict';
    describe('baseProxy', function () {

        beforeEach(function () {
            proxyFactory.register('TestBaseProxy', testUtils.stupidProxy);
        });

        afterEach(function () {
            proxyFactory.invalidate('TestBaseProxy');
        });

        describe('expressions', function () {
            it('getCompProp - nested object', function () {
                var viewDef = {
                    "comp": {
                        "name": "TestBaseProxy", "hidden": {
                            "$expr": "eq(width1.value1, 30)"
                        }
                    }
                };

                var partData = {
                    width1: {
                        value1: "30"
                    }};


                var props = testUtils.proxyPropsBuilder(viewDef, partData);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var hidden = proxyClass.getCompProp("hidden");
                expect(hidden).toEqual(true);
            });

            it('getCompProp - using this', function () {
                var viewDef = {
                    "comp": {
                        "name": "TestBaseProxy", "hidden": {
                            "$expr": "eq(this.width1.value1, 30)"
                        }
                    }
                };

                var partData = {
                    width1: {
                        value1: "30"
                    }};


                var props = testUtils.proxyPropsBuilder(viewDef, partData);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var hidden = proxyClass.getCompProp("hidden");
                expect(hidden).toEqual(true);
            });

            it('getCompProp - array', function () {
                var viewDef = {
                    "comp": {
                        "name": "TestBaseProxy", "hidden": {
                            "$expr": "eq(this.width1.value1[1].x, 30)"
                        }
                    }
                };

                var partData = {
                    width1: {
                        value1: [
                            {x: "20"},
                            {x: "30"}
                        ]
                    }};


                var props = testUtils.proxyPropsBuilder(viewDef, partData);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var hidden = proxyClass.getCompProp("hidden");
                expect(hidden).toEqual(true);
            });

            it('getStyleDef', function () {
                var viewDef = {
                    "comp": {
                        "name": "TestBaseProxy", "css": {
                            "cursor": {
                                "$expr": "if(lt(value1,40), 'giorgio','daft-punk')"
                            },
                            "border-left": "15"
                        }
                    },
                    "layout": {
                        "min-width": {
                            "$expr": "mult(this.value1,2)"
                        },
                        "max-width": 400
                    }
                };

                var partData = {
                    value1: "30"
                };

                var props = testUtils.proxyPropsBuilder(viewDef, partData);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var actual = proxyClass.getStyleDef();

                var expected = {
                    "min-width": 60,
                    "max-width": 400,
                    "cursor": 'giorgio',
                    "border-left": 15
                };
                expect(actual).toEqual(expected);
            });

            it('getStyleDef with vars', function () {
                var viewDef = {
                    "vars": {
                        minWidth: '10',
                        maxWidth: {
                            $expr: "mult($minWidth, 5)"
                        }
                    },
                    "comp": {
                        "name": "TestBaseProxy"
                    },
                    "layout": {
                        "min-width": {
                            "$expr": "mult($minWidth,2)"
                        },
                        "max-width": {
                            $expr: '$maxWidth'
                        }
                    }
                };

                var partData = {
                    value1: "2"
                };

                var props = testUtils.proxyPropsBuilder(viewDef, partData);
                spyOn(props.viewContextMap, 'getVar').and.callFake(function (path, name) {
                    name = name.replace(/^\$/, '');
                    return viewDef.vars[name];
                });

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var actual = proxyClass.getStyleDef();

                var expected = {
                    "min-width": 20,
                    "max-width": 50
                };

                expect(actual).toEqual(expected);
            });
        });

        describe('proxy vars', function () {
            it('should add the vars to the viewContext (no view definition vars)', function () {
                var viewDef = {
                    "comp": {
                        "name": "TestBaseProxy"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var proxyVars = {indexInParent: 1};
                spyOn(proxyClass.props.viewContextMap, 'newContextForDataPath').and.callThrough();
                var childProps = proxyClass.getChildProxyProps(viewDef, [], {vars: {proxy: proxyVars}});

                // Expect creation of child view context using the vars from the proxy
                expect(childProps.contextProps).toEqual(jasmine.objectContaining({vars: {proxy: proxyVars}}));
            });

            it('should add the both proxy and view definition vars to the viewContext', function () {
                var viewDef = {
                    "vars": {
                        'viewVar': 'test'
                    },
                    "comp": {
                        "name": "TestBaseProxy"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var proxyVars = {indexInParent: 1};
                spyOn(proxyClass.props.viewContextMap, 'newContextForDataPath').and.callThrough();

                var customContextDataPath = [];
                var childProps = proxyClass.getChildProxyProps(viewDef, customContextDataPath, {vars: {proxy: proxyVars}});
                delete childProps.ref;
                testUtils.proxyBuilder('TestBaseProxy', childProps);

                // Expect creation of child view context using the vars from the proxy merged with the view definition's vars.
                var expectedVars = _.merge(proxyVars, viewDef.vars);
                expect(proxyClass.props.viewContextMap.newContextForDataPath).toHaveBeenCalledWith(proxyClass.contextPath, customContextDataPath, expectedVars, {}, {});
            });

            it('should prefer view definition vars over proxy vars', function () {
                var viewDef = {
                    "vars": {
                        indexInParent: 'test',
                        viewVar: 'test'
                    },
                    "comp": {
                        "name": "TestBaseProxy"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var proxyVars = {indexInParent: 1};
                spyOn(proxyClass.props.viewContextMap, 'newContextForDataPath').and.callThrough();
                var customContextDataPath = [];
                var childProps = proxyClass.getChildProxyProps(viewDef, customContextDataPath, {vars: {proxy: proxyVars}});
                delete childProps.ref;
                testUtils.proxyBuilder('TestBaseProxy', childProps);

                // Expect creation of child view context using the vars from the proxy merged with the view definition's vars.
                var expectedVars = {
                    'viewVar': 'test',
                    indexInParent: 'test'
                };
                expect(proxyClass.props.viewContextMap.newContextForDataPath).toHaveBeenCalledWith(proxyClass.contextPath, customContextDataPath, expectedVars, {}, {});
            });

            it('should set the hover var to true on mouse enter and back to false on mouse out', function () {
                var viewDef = {
                    "vars": {
                        hover: false
                    },
                    "comp": {
                        "name": "TestBaseProxy",
                        "hoverVar": 'hover'
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                spyOn(props.viewProps, 'setVar');
                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);
                proxyClass.props.viewContextMap.contextMap[0].vars.hover = false;

                React.addons.TestUtils.SimulateNative.mouseOver(proxyClass.refs.component);
                expect(props.viewProps.setVar).toHaveBeenCalledWith('0', viewDef.comp.hoverVar, true);

                React.addons.TestUtils.SimulateNative.mouseOut(proxyClass.refs.component);
                expect(props.viewProps.setVar).toHaveBeenCalledWith('0', viewDef.comp.hoverVar, false);
            });
        });

        describe('view events', function () {
            var viewDef;

            beforeEach(function () {
                viewDef = {
                    "comp": {
                        "name": 'TestBaseProxy',
                        "events": {}
                    }
                };
            });

            it("should call logic's function on event", function () {
                var logicCallback = jasmine.createSpy('logicCallback');
                viewDef.comp.events.compEvent = 'logicCallback';

                var props = testUtils.proxyPropsBuilder(viewDef);
                props.logic.logicCallback = logicCallback;

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var payload = {test: 2};
                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent',
                    payload: payload
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(logicCallback).toHaveBeenCalledWith(jasmine.objectContaining({payload: payload}), 'testId');
            });

            it("should throw exception if logic doesn't have a function with the name defined in the view definition", function () {
                var logicCallback = jasmine.createSpy('logicCallback');
                viewDef.comp.events.compEvent = 'notExist';

                var props = testUtils.proxyPropsBuilder(viewDef);
                props.logic.logicCallback = logicCallback;

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var payload = {test: 2};
                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent',
                    payload: payload
                };

                var handleEvent = function () {
                    proxyClass.handleViewEvent(event, 'testId');
                };

                expect(handleEvent).toThrow("Error:: Logic missing implementation for event [notExist]");
            });

            it('should pass params from the view to the event callback', function () {
                var logicCallback = jasmine.createSpy('logicCallback');
                var params = {
                    param: 2
                };

                viewDef.comp.events.compEvent = {
                    event: 'logicCallback',
                    params: params
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                props.logic.logicCallback = logicCallback;

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                var payload = {test: 2};
                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent',
                    payload: payload
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(logicCallback).toHaveBeenCalledWith(jasmine.objectContaining({payload: payload, params: params}), 'testId');

            });

            it('should resolve expressions in the params and pass it from the view to the event callback', function () {
                var logicCallback = jasmine.createSpy('logicCallback');
                var params = {
                    param1: {
                        $expr: 'add(2, 3)'
                    }
                };
                viewDef.comp.events.compEvent = {
                    event: 'logicCallback',
                    params: params
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                props.logic.logicCallback = logicCallback;

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent'
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(logicCallback).toHaveBeenCalledWith(jasmine.objectContaining({params: {param1: 5}}), 'testId');
            });

            it('should set value of var when using "set:$varname=value" as viewer event', function () {
                viewDef.comp.events.compEvent = 'set:$testVar=5';
                var props = testUtils.proxyPropsBuilder(viewDef);
                spyOn(props.viewProps, 'setVar');

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent'
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(props.viewProps.setVar).toHaveBeenCalledWith(proxyClass.contextPath, '$testVar', 5);
            });

            it('should multiple set value of var when using "set:$varname=value" as viewer event', function () {
                viewDef.comp.events.compEvent = 'set:$testVar=5;set:$anotherVar=9';
                var props = testUtils.proxyPropsBuilder(viewDef);
                spyOn(props.viewProps, 'setVar');

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent'
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(props.viewProps.setVar.calls.count()).toEqual(2);
                expect(props.viewProps.setVar.calls.argsFor(0)).toEqual([proxyClass.contextPath, '$testVar', 5]);
                expect(props.viewProps.setVar.calls.argsFor(1)).toEqual([proxyClass.contextPath, '$anotherVar', 9]);
            });

            it('should evaluate expression and set the value of var when using "set:$varname={expression}" as viewer event', function () {
                viewDef.comp.events.compEvent = 'set:$testVar={add(2, 5)}';
                var props = testUtils.proxyPropsBuilder(viewDef);
                spyOn(props.viewProps, 'setVar');

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);

                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent'
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(props.viewProps.setVar).toHaveBeenCalledWith(proxyClass.contextPath, '$testVar', 7);
            });

            it('should set value of data when using "set:property=value" as viewer event', function () {
                var newTitle = 'set Title using view event';
                viewDef.comp.events.compEvent = "set:title='" + newTitle + "'";
                var data = {
                    title: 'initial title'
                };
                var props = testUtils.proxyPropsBuilder(viewDef, data);

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);
                spyOn(proxyClass.props.viewProps, 'setDataByPath').and.callThrough();

                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent'
                };

                proxyClass.handleViewEvent(event, 'testId');
                expect(proxyClass.props.viewProps.setDataByPath).toHaveBeenCalledWith('0', 'title', newTitle);
            });

            it('should evaluate expression and set the value of the data when using "set:property={expression}" as viewer event', function () {
                viewDef.comp.events.compEvent = "set:title={String.concat('This is not the ', title)}";
                var title = 'initial title';
                var data = {
                    title: title
                };
                var props = testUtils.proxyPropsBuilder(viewDef, data);

                var proxyClass = testUtils.proxyBuilder('TestBaseProxy', props);
                spyOn(proxyClass.props.viewProps, 'setDataByPath').and.callThrough();

                /** @type SyntheticEvent */
                var event = {
                    type: 'compEvent'
                };

                proxyClass.handleViewEvent(event, 'testId');
                var expectedTitle = 'This is not the ' + title;
                expect(proxyClass.props.viewProps.setDataByPath).toHaveBeenCalledWith('0', 'title', expectedTitle);
            });
        });
    });
});
