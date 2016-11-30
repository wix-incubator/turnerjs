define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils'], function (_, santa, componentUtils, apiCoverageUtils) {
    'use strict';

    describe('componentModes', function () {

        var documentServices;
        var modes;
        var focusedPageRef;

        function getMobilePointer(comp, page) {
            return documentServices.components.get.byId(comp.id, (page || focusedPageRef).id, 'MOBILE');
        }

        beforeAll(function (done) {
            modes = {
                "modes": {
                    "definitions": [
                        {
                            "modeId": "defaultModeId",
                            "label": "blabla",
                            "type": "DEFAULT",
                            "params": []
                        },
                        {
                            "modeId": "hoverModeId",
                            "label": "users-label",
                            "type": "HOVER",
                            "params": null
                        }, {
                            "modeId": "applicativeModeId",
                            "label": "users-label-2",
                            "type": "APPLICATIVE",
                            "params": []
                        }
                    ],
                    "overrides": []
                }
            };

            var siteParameter = {
                experimentsOn: ['sv_hoverBox'],
                experimentsOff: []
            };
            santa.start(siteParameter).then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing for hoverBox behavior in mobile view');
                done();
            });
        });

        afterEach(function (done) {
            documentServices.components.modes.resetAllActiveModes();
            documentServices.viewMode.set('DESKTOP');
            documentServices.waitForChangesApplied(done);
        });

        it('for a new component - should display hover mode when switching to mobile view', function (done) {
            var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", modes);
            var childCompDef = componentUtils.getComponentDef(documentServices, "LINE");
            var containerPointer = documentServices.components.add(focusedPageRef, containerDef);
            var childCompPointer = documentServices.components.add(focusedPageRef, childCompDef);
            documentServices.waitForChangesApplied(function () {
                var defaultMode = documentServices.components.modes.getModesByType(containerPointer, 'DEFAULT')[0];
                documentServices.components.modes.activateComponentMode(containerPointer, defaultMode.modeId);
                documentServices.components.setContainer(childCompPointer, containerPointer);
                documentServices.viewMode.set('MOBILE');

                documentServices.waitForChangesApplied(function () {
                    var containerModes = documentServices.components.modes.getModes(containerPointer);
                    var hoverModeId = _.find(containerModes, {type: 'HOVER'}).modeId;
                    var defaultModeId = _.find(containerModes, {type: 'DEFAULT'}).modeId;
                    var mobileContainerPtr = getMobilePointer(containerPointer, focusedPageRef);
                    var activeModes = documentServices.components.modes.getComponentActiveModeIds(mobileContainerPtr);
                    expect(activeModes[hoverModeId]).toBeTruthy();
                    expect(activeModes[defaultModeId]).toBeFalsy();

                    var doesChildExist = documentServices.components.is.exist(childCompPointer);
                    expect(doesChildExist).toBeFalsy();

                    done();
                });
            });

        });

        it('updateMobileDisplayedModeProperty - should update the comp property and switch to selected mode', function (done) {
            var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", modes);
            var childCompDef = componentUtils.getComponentDef(documentServices, "LINE");
            var containerPointer = documentServices.components.add(focusedPageRef, containerDef);
            var childCompPointer = documentServices.components.add(focusedPageRef, childCompDef);
            documentServices.waitForChangesApplied(function () {
                var defaultMode = documentServices.components.modes.getModesByType(containerPointer, 'DEFAULT')[0];
                documentServices.components.modes.activateComponentMode(containerPointer, defaultMode.modeId);
                documentServices.components.setContainer(childCompPointer, containerPointer);

                documentServices.viewMode.set('MOBILE');

                documentServices.waitForChangesApplied(function () {
                    var mobileContainerPtr = getMobilePointer(containerPointer, focusedPageRef);
                    var containerModes = documentServices.components.modes.getModes(containerPointer);
                    var applicativeModeId = _.find(containerModes, {type: 'APPLICATIVE'}).modeId;
                    documentServices.components.modes.updateMobileDisplayedModeProperty(mobileContainerPtr, applicativeModeId);

                    documentServices.waitForChangesApplied(function () {

                        var activeModes = documentServices.components.modes.getComponentActiveModeIds(mobileContainerPtr);
                        expect(activeModes[applicativeModeId]).toBeTruthy();
                        expect(activeModes.hoverModeId).toBeFalsy();
                        expect(activeModes.defaultModeId).toBeFalsy();

                        var compProps = documentServices.components.properties.get(containerPointer);
                        expect(compProps.mobileDisplayedModeId).toEqual(applicativeModeId);

                        var doesChildExist = documentServices.components.is.exist(childCompPointer);
                        expect(doesChildExist).toBeFalsy();

                        done();
                    });
                });
            });

            apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.updateMobileDisplayedModeProperty');
        });
    });
});
