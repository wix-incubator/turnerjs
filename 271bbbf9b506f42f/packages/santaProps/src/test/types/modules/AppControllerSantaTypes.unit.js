define(['lodash', 'react', 'testUtils', 'santaProps/types/modules/AppControllerSantaTypes'], function (_, React, testUtils, AppControllerSantaTypes) {
    'use strict';

    var DEFAULT_STAGE_DATA = {
        icon: 'https://maxcdn.icons8.com/office/PNG/40/Animals/unicorn-40.png'
    };

    describe('applicativeUIData.', function () {
        it('should be the applicativeUIData by controllerState, controllerType and appId', function () {
            var applicationId = 'appId';
            var controllerId = 'controllerId';
            var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
            var controllerState = 'state';
            var controllerStageData = testUtils.mockFactory.platformMocks.controllerStageData(data.controllerType, controllerState, {icon: 'icon', other: 'data'});
            var siteData = testUtils.mockFactory.mockSiteData().addControllerStageData(controllerStageData, data.applicationId).addControllerToStateMap(controllerId, controllerState);
            var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var pageId = siteData.getPrimaryPageId();
            var controllerStructure = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId, {data: data}, false, controllerId);

            var applicativeUIDataProp = AppControllerSantaTypes.applicativeUIData(React.PropTypes.shape({
                icon: React.PropTypes.string.isRequired
            }));
            var applicativeUIData = applicativeUIDataProp.fetch({siteData: siteData, siteAPI: siteAPI}, {structure: controllerStructure});

            expect(applicativeUIData).toEqual(_.get(controllerStageData, [data.controllerType, controllerState]));
        });

        it('should return default required properties if they were not defined in controllerStageData', function () {
            var applicationId = 'appId';
            var controllerId = 'controllerId';
            var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
            var controllerState = 'state';
            var controllerStageData = testUtils.mockFactory.platformMocks.controllerStageData(data.controllerType, controllerState, {notDefault: 'data'});
            var siteData = testUtils.mockFactory.mockSiteData().addControllerStageData(controllerStageData, data.applicationId).addControllerToStateMap(controllerId, controllerState);
            var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var pageId = siteData.getPrimaryPageId();
            var controllerStructure = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId, {data: data}, false, controllerId);

            var applicativeUIDataProp = AppControllerSantaTypes.applicativeUIData(React.PropTypes.shape({
                icon: React.PropTypes.string.isRequired
            }));
            var applicativeUIData = applicativeUIDataProp.fetch({siteData: siteData, siteAPI: siteAPI}, {structure: controllerStructure});

            expect(applicativeUIData).toEqual(_.defaults(_.get(controllerStageData, [data.controllerType, controllerState]), DEFAULT_STAGE_DATA));
        });

        it('should return default applicativeUIData if it is not defined', function () {
            var applicationId = 'appId';
            var controllerId = 'controllerId';
            var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
            var controllerState = 'state';
            var siteData = testUtils.mockFactory.mockSiteData().addControllerToStateMap(controllerId, controllerState);
            var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var pageId = siteData.getPrimaryPageId();
            var controllerStructure = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId, {data: data}, false, controllerId);

            var applicativeUIDataProp = AppControllerSantaTypes.applicativeUIData(React.PropTypes.shape({
                icon: React.PropTypes.string.isRequired
            }));
            var applicativeUIData = applicativeUIDataProp.fetch({siteData: siteData, siteAPI: siteAPI}, {structure: controllerStructure});

            expect(applicativeUIData).toEqual(DEFAULT_STAGE_DATA);
        });
    });
});
