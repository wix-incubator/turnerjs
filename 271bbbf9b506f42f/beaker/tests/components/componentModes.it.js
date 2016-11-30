define(['santa-harness', 'componentUtils', 'apiCoverageUtils'], function (santa, componentUtils, apiCoverageUtils) {
    'use strict';

    xdescribe('componentModes', function () {

        var documentServices;
        var containerModes;
        var customId;
        var focusedPageRef;
        var override1;
        var override2;

        beforeAll(function (done) {
            customId = "My-Container-ID";

            override1 = {
                "modeIds": ['myCoolModeId']
            };

            override2 = {
                "modeIds": ['myCoolModeId', 'modeId-Y'],
                "isHiddenByModes": true
            };

            containerModes = {
                "modes": {
                    "definitions": [
                        {
                            "modeId": "myCoolModeId",
                            "label": "users-label",
                            "type": "HOVER",
                            "params": null
                        }, {
                            "modeId": "myCoolModeId-2",
                            "label": "users-label-2",
                            "type": "APPLICATIVE",
                            "params": []
                        }
                    ],
                    "overrides": [override1, override2]
                }
            };

            var siteParameter = {
                experimentsOn: [],
                experimentsOff: []
            };
            santa.start(siteParameter).then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                console.log('Testing Components modes spec');
                done();
            });
        });

        describe('getModes', function () {
            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.getModes');
            });

            it('should return undefined for a component without modes', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER");
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var modes = documentServices.components.modes.getModes(compPtr);
                    expect(modes).toBeUndefined();
                    done();
                });
            });

            it('should return the component modes', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var modes = documentServices.components.modes.getModes(compPtr);
                    expect(modes.length).toEqual(2);
                    expect(modes[0].type).toEqual('HOVER');
                    expect(modes[1].type).toEqual('APPLICATIVE');
                    done();
                });
            });
        });

        describe('getModeById', function () {
            it('should return the mode by the modeId', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var mode = documentServices.components.modes.getModeById(compPtr, 'myCoolModeId');
                    expect(mode.modeId).toEqual('myCoolModeId');
                    expect(mode.label).toEqual('users-label');
                    expect(mode.type).toEqual('HOVER');
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.getModeById');
                    done();
                });
            });
        });

        describe('getModesByType', function () {
            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.getModesByType');

            });
            it('should return the modes by the type', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var modes = documentServices.components.modes.getModesByType(compPtr, 'HOVER');
                    expect(modes.len.type).toEqual('HOVER');
                    done();
                });
            });

            it('should return no modes for non existing type', function (done) {
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var modes = documentServices.components.modes.getModesByType(compPtr, 'NOT_A_TYPE');
                    expect(modes.length).toEqual(0);
                    done();
                });
            });
        });

        describe('getAllCompOverrides', function () {
            it('should return all overrides', function (done){
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var overrides = documentServices.components.modes.getAllCompOverrides(compPtr);
                    expect(overrides.length).toEqual(2);
                    expect(overrides[0]).toEqual(override1);
                    expect(overrides[1]).toEqual(override2);
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.getAllCompOverrides');
                    done();
                });
            });
        });

        // todo check with Guy how to test this one
        describe('isDisplayedByDefault', function () {
            it('should determine if a component is displayed by default (by isHiddenByModes)', function (done){
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var isDisplayed = documentServices.components.modes.isDisplayedByDefault(compPtr);
                    expect(isDisplayed).toEqual(true);
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.isDisplayedByDefault');
                    done();
                });
            });
            // todo check the false value
        });

        // todo check with Guy how to test this one
        describe('isComponentDisplayedInModes', function () {
            it('should determine if a component is display in the given modes', function (done){
                var containerDef = componentUtils.getComponentDef(documentServices, "CONTAINER", containerModes);
                var compPtr = documentServices.components.add(focusedPageRef, containerDef, customId);
                documentServices.waitForChangesApplied(function () {
                    var isDisplayed = documentServices.components.modes.isComponentDisplayedInModes(compPtr, ['myCoolModeId']);
                    expect(isDisplayed).toEqual(true);
                    apiCoverageUtils.checkFunctionAsTested('documentServices.components.modes.isComponentDisplayedInModes');
                    done();
                });
            });
        });
    });
});
