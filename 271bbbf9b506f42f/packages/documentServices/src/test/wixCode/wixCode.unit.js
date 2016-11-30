define([
    'bluebird',
    'lodash',
    'core',
    'utils',
    'testUtils',
    'siteUtils',
    'widgets',
    'documentServices/wixCode/wixCode',
    'wixCode',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/wixCode/utils/constants',
    'documentServices/siteMetadata/clientSpecMap'
], function (Promise, _, core, utils, testUtils, siteUtils, widgets, wixCode, wixCodeViewer, wixCodeLifecycleService, privateServicesHelper, constants, clientSpecMap) {

    'use strict';

    describe('wixCode', function () {
        function createPrivateServices() {
            var siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
            var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            spyOn(ps.setOperationsQueue, 'asyncSetOperationComplete');
            ps.siteAPI = testUtils.mockFactory.mockSiteAPI();

            return ps;
        }

        function getExistingWixCodeApp(ps) {
            return _.first(clientSpecMap.filterAppsDataByType(ps, constants.WIX_CODE_SPEC_TYPE));
        }

        describe('initialize', function () {
            it('should set the app as read only', function () {
                var ps = createPrivateServices();
                var pointer = ps.pointers.wixCode.getIsAppReadOnly();
                var valueBefore = ps.dal.get(pointer);

                expect(valueBefore).toBeUndefined();

                wixCode.initializeWixCode(ps);
                var valueAfter = ps.dal.get(pointer);

                expect(valueAfter).toEqual(true);
            });
        });

        describe('provision', function () {
            it('should work without external options', function (done) {
                var ps = createPrivateServices();
                ps.setOperationsQueue.asyncSetOperationComplete.and.callFake(done);
                function provision() {
                    wixCode.provision(ps);
                }

                expect(provision).not.toThrow();
            });

            describe('on success', function () {
                function failTest(error) {
                    throw error;
                }

                it('should call `asyncSetOperationComplete` on provision success', function (done) {
                    var ps = createPrivateServices();

                    wixCode.provision(ps, {
                        onSuccess: validate,
                        onError: failTest
                    });

                    function validate() {
                        expect(ps.setOperationsQueue.asyncSetOperationComplete).toHaveBeenCalledWith(/* nothing */);
                        done();
                    }
                });

                it('should call the optional success callback', function (done) {
                    var ps = createPrivateServices();

                    wixCode.provision(ps, {
                        onSuccess: validate,
                        onError: failTest
                    });

                    function validate(result) {
                        var expectedResult = getExistingWixCodeApp(ps);
                        expect(result).toEqual(expectedResult);
                        done();
                    }
                });

                it('should call wixCodeWidgetAspect.initApp', function(done) {
                    var ps = createPrivateServices();
                    var wixCodeWidgetAspect = ps.siteAPI.getSiteAspect('wixCodeWidgetAspect');
                    spyOn(wixCodeWidgetAspect, 'initApp');

                    wixCode.provision(ps, {
                        onSuccess: validate,
                        onError: failTest
                    });

                    function validate() {
                        expect(wixCodeWidgetAspect.initApp).toHaveBeenCalled();
                        done();
                    }
                });
            });

            describe('on error', function () {
                function failOnSuccess() {
                    throw new Error('this test should have failed');
                }

                it('should call `asyncSetOperationComplete` with the error object', function (done) {
                    var ps = createPrivateServices();
                    var fakeError = {
                        success: false,
                        payload: {}
                    };
                    var expectedError = new Error('Wix Code provision failed: ' + JSON.stringify(fakeError));
                    spyOn(wixCodeLifecycleService, 'provision').and.returnValue(Promise.reject(fakeError));

                    wixCode.provision(ps, {
                        onSuccess: failOnSuccess,
                        onError: validate
                    });

                    function validate() {
                        expect(ps.setOperationsQueue.asyncSetOperationComplete).toHaveBeenCalledWith(expectedError);
                        done();
                    }
                });

                it('should call the optional error callback', function (done) {
                    var ps = createPrivateServices();
                    var fakeError = {
                        success: false,
                        payload: {}
                    };
                    spyOn(wixCodeLifecycleService, 'provision').and.returnValue(Promise.reject(fakeError));

                    wixCode.provision(ps, {
                        onSuccess: failOnSuccess,
                        onError: validate
                    });

                    function validate(error) {
                        expect(error).toEqual(fakeError);
                        done();
                    }
                });
            });
        });

        describe('generateRemoteModelInterface', function () {
           var newPageId = 'somePageId';
            var componentType = 'wysiwyg.viewer.components.WRichText';
            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData(null, true)
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPageWithDefaults(newPageId)
                    .setCurrentPage(newPageId);
                this.runtimeDal = testUtils.mockFactory.getRuntimeDal(this.mockSiteData);
            });

            it('should generate model containing EventTypes', function() {
                var expectedCompIdArr = [newPageId, 'SITE_HEADER', 'SITE_FOOTER'];
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);

                var RMI = wixCode.generateRemoteModelInterface(ps, newPageId);

                var expectedRMI = testUtils.mockFactory.widgetMocks.rmi(expectedCompIdArr, this.runtimeDal, siteUtils.constants.ACTION_TYPES);
                expect(RMI.toJson().EventTypes).toEqual(expectedRMI.EventTypes);
            });

            it('should generate model for the passed page and master page components', function(){
                var currentPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId);
                var masterPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var expectedCompIdArr = ['SITE_FOOTER', 'SITE_HEADER', masterPageComponent.id, currentPageComponent.id, newPageId];
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);

                var RMI = wixCode.generateRemoteModelInterface(ps, newPageId);

                var expectedRMI = testUtils.mockFactory.widgetMocks.rmi(expectedCompIdArr, this.runtimeDal, siteUtils.constants.ACTION_TYPES);
                expect(RMI.toJson().components).toEqual(expectedRMI.components);
                expect(RMI.toJson().connections).toEqual(expectedRMI.connections);
                expect(RMI.toJson().pages).toEqual(expectedRMI.pages);
            });

            it('should generate model for master page components only, in case there are no components on the current page', function(){
                var masterPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var expectedCompIdArr = [newPageId, 'SITE_HEADER', 'SITE_FOOTER', masterPageComponent.id];
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);

                var RMI = wixCode.generateRemoteModelInterface(ps, newPageId);

                var expectedRMI = testUtils.mockFactory.widgetMocks.rmi(expectedCompIdArr, this.runtimeDal, siteUtils.constants.ACTION_TYPES);
                expect(RMI.toJson()).toEqual(expectedRMI);
            });

            it('should generate model for the passed page only, in case there are no components on the master page', function(){
                var currentPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId);
                var expectedCompIdArr = [newPageId, currentPageComponent.id, 'SITE_HEADER', 'SITE_FOOTER'];
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);

                var RMI = wixCode.generateRemoteModelInterface(ps, newPageId);

                var expectedRMI = testUtils.mockFactory.widgetMocks.rmi(expectedCompIdArr, this.runtimeDal, siteUtils.constants.ACTION_TYPES);
                expect(RMI.toJson()).toEqual(expectedRMI);
            });

            xit('should generate model for the passed popup page only (without master page components)', function(){
                var popupId = 'myPopup';
                var popupCompId = 'someCompId';
                var expectedCompIdArr = _.sortBy([popupCompId, popupId]);
                var popupComponent = testUtils.mockFactory.createStructure(componentType, null, popupCompId);
                //this.mockSiteData.addPopupPageWithDefaults(popupId, [popupComponent]).setCurrentPage(popupId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                ps.dal.addPopupPageWithDefaults(popupId, [popupComponent]);
                this.mockSiteData.setCurrentPage(popupId);

                var RMI = wixCode.generateRemoteModelInterface(ps, popupId);

                var expectedRMI = testUtils.mockFactory.widgetMocks.rmi(expectedCompIdArr, this.runtimeDal, siteUtils.constants.ACTION_TYPES);
                expect(RMI.toJson()).toEqual(expectedRMI);
            });

            it('should generate model containing components from both displayed and full json', function(){
                var testPageId = 'testPageId';
                var testContainerId = 'containerWithModes';
                var onlyInMasterCompId = 'onlyInMasterCompId';
                var onlyInModeCompId = 'onlyInModeCompId';
                var testModeId = 'testModeId';
                var fullSiteData = testUtils.mockFactory.mockSiteData(null, true)
                    .addPageWithDefaults(testPageId)
                    .setPageComponents([
                        testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                            modes: {definitions: [{modeId: testModeId}]},
                            components: [
                                testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', {
                                    layout: {testParam: 'original'},
                                    modes: {
                                        isHiddenByModes: false,
                                        overrides: [{
                                            modeIds: [testModeId],
                                            layout: {testParam: 'override'},
                                            isHiddenByModes: true
                                        }]
                                    }
                                }, onlyInMasterCompId),
                                testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {
                                    layout: {testParam: 'original'},
                                    modes: {
                                        isHiddenByModes: true,
                                        overrides: [{
                                            modeIds: [testModeId],
                                            layout: {testParam: 'override'},
                                            isHiddenByModes: false
                                        }]
                                    }
                                }, onlyInModeCompId)
                            ]}, testContainerId)
                    ], testPageId)
                    .setCurrentPage(testPageId);

                var mockSiteAPI = testUtils.mockFactory.mockWixSiteReactFromFullJson(fullSiteData).siteAPI;
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(fullSiteData);

                mockSiteAPI.activateModeById(testContainerId, testPageId, testModeId);
                var RMIWithActiveMode = wixCode.generateRemoteModelInterface(ps, testPageId);

                var modelWithActiveModeJson = RMIWithActiveMode.toJson();
                var compsInMode = _.keys(modelWithActiveModeJson.components);
                expect(compsInMode).toContain(onlyInMasterCompId);
                expect(compsInMode).toContain(onlyInModeCompId);

                mockSiteAPI.deactivateModeById(testContainerId, testPageId, testModeId);
                var RMINoActiveMode = wixCode.generateRemoteModelInterface(ps, testPageId);

                var modelNoActiveModeJson = RMINoActiveMode.toJson();
                var compsInMaster = _.keys(modelNoActiveModeJson.components);
                expect(compsInMaster).toContain(onlyInMasterCompId);
                expect(compsInMaster).toContain(onlyInModeCompId);
            });

            it('should throw an error if the passed contextId is masterPage', function(){
                var masterPageId = 'masterPage';
                var errorMsg = 'contextId - ' + masterPageId + ' is invalid';
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);

                expect(wixCode.generateRemoteModelInterface.bind(wixCode, ps, masterPageId)).toThrow(new Error(errorMsg));
            });

            it('should throw an error if the passed contextId is not a valid pageId', function(){
                var invalidContextId = 'someInvalidContextId';
                var errorMsg = 'contextId - ' + invalidContextId + ' is invalid';
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);

                expect(wixCode.generateRemoteModelInterface.bind(wixCode, ps, invalidContextId)).toThrow(new Error(errorMsg));
            });

            //Should I support the case of no application is installed? is it interesting enough?
        });

        describe('getWidgetRef', function(){
            it('should return root ref of the passed compRef in case it is the current page', function(){
                var pageId = 'myPageId';
                var siteData = testUtils.mockFactory.mockSiteData(null, true)
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPageWithDefaults(pageId)
                    .setCurrentPage(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, null, true);
                var pageRef = ps.pointers.components.getPage(pageId, 'DESKTOP');
                var compRef = ps.pointers.components.getComponent(compStructure.id, pageRef);
                var currentPageRef = ps.pointers.components.getPageOfComponent(compRef);

                var result = wixCode.getWidgetRef(ps, compRef);

                expect(result).toEqual(currentPageRef);
            });

            it("should return the current page ref in case the passed compRef is on the masterPage", function () {
                var pageId = 'myPageId';
                var siteData = testUtils.mockFactory.mockSiteData(null, true)
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPageWithDefaults(pageId)
                    .setCurrentPage(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage');
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, null, true);
                var masterPageRef = ps.pointers.components.getMasterPage(utils.constants.VIEW_MODES.DESKTOP);
                var compRef = ps.pointers.components.getComponent(compStructure.id, masterPageRef);
                var currentPageRef = ps.pointers.components.getPage(pageId, utils.constants.VIEW_MODES.DESKTOP);

                var result = wixCode.getWidgetRef(ps, compRef);

                expect(result).toEqual(currentPageRef);

            });

            it('should return the root ref of the passed compRef in case it is the current opened popup', function () {
                var popupId = 'myPopupId';
                var siteData = testUtils.mockFactory.mockSiteData(null, true)
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPopupPageWithDefaults(popupId)
                    .setCurrentPage(popupId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, popupId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, null, true);
                var popupRef = ps.pointers.components.getPage(popupId, 'DESKTOP');
                var compRef = ps.pointers.components.getComponent(compStructure.id, popupRef);

                var result = wixCode.getWidgetRef(ps, compRef);

                expect(result).toEqual(popupRef);
            });

            it('should return null in case the passed compRef does not belong to any of the active root', function () {
                var pageId = 'myPageId';
                var siteData = testUtils.mockFactory.mockSiteData(null, true)
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPageWithDefaults(pageId)
                    .setCurrentPage(pageId);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, null, true);

                var result = wixCode.getWidgetRef(ps, {id: 'someNonExistingId', type: 'DESKTOP'});

                expect(result).toEqual(null);
            });

            it('should return the current page ref if the passed compRef is a reference to the current page', function () {
                var pageId = 'myPageId';
                var siteData = testUtils.mockFactory.mockSiteData(null, true)
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPageWithDefaults(pageId)
                    .setCurrentPage(pageId);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, null, true);
                var pageRef = ps.pointers.components.getPage(pageId, 'DESKTOP');

                var result = wixCode.getWidgetRef(ps, pageRef);

                expect(result).toEqual(pageRef);
            });
        });
    });
});
