define(['testUtils', 'wixCodeInit'], function(testUtils, wixCodeInit){
    'use strict';

    var routerUtilsDependencyMocks = {
        'zepto': {ajax: jasmine.createSpy('ajax')},
        'coreUtils/core/requestsUtil': {createAndSendRequest: jasmine.createSpy('createAndSendRequest')},
        'wixCodeInit': wixCodeInit
    };

    describe('routerUtils spec', function(){
        testUtils.requireWithMocks('coreUtils/core/routersBackEndRequests', routerUtilsDependencyMocks, function (routersBackEndRequests) {
            function getMockRouters() {
                return {
                    configMap: {
                        1:  {
                            prefix: 'recipes',
                            appId: 99,
                            config: {
                                routerFunctionName:'routerFunction'
                            },
                            pages: {
                                blank: 'rnnnn'
                            }
                        }
                    }
                };
            }

            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData()
                    .withRouters(getMockRouters());
                spyOn(wixCodeInit.specMapUtils, 'getAppSpec').and.returnValue({
                    appDefinitionId: 'mockAppId',
                    instance: 'mockInstance'
                });
            });

            describe('getPage', function(){
                it('should fetch page from backend', function(){
                    var routersBackEndRequestsParamObj = routersBackEndRequests.makeParamObjFromSiteData(this.mockSiteData, getMockRouters().configMap[1], ['recipes/myBigBoo']);
                    routersBackEndRequests.getPage(routersBackEndRequestsParamObj, function(){});
                    expect(routerUtilsDependencyMocks['coreUtils/core/requestsUtil'].createAndSendRequest).toHaveBeenCalled();
                });

                it('should build request url with the correct parameters', function(){
                    var routersBackEndRequestsParamObj = routersBackEndRequests.makeParamObjFromSiteData(this.mockSiteData, getMockRouters().configMap[1], ['recipes/myBigBoo']);
                    routersBackEndRequests.getPage(routersBackEndRequestsParamObj, function(){});
                    var requestedUrl = routerUtilsDependencyMocks['coreUtils/core/requestsUtil'].createAndSendRequest.calls.mostRecent().args[0].url;
                    expect('http://testhost.com/_api/cloud-dispatcher/public/data-binding/pages?viewMode=site&instance=mockInstance&scari=fake-scari-fake-scari-fake-scari').toEqual(requestedUrl);
                });
            });
        });
    });
});
