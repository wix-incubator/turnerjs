(function() {

    'use strict';

    describe('PopupLogger', function() {
        var WConsoleBuilderClass = window.W.WConsoleBuilderClass || (window.WT && window.WT.WConsoleBuilderClass);
        var PopupLoggerClass = WConsoleBuilderClass._PopupLoggerClass;

        var popupLogger;
        var containerNode = document.createElement('div');

        var isAppendableDom = PopupLoggerClass.isAppendableDom;

        describe('isAppendableDom', function() {
            it('should return true for a DOM element', function() {
                expect(isAppendableDom(document.createElement('div'))).toBeTruthy();
            });

            it('should return true for a document fragment', function() {
                expect(isAppendableDom(document.createDocumentFragment())).toBeTruthy();
            });

            it('should return false for a non-appendable DOM element', function() {
                expect(isAppendableDom(document.createTextNode('bla'))).toBeFalsy();
            });

            it('should return false for a non-DOM stuff', function() {
                expect(isAppendableDom(_.noop)).toBeFalsy();
                expect(isAppendableDom(undefined)).toBeFalsy();
                expect(isAppendableDom({ appendChild: _.noop })).toBeFalsy();
            });
        });

        beforeEach(function() {
            function contains(parent, child) {
                var childParent = child.parentNode;
                return (childParent && (childParent === parent || contains(parent, childParent)));
            }

            this.addMatchers({
                toBeADomElement: function() {
                    return isAppendableDom(this.actual);
                },
                toBeDescendantOf: function(expected) {
                    return contains(expected, this.actual);
                }
            });
        });

        beforeEach(function() {
            containerNode.empty();
            popupLogger = new PopupLoggerClass(containerNode);
        });

        describe('initialization', function() {
            it('should create DOM elements', function() {
                expect(popupLogger.getTextAreaNode()).toBeADomElement();
            });

            it('should create a textarea with an empty value', function() {
                expect(popupLogger.getTextAreaNode().value).toBe('');
            });

            it('containerNode should contain textArea', function() {
                expect(popupLogger.getTextAreaNode()).toBeDescendantOf(containerNode);
            });

            it('containerNode should contain only a single div with id logTextAreaContainer', function() {
                expect(containerNode.childNodes.length).toBe(1);
                expect(containerNode.childNodes[0].id).toBe('logTextAreaContainer');
            });
        });

        describe('addLogLine', function() {
            it('should add to the value property of the textarea', function() {
                popupLogger.addLogLine('this is a line');
                expect(popupLogger.getTextAreaNode().value).toBe('this is a line\n');
                popupLogger.addLogLine('this is another line');
                expect(popupLogger.getTextAreaNode().value).toBe('this is a line\nthis is another line\n');
            });
        });

        describe('_formatConsoleCall', function() {
            it('should format the console call', function() {
                expect(popupLogger._formatConsoleCall('foo', ['1this is a line'])).toBe('foo: 1this is a line');
                expect(popupLogger._formatConsoleCall('bar', ['2this is', 'another line'])).toBe('bar: 2this is,another line');
            });
        });

        describe('logConsoleCall', function() {
            it('should add to the value property of the textarea', function() {
                popupLogger.logConsoleCall('foo', ['this is a line']);
                expect(popupLogger.getTextAreaNode().value).toBe('foo: this is a line\n');
                popupLogger.logConsoleCall('bar', ['this is', 'another line']);
                expect(popupLogger.getTextAreaNode().value).toBe('foo: this is a line\nbar: this is,another line\n');
            });
        });
    });

    describe('Stores', function() {
        var fakeDateIndex;
        var FakeDate = function() {
            this.date = fakeDateIndex++;
        };

        beforeEach(function() {
            fakeDateIndex = 0;
        });

        function testLogStoreClass(Class) {
            describe('LogStore', function() {
                var store;

                beforeEach(function() {
                    store = new Class({Date: FakeDate});
                });

                it('should add the arguments to the log', function() {
                    expect(store.get()).toBeEquivalentTo([]);
                    store.add('a', 'b', 'c');
                    expect(store.get()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c']]);
                    store.add('d', 'e', 'f');
                    expect(store.get()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c'], [{date: 1}, 'd', 'e', 'f']]);
                    var obj = {x:12};
                    store.add('a', obj);
                    expect(store.get().slice(-1)[0][2]).toBe(obj);
                    store.clear();
                    expect(store.get()).toBeEquivalentTo([]);
                });

                describe('pop', function() {
                    it('should return the log and clear it', function() {
                        expect(store.get()).toBeEquivalentTo([]);
                        store.add('a', 'b', 'c');
                        expect(store.pop()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c']]);
                        expect(store.get()).toBeEquivalentTo([]);
                    });
                });
            });
        }

        describe('ConsoleStore', function() {
            var WConsoleBuilderClass = window.W.WConsoleBuilderClass || (window.WT && window.WT.WConsoleBuilderClass);
            var ConsoleStoreClass = WConsoleBuilderClass._ConsoleStoreClass;
            testLogStoreClass(ConsoleStoreClass);
        });

        describe('WindowErrorsStore', function() {
            var WConsoleBuilderClass = window.W.WConsoleBuilderClass || (window.WT && window.WT.WConsoleBuilderClass);
            var WindowErrorsStoreClass = WConsoleBuilderClass._WindowErrorsStoreClass;
            testLogStoreClass(WindowErrorsStoreClass);

            describe('start/stop', function() {
                var store;
                var fakeWindow;

                beforeEach(function() {
                    fakeWindow = {};
                    store = new WindowErrorsStoreClass({window: fakeWindow, Date: FakeDate});
                });

                it('should add to the log when window.onerror is called', function() {
                    store.start();
                    fakeWindow.onerror('a', 'b', 'c', 'd');
                    expect(store.get()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c', 'd']]);
                    fakeWindow.onerror('e');
                    expect(store.get()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c', 'd'], [{date: 1}, 'e']]);
                });

                it('should save the old window.onerror, call it and re-instate it when stop() is called', function() {
                    var originalOnError = jasmine.createSpy('originalOnError');
                    fakeWindow.onerror = originalOnError;
                    store.start();
                    fakeWindow.onerror('a', 'b', 'c', 'd');
                    expect(store.get()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c', 'd']]);
                    expect(originalOnError).toHaveBeenCalledXTimes(1);
                    expect(originalOnError).toHaveBeenCalledWithEquivalentOf('a', 'b', 'c', 'd');
                    store.stop();
                    fakeWindow.onerror('e');
                    expect(originalOnError).toHaveBeenCalledXTimes(2);
                    expect(originalOnError).toHaveBeenCalledWithEquivalentOf('e');
                });

                it('should stop adding to the log when window.onerror is called after stop() is called', function() {
                    fakeWindow.onerror = _.noop;
                    store.start();
                    fakeWindow.onerror('a', 'b', 'c', 'd');
                    store.stop();
                    fakeWindow.onerror('a', 'b', 'c', 'd');
                    expect(store.get()).toBeEquivalentTo([[{date: 0}, 'a', 'b', 'c', 'd']]);
                });
            });
        });
    });

    describe('WConsole', function() {
        var WConsoleBuilderClass = window.W.WConsoleBuilderClass || (window.WT && window.WT.WConsoleBuilderClass);
        var WConsoleClass = WConsoleBuilderClass._WConsoleClass;

        var wConsole;

        it('should have a property _isWConsole with value of true', function() {
            wConsole = new WConsoleClass();
            expect(wConsole._isWConsole).toBe(true);
        });

        it('should store the originalConsole in the property _oldConsole', function() {
            var originalConsole = {};
            wConsole = new WConsoleClass(null, originalConsole);
            expect(wConsole._oldConsole).toBe(originalConsole);
        });

        it('the property _oldConsole should be undefined when no originalConsole is specified', function() {
            wConsole = new WConsoleClass(null, false /* false to test "harder" than undefined */);
            expect(wConsole._oldConsole).toBe(undefined);
        });

        describe('the created log functions', function() {
            var funcNames = ['foo', 'bar'];
            var loggerFunc, originalConsole, shouldCallOriginalConsole, onLogException;

            beforeEach(function() {
                loggerFunc = originalConsole = shouldCallOriginalConsole = onLogException = null;
            });

            function eachFunctionShould(description, testForEachFunc, setup) {
                it('should ' + description, function() {
                    if (setup) {
                        setup();
                    }

                    wConsole = new WConsoleClass(
                        loggerFunc,
                        originalConsole,
                        shouldCallOriginalConsole,
                        {consoleFunctionNames: funcNames, onLogException: onLogException}
                    );

                    funcNames.forEach(testForEachFunc);
                });
            }

            eachFunctionShould('be created', function(funcName) {
                expect(typeof wConsole[funcName] === 'function');
            });

            eachFunctionShould('call loggerFunc if it was specified',
                function(funcName) {
                    wConsole[funcName]('called', funcName+'_');
                    expect(loggerFunc).toHaveBeenCalledWith(funcName, 'called', funcName+'_');
                }, function() {
                    loggerFunc = jasmine.createSpy('loggerFunc');
                }
            );

            eachFunctionShould('not call loggerFunc if it is not a function',
                function(funcName) {
                    wConsole[funcName]('boo! ' + funcName);
                    expect(onLogException).not.toHaveBeenCalled();
                }, function() {
                    onLogException = jasmine.createSpy('onLogException');
                    loggerFunc = 'not a function';
                }
            );

            function makeObject(ar, func) {
                var result = {};
                ar.forEach(function(el) {
                    result[el] = func(el);
                });
                return result;
            }

            describe('when shouldCallOriginalConsole is truthy', function() {
                beforeEach(function() {
                    shouldCallOriginalConsole = true;
                });

                eachFunctionShould('call the corresponding originalConsole function and return its value',
                    function(funcName) {
                        var result = wConsole[funcName]('called', funcName);
                        expect(originalConsole[funcName]).toHaveBeenCalledWith('called', funcName);
                        expect(result).toBe('result_' + funcName);
                    }, function() {
                        originalConsole = makeObject(funcNames, function createSpyAndReturn(funcName) {
                            return jasmine.createSpy(funcName).andReturn('result_' + funcName);
                        });
                    }
                );

                var error = new Error('logging function threw an error!');

                eachFunctionShould('swallow exceptions in the originalConsole function and return undefined',
                    function(funcName) {
                        var result = wConsole[funcName]('boo! ' + funcName);
                        expect(result).toBeUndefined();
                        expect(onLogException).toHaveBeenCalledWith(error);
                    }, function() {
                        onLogException = jasmine.createSpy('onLogException');
                        originalConsole = makeObject(funcNames, function throws(funcName) {
                            return jasmine.createSpy(funcName).andThrow(error);
                        });
                    }
                );

                eachFunctionShould('not try to call the corresponding originalConsole property if it is not a function',
                    function(funcName) {
                        var result = wConsole[funcName]('boo! ' + funcName); // expect not to throw
                        expect(result).toBeUndefined();
                    }, function() {
                        originalConsole = makeObject(funcNames, _.identity /* strings, not functions */);
                    }
                );

                eachFunctionShould('call both the loggerFunc and the corresponding originalConsole function if both are specified',
                    function(funcName) {
                        wConsole[funcName]('called', funcName+'_');
                        expect(originalConsole[funcName]).toHaveBeenCalledWith('called', funcName+'_');
                        expect(loggerFunc).toHaveBeenCalledWith(funcName, 'called', funcName+'_');
                    }, function() {
                        originalConsole = makeObject(funcNames, jasmine.createSpy);
                        loggerFunc = jasmine.createSpy('loggerFunc');
                    }
                );
            });

            describe('when shouldCallOriginalConsole is falsy', function() {
                eachFunctionShould('not call the corresponding originalConsole function',
                    function(funcName) {
                        var result = wConsole[funcName]('called', funcName);
                        expect(originalConsole[funcName]).not.toHaveBeenCalled();
                        expect(result).toBeUndefined();
                    }, function() {
                        originalConsole = makeObject(funcNames, function createSpyAndReturn(funcName) {
                            return jasmine.createSpy(funcName).andReturn('result_' + funcName);
                        });
                    }
                );
            });
        });


        describe('IE8/9 console functions', function() {
            var IE8_USERAGENT = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)";
            var IE9_USERAGENT = "Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 5.1; Trident/4.0)";
            var IE10_USERAGENT = "Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 5.1; Trident/4.0)";

            function testOldIELog(userAgent, logFunction, shouldBeCalled) {
                var onLogException = jasmine.createSpy('onLogException');
                it('should ' + (shouldBeCalled ? '' : 'not ') + 'call the log function if IE userAgent and typeof log=' + typeof(logFunction), function() {
                    wConsole = new WConsoleClass(null, {log: logFunction}, true, {
                        userAgent: userAgent,
                        onLogException: onLogException
                    });

                    wConsole.log('bla');
                    if (shouldBeCalled) {
                        expect(onLogException).toHaveBeenCalled();
                    } else {
                        expect(onLogException).not.toHaveBeenCalled();
                    }
                });
            }

            [IE8_USERAGENT, IE9_USERAGENT].forEach(function(userAgent) {
                testOldIELog(userAgent, {}, true);
                testOldIELog(userAgent, function() {}, false);
            });

            testOldIELog(IE10_USERAGENT, {}, false);
            testOldIELog(IE10_USERAGENT, function() {}, false);
        });
    });

    describe('WConsoleBuilder', function() {
        var WConsoleBuilderClass = window.W.WConsoleBuilderClass || (window.WT && window.WT.WConsoleBuilderClass);

        var wConsoleBuilder, testDeps;

        describe('_isUrlParamSpecified', function() {
            beforeEach(function() {
                wConsoleBuilder = new WConsoleBuilderClass({
                    urlQuery: '?mode=debug&logBi=true'
                });
            });

            it('should return true for UrlParams which are specified', function() {
                expect(wConsoleBuilder._isUrlParamSpecified('mode=debug')).toBe(true);
                expect(wConsoleBuilder._isUrlParamSpecified('logBi=true')).toBe(true);
                expect(wConsoleBuilder._isUrlParamSpecified('log(Bi)?=true')).toBe(true);
                expect(wConsoleBuilder._isUrlParamSpecified('log(bi)?=true')).toBe(true);
                expect(wConsoleBuilder._isUrlParamSpecified('mode.*')).toBe(true);
            });

            it('should return false for UrlParams which are not specified', function() {
                expect(wConsoleBuilder._isUrlParamSpecified('mode=foo')).toBe(false);
                expect(wConsoleBuilder._isUrlParamSpecified('unspecified')).toBe(false);
            });

            it('should work correctly when urlQuery is empty', function() {
                wConsoleBuilder = new WConsoleBuilderClass({ urlQuery: '' });
                expect(wConsoleBuilder._isUrlParamSpecified('mode=foo')).toBe(false);
                expect(wConsoleBuilder._isUrlParamSpecified('unspecified')).toBe(false);
            });
        });

        var IE8_USERAGENT = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)";

        describe('_shouldEnableWConsole', function() {
            var testDeps;
            beforeEach(function() {
                testDeps = {urlQuery:''};
            });

            function expectIsEnabled(val) {
                wConsoleBuilder = new WConsoleBuilderClass(testDeps);
                expect(wConsoleBuilder._shouldEnableWConsole()).toBe(val);
            }

            function testEnablingConditions(expectation) {
                it('if serviceTopology is defined', function() {
                    testDeps.serviceTopology = {};
                    expectation();
                });

                it('if serviceTopology is defined and serviceTopology.developerMode is falsy', function() {
                    testDeps.serviceTopology = {developerMode: 0};
                    expectation();
                });

                it('if log or logbi parameters are specified with a value of "true"', function() {
                    testDeps.urlQuery += '&log=true';
                    expectation();
                    testDeps.urlQuery += '&logBI=true';
                    expectation();
                });

                it('if the wconsole=store parameter is specified', function() {
                    testDeps.urlQuery += '&wconsole=store';
                    expectation();
                });

                it('if the userAgent is IE', function() {
                    testDeps.userAgent = IE8_USERAGENT;
                    expectation();
                });
            }

            describe('should return true', function() {
                function expectEnabled() { expectIsEnabled(true); }
                testEnablingConditions(expectEnabled);
            });

            describe('should return false', function() {
                function expectDisabled() { expectIsEnabled(false); }

                it('if serviceTopology is not defined', function() {
                    delete testDeps.serviceTopology;
                    expectDisabled();
                });

                it('if serviceTopology defined and serviceTopology.developerMode is truthy', function() {
                    testDeps.serviceTopology = { developerMode: 1 };
                    expectDisabled();
                });

                it('if a log or logbi query parameter is specified with a value other than "true"', function() {
                    testDeps.urlQuery = '?log';
                    expectDisabled();
                    testDeps.urlQuery = '?log=f22';
                    expectDisabled();
                    testDeps.urlQuery = '?logBi';
                    expectDisabled();
                    testDeps.urlQuery = '?logBi=f23';
                    expectDisabled();
                });

                it('if a wconsole=false query parameter is specified', function() {
                    testDeps.urlQuery = '?wconsole=false';
                    expectDisabled();
                });

                describe('when the enabling conditions are met but', function() {
                    function testWithDisablingCondition(description, setup) {
                        describe(description, function() {
                            beforeEach(setup);
                            testEnablingConditions(expectDisabled);
                        });
                    }

                    testWithDisablingCondition('the wconsole=false query parameter is specified', function() {
                        testDeps.urlQuery += '&wconsole=false';
                    });
                });
            });
        });

        describe('_shouldAlsoCallOriginalConsole', function() {
            var testDeps;
            beforeEach(function() {
                testDeps = {urlQuery:''};
            });

            describe('should return true', function() {
                function testEnablingCondition(description, setup) {
                    it(description, function() {
                        setup();
                        wConsoleBuilder = new WConsoleBuilderClass(testDeps);
                        expect(wConsoleBuilder._shouldAlsoCallOriginalConsole()).toBe(true);
                    });
                }

                testEnablingCondition('if the log parameter is specified with a value of "true"', function() {
                    testDeps.urlQuery += '&log=true';
                });

                testEnablingCondition('if the logBI parameter is specified with a value of "true"', function() {
                    testDeps.urlQuery += '&logBi=true';
                });

                testEnablingCondition('if the mode parameter is specified with a value of "debug"', function() {
                    testDeps.urlQuery += '&mode=debug';
                });

                testEnablingCondition('if the wconsole parameter is specified with a value of "store"', function() {
                    testDeps.urlQuery += '&wconsole=store';
                });

                testEnablingCondition('if the debugArtifact parameter is specified without a value', function() {
                    testDeps.urlQuery += '&debugArtifact';
                });

                testEnablingCondition('if the debugArtifact parameter is specified with any value', function() {
                    testDeps.urlQuery += '&debugArtifact=1,2,3';
                });

                testEnablingCondition('if the debugArtifacts parameter is specified without a value', function() {
                    testDeps.urlQuery += '&debugArtifacts';
                });

                testEnablingCondition('if the debugArtifacts parameter is specified with any value', function() {
                    testDeps.urlQuery += '&debugArtifacts=1,2,3';
                });
            });
        });

        describe('_getLoggerFunc', function() {
            var div = new Element('div');

            function getBuilder(urlQuery, logStoreContainer) {
                return new WConsoleBuilderClass({
                    urlQuery: urlQuery,
                    logStoreContainer: logStoreContainer,
                    popupContainer: div,
                    initialLog: {
                        alwaysPrint: {
                            MYKEY: 'MYVAL'
                        }
                    }
                });
            }

            describe('when wconsole=store is specified', function() {
                var container = {};

                beforeEach(function() {
                    wConsoleBuilder = getBuilder('?wconsole=store', [container, '_lll']);
                });

                it('should return the ConsoleStore.add function and store it in the specified container', function() {
                    var loggerFunc = wConsoleBuilder._getLoggerFunc();
                    expect(loggerFunc).toBeTruthy();
                    expect(container._lll).toBeTruthy();
                    loggerFunc('foo', 'a', 'b');
                    var log = container._lll.get();
                    expect(log.length).toBe(1);
                    expect(log[0][0]).toBeInstanceOf(Date);
                    expect(log[0].slice(1)).toBeEquivalentTo(['foo', 'a', 'b']);
                });
            });

            describe('when popup logger is enabled', function() {
                beforeEach(function() {
                    wConsoleBuilder = getBuilder('?log=true');
                });

                it('should return the popupLogger function', function() {
                    var loggerFunc = wConsoleBuilder._getLoggerFunc();
                    expect(loggerFunc).toBeTruthy();
                    var textArea = div.querySelector('#logTextArea');
                    expect(textArea).toBeTruthy();
                    expect(textArea.value).toContainString('MYKEY');
                    loggerFunc('foo', 'aaa', 'bbb');
                    expect(textArea.value).toContainString('foo');
                    expect(textArea.value).toContainString('aaa');
                    expect(textArea.value).toContainString('bbb');
                });
            });

            describe('when neither of the options is specified', function() {
                beforeEach(function() {
                    wConsoleBuilder = getBuilder();
                });

                it('should return the popupLogger function', function() {
                    var loggerFunc = wConsoleBuilder._getLoggerFunc();
                    expect(loggerFunc).toBeUndefined();
                });
            });

        });

        describe('_shouldLogTextAreaBeEnabled', function() {
            function getBuilder(urlQuery) {
                return new WConsoleBuilderClass({
                    popupContainer: new Element('div'),
                    urlQuery: urlQuery
                });
            }

            it('should return true when log=true is specified', function() {
                wConsoleBuilder = getBuilder('?log=true');
                expect(wConsoleBuilder._shouldLogTextAreaBeEnabled()).toBeTruthy();
            });

            it('should return false when logbi=true is specified', function() {
                wConsoleBuilder = getBuilder('?logbi=true');
                expect(wConsoleBuilder._shouldLogTextAreaBeEnabled()).toBeFalsy();
            });

            it('should return false when no URL query params are specified', function() {
                wConsoleBuilder = getBuilder('');
                expect(wConsoleBuilder._shouldLogTextAreaBeEnabled()).toBeFalsy();
            });
        });

        describe('startCapturingWindowErrorsIfSpecified', function() {
            var start = jasmine.createSpy('start');
            var fakeStoreClassCalls;

            var FakeStoreClass = function FakeStoreClass() {
                if (this instanceof FakeStoreClass) {
                    fakeStoreClassCalls++;
                    this.start = start;
                }
            };

            function getBuilder(urlQuery, container, Class) {
                Class = Class || FakeStoreClass;
                var builder = new WConsoleBuilderClass({
                    urlQuery: urlQuery,
                    windowErrorsStoreContainer: container,
                    WindowErrorsStoreClass: Class
                });

                builder.startCapturingWindowErrorsIfSpecified();
                return builder;
            }

            beforeEach(function() {
                fakeStoreClassCalls = 0;
                this.addMatchers({
                    toHaveCreatedAndStartedStore: function() {
                        this.actual = 'builder';
                        return fakeStoreClassCalls === 1 && start.callCount === 1;
                    }
                });
            });

            var container = [{}, 'store'];

            it('should not create the store if wconsole=store was not specified', function() {
                getBuilder('', container);
                expect().not.toHaveCreatedAndStartedStore();
            });

            it('should not create the store if a container was not specified', function() {
                getBuilder('?wconsole=store');
                expect().not.toHaveCreatedAndStartedStore();
            });

            it('should not create the store if an invalid container was specified', function() {
                getBuilder('?wconsole=store', [{}]);
                expect().not.toHaveCreatedAndStartedStore();
            });

            it('should not create the store if no class was specified', function() {
                getBuilder('?wconsole=store', container, 'not a class');
                expect().not.toHaveCreatedAndStartedStore();
            });

            it('should create the store and start it if wconsole=store a valid container were specified', function() {
                getBuilder('?wconsole=store', container);
                expect().toHaveCreatedAndStartedStore();
            });
        });

        describe('_getInitialLogLines', function() {
            it('should return the correct log', function() {
                wConsoleBuilder = new WConsoleBuilderClass({
                    initialLog: {
                        alwaysPrint: {
                            'prop1': 'val1',
                            'prop2': 'val2',
                            'name with spaces': 'value with spaces'
                        },
                        printOnlyIfNonNull: {
                            'prop3': ['val3a', 'val3b'],
                            'prop4': {a:12,b:'13'},
                            'prop5': undefined
                        }
                    }
                });

                expect(wConsoleBuilder._getInitialLogLines()).toBeEquivalentTo([
                    'prop1: val1',
                    'prop2: val2',
                    'name with spaces: value with spaces',
                    'prop3: ["val3a","val3b"]',
                    'prop4: {"a":12,"b":"13"}'
                ]);
            });

            it('should return an empty log if initialLog or parts of it are not specified', function() {
                testDeps = {};
                function expectEmpty() {
                    wConsoleBuilder = new WConsoleBuilderClass(testDeps);
                    expect(wConsoleBuilder._getInitialLogLines()).toBeEquivalentTo([]);
                }

                expectEmpty();
                testDeps.initialLog = {};
                expectEmpty();
                testDeps.initialLog = { alwaysPrint: {} };
                expectEmpty();
                testDeps.initialLog = { printOnlyIfNonNull: {} };
                expectEmpty();
                testDeps.initialLog = { alwaysPrint: {}, printOnlyIfNonNull: {} };
            });
        });

        var CONSOLE_FUNCTION_NAMES = WConsoleBuilderClass._WConsoleClass.CONSOLE_FUNCTION_NAMES;

        describe('build', function() {
            it('should use the result of _getLoggerFunc', function() {
                wConsoleBuilder = new WConsoleBuilderClass({});
                var loggerFunc = jasmine.createSpy('loggerFunc');
                spyOn(wConsoleBuilder, '_getLoggerFunc').andReturn(loggerFunc);
                spyOn(wConsoleBuilder, '_shouldEnableWConsole').andReturn(true);
                var wConsole = wConsoleBuilder.build();
                wConsole.log('aaa', 'bbb');
                expect(loggerFunc).toHaveBeenCalledWithEquivalentOf('log', 'aaa', 'bbb');
            });

            it('should not replace the console if _shouldEnableWConsole returns false', function() {
                var fakeConsole = {};
                wConsoleBuilder = new WConsoleBuilderClass({ originalConsole: fakeConsole });
                spyOn(wConsoleBuilder, '_shouldEnableWConsole').andReturn(false);
                expect(wConsoleBuilder.build()).toBe(fakeConsole); // not replaced
            });

            function testCallingOriginalConsoleFuncs(dependencies, extraSetup) {
                var originalConsole = {
                    log: jasmine.createSpy('log'),
                    info: jasmine.createSpy('info')
                };

                wConsoleBuilder = new WConsoleBuilderClass(_.extend(dependencies, {
                    originalConsole: originalConsole
                }));

                if (extraSetup) {
                    extraSetup(wConsoleBuilder);
                }

                var wConsole = wConsoleBuilder.build();
                CONSOLE_FUNCTION_NAMES.forEach(function(funcName) {
                    expect(typeof wConsole[funcName]).toBe('function');
                    wConsole[funcName]('called', funcName);
                    if (originalConsole.hasOwnProperty(funcName)) {
                        expect(originalConsole[funcName]).toHaveBeenCalledWith('called', funcName);
                    }
                });
            }

            describe('integration', function() {
                it('should create the log popup, add the initial log and add logs', function() {
                    var popupContainer = document.createElement('div');

                    wConsoleBuilder = new WConsoleBuilderClass({
                        popupContainer: popupContainer,
                        urlQuery: '?log=true',
                        initialLog: {
                            alwaysPrint: {
                                x: 'this text should appear'
                            }
                        }
                    });

                    var wConsole = wConsoleBuilder.build();

                    var textArea = popupContainer.querySelector('textarea');
                    expect(textArea).not.toBeFalsy();
                    expect(textArea.value).toContain('this text should appear');

                    _.times(2, function(index) {
                        CONSOLE_FUNCTION_NAMES.forEach(function(funcName) {
                            wConsole[funcName]('called', index, funcName);
                        });
                    });

                    _.times(2, function(index) {
                        CONSOLE_FUNCTION_NAMES.forEach(function(funcName) {
                            expect(textArea.value).toContain('called,' + index + ',' + funcName);
                        });
                    });
                });

                it('should create an overriding console and call the original function names if the log parameter is specified',
                    function() {
                        testCallingOriginalConsoleFuncs({ urlQuery: '?log=true' });
                    }
                );

                it('should create an overriding console and call the original function names if the logbi parameter is specified',
                    function() {
                        testCallingOriginalConsoleFuncs({ urlQuery: '?logbi=true' });
                    }
                );

                it('should create an overriding console and call the original function names if both the mode=debug and wconsole=true parameters are specified',
                    function() {
                        testCallingOriginalConsoleFuncs({ urlQuery: '?mode=debug&wconsole=true' });
                    }
                );

                it('should pass the userAgent dependency to the WConsole class and call the IE8 console functions', function() {
                    var onLogException = jasmine.createSpy('onLogException');
                    wConsoleBuilder = new WConsoleBuilderClass({
                        urlQuery: '?mode=debug',
                        userAgent: IE8_USERAGENT,
                        originalConsole: {log: {}}, // IE8 console func return typeof 'object'
                        onLogException: onLogException
                    });

                    var wConsole = wConsoleBuilder.build();
                    wConsole.log('bla');
                    expect(onLogException).toHaveBeenCalled();
                });
            });
        });
    });
})();

