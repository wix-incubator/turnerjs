define(['testUtils', 'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/component/componentModesValidations'], function(testUtils, privateServicesHelper, componentModesValidations) {
    'use strict';

    function createDummyPageStructure(ps, pageRef, componentId, modeName, modeName2) {
        return [{
            "id": "container-1",
            "layout": {
                "width": 800, "height": 700,
                "x": 100, "y": 100,
                "fixedPosition": false,
                "scale": 1.0, "rotationInDegrees": 0.0,
                "anchors": []
            },
            "type": "Container",
            "skin": "wysiwyg.viewer.skins.area.RectangleArea",
            "componentType": "mobile.core.components.Container",
            "data": null,
            "props": null,
            "components": [{
                "id": 'container-2',
                "layout": {width: 500, height: 500, x: 10, y: 10, fixedPosition: false, scale: 1.0, rotationInDegrees: 0, anchors: []},
                "type": "Container",
                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                "componentType": "mobile.core.components.Container",
                "data": null,
                "props": null,
                "components": [{
                        "id": componentId,
                        "type": "Button",
                        "componentType": "mobile.core.components.SiteButton",
                        "layout": {
                            "width": 400, "height": 400,
                            "x": 200, "y": 200,
                            "fixedPosition": false,
                            "scale": 1.0, "rotationInDegrees": 0.0,
                            "anchors": []
                        },
                        "style": "b1",
                        "data": null,
                        "props": null
                }],
                "modes": {
                    "definitions": [
                        {
                            "modeId": modeName2 || 'unwanted-mode-id1',
                            "type": "HOVER",
                            "label": "labeli",
                            "params": null
                        }
                    ]
                }
            }],
            "modes": {
                "definitions": [{
                    "modeId": modeName,
                    "type": "HOVER",
                    "label": "label-1",
                    "params": null
                },
                {
                    "modeId": 'wanted-mode-id2',
                    "type": "HOVER",
                    "label": "label-2",
                    "params": null
                }]
            }
        }];
    }

    xdescribe('componentModesValidations - validations on component modes', function() {

        var mockPS;
        var pagePointer;

        var mode = 'dummy-mode-def';
        var mode2 = 'dummy-mode-def2';
        var componentId = 'compId-to-add-overrides-on';

        beforeEach(function () {
            var structure = createDummyPageStructure(mockPS, pagePointer, componentId, mode, mode2);

            var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage', structure);
            mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            pagePointer = mockPS.pointers.page.getPagePointer('mainPage');
        });

        describe('doModesExistOnAncestor', function() {
            var componentPointer;

            beforeEach(function() {
                var viewMode = mockPS.pointers.components.getViewMode(pagePointer);
                componentPointer = mockPS.pointers.components.getUnattached(componentId, viewMode);
            });

            it('should return true if all modes are found on ancestors', function() {
                var modes = [mode, mode2];

                var doModesExistOnAncestors = componentModesValidations.doModesExistOnAncestor(mockPS, modes, componentPointer);

                expect(doModesExistOnAncestors).toBeTruthy();
            });

            it('should return false if any mode isnt found on ancestors', function() {
                var modes = [mode, mode2, 'mode-which-no-ancestor-has'];

                var doModesExistOnAncestors = componentModesValidations.doModesExistOnAncestor(mockPS, modes, componentPointer);

                expect(doModesExistOnAncestors).toBeFalsy();
            });
        });
    });
});
