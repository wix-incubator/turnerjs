define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils'], function (_, santa, componentUtils, apiCoverageUtils) {
    'use strict';

    describe('HoverBox', function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start({
                experimentsOn: ['sv_hoverBox']
            }).then(function (harness) {
                documentServices = harness.documentServices;
                done();
            });
        });

        beforeEach(function() {
            documentServices.history.add('hoverBoxTestSnapshot');
        });

        afterEach(function() {
            while (documentServices.history.canUndo()) {
                documentServices.history.undo();
            }
        });

        describe('Bugs verification', function() {
            beforeEach(function (done) {
                var focusedPageRef = documentServices.pages.getFocusedPage();
                this.focusedPageRef = focusedPageRef;
                this.boxPointer = addComponentToPageWithId.call(this, focusedPageRef, 'CONTAINER', 'container-Id');
                this.containerWithModesPointer = addComponentToPageWithId.call(this, focusedPageRef, 'CONTAINER_WITH_MODES', 'My-HoverBox-Id');
                this.buttonPointer = addComponentToPageWithId.call(this, focusedPageRef, 'SITE_BUTTON', 'My-button-id');
                this.waitForChangesApplied = waitForChangesApplied;
                this.waitForChangesApplied(function() {
                    updateHoverBoxModeIds.call(this);
                    done();
                });
            });

            function waitForChangesApplied(callback) {
                documentServices.waitForChangesApplied(callback.bind(this));
            }

            function updateHoverBoxModeIds() {
                this.regularModeId = _.first(documentServices.components.modes.getModesByType(this.containerWithModesPointer, 'DEFAULT')).modeId;
                this.hoverModeId = _.first(documentServices.components.modes.getModesByType(this.containerWithModesPointer, 'HOVER')).modeId;
            }

            function addComponentToPageWithId(focusedPageRef, defType, customId) {
                var compDef = componentUtils.getComponentDef(documentServices, defType);
                return documentServices.components.add(focusedPageRef, _.cloneDeep(compDef), customId);
            }

            function activateModeAndAddComponentToHoverBox(componentPointerToAddToHoverBox, modeIdToActivate, callback) {
                documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, modeIdToActivate);
                this.waitForChangesApplied(function() {
                    documentServices.components.setContainer(componentPointerToAddToHoverBox, this.containerWithModesPointer);
                    waitForChangesApplied.call(this, callback);
                });
            }

            describe('when duplicating a simple component showing only in one mode', function() {
                describe('SE-16876 - When mode is Hover', function () {
                    it('should duplicate the component without overrides', function (done) {
                        activateModeAndAddComponentToHoverBox.call(this, this.buttonPointer, this.hoverModeId, function () {
                            var duplicatedButton = documentServices.components.duplicate(this.buttonPointer, this.focusedPageRef);
                            documentServices.waitForChangesApplied(function () {
                                expect(documentServices.components.is.exist(duplicatedButton)).toBeTruthy();
                                apiCoverageUtils.checkFunctionAsTested('documentServices.components.duplicate');
                                done();
                            });
                        });
                    });
                });
            });

            describe('when duplicating a component showing in both modes of Container', function() {
                it('should duplicate the component without overrides', function(done) {
                    activateModeAndAddComponentToHoverBox.call(this, this.buttonPointer, this.regularModeId, function() {
                        var duplicatedButton = documentServices.components.duplicate(this.buttonPointer, this.focusedPageRef);
                        this.waitForChangesApplied(function() {
                            expect(documentServices.components.is.exist(duplicatedButton)).toBeTruthy();
                            apiCoverageUtils.checkFunctionAsTested('documentServices.components.duplicate');
                            done();
                        });
                    });
                });
            });

            describe('Re-parent container with modes', function() {
                describe('when target container is in the same page', function() {
                    describe('when the target parent component has NO active modes', function() {
                        describe('when the re-parented component has no modes defined (simple component)', function() {
                            it('should re-parent the button from the page to the container', function(done) {
                                expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.focusedPageRef);

                                documentServices.components.setContainer(this.buttonPointer, this.boxPointer);

                                this.waitForChangesApplied(function() {
                                    expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.boxPointer);
                                    done();
                                });
                            });
                        });

                        describe('when the re-parented component has NO active modes (i.e. hoverbox without active modes)', function() {

                            beforeEach(function(done) {
                                activateModeAndAddComponentToHoverBox.call(this, this.buttonPointer, this.hoverModeId, function() {
                                    documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.regularModeId);
                                    this.waitForChangesApplied(done);
                                });
                            });

                            it('should move the component to the container with all the existing defined modes and overrides', function(done) {
                                expect(documentServices.components.getContainer(this.containerWithModesPointer)).toEqual(this.focusedPageRef);

                                documentServices.components.setContainer(this.containerWithModesPointer, this.boxPointer);

                                this.waitForChangesApplied(function() {
                                    expect(documentServices.components.getContainer(this.containerWithModesPointer)).toEqual(this.boxPointer);
                                    expect(documentServices.components.modes.getComponentActiveModeIds(this.containerWithModesPointer)[this.regularModeId]).toBeTruthy();
                                    expect(documentServices.components.getChildren(this.containerWithModesPointer)).toEqual([]);
                                    documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.hoverModeId);
                                    this.waitForChangesApplied(function() {
                                        expect(documentServices.components.getChildren(this.containerWithModesPointer)).toContain(this.buttonPointer);
                                        done();
                                    });
                                });
                            });
                        });

                        describe('when the re-parented component has active modes (i.e. hoverbox hover mode is active)', function() {

                            beforeEach(function(done) {
                                activateModeAndAddComponentToHoverBox.call(this, this.buttonPointer, this.hoverModeId, done);
                            });

                            it('should move the component to the container with all the existing defined modes and overrides', function(done) {
                                expect(documentServices.components.getContainer(this.containerWithModesPointer)).toEqual(this.focusedPageRef);
                                expect(documentServices.components.modes.getComponentActiveModeIds(this.containerWithModesPointer)[this.hoverModeId]).toBeTruthy();

                                documentServices.components.setContainer(this.containerWithModesPointer, this.boxPointer);

                                this.waitForChangesApplied(function() {
                                    expect(documentServices.components.getContainer(this.containerWithModesPointer)).toEqual(this.boxPointer);
                                    expect(documentServices.components.modes.getComponentActiveModeIds(this.containerWithModesPointer)[this.hoverModeId]).toBeTruthy();
                                    expect(_.size(documentServices.components.getChildren(this.containerWithModesPointer))).toBe(1);
                                    expect(documentServices.components.getChildren(this.containerWithModesPointer)).toContain(this.buttonPointer);
                                    documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.regularModeId);
                                    this.waitForChangesApplied(function() {
                                        expect(documentServices.components.getChildren(this.containerWithModesPointer)).toEqual([]);
                                        done();
                                    });
                                });
                            });
                        });
                    });

                    describe('when the target parent component has active modes', function() {
                        beforeEach(function(done) {
                            documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.hoverModeId);
                            this.hoverBoxPointer = addComponentToPageWithId.call(this, this.focusedPageRef, 'HOVER_BOX', 'My-HoverBox-Id2');
                            this.waitForChangesApplied(done);
                        });

                        describe('when the re-parented component has no modes defined (simple component)', function() {
                            it('should only change the parent of the (simple) component', function(done) {
                                expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.focusedPageRef);

                                documentServices.components.setContainer(this.buttonPointer, this.containerWithModesPointer);

                                this.waitForChangesApplied(function() {
                                    expect(documentServices.components.getContainer(this.buttonPointer)).not.toEqual(this.focusedPageRef);
                                    expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.containerWithModesPointer);
                                    done();
                                });
                            });
                        });

                        describe('when the re-parented component has NO active modes (i.e. hoverbox without active modes)', function() {

                            beforeEach(function(done) {
                                documentServices.components.setContainer(this.buttonPointer, this.hoverBoxPointer);
                                this.waitForChangesApplied(done);
                            });

                            it('should should set hoverbox2 to be the child of hoverbox', function(done) {
                                expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.hoverBoxPointer);
                                expect(documentServices.components.getContainer(this.hoverBoxPointer)).toEqual(this.focusedPageRef);

                                documentServices.components.setContainer(this.hoverBoxPointer, this.containerWithModesPointer);

                                this.waitForChangesApplied(function() {
                                    expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.hoverBoxPointer);
                                    expect(documentServices.components.getContainer(this.hoverBoxPointer)).toEqual(this.containerWithModesPointer);
                                    this.waitForChangesApplied(function() {
                                        expect(documentServices.components.getChildren(this.hoverBoxPointer)).toContain(this.buttonPointer);
                                        documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.regularModeId);
                                        this.waitForChangesApplied(function() {
                                            expect(documentServices.components.getChildren(this.containerWithModesPointer)).toEqual([]);
                                            done();
                                        });
                                    });
                                });
                            });
                        });

                        describe('Notice: NO SUCH SCENARIO YET IN EDITOR - HB inside HB!(31/7/16) - when the re-parented component has active modes (i.e. hoverbox hover mode is active)', function() {

                            beforeEach(function(done) {
                                this.regularModeId2 = _.first(documentServices.components.modes.getModesByType(this.hoverBoxPointer, 'DEFAULT')).modeId;
                                this.hoverModeId2 = _.first(documentServices.components.modes.getModesByType(this.hoverBoxPointer, 'HOVER')).modeId;
                                documentServices.components.modes.activateComponentMode(this.hoverBoxPointer, this.hoverModeId2);
                                this.waitForChangesApplied(function() {
                                    documentServices.components.setContainer(this.buttonPointer, this.hoverBoxPointer);
                                    documentServices.components.modes.activateComponentMode(this.hoverBoxPointer, this.regularModeId2);
                                    this.waitForChangesApplied(done);
                                });
                            });

                            it('should set the hoverBox2 to the hoverBox hover mode and show the button in HB & HB2 hover modes', function(done) {
                                documentServices.components.setContainer(this.hoverBoxPointer, this.containerWithModesPointer);

                                this.waitForChangesApplied(function() {
                                    expect(documentServices.components.getChildren(this.containerWithModesPointer)).toContain(this.hoverBoxPointer);
                                    documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.regularModeId);
                                    this.waitForChangesApplied(function() {
                                        expect(documentServices.components.getChildren(this.containerWithModesPointer)).toEqual([]);
                                        documentServices.components.modes.activateComponentMode(this.containerWithModesPointer, this.hoverModeId);
                                        documentServices.components.modes.activateComponentMode(this.hoverBoxPointer, this.hoverModeId2);
                                        this.waitForChangesApplied(function() {
                                            expect(documentServices.components.getChildren(this.hoverBoxPointer)).toContain(this.buttonPointer);
                                            documentServices.components.modes.activateComponentMode(this.hoverBoxPointer, this.regularModeId2);
                                            this.waitForChangesApplied(function() {
                                                expect(documentServices.components.getChildren(this.hoverBoxPointer)).toEqual([]);
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

                describe('when target container is a different page', function() {
                    describe('when target container is master page', function() {
                        beforeEach(function(done) {
                            var masterPageId = documentServices.pages.getMasterPageId();
                            this.masterPagePointer = documentServices.pages.getReference(masterPageId);

                            documentServices.components.setContainer(this.buttonPointer, this.containerWithModesPointer);
                            this.waitForChangesApplied(done);
                        });

                        it('should reparent to the master page', function(done) {
                            expect(documentServices.components.getContainer(this.containerWithModesPointer)).toEqual(this.focusedPageRef);
                            expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.containerWithModesPointer);

                            documentServices.components.setContainer(this.containerWithModesPointer, this.masterPagePointer);

                            this.waitForChangesApplied(function() {
                                expect(documentServices.components.getContainer(this.containerWithModesPointer)).toEqual(this.masterPagePointer);
                                expect(documentServices.components.getContainer(this.buttonPointer)).toEqual(this.containerWithModesPointer);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
