define([
    'lodash',
    'tpa',
    'utils',
    'bluebird',
    'testUtils',
    'documentServices/tpa/handlers/tpaHandlers',
    'documentServices/tpa/tpa',
    'documentServices/page/page',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/siteMetadata/seo',
    'documentServices/page/pageUtils',
    'documentServices/tpa/services/appMarketService',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/component/component',
    'documentServices/structure/structure'
], function (_, tpa, utils, Promise, testUtils, tpaHandlers, tpaDocumentServices, page, siteMetadata, privateServicesHelper, seo, pageUtils, appMarketService, componentDetectorAPI, component, structure) {
    'use strict';

    var siteAPI = {};
    var ps = {
        siteDataAPI: {
            siteData: {}
        }
    };
    var compId = 'tpaSettings';
    var applicationId = '1';

    describe('ds - tpa handlers', function() {
        beforeEach(function () {
            tpaHandlers.settpads(tpaDocumentServices);
        });

        describe('registerEventListener', function() {
            it('should handle COMPONENT_DELETED', function () {
                spyOn(tpaDocumentServices.change.register, 'deleteCompHandler');
                var msg = {
                    compId: compId,
                    data: {
                        eventKey: 'COMPONENT_DELETED'
                    }
                };
                tpaHandlers.registerEventListener(ps, siteAPI, msg);
                expect(tpaDocumentServices.change.register.deleteCompHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
            });

            it('should handle EDIT_MODE_CHANGE', function () {
                spyOn(tpaDocumentServices.change.register, 'editModeChangeHandler');
                var msg = {
                    compId: compId,
                    data: {
                        eventKey: 'EDIT_MODE_CHANGE'
                    }
                };
                tpaHandlers.registerEventListener(ps, siteAPI, msg);
                expect(tpaDocumentServices.change.register.editModeChangeHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
            });

            it('should handle SETTINGS_UPDATED', function () {
                spyOn(tpaDocumentServices.change.register, 'settingsUpdatedHandler');
                var msg = {
                    compId: compId,
                    data: {
                        eventKey: 'SETTINGS_UPDATED'
                    }
                };
                tpaHandlers.registerEventListener(ps, siteAPI, msg);
                expect(tpaDocumentServices.change.register.settingsUpdatedHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
            });

            it('should handle THEME_CHANGE', function () {
                spyOn(tpaDocumentServices.change.register, 'themeChangeHandler');
                var msg = {
                    compId: compId,
                    data: {
                        eventKey: 'THEME_CHANGE'
                    }
                };
                tpaHandlers.registerEventListener(ps, siteAPI, msg);
                expect(tpaDocumentServices.change.register.themeChangeHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
            });

            it('should handle SITE_PUBLISHED', function () {
                spyOn(tpaDocumentServices.change.register, 'sitePublishedHandler');
                var msg = {
                    compId: compId,
                    data: {
                        eventKey: 'SITE_PUBLISHED'
                    }
                };
                tpaHandlers.registerEventListener(ps, siteAPI, msg);
                expect(tpaDocumentServices.change.register.sitePublishedHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
            });

            it('should handle DEVICE_TYPE_CHANGED', function () {
                spyOn(tpaDocumentServices.change.register, 'deviceTypeChangeHandler');
                var msg = {
                    compId: compId,
                    data: {
                        eventKey: 'DEVICE_TYPE_CHANGED'
                    }
                };
                tpaHandlers.registerEventListener(ps, siteAPI, msg);
                expect(tpaDocumentServices.change.register.deviceTypeChangeHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
            });

            describe('PUBLIC_DATA_CHANGED', function(){

                it('should handle PUBLIC_DATA_CHANGED', function () {
                    var msg = {
                        compId: compId,
                        data: {
                            eventKey: 'PUBLIC_DATA_CHANGED'
                        }
                    };
                    this.privateServices = privateServicesHelper.mockPrivateServices();

                    spyOn(tpaDocumentServices.change.register, 'registerPublicDataChangedHandler').and.callFake(function(ps1, compId1, callback) {
                        callback();
                    });

                    spyOn(tpaDocumentServices.comp, 'postMessageBackToApp');

                    tpaHandlers.registerEventListener(ps, siteAPI, msg);

                    expect(tpaDocumentServices.change.register.registerPublicDataChangedHandler).toHaveBeenCalledWith(ps, msg.compId, jasmine.any(Function));
                    expect(tpaDocumentServices.comp.postMessageBackToApp).toHaveBeenCalledWith(compId, 'PUBLIC_DATA_CHANGED', undefined);
                });
            });
            describe('SITE_SAVED', function(){

                var SITE_SAVED_EVENT = 'SITE_SAVED';

                beforeEach(function(){
                    this.msg = {
                        compId: compId,
                        data: {
                            eventKey: SITE_SAVED_EVENT
                        }
                    };
                    this.privateServices = privateServicesHelper.mockPrivateServices();

                    spyOn(tpaDocumentServices.change.register, 'siteSavedHandler').and.callThrough();
                });

                it('should handle SITE_SAVED', function () {
                    tpaHandlers.registerEventListener(ps, siteAPI, this.msg);

                    expect(tpaDocumentServices.change.register.siteSavedHandler).toHaveBeenCalledWith(ps, this.msg.compId, jasmine.any(Function));
                });

                it('should trigger SITE_SAVED handlers when site is saved', function () {
                    spyOn(tpaDocumentServices.comp, 'postMessageBackToApp').and.callThrough();

                    tpaHandlers.registerEventListener(ps, siteAPI, this.msg);
                    tpaDocumentServices.change.siteSaved();
                    expect(tpaDocumentServices.comp.postMessageBackToApp).toHaveBeenCalledWith(compId, SITE_SAVED_EVENT);
                });
            });

        });

        describe('viewer - preview handlers', function () {
            var PUBLIC_URL = 'http://baseUrl';
            it('should handle getSitePages - when includePagesUrl is forward', function () {
                spyOn(tpa.sitePages, 'getSitePagesInfoData');
                var msg = {
                    compId: 'compId',
                    data: {
                        includePagesUrl: true
                    }
                };

                var expectedOptions = {
                    filterHideFromMenuPages: true,
                    includePagesUrl: true,
                    baseUrl: PUBLIC_URL
                };
                spyOn(siteMetadata.generalInfo, 'getPublicUrl').and.returnValue(PUBLIC_URL);

                tpaHandlers.getSitePages(ps, siteAPI, msg, function () {});
                expect(tpa.sitePages.getSitePagesInfoData).toHaveBeenCalledWith(ps.siteDataAPI.siteData, expectedOptions);
            });

            it('should handle getSitePages - when includePagesUrl is not forward', function () {
                spyOn(tpa.sitePages, 'getSitePagesInfoData');
                var msg = {
                    compId: 'compId',
                    data: {}
                };

                var expectedOptions = {
                    filterHideFromMenuPages: true,
                    includePagesUrl: false,
                    baseUrl: PUBLIC_URL
                };
                spyOn(siteMetadata.generalInfo, 'getPublicUrl').and.returnValue(PUBLIC_URL);

                tpaHandlers.getSitePages(ps, siteAPI, msg, function () {});
                expect(tpa.sitePages.getSitePagesInfoData).toHaveBeenCalledWith(ps.siteDataAPI.siteData, expectedOptions);
            });

            it('should handle navigateToPage', function () {
                spyOn(tpa.tpaHandlers, 'navigateToPage');
                spyOn(tpa.services.tpaPreviewEditorCommunicationService, 'doPostMessage');
                var msg = {
                    compId: 'compId',
                    data: { }
                };
                tpaHandlers.navigateToPage(ps, siteAPI, msg, function () {});
                expect(tpa.tpaHandlers.navigateToPage).toHaveBeenCalledWith(siteAPI, msg, jasmine.any(Function));
                expect(tpa.services.tpaPreviewEditorCommunicationService.doPostMessage).toHaveBeenCalledWith('deselectComponent');
            });
        });

        describe('refreshApp', function () {
            var compsData = [
                {
                    id: 'comp1'
                },
                {
                    id: 'comp2'
                }
            ];
            var _siteAPI;
            beforeEach(function () {
                spyOn(tpaDocumentServices.app, 'refreshApp');
                spyOn(tpaDocumentServices.app, 'getRenderedReactCompsByApplicationId').and.callFake(function() {
                    return _.map(compsData, function(compData) {
                        return getCompId(compData.id, applicationId);
                    });
                });

                _siteAPI = _.clone(siteAPI);
                _siteAPI.getComponentById = function(id) {
                    return getCompId(id, applicationId);
                };


            });
            var getCompId = function (id, appId) {
                return {
                    compId: id,
                    props: {
                        compData : {
                            applicationId : appId
                        }
                    }
                };
            };

            it('should get all app comps and call refreshApp when no comp ids were given', function () {
                var msg = {
                    compId: compId,
                    data: {

                    }
                };

                tpaHandlers.refreshApp(ps, _siteAPI, msg);
                expect(tpaDocumentServices.app.refreshApp).toHaveBeenCalledWith(ps, [
                    getCompId('comp1', applicationId),
                    getCompId('comp2', applicationId)
                ], undefined);
            });

            it('should get comps from given compIds and call refreshApp', function () {
                var msg = {
                    compId: compId,
                    data: {
                        compIds: ['comp2']
                    }
                };

                tpaHandlers.refreshApp(ps, _siteAPI, msg);
                expect(tpaDocumentServices.app.refreshApp).toHaveBeenCalledWith(ps, [
                    getCompId('comp2', applicationId)
                ], undefined);
            });

            it('should get all app comps and call refreshApp when the given comp ids are not an array', function () {
                var msg = {
                    compId: compId,
                    data: {
                        compIds: 'comp2'
                    }
                };

                tpaHandlers.refreshApp(ps, _siteAPI, msg);
                expect(tpaDocumentServices.app.refreshApp).toHaveBeenCalledWith(ps, [
                    getCompId('comp1', applicationId),
                    getCompId('comp2', applicationId)
                ], undefined);
            });
        });

        describe('url handlers', function () {
            var singlePage = {
                id: 'c1u9j',
                pageUriSEO: 'online-store',
                tpaPageId: 'thank_you_page',
                tpaApplicationId: 14,
                hidePage: true
            };
            var multiSection1 = {
                id: 'pj96t',
                pageUriSEO: 'multi_section1',
                tpaPageId: 'welcome_page',
                tpaApplicationId: 11,
                hidePage: true
            };
            var multiSection2 = {
                id: 'j4gu2',
                pageUriSEO: 'multi_section2',
                tpaPageId: 'thank_you_page',
                tpaApplicationId: 11,
                hidePage: false
            };

            var mockBaseUrl = 'http://user.wix.com/example';

            var mockSitePages = [singlePage, multiSection1, multiSection2];

            beforeEach(function(){
                this.msg = {
                    data: {
                        sectionIdentifier: 'thank_you_page'
                    }
                };
                this.siteData = privateServicesHelper.getSiteDataWithPages();
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData, {siteData: [{path: ['documentServicesModel'], optional: true}, {path: ['rendererModel'], optional: true}]});
                this.callbackFn = jasmine.createSpy('callback');
                spyOn(page, 'getPagesDataItems').and.returnValue(mockSitePages);
                spyOn(ps.siteDataAPI.siteData, 'getPagesDataItems').and.returnValue(mockSitePages);
                spyOn(siteMetadata.generalInfo, 'isSitePublished').and.returnValue(true);
            });

            describe('getSectionUrl', function() {
                it('should throw error when site is not saved', function () {
                    spyOn(siteMetadata.generalInfo, 'isFirstSave').and.returnValue(true);

                    tpaHandlers.getSectionUrl(ps, siteAPI, {}, this.callbackFn);

                    expect(this.callbackFn).toHaveBeenCalledWith({error: {message: 'Page was not found.'}});
                });

                it('should get section url for app with multi pages', function () {
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '11'
                            }
                        }
                    });
                    tpaHandlers.getSectionUrl(ps, siteAPI, this.msg, this.callbackFn);

                    expect(this.callbackFn).toHaveBeenCalledWith({
                        url: mockBaseUrl + '#!' + multiSection2.pageUriSEO + '/' + multiSection2.id
                    });
                });

                it('should get section url for slash-formatted URLs', function () {
                    spyOn(this.siteData, 'getUrlFormat').and.returnValue('slash');
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '11'
                            }
                        }
                    });
                    tpaHandlers.getSectionUrl(ps, siteAPI, this.msg, this.callbackFn);

                    expect(this.callbackFn).toHaveBeenCalledWith({
                        url: mockBaseUrl + '/' + multiSection2.pageUriSEO
                    });
                });

                it('should clear the query', function () {
                    this.siteData.currentUrl.query = {key: 'value'};
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '11'
                            }
                        }
                    });
                    tpaHandlers.getSectionUrl(ps, siteAPI, this.msg, this.callbackFn);

                    expect(this.callbackFn).toHaveBeenCalledWith({
                        url: mockBaseUrl + '#!' + multiSection2.pageUriSEO + '/' + multiSection2.id
                    });
                });

                it('should get first none hidden section url for app with multi pages', function () {
                    this.msg.data.sectionIdentifier = 'no_page_with_this_name';
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '11'
                            }
                        }
                    });
                    tpaHandlers.getSectionUrl(ps, siteAPI, this.msg, this.callbackFn);

                    expect(this.callbackFn).toHaveBeenCalledWith({
                        url: mockBaseUrl + '#!' + multiSection2.pageUriSEO + '/' + multiSection2.id
                    });
                });

                it('should throw error if app does not have any pages', function () {
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '3'
                            }
                        }
                    });
                    tpaHandlers.getSectionUrl(ps, siteAPI, this.msg, this.callbackFn);

                    expect(this.callbackFn).toHaveBeenCalledWith({error: {message: 'This app does not have any pages.'}});
                });
            });

            describe('getStateUrl', function() {

                beforeEach(function () {
                    this.msg = {
                        data: {
                            sectionId: 'thank_you_page',
                            state: 'some/internal/state'
                        }
                    };
                });

                it('should throw error when site is not saved', function(){
                    spyOn(siteMetadata.generalInfo, 'isFirstSave').and.returnValue(true);
                    tpaHandlers.getStateUrl(ps, siteAPI, {}, this.callbackFn);
                    expect(this.callbackFn).toHaveBeenCalledWith({error: {message: 'Page was not found.'}});
                });

                it('should get state url for app with multi pages', function(){
                    this.msg.data.sectionIdentifier = 'thank_you_page';
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '11'
                            }
                        }
                    });
                    tpaHandlers.getStateUrl(ps, siteAPI, this.msg, this.callbackFn);
                    expect(this.callbackFn).toHaveBeenCalledWith({
                        url: mockBaseUrl + '#!' + multiSection2.pageUriSEO + '/' + multiSection2.id + '/' + this.msg.data.state
                    });
                });

                it('should get first non-hidden section url for app with multi pages', function () {
                    this.msg.data.sectionId = 'no_page_with_this_name';
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '11'
                            }
                        }
                    });
                    tpaHandlers.getStateUrl(ps, siteAPI, this.msg, this.callbackFn);
                    expect(this.callbackFn).toHaveBeenCalledWith({
                        url: mockBaseUrl + '#!' + multiSection2.pageUriSEO + '/' + multiSection2.id
                    });
                });

                it('should throw error if app does not have any pages', function() {
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: '3'
                            }
                        }
                    });
                    tpaHandlers.getStateUrl(ps, siteAPI, this.msg, this.callbackFn);
                    expect(this.callbackFn).toHaveBeenCalledWith({error: {message: 'This app does not have any pages.'}});
                });
            });
        });

        describe('siteInfo', function() {
            var callbackFn, expectedInfo;
            var mockBaseUrl = 'http://user.wix.com/example#!';
            var pageData = {
                title: 'title',
                pageTitleSEO: 'pageTitleSEO'
            };

            var msg = {
                version: '1.43.0'
            };

            beforeEach(function(){
                var siteData = privateServicesHelper.getSiteDataWithPages();
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                callbackFn = jasmine.createSpy('callback');
                spyOn(tpa.common.utils, 'sdkVersionIsAtLeast').and.returnValue(true);
                spyOn(page.data, 'get').and.returnValue(pageData);
                spyOn(siteMetadata.generalInfo, 'isFirstSave').and.returnValue(false);
                spyOn(siteMetadata.generalInfo, 'getPublicUrl').and.returnValue(mockBaseUrl);
                spyOn(seo.description, 'get').and.returnValue('descriptionSEO');
                spyOn(seo.keywords, 'get').and.returnValue('metaKeywordsSEO');
                spyOn(seo.title, 'get').and.returnValue('siteTitleSEO');
                spyOn(pageUtils, 'isHomepage').and.returnValue(true);

                expectedInfo = {
                    pageTitle: pageData.pageTitleSEO,
                    siteDescription: 'descriptionSEO',
                    siteKeywords: 'metaKeywordsSEO',
                    baseUrl: 'http://user.wix.com/example',
                    referer: window.document.referrer,
                    url: 'http://editor.wix.com'
                };
            });

            it('should return site info', function() {
                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return empty base url if site not saved', function() {
                siteMetadata.generalInfo.isFirstSave.and.returnValue(true);
                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expectedInfo.baseUrl = '';
                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return message as base url if getPublicUrl return undefined', function() {
                siteMetadata.generalInfo.getPublicUrl.and.returnValue(undefined);
                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expectedInfo.baseUrl = 'baseUrl is not available - site is saved but not published';

                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return site title of the page', function() {
                pageData.pageTitle = 'pageTitleSEO';
                expectedInfo.pageTitle = 'pageTitleSEO';
                page.data.get.and.returnValue(pageData);

                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return site title | page Name', function() {
                pageData.pageTitleSEO = '';
                expectedInfo.pageTitle = 'siteTitleSEO | title';
                pageUtils.isHomepage.and.returnValue(false);
                page.data.get.and.returnValue(pageData);

                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return site title of the site if no page title seo id defined and the page is home page', function() {
                pageData.pageTitleSEO = '';
                expectedInfo.pageTitle = 'siteTitleSEO';
                pageUtils.isHomepage.and.returnValue(true);
                page.data.get.and.returnValue(pageData);
                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return an empty title if sdk version is at least 1.42.0', function() {
                tpa.common.utils.sdkVersionIsAtLeast.and.returnValue(false);
                expectedInfo.siteTitle = pageData.siteTitle;
                expectedInfo.pageTitle = pageData.title;
                tpaHandlers.siteInfo(ps, siteAPI, msg, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(expectedInfo);
            });

            it('should return editor url', function (done) {
                tpaHandlers.siteInfo(ps, siteAPI, msg, function (info) {
                    expect(info.url).toBe('http://editor.wix.com');
                    done();
                });
            });

        });

        describe('getInstalledInstance', function(){

            var msg = {
                data: {
                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7'
                }
            };
            var mockClientSpecMap = {
                1: {
                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                    applicationId: 1,
                    instanceId: '43g5660d-kj75-1acc-b7ac-6j727f89o4db'
                },
                2: {
                    appDefinitionId: '3d590cbc-4907-4cc4-b0b1-ddf2c5edf297',
                    applicationId: 2,
                    instanceId: '13b6370d-b565-1acc-b7ac-6a727f65a6db'
                }
            };
            var mockCallback;

            beforeEach(function(){
                spyOn(siteMetadata, 'getProperty').and.returnValue(mockClientSpecMap);
                mockCallback = jasmine.createSpy('mockCallback');

            });

            it('should call the callback with the installed instance of the app', function(){
                var mockAppData = {
                    instanceId: '43g5660d-kj75-1acc-b7ac-6j727f89o4db'
                };
                spyOn(tpaDocumentServices.app, 'isInstalled').and.returnValue(true);

                tpaHandlers.getInstalledInstance(ps, siteAPI, msg, mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(mockAppData);
            });

            it('should call the callback with onError flag if the app exists in the clientSpecMap but no instances of the app are installed in the site', function(){
                tpaHandlers.getInstalledInstance(ps, siteAPI, msg, mockCallback);
                expect(mockCallback).toHaveBeenCalledWith({
                    onError: true
                });
            });

            it('should call the callback with onError flag if there are no instances of the app', function(){
                var mockMsg = {
                    data: {
                        appDefinitionId: '14444'
                    }
                };
                tpaHandlers.getInstalledInstance(ps, siteAPI, mockMsg, mockCallback);
                expect(mockCallback).toHaveBeenCalledWith({
                    onError: true
                });
            });
        });

        describe('revalidateSession', function() {

            var revalidateSessionCallback;
            var msg = {
                intent: 'TPA2',
                type: 'revalidateSession',
                compId: 'TPASection_ick7dyn9',
                data: {}
            };
            var mockServerData = {
                payload: {
                    applicationId: '20',
                    instance: 'abcdefghijklmn'
                }
            };

            beforeEach(function() {
                var siteData = privateServicesHelper.getSiteDataWithPages();
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                revalidateSessionCallback = jasmine.createSpy('revalidateSessionCallback');
                siteAPI.getSiteData = jasmine.createSpy('getSiteData').and.returnValue({
                    rendererModel:{
                        metaSiteId: '123456',
                        clientSpecMap: {},
                        siteInfo: {}
                    }
                });
                siteAPI.getComponentById = jasmine.createSpy('getSiteData').and.returnValue({
                    props:{
                        compData: {
                            applicationId: '11111'
                        }
                    }
                });
            });

            it('should call the callback with new app instance after session revalidation', function(done) {
                spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function(options) {
                    options.success(mockServerData);
                });
                spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                    return Promise.resolve(true);
                });
                revalidateSessionCallback = jasmine.createSpy('revalidateSessionCallback').and.callFake(function(){
                    expect(revalidateSessionCallback).toHaveBeenCalledWith({instance: mockServerData.payload.instance});
                    done();
                });

                tpaHandlers.revalidateSession(ps, siteAPI, msg, revalidateSessionCallback);
            });

            it('should call the callback with onError flag in case an error occured', function() {
                var errorResponse = {
                    status: 403,
                    statusText: 'Forbidden',
                    response: '{}'
                };
                spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function(options) {
                    options.error(errorResponse);
                });
                tpaHandlers.revalidateSession(ps, siteAPI, msg, revalidateSessionCallback);
                expect(revalidateSessionCallback).toHaveBeenCalledWith({
                    onError: true,
                    error: {
                        errorCode: errorResponse.status,
                        errorText: errorResponse.statusText,
                        error: JSON.parse(errorResponse.response)
                    }
                });
           });
        });

        describe('getCurrentPageAnchors', function () {
            var pageId = 'page1';

            beforeEach(function () {
                this.siteAPI = testUtils.mockFactory.mockSiteAPI();
                this.siteData = this.siteAPI.getSiteData();
                this.anchorData = this.siteData.mock.anchorData({
                    compId: '123',
                    name: 'frogAnchor',
                    pageId: 'u37l2'
                });
                this.siteData.addPageWithDefaults(pageId);
                this.siteAPI.setCurrentPage(pageId);
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                this.callback = jasmine.createSpy('callback');
            });

            it('should return the top page anchor by default', function () {
                tpaHandlers.getCurrentPageAnchors(this.ps, this.siteAPI, null, this.callback);
                var anchors = this.callback.calls.argsFor(0)[0];
                expect(anchors.length).toBe(1);
                expect(anchors[0]).toEqual({
                    id: 'PAGE_TOP_ANCHOR',
                    title: tpa.common.utils.Constants.TOP_PAGE_ANCHOR_PREFIX + this.siteData.getPrimaryPageId()
                });
            });

            it('should return the current page anchors data', function () {
                privateServicesHelper.mockComponentInPage('wysiwyg.common.components.anchor.viewer.Anchor', this.ps, pageId, this.anchorData);

                tpaHandlers.getCurrentPageAnchors(this.ps, this.siteAPI, null, this.callback);
                var anchors = this.callback.calls.argsFor(0)[0];
                expect(anchors.length).toBe(2);
                expect(anchors).toContain({
                    id: 'PAGE_TOP_ANCHOR',
                    title: tpa.common.utils.Constants.TOP_PAGE_ANCHOR_PREFIX + this.siteData.getPrimaryPageId()
                });
                expect(anchors).toContain({id: this.anchorData.compId, title: this.anchorData.name});
            });
        });

        describe('getComponentInfo', function() {
            var tpaWidgetId = 'tpaWidgetId';
            var appPageId = 'appPageId';
            var appData = {
                widgets: {
                    widget1: {
                        tpaWidgetId: tpaWidgetId,
                        published: true
                    },
                    widget2: {
                        appPage: {
                            name: 'appPage',
                            hidden: false,
                            id: appPageId
                        },
                        published: true
                    }
                }
            };

            var compData = {
                widgetId: 'widget1',
                applicationId: '11'
            };

            var msg = {
                compId: 'comp1'
            };

            var compPointer = {
                id: '123'
            };

            var callback, mockPs = {
                pointers: {
                    components: {
                        getPageOfComponent: function() {
                            return {
                                id: 'page1'
                            };
                        }
                    }
                }
            };

            var mockSiteAPI = {};
            beforeEach(function() {
                callback = jasmine.createSpy('callback');
                spyOn(componentDetectorAPI, 'getComponentById').and.returnValue(compPointer);
                spyOn(component.data, 'get').and.returnValue(compData);
                spyOn(tpaDocumentServices.app, 'getData').and.returnValue(appData);
                spyOn(structure, 'isShowOnAllPages').and.returnValue(false);
            });

            var expectedCompInfo = {
                compId: 'comp1',
                showOnAllPages: false,
                pageId: 'page1',
                tpaWidgetId: tpaWidgetId,
                appPageId: ''
            };

            it('should return info with show on all pages true if comp is marked as show on all pages', function() {
                structure.isShowOnAllPages.and.returnValue(true);
                var expectedCompInfo2 = _.cloneDeep(expectedCompInfo);
                expectedCompInfo2.pageId = '';
                expectedCompInfo2.showOnAllPages = true;

                tpaHandlers.getComponentInfo(mockPs, mockSiteAPI, msg, callback);

                expect(callback).toHaveBeenCalledWith(expectedCompInfo2);
            });

            it('should return tpaWidgetId if comp is of type widget', function() {
                structure.isShowOnAllPages.and.returnValue(false);

                tpaHandlers.getComponentInfo(mockPs, mockSiteAPI, msg, callback);

                expect(callback).toHaveBeenCalledWith(expectedCompInfo);
            });

            it('should return appPageId if comp is of type section', function() {
                compData.widgetId = '';
                component.data.get.and.returnValue(compData);
                var expectedCompInfo2 = _.cloneDeep(expectedCompInfo);
                expectedCompInfo2.appPageId = appPageId;
                expectedCompInfo2.tpaWidgetId = '';
                spyOn(tpaDocumentServices.app, 'getMainSectionWidgetDataFromApplicationId').and.returnValue({
                    appPage: {
                        id: appPageId
                    }
                });

                tpaHandlers.getComponentInfo(mockPs, mockSiteAPI, msg, callback);
                expect(callback).toHaveBeenCalledWith(expectedCompInfo2);
            });
        });

        describe('data service', function() {
            var mockSiteAPI2, mockPs2, callback;
            var pageId = 'pageId';
            var compId1 = 'comp1';
            var compData = {
                applicationId: '10',
                type: 'TPAWidget',
                tpaData: '#tpaData'
            };
            var tpaData = {
                content: '{"key1": 1}',
                id: 'tpaData',
                type: "TPAData"
            };
            var appTpaData = {
                content: '{"keyApp1":{"1":999},"keyApp2":{"1":222}}',
                id: "tpaData-10",
                type: "TPAGlobalData"
            };
            var expectedData = {
                key1: 1
            };

            var expectedDataApp = {
                keyApp1:{"1":999},
                keyApp2:{"1":222}
            };

            beforeEach(function() {
                mockSiteAPI2 = testUtils.mockFactory.mockSiteAPI();
                var mockSiteData = mockSiteAPI2.getSiteData();

                mockSiteAPI2.getComponentById = function() {
                    return {
                        props: {
                            compData: {
                                origCompId: 'comp1'
                            }
                        }
                    };
                };

                mockSiteData.addPageWithDefaults(pageId).setCurrentPage(pageId);
                mockSiteData.addData(tpaData, pageId);
                mockSiteData.addData(appTpaData, 'masterPage');

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData}, false, compId1);
                mockPs2 = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                callback = jasmine.createSpy(callback);
            });

            describe('COMPONENT scope', function() {
                it('should get the data from orig component if the comp not exist in the document', function() {
                    var msg = {
                        compId: 'comp2',
                        data: {
                            key: 'key1',
                            scope: 'COMPONENT'
                        }
                    };
                    tpaHandlers.getValue(mockPs2, mockSiteAPI2, msg, callback);

                    expect(callback).toHaveBeenCalledWith(expectedData);
                });

                it('should get the data from  component if the comp exists in the document', function() {
                    var msg = {
                        compId: 'comp1',
                        data: {
                            key: 'key1',
                            scope: 'COMPONENT'
                        }
                    };
                    tpaHandlers.getValue(mockPs2, mockSiteAPI2, msg, callback);

                    expect(callback).toHaveBeenCalledWith(expectedData);
                });

                it('should return error in case comp not found', function() {
                    mockSiteAPI2.getComponentById = function() {
                        return null;
                    };

                    var msg = {
                        compId: 'comp3',
                        data: {
                            key: 'key1',
                            scope: 'COMPONENT'
                        }
                    };
                    tpaHandlers.getValue(mockPs2, mockSiteAPI2, msg, callback);

                    expect(callback).toHaveBeenCalledWith({
                        error: {
                            'message': 'comp not found'
                        }
                    });
                });

                describe('setValue', function () {

                    it('should set the comp value', function () {
                        var msg = {
                            compId: 'comp1',
                            data: {
                                key: 'key1',
                                scope: 'COMPONENT',
                                value: {foo: 'bar'}

                            }
                        };
                        var getMsg = {
                            compId: 'comp1',
                            data: {
                                key: 'key1',
                                scope: 'COMPONENT'
                            }
                        };
                        tpaHandlers.setValue(mockPs2, mockSiteAPI2, msg, callback);
                        expect(callback).toHaveBeenCalledWith({
                            'key1': {foo: 'bar'}
                        });
                        tpaHandlers.getValue(mockPs2, mockSiteAPI2, getMsg, callback);
                        expect(callback).toHaveBeenCalledWith({
                            'key1': {foo: 'bar'}
                        });
                    });

                    it('should not set the comp value - comp doesnot exist', function () {
                        var msg = {
                            compId: 'comp3',
                            data: {
                                key: 'key1',
                                scope: 'COMPONENT',
                                value: {foo: 'bar'}

                            }
                        };
                        tpaHandlers.setValue(mockPs2, mockSiteAPI2, msg, callback);
                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'comp not found'
                            }
                        });
                    });

                    it('should set the app value', function () {
                        var msg = {
                            compId: 'comp1',
                            data: {
                                key: 'key1',
                                scope: 'APP',
                                value: {foo: 'bar'}

                            }
                        };
                        var getMsg = {
                            compId: 'comp1',
                            data: {
                                key: 'key1',
                                scope: 'APP'
                            }
                        };
                        tpaHandlers.setValue(mockPs2, mockSiteAPI2, msg, callback);
                        expect(callback).toHaveBeenCalledWith({
                            'key1': {foo: 'bar'}
                        });
                        tpaHandlers.getValue(mockPs2, mockSiteAPI2, getMsg, callback);
                        expect(callback).toHaveBeenCalledWith({
                            'key1': {foo: 'bar'}
                        });
                    });

                    it('should not set the APP value - comp doesnot exist', function () {
                        var msg = {
                            compId: 'comp3',
                            data: {
                                key: 'key1',
                                scope: 'APP',
                                value: {foo: 'bar'}

                            }
                        };
                        tpaHandlers.setValue(mockPs2, mockSiteAPI2, msg, callback);
                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'comp not found'
                            }
                        });
                    });
                });

            });


            describe('APP scope', function() {
                it('should get value', function(){
                    mockSiteAPI2.getComponentById = function() {
                        return {
                            props: {
                                compData: {
                                    applicationId: '10'
                                }
                            }
                        };
                    };

                    var msg = {
                        compId: 'comp1',
                        data: {
                            keys: ['keyApp1', 'keyApp2'],
                            scope: 'APP'
                        }
                    };
                    tpaHandlers.getValues(mockPs2, mockSiteAPI2, msg, callback);

                    expect(callback).toHaveBeenCalledWith(expectedDataApp);
                });

                it('should return error in case comp not found', function() {
                    var msg = {
                        compId: 'comp3',
                        data: {
                            keys: ['keyApp1', 'keyApp2'],
                            scope: 'APP'
                        }
                    };
                    tpaHandlers.getValues(mockPs2, mockSiteAPI2, msg, callback);

                    expect(callback).toHaveBeenCalledWith({
                        error: {
                            'message': 'comp not found'
                        }
                    });
                });
            });
        });

        describe('navigateToSectionPage', function() {
            var callback, mockSiteData;
            var mockSiteAPI, mockPrivateServices, comp;

            beforeEach(function() {
                callback = jasmine.createSpy('callback');
                spyOn(tpa.tpaHandlers, 'navigateToSection').and.callThrough();
                mockSiteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.editor({applicationId: '2000', appDefinitionName: 'appName'}));
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
                mockSiteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                    props: {
                        compData: {
                            applicationId: '2000'
                        }
                    }
                });
                var pageId = mockSiteData.getCurrentUrlPageId();
                var compData = {
                    applicationId: '2000',
                    type: 'TPAWidget',
                    tpaData: '#tpaData'
                };
                comp = testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData});
            });

            it('should navigateToSection with no app pages and no app data if comp not exists', function() {
                mockSiteAPI.getComponentById.and.returnValue(null);
                var msg = {
                    compId: 'notExists'
                };

                tpaHandlers.navigateToSectionPage(mockPrivateServices, mockSiteAPI, msg, callback);

                expect(callback).toHaveBeenCalledWith({
                    error: {
                        message: 'Component was not found.'
                    }
                });
            });

            it('should not navigateToSection if app has no pages', function() {
                var msg = {
                    compId: comp.id
                };

                tpaHandlers.navigateToSectionPage(mockPrivateServices, mockSiteAPI, msg, callback);

                expect(callback).toHaveBeenCalledWith({
                    error: {
                        message: 'Page with app "appName" was not found.'
                    }
                });
            });

            it('should navigateToSection if app has section pages', function() {
                var msg = {
                    compId: comp.id
                };

                var sectionData = {
                    applicationId: '2000',
                    type: 'TPASection',
                    tpaData: '#tpaSection'
                };

                var pageData = {
                    tpaApplicationId : 2000
                };
                spyOn(mockSiteAPI, 'navigateToPage');
                mockSiteData.addPageWithData('sectionPage', pageData);
                testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, 'sectionPage', {data: sectionData});
                mockPrivateServices.syncDisplayedJsonToFull();

                tpaHandlers.navigateToSectionPage(mockPrivateServices, mockSiteAPI, msg, callback);

                expect(mockSiteAPI.navigateToPage).toHaveBeenCalled();
            });
        });
    });
});
