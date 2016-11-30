describe('InitialStatemapOrTopologyHandler', function() {
    'use strict';

    var HandlerClass = window.WT.InitialStatemapOrTopologyHandlerClass;

    var handler, windowScope, statemapOrTopology;

    beforeEach(function() {
        handler = windowScope = statemapOrTopology = null;
    });

    describe('_saveOldScriptsLocationMap', function() {
        function testWhen(originalServiceTopology, originalServiceTopologyDescription) {
            describe('when windowScope.serviceTopology is ' + originalServiceTopologyDescription, function() {
                beforeEach(function() {
                    windowScope = { serviceTopology: originalServiceTopology };
                    handler = new HandlerClass({windowScope: windowScope});
                });

                it('should save a clone of the scriptsLocationMap', function() {
                    handler._saveOldScriptsLocationMap();

                    var originalScriptsLocationMap = originalServiceTopology.scriptsLocationMap;
                    /* jshint ignore:start */
                    expect(windowScope.__original_serviceTopology_scriptsLocationMap__)
                        .toBeEquivalentTo(originalScriptsLocationMap);

                    if (!_([undefined, null]).contains(originalScriptsLocationMap)) {
                        expect(windowScope.__original_serviceTopology_scriptsLocationMap__).not
                            .toBe(originalScriptsLocationMap);
                    }
                    /* jshint ignore:end */
                });
            });
        }

        testWhen({ scriptsLocationMap: {x:1} }, 'an object');
        testWhen({ scriptsLocationMap: null }, 'null');
        testWhen({}, 'undefined');
    });

    describe('_overrideServiceTopologyScriptsLocationMap', function() {
        function testWhen(description, originalServiceTopology, overridingScriptsLocationMap, expectedScriptsLocationMap) {
            describe('when window.serviceTopology ' + description, function() {
                beforeEach(function() {
                    windowScope = {
                        serviceTopology: originalServiceTopology
                    };

                    handler = new HandlerClass({windowScope: windowScope});
                });

                it('should override', function() {
                    handler._overrideServiceTopologyScriptsLocationMap(overridingScriptsLocationMap);
                   expect(windowScope.serviceTopology.scriptsLocationMap).toBeEquivalentTo(expectedScriptsLocationMap);
                });
            });
        }

        testWhen('contains a scriptsLocationMap', { scriptsLocationMap: {x:1} }, {y:2}, {x:1,y:2});
        testWhen('contains a scriptsLocationMap with a "none" value', { scriptsLocationMap: {x:1} }, {y:2, x:'none'}, {y:2});
        testWhen('does not contain a scriptsLocationMap', {}, {y:2}, {y:2});
    });

    describe('_getModel', function() {
        beforeEach(function() {
            windowScope = {};
            handler = new HandlerClass({windowScope: windowScope});
        });

        it('should return the editorModel when it\'s available', function() {
            windowScope.editorModel = {};
            expect(handler._getModel()).toBe(windowScope.editorModel);
            windowScope.rendererModel = {};
            expect(handler._getModel()).toBe(windowScope.editorModel);
        });

        it('should return the rendererModel when the editorModel is not available', function() {
            windowScope.rendererModel = {};
            expect(handler._getModel()).toBe(windowScope.rendererModel);
        });

        it('should return an empty object if both the rendererModel and the editorModel are not available', function() {
            expect(handler._getModel()).toBeEquivalentTo({});
        });
    });

    describe('_getRunningExperiments', function() {
        var getModelSpy;

        beforeEach(function() {
            handler = new HandlerClass();
            getModelSpy = spyOn(handler, '_getModel');
        });

        it('should return the runningExperiments property when it\'s available', function() {
            var runningExperiments = {x:'new'};
            getModelSpy.andReturn({runningExperiments: runningExperiments});
            expect(handler._getRunningExperiments()).toBe(runningExperiments);
        });

        it('should return an empty object when the runningExperiments property is undefined', function() {
            getModelSpy.andReturn({});
            expect(handler._getRunningExperiments()).toBeEquivalentTo({});
        });
    });

    describe('_replaceRunningExperiments', function() {
        var getModelSpy, getRunningExperimentsSpy;
        var runningExperiments = {x:1};
        var model = {};

        beforeEach(function() {
            windowScope = {};
            handler = new HandlerClass({windowScope: windowScope});
            getModelSpy = spyOn(handler, '_getModel').andReturn(model);
            getRunningExperimentsSpy = spyOn(handler, '_getRunningExperiments').andReturn(runningExperiments);
        });

        function testSave(params) {
            beforeEach(function() {
                handler._replaceRunningExperiments.apply(handler, params);
            });

            it('should save the old runningExperiments', function() {
                /* jshint ignore:start */
                expect(windowScope.__original_runningExperiments__).not.toBe(runningExperiments);
                expect(windowScope.__original_runningExperiments__).toBeEquivalentTo(runningExperiments);
                /* jshint ignore:end */
            });
        }

        describe('when called with no parameters', function() {
            testSave([]);
            it('should not set the model runningExperiments', function() {
                expect(model.runningExperiments).toBeUndefined();
            });
        });

        describe('when called with a new runningExperiments object', function() {
            testSave([runningExperiments]);
            it('should not set the model runningExperiments', function() {
                expect(model.runningExperiments).toBe(runningExperiments);
            });
        });
    });

    describe('execute', function() {
        function createSpies(handler) {
            spyOn(handler, '_saveOldScriptsLocationMap').andCallThrough();
            spyOn(handler, '_replaceServiceTopologyScriptsLocationMap').andCallThrough();
            spyOn(handler, '_overrideServiceTopologyScriptsLocationMap').andCallThrough();
            spyOn(handler, '_replaceRunningExperiments').andCallThrough();
            spyOn(handler, '_fakeDeployment').andCallThrough();
        }

        function testWith(description, statemapOrTopology, expectedTopology, expectedExperiments, extraExpectations) {
            describe('with ' + description, function() {
                beforeEach(function() {
                    windowScope = {};
                    handler = new HandlerClass({windowScope: windowScope, statemapOrTopology: statemapOrTopology});
                    createSpies(handler);
                    handler.execute();
                });

                it('should always call the basic methods', function() {
                    expect(handler._saveOldScriptsLocationMap).toHaveBeenCalled();
                    expect(handler._replaceRunningExperiments).toHaveBeenCalled();
                    expect(handler._fakeDeployment).toHaveBeenCalled();

                    if (extraExpectations) {
                        extraExpectations(handler);
                    }
                });
            });
        }

        function shouldReplaceTopology(topology, handler) {
            expect(handler._replaceServiceTopologyScriptsLocationMap).toHaveBeenCalledWith(topology);
            expect(handler._overrideServiceTopologyScriptsLocationMap).not.toHaveBeenCalled();
        }

        function shouldOverrideTopology(topology, handler) {
            expect(handler._overrideServiceTopologyScriptsLocationMap).toHaveBeenCalledWith(topology);
            expect(handler._replaceServiceTopologyScriptsLocationMap).not.toHaveBeenCalled();
        }

        testWith(
            'an undefined statemapOrTopology (when loadInitialScripts.js did not run)',
            undefined,
            undefined,
            undefined,
            shouldOverrideTopology.bind(null, undefined)
        );

        var empty1 = {}, empty2 = {};
        testWith(
            'an empty object statemapOrTopology',
            empty1,
            empty1,
            undefined,
            shouldOverrideTopology.bind(null, empty1)
        );

        var topology = {};
        testWith(
            'a "real" statemap (with the properties "topology" and "experiments")',
            {topology: empty1, experiments: empty2},
            empty1,
            empty2,
            shouldOverrideTopology.bind(null, empty1)
        );

        testWith(
            'a "real" statemap (with the properties "topology" and "experiments", and with a truthy "replaceTopology" property)',
            {topology: empty1, experiments: empty2, replaceTopology: true},
            empty1,
            empty2,
            shouldReplaceTopology.bind(null, empty1)
        );
    });
});