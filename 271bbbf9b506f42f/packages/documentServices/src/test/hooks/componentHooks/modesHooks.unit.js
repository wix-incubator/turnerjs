define([
    'lodash', 'utils', 'testUtils', 'experiment',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/dataModel/dataModel',
    'documentServices/mobileConversion/mobileActions',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/mobileConversion/modules/mergeAggregator',
    'documentServices/page/page',
    'documentServices/hooks/componentHooks/modesHooks'
], function (_, utils, testUtils, experiment,
             privateServicesHelper,
             component,
             dataModel,
             mobileActions,
             mobileConversion,
             mergeAggregator,
             page,
             modesHooks) {
    'use strict';

    describe('modesHooks hook', function () {

        function getHoverBoxStructure() {
            return {
                "id": "compWithModes",
                "layout": {},
                "type": "Container",
                "componentType": "mobile.core.components.Container",
                "components": [],
                "data": null,
                "propertyQuery": null,
                "modes": {
                    "definitions": [
                        {
                            "modeId": "hoverModeId",
                            "label": "users-label",
                            "type": "HOVER",
                            "params": null
                        }, {
                            "modeId": "regularModeId",
                            "label": "users-label-2",
                            "type": "DEFAULT",
                            "params": []
                        }]
                }
            };
        }

        var mockPrivateServices;

        beforeEach(function () {
            testUtils.experimentHelper.openExperiments('sv_hoverBox');

            this.siteData = testUtils.mockFactory.mockSiteData();

            this.siteData.addPageWithDefaults('somePage', [getHoverBoxStructure()]);

            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
            mergeAggregator.initialize(mockPrivateServices);
            this.pagePointer = mockPrivateServices.pointers.components.getPage('somePage', 'DESKTOP');
            this.compPointer = mockPrivateServices.pointers.components.getComponent('compWithModes', this.pagePointer);
        });

        describe('when there is a hoverBox in the page but it doesnt have a correspondent mobile comp', function () {

            it('should activate the hover mode on the desktop component', function(){
                modesHooks.activatePageMobileHoverModes(mockPrivateServices, this.pagePointer);

                var activeModes = component.modes.getComponentActiveModeIds(mockPrivateServices, this.compPointer);

                expect(activeModes.hoverModeId).toBeTruthy();
            });
        });

        describe('when there is a hoverBox in the page and it has a correspondent mobile comp', function () {

            beforeEach(function () {
                mobileConversion.convertMobileStructure(mockPrivateServices);

                this.mobileCompPointer = mockPrivateServices.pointers.components.getMobilePointer(this.compPointer);
            });


            it('should activate the hover mode as a default if the mobileDisplayedModeId property doesnt exists on the desktop comp', function(){
                modesHooks.activatePageMobileHoverModes(mockPrivateServices, this.pagePointer);

                var activeModes = component.modes.getComponentActiveModeIds(mockPrivateServices, this.mobileCompPointer);

                expect(activeModes.hoverModeId).toBeTruthy();
                expect(activeModes.regularModeId).toBeFalsy();
            });

            it('should activate the mode defined in mobileDisplayedModeId property if it exists on the desktop comp', function(){
                mobileActions.setComponentDisplayMode(mockPrivateServices, this.compPointer, 'regularModeId');

                modesHooks.activatePageMobileHoverModes(mockPrivateServices, this.pagePointer);

                var activeModes = component.modes.getComponentActiveModeIds(mockPrivateServices, this.mobileCompPointer);

                expect(activeModes.regularModeId).toBeTruthy();
                expect(activeModes.hoverModeId).toBeFalsy();
            });
        });

    });
});
