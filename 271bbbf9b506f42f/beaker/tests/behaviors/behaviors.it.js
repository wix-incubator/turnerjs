define(['lodash', 'santa-harness', 'apiCoverageUtils', 'componentUtils'],
    function (_, santa, apiCoverageUtils, componentUtils) {
        "use strict";

        describe('Document Services - Actions and Behaviors API - Behaviors', function () {

            var documentServices;

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing behaviors spec');
                    done();
                });
            });

            describe('Generic behavior getters', function () {
                it('getDefinition: should return an object', function () {
                    var behaviorDef = documentServices.behaviors.getDefinition('runCode');
                    expect(_.isObject(behaviorDef)).toBeTruthy();
                    apiCoverageUtils.checkFunctionAsTested('documentServices.behaviors.getDefinition');
                });

                it('getNames: should return an array', function () {
                    var behaviorNames = documentServices.behaviors.getNames();
                    expect(_.isArray(behaviorNames)).toBeTruthy();
                    apiCoverageUtils.checkFunctionAsTested('documentServices.behaviors.getNames');
                });
            });

            describe('Component related behaviors', function () {
                var focusedPageRef;
                var containerDef;
                var compRef;
                var behaviorTargetRef;
                var behavior;
                var actionObj;

                beforeEach(function (done) {
                    focusedPageRef = documentServices.pages.getFocusedPage();
                    containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                    compRef = documentServices.components.add(focusedPageRef, containerDef);
                    documentServices.waitForChangesApplied(done);


                    behaviorTargetRef = {id: 'myWidgetInstanceId'};
                    behavior = {
                        type: 'comp',
                        name: 'myBehaviorName'
                    };
                    actionObj = {
                        type: 'comp',
                        name: 'click'
                    };
                });

                describe('update', function () {
                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.behaviors.update');
                    });

                    it('should add a new behavior if no such behavior exists in the actionSourceRef behaviors', function (done) {
                        var expected = {
                            action: _.defaults({sourceId: compRef.id}, actionObj),
                            behavior: _.defaults({targetId: behaviorTargetRef.id}, behavior)
                        };

                        documentServices.behaviors.update(compRef, actionObj, behaviorTargetRef, behavior);
                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.behaviors.get(compRef)).toEqual([expected]);
                            done();
                        });
                    });

                    it('should update an existing behavior if it exists in the actionSourceRef behaviors', function (done) {
                        var newBehavior = _.defaults({params: {callbackId: 'anotherCallbackName'}}, behavior);
                        var expected = {
                            action: _.defaults({sourceId: compRef.id}, actionObj),
                            behavior: _.defaults({targetId: behaviorTargetRef.id}, newBehavior)
                        };

                        documentServices.behaviors.update(compRef, actionObj, behaviorTargetRef, behavior);
                        documentServices.behaviors.update(compRef, actionObj, behaviorTargetRef, newBehavior);

                        documentServices.waitForChangesApplied(function () {
                            expect(documentServices.behaviors.get(compRef)).toEqual([expected]);
                            done();
                        });
                    });
                });

                it('get: should return the behaviors saved on a component structure', function (done) {
                    var expected = {
                        action: _.defaults({sourceId: compRef.id}, actionObj),
                        behavior: _.defaults({targetId: behaviorTargetRef.id}, behavior)
                    };

                    documentServices.behaviors.update(compRef, actionObj, behaviorTargetRef, behavior);

                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.behaviors.get(compRef)).toEqual([expected]);
                        done();
                    });
                    apiCoverageUtils.checkFunctionAsTested('documentServices.behaviors.get');
                });

                it('remove: should remove behavior from compRef that match action and behavior type and name', function (done) {
                    documentServices.behaviors.update(compRef, actionObj, behaviorTargetRef, behavior);
                    documentServices.behaviors.remove(compRef, actionObj, behaviorTargetRef, behavior);

                    documentServices.waitForChangesApplied(function () {
                        expect(documentServices.behaviors.get(compRef)).toEqual([]);
                        done();
                    });
                    apiCoverageUtils.checkFunctionAsTested('documentServices.behaviors.remove');
                });
            });
        });
    });
