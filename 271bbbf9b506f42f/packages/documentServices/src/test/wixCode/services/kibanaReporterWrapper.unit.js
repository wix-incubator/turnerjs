define([
    'lodash',
    'testUtils',
    'documentServices/wixCode/services/kibanaReporterWrapper',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'wixCode'
], function (_, testUtils, kibanaReporterWrapper, privateServicesHelper, wixCode) {

    'use strict';

    describe('kibana reporter wrapper', function () {
        var wixCodeSavedClientSpec = {
            appDefinitionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
            applicationId: 14,
            extensionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
            instance: '3eeed575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0=',
            instanceId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
            type: 'siteextension'
        };
        var fakeUserId = 'fake-userid';
        var baseDomain;

        function createSiteData(customClientSpecMap) {
            return testUtils.mockFactory.mockSiteData()
                .overrideClientSpecMap(customClientSpecMap)
                .setUserId(fakeUserId);
        }

        function createPrivateServices(customClientSpecMap) {
            if (!customClientSpecMap) {
                return privateServicesHelper.mockPrivateServicesWithRealDAL();
            }

            var siteData = createSiteData(customClientSpecMap);
            baseDomain = siteData.serviceTopology.baseDomain;
            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        beforeEach(function() {
            spyOn(wixCode.log, 'trace');
        });

        it('levels should be defined', function () {
            expect(kibanaReporterWrapper.levels).toBeDefined();
        });

        describe('trace', function () {
            it('should add appId and userId params', function () {
                var customClientSpecMap = {
                    14: wixCodeSavedClientSpec
                };
                var ps = createPrivateServices(customClientSpecMap);
                var expectedParams = {
                    appId: wixCodeSavedClientSpec.extensionId,
                    userId: fakeUserId
                };

                kibanaReporterWrapper.trace(ps);

                expect(wixCode.log.trace).toHaveBeenCalled();
                expect(wixCode.log.trace.calls.mostRecent().args[0]).toEqual(expectedParams);
            });

            it('should pass an empty appId in case wix code is not provisioned', function() {
                var ps = createPrivateServices({});
                var expectedParams = {
                    appId: '',
                    userId: fakeUserId
                };

                kibanaReporterWrapper.trace(ps);

                expect(wixCode.log.trace).toHaveBeenCalled();
                expect(wixCode.log.trace.calls.mostRecent().args[0]).toEqual(expectedParams);
            });

            it('should extend existing parameters', function() {
                var ps = createPrivateServices({});
                var params = {
                    message: 'hello'
                };
                var addedParams = {
                    appId: '',
                    userId: fakeUserId
                };
                var expectedParams = _.assign({}, params, addedParams);

                kibanaReporterWrapper.trace(ps, params);

                expect(wixCode.log.trace).toHaveBeenCalled();
                expect(wixCode.log.trace.calls.mostRecent().args[0]).toEqual(expectedParams);
            });

            it('should call trace with baseDomain', function() {
                var ps = createPrivateServices({});

                kibanaReporterWrapper.trace(ps);

                expect(wixCode.log.trace).toHaveBeenCalled();
                expect(wixCode.log.trace.calls.mostRecent().args[1]).toEqual(baseDomain);
            });
        });
    });
});
