define(['utils',
    'testUtils',
    'documentServices/tpa/services/billingService',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/services/clientSpecMapService'], function(utils, testUtils, billingService, siteMetadata, privateServicesHelper, clientSpecMapService) {
    'use strict';

    describe('billingService', function() {

        describe('getPremiumApps', function() {

            var ajaxSpy, data, mockPs;

            beforeEach(function() {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                mockPs = privateServicesHelper.mockPrivateServices();
                spyOn(mockPs.dal, 'get').and.callFake(function(param) {
                    if (param.id === 'serviceTopology' && param.innerPath[0] === 'premiumStateApiUrl'){
                        return 'http://editor.wix.com/_api/wix/getTpaPremiumState';
                    }
                });
            });

            describe('basic tests', function() {
                beforeEach(function() {
                    data = window.document.createElement('tpaPackages');
                    data.appendChild(window.document.createElement('tpaPackage'));
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({
                            'errorCode': 0,
                            'errorDescription': 'OK',
                            'success': true,
                            'payload': {
                                'tpaPackages': []
                            }
                        });
                    });
                });

                it('should resolve with empty object in case of zero upgraded apps', function() {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    billingService.getPremiumApps(mockPs, 'metasiteId', onSuccess);
                    expect(onSuccess).toHaveBeenCalledWith({
                        'tpaPackages': []
                    });
                });

                it('should call ajax request with proper url and handle zero upgraded apps', function() {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    billingService.getPremiumApps(mockPs, 'metasiteId', onSuccess);
                    expect(utils.ajaxLibrary.ajax).toHaveBeenCalledWith({
                        type : 'POST',
                        url : 'http://editor.wix.com/_api/wix/getTpaPremiumState?siteGuid=metasiteId',
                        data : {},
                        dataType : 'json',
                        success : jasmine.any(Function),
                        error : undefined
                    });
                });

                it('should call onError in case of ajax error', function() {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onFailure = jasmine.createSpy('onFailure');
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.error();
                    });
                    billingService.getPremiumApps(mockPs, 'metasiteId', onSuccess, onFailure);
                    expect(onFailure).toHaveBeenCalled();
                });
            });
        });

        describe('getSiteUpgradeUrl', function () {
            var mockPs, basePremiumUrl;
            beforeEach(function () {
                basePremiumUrl = 'https://hxs0r.com';
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                mockSiteData.serviceTopology.premiumServerUrl = basePremiumUrl;
                mockPs = privateServicesHelper.mockPrivateServices(mockSiteData);
            });

            it('should return the meta site upgrade url with the givens query params', function () {
                var metaSiteId = 'metaSiteId';
                var params = {
                    appDefId: '123',
                    referralAdditionalInfo: 'bar'
                };
                spyOn(siteMetadata.generalInfo, "getMetaSiteId").and.returnValue(metaSiteId);


                var url = billingService.getSiteUpgradeUrl(mockPs, params);
                expect(url).toContain(basePremiumUrl);
                expect(url).toContain('siteGuid=' + metaSiteId);
                expect(url).toContain('referralAdditionalInfo=' + params.referralAdditionalInfo);
                expect(url).toContain('appDefId=' + params.appDefId);
            });

            it('should return the meta site upgrade url with no query params', function () {
                var metaSiteId = 'metaSiteId';
                spyOn(siteMetadata.generalInfo, "getMetaSiteId").and.returnValue(metaSiteId);

                var url = billingService.getSiteUpgradeUrl(mockPs);
                expect(url).toBe(basePremiumUrl + '/wix/api/premiumStart' + '?siteGuid=' + metaSiteId);
            });
        });

        describe('get upgrade url', function() {
            var mockPs, params, basePremiumUrl;

            beforeEach(function () {
                basePremiumUrl = 'https://hxs0r.com';
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                mockSiteData.serviceTopology.premiumServerUrl = basePremiumUrl;
                mockPs = privateServicesHelper.mockPrivateServices(mockSiteData);
                params = {
                    applicationId: '14',
                    vendorProductId: 'Premium1',
                    paymentCycle: 'YEARLY',
                    metaSiteId: 'metaSiteId',
                    appDefinitionId: "appDefinitionId"
                };
            });

            it('should return the app upgrade url with the givens query params', function() {
                spyOn(clientSpecMapService, "getAppData").and.returnValue({appDefinitionId: params.appDefinitionId});
                spyOn(siteMetadata.generalInfo, "getMetaSiteId").and.returnValue(params.metaSiteId);

                var url = billingService.getAppUpgradeUrl(mockPs, params.applicationId, params.vendorProductId, params.paymentCycle);

                expect(url).toContain(basePremiumUrl);


                expect(url).toContain('&vendorProductId=' + params.vendorProductId);
                expect(url).toContain('&paymentCycle=' + params.paymentCycle);
                expect(url).toContain('&metaSiteId=' + params.metaSiteId);
                expect(url).toContain('&pp_type');
                expect(url).toContain('&referralAdditionalInfo');
            });

            it('should return the app upgrade url with optional query params', function() {
                spyOn(clientSpecMapService, "getAppData").and.returnValue({appDefinitionId: params.appDefinitionId});
                spyOn(siteMetadata.generalInfo, "getMetaSiteId").and.returnValue(params.metaSiteId);
                params = {
                    applicationId: '14',
                    vendorProductId: 'Premium1',
                    paymentCycle: 'YEARLY',
                    metaSiteId: 'metaSiteId',
                    appDefinitionId: 'appDefinitionId',
                    pp_type: 'pp_type',
                    referralAdditionalInfo: 'referralAdditionalInfo'
                };

                var url = billingService.getAppUpgradeUrl(mockPs, params.applicationId, params.vendorProductId, params.paymentCycle, {
                    pp_type: params.pp_type,
                    referralAdditionalInfo: params.referralAdditionalInfo
                });

                expect(url).toContain(basePremiumUrl);


                expect(url).toContain('&pp_type=' + params.pp_type);
                expect(url).toContain('&referralAdditionalInfo=' + params.referralAdditionalInfo);
            });


            it('should set payment cycle to monthly as default', function(){
                spyOn(clientSpecMapService, "getAppData").and.returnValue({appDefinitionId: params.appDefinitionId});
                spyOn(siteMetadata.generalInfo, "getMetaSiteId").and.returnValue(params.metaSiteId);

                var url = billingService.getAppUpgradeUrl(mockPs, params.applicationId, params.vendorProductId);
                expect(url).toContain('paymentCycle=MONTHLY');
            });
        });
    });
});
