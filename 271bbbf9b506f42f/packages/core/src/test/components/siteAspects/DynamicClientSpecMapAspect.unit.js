define(['testUtils', 'lodash', 'definition!core/components/siteAspects/DynamicClientSpecMapAspect', 'experiment'], function (testUtils, _, aspectDef, experiment) {
    'use strict';

    describe('DynamicClientSpecMapAspect definition', function() {
        describe('registration', function() {
            it('should register the aspect', function() {
                var registerSiteAspect = jasmine.createSpy('registerSiteAspect');
                aspectDef(_, {
                    registerSiteAspect: registerSiteAspect
                });
                expect(registerSiteAspect).toHaveBeenCalledWith('dynamicClientSpecMap', jasmine.any(Function));
            });
        });
    });

    describe('DynamicClientSpecMapAspect', function() {
        var CSM = {
            14: {
                instance: "VGwJTn_YkKSQEyXbaIxLoGWVjAdEoz6uvUzX0Lv7VIY.eyJpbnN0YW5jZUlkIjoiMTM2YWZkMGMtMmEzNi1hN2FlLTI1ZWEtMTBmM2EzZjBjOTdiIiwic2lnbkRhdGUiOiIyMDE0LTA4LTA1VDA4OjQ3OjA1LjQ3NS0wNDowMCIsInVpZCI6Ijg2YzZjNTUwLTIwNDItNDk0ZS04NmJiLWFjNjVmODg2MmUyNSIsInBlcm1pc3Npb25zIjoiT1dORVIiLCJpcEFuZFBvcnQiOiI5MS4xOTkuMTE5LjI1NC81NjYzMSIsInZlbmRvclByb2R1Y3RJZCI6bnVsbCwiZGVtb01vZGUiOmZhbHNlfQ"
            }
        };

        var Aspect;
        var registerSiteAspect = function(name, siteAspect) {
            Aspect = siteAspect;
        };

        var siteData;
        var siteApi;

        function initializeAspect() {
            aspectDef(_, {registerSiteAspect: registerSiteAspect}, experiment);
        }

        var staticClientSpecMap = {},
            aspect;

        beforeEach(function() {
            siteApi = siteApi || {
              getSiteData: function() { return siteData; },
              forceUpdate: jasmine.createSpy('forceUpdate')
            };

            siteData = testUtils.mockFactory.mockSiteData({
                publicModel: {},
                getExternalBaseUrl: function(){return 'http://siteUrl';},
                rendererModel: {
                    clientSpecMap: staticClientSpecMap
                },
                store: {
                    loadBatch: jasmine.createSpy()
                },
                isViewerMode: function(){
                    return true;
                }
            });
            initializeAspect();

            aspect = new Aspect(siteApi);
        });

        describe('when in preview do not reload client spec map', function() {
            var siteApiPreview = {}, siteDataPreview = {};
            beforeEach(function() {

                siteDataPreview = {
                    rendererModel: {
                        clientSpecMap: staticClientSpecMap
                    },
                    store: {
                        loadBatch: jasmine.createSpy()
                    },
                    isViewerMode: function() {return false;}
                };

                siteApiPreview = {
                    getSiteData: function () { return siteDataPreview; },
                    forceUpdate: jasmine.createSpy('forceUpdate'),
                    registerToComponentDidMount: jasmine.createSpy('registerToComponentDidMount')
                };

                initializeAspect();

                aspect = new Aspect(siteApiPreview);

                spyOn(aspect, 'reloadClientSpecMap').and.callFake(function () {});
                siteDataPreview.rendererModel.clientSpecMap = CSM;
            });

            it('calls the loader with the correct parameters', function() {
                expect(siteApiPreview.registerToComponentDidMount).not.toHaveBeenCalledWith();
                expect(aspect.reloadClientSpecMap).not.toHaveBeenCalledWith();
            });
        });

        describe('reloadClientSpecMap', function () {
            describe('when getting error response', function () {
                beforeEach(function () {
                    siteData.store.loadBatch.and.callFake(function (reqSpec, onComplete) {
                        onComplete();
                    });
                });

                it('should fail reloading', function () {
                    var callback = jasmine.createSpy();
                    aspect.reloadClientSpecMap(callback, true);

                    expect(callback).toHaveBeenCalledWith({
                        status: 'error'
                    });
                });
            });

            describe('when getting success response', function () {
                var mockResponse;
                var ctToken = 'ctToken';
                var svSession = 'svSession';
                var hs = 'hs';
                var clientSpecMap = {};

                beforeEach(function () {
                    mockResponse = {
                        test: true,
                        ctToken: ctToken,
                        svSession: svSession,
                        hs: hs,
                        clientSpecMap: clientSpecMap
                    };
                    siteData.store.loadBatch.and.callFake(function (reqSpec, onComplete) {
                        reqSpec[0].callback(true, mockResponse);
                        onComplete();
                    });
                });

                it('should reload successfully', function () {
                    var callback = jasmine.createSpy();
                    aspect.reloadClientSpecMap(callback, true);

                    expect(callback).toHaveBeenCalledWith(mockResponse);
                });

                it('should set site data', function () {
                    var callback = jasmine.createSpy();
                    aspect.reloadClientSpecMap(callback, true);

                    expect(siteData.getCTToken()).toBe(ctToken);
                    expect(siteData.getSvSession()).toBe(svSession);
                    expect(siteData.getHubSecurityToken()).toBe(hs);
                    expect(siteData.rendererModel.clientSpecMap).toEqual(clientSpecMap);
                });
            });
        });
    });
});
