define(['bluebird',
        'lodash',
        'documentServices/tpa/services/appMarketService',
        'documentServices/tpa/bi/errors',
        'documentServices/tpa/utils/provisionUtils',
        'documentServices/mockPrivateServices/privateServicesHelper'],
    function (Promise, _, appMarketService, tpaErrors, provisionUtils, privateServicesHelper) {
        'use strict';

        describe('provision utils', function(){

            var mockPs,
                mockAppData;

            beforeEach(function(){
                mockPs = privateServicesHelper.mockPrivateServices();
                mockAppData = {};
            });

            it('should cache app market data', function(){
                spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                    return Promise.resolve();
                });
                provisionUtils.cacheAppMarketDataAfterProvision(mockPs, mockAppData);
                expect(appMarketService.getAppMarketDataAsync).toHaveBeenCalled();
            });

            describe('cache app market data fails', function(){
                beforeEach(function(){
                    spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                        return Promise.reject();
                    });
                });

                it('should report bi error', function(done){
                    mockPs.siteAPI.reportBI = jasmine.createSpy('reportBi').and.callFake(function(){
                        expect(mockPs.siteAPI.reportBI).toHaveBeenCalledWith(tpaErrors.FAIL_TO_GET_APP_MARKET_DATA);
                        done();
                    });

                    provisionUtils.cacheAppMarketDataAfterProvision(mockPs, mockAppData);
                });
            });

            describe('`generateAppFlowsLargestAppId`', function () {
                var randomSpy;
                beforeEach(function () {
                    randomSpy = spyOn(_, 'random');
                });
                it('should return an id greater than the current id > 1000', function () {
                    randomSpy.and.callFake(function() {
                       return 105;
                    });
                    var id = provisionUtils.generateAppFlowsLargestAppId(2000);
                    expect(id).toBe(2210);
                });

                it('should return an id greater by 1 for current id=1000', function () {
                    randomSpy.and.callFake(function() {
                        return 105;
                    });
                    var id = provisionUtils.generateAppFlowsLargestAppId(1000);
                    expect(id).toBe(1210);
                });

                it('should return an id greater than 1000 for current id<1000', function () {
                    randomSpy.and.callFake(function() {
                        return 105;
                    });
                    var id = provisionUtils.generateAppFlowsLargestAppId(5);
                    expect(id).toBe(1209);
                });
            });
        });
    });
