define([
    'lodash',
    'testUtils',
    'documentServices/componentsMetaData/components/controllerMetaData',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/constants/constants',
    'documentServices/platform/platform',
    'documentServices/appControllerData/appControllerData',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, testUtils, controllerMetaData, componentDetectorAPI, constants, platform, appControllerData, componentsMetaData, privateServicesHelper) {
    'use strict';

    describe('app controller metaData', function () {
        var pageId = 'page1';
        var popupId = 'popup1';

        function createSiteWithControllerAndStageData(metaDataKey, metaDataValue) {
            var controllerData = testUtils.mockFactory.dataMocks.controllerData();
            var controllerState = 'state';
            var overrides = _.set({}, metaDataKey, metaDataValue);
            var controllerStageData = testUtils.mockFactory.platformMocks.controllerStageData(controllerData.controllerType, controllerState, overrides);
            this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(pageId).addPopupPageWithDefaults(popupId);
            var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, pageId, {data: controllerData});
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
            platform.init(this.ps);
            this.siteData.addControllerStageData(controllerStageData, controllerData.applicationId);
            var pagePointer = this.ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            this.controllerPointer = this.ps.pointers.components.getComponent(controller.id, pagePointer);
            appControllerData.setState(this.ps, _.set({}, controllerState, [this.controllerPointer]));
        }

        describe('containable', function () {

            _.forEach([true, false], function (showOnAllPagesValue) {
                describe('when controllerStageData enableShowOnAllPages is ' + showOnAllPagesValue, function () {
                    beforeEach(function() {
                        createSiteWithControllerAndStageData.call(this, 'enableShowOnAllPages', showOnAllPagesValue);
                    });

                    it('should allow app controller to be in popup (blocking layer)', function () {
                        var popupPointer = this.ps.pointers.components.getPage(popupId, constants.VIEW_MODES.DESKTOP);

                        var actual = controllerMetaData.containable(this.ps, this.controllerPointer, popupPointer);
                        expect(actual).toBe(true);
                    });

                    it('should allow app controller to be in popup (popup container)', function () {
                        var popupContainer = _.first(componentDetectorAPI.getComponentByType(this.ps, 'wysiwyg.viewer.components.PopupContainer'));
                        var actual = controllerMetaData.containable(this.ps, this.controllerPointer, popupContainer);
                        expect(actual).toBe(true);
                    });

                    it('should allow app controller to be in a page', function () {
                        var pagePointer = this.ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);

                        var actual = controllerMetaData.containable(this.ps, this.controllerPointer, pagePointer);
                        expect(actual).toBe(true);
                    });

                    it('should not allow app controller to be in container', function () {
                        var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.siteData, pageId);
                        var pagePointer = this.ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                        var containerRef = this.ps.pointers.components.getComponent(container.id, pagePointer);
                        var actual = controllerMetaData.containable(this.ps, this.controllerPointer, containerRef);
                        expect(actual).toBe(false);
                    });

                    it('should ' + (showOnAllPagesValue ? '' : 'not ') + 'allow app controller to be contained in masterPage, header and footer', function () {
                        var masterPagePointer = this.ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                        var containableInMasterPage = controllerMetaData.containable(this.ps, this.controllerPointer, masterPagePointer);
                        expect(containableInMasterPage).toBe(showOnAllPagesValue);

                        var footerPointer = this.ps.pointers.components.getFooter(constants.VIEW_MODES.DESKTOP);
                        var containableInFooter = controllerMetaData.containable(this.ps, this.controllerPointer, footerPointer);
                        expect(containableInFooter).toBe(showOnAllPagesValue);

                        var headerPointer = this.ps.pointers.components.getHeader(constants.VIEW_MODES.DESKTOP);
                        var containableInHeader = controllerMetaData.containable(this.ps, this.controllerPointer, headerPointer);
                        expect(containableInHeader).toBe(showOnAllPagesValue);
                    });
                });
            });

            describe('when controllerStageData enableShowOnAllPages is not defined', function () {
                it('should allow app controller to be contained in masterPage, header and footer', function () {
                    createSiteWithControllerAndStageData.call(this);

                    var masterPagePointer = this.ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var containableInMasterPage = controllerMetaData.containable(this.ps, this.controllerPointer, masterPagePointer);
                    expect(containableInMasterPage).toBe(true);

                    var footerPointer = this.ps.pointers.components.getFooter(constants.VIEW_MODES.DESKTOP);
                    var containableInFooter = controllerMetaData.containable(this.ps, this.controllerPointer, footerPointer);
                    expect(containableInFooter).toBe(true);

                    var headerPointer = this.ps.pointers.components.getHeader(constants.VIEW_MODES.DESKTOP);
                    var containableInHeader = controllerMetaData.containable(this.ps, this.controllerPointer, headerPointer);
                    expect(containableInHeader).toBe(true);
                });
            });
        });

        _.forEach(['removable', 'duplicatable'], function (metaDataKey) {
            describe(metaDataKey, function () {
                describe('when controllerStageData ' + metaDataKey + ' is true', function () {
                    it('should allow app controller to be duplicated', function () {
                        createSiteWithControllerAndStageData.call(this, metaDataKey, true);
                        var actual = controllerMetaData[metaDataKey](this.ps, this.controllerPointer);
                        expect(actual).toBe(true);
                    });
                });

                describe('when controllerStageData ' + metaDataKey + ' is false', function () {
                    it('should not allow app controller to be duplicated', function () {
                        createSiteWithControllerAndStageData.call(this, metaDataKey, false);
                        var actual = controllerMetaData[metaDataKey](this.ps, this.controllerPointer);
                        expect(actual).toBe(false);
                    });
                });

                describe('when controllerStageData ' + metaDataKey + ' is not defined', function () {
                    it('should allow app controller to be duplicated', function () {
                        createSiteWithControllerAndStageData.call(this);
                        var actual = controllerMetaData[metaDataKey](this.ps, this.controllerPointer);
                        expect(actual).toBe(true);
                    });
                });
            });
        });
    });
});
