/**
 * created by omri
 * Date: 3/7/11
 * Time: 5:13 PM
 */
describe('ServerFacadeSpec', function () {

    testRequire().
        classes('core.managers.serverfacade.WixRESTClient',
            'wysiwyg.editor.managers.serverfacade.WServerApiUrls',
            'wysiwyg.editor.managers.serverfacade.ServerFacade').
        resources('W.ServerFacade', 'W.Data', 'W.Preview', 'W.Config');

    var fakeDataManager = {
        markAllDirty: function(){},
        define: {"getDefinition": function(){ return {} } },
        getDataMap: function(){ return {} }
    };


    beforeEach(function () {
        spyOn(this.W.Preview, 'getPreviewManagers').andReturn({
            Data: fakeDataManager,
            Theme: fakeDataManager,
            ComponentData: fakeDataManager,
            Css: {
                getUsedFonts: function() { return ['arial']; }
            }
        });
    });

    afterEach(function () {
        window.localStorage.clear();
    });


    describe("Basic functionality", function () {
        beforeEach(function () {
            /**
             * Mock inner classes
             **/
            var MockRESTClientClass = new MockBuilder('RESTClient').mockClass(this.WixRESTClient);
            var MockWixUrlBuilderClass = new MockBuilder('WixUrlBuilder').mockClass(this.WServerApiUrls);
            var MockSiteSerializerClass = new MockBuilder('SiteSerializer').mockClass(this.WSiteSerializer);

            /**
             * Mock managers
             **/
            spyOn(W.Config, 'getEditedSiteLoadTimeVersion').andReturn(0);

            /**
             * Mock variables
             **/
            this.mockSiteId = 'mock-site-id';
            var mockSiteName = 'mock-site-name';
            // Mock inner classes
            this.W.ServerFacade._restClient = MockRESTClientClass.getInstance();
            this.W.ServerFacade._urlBuilder = MockWixUrlBuilderClass.getInstance();
            this.W.ServerFacade._siteSerializer = MockSiteSerializerClass.getInstance();
            // Mock SITE_SETTINGS data
            var originalGetDataByQuery = this.W.Data.getDataByQuery;
            spyOn(this.W.Data, 'getDataByQuery').andCallFake(function (query) {
                if (query === '#SITE_SETTINGS') {
                    return this.W.Data.createDataItem({'type':'SiteSettings'});
                } else {
                    return originalGetDataByQuery.apply(this.W.Data, [query]);
                }
            });
        });

        function createSuccessFailureCallbackSpies() {
            return {
                onSuccess:getSpy('successCallback'),
                onError:getSpy('failureCallback')
            }
        }

        //this needs to be fixed
        xdescribe( 'cloneDocument', function(){
            it('should pass the site through serialization, get the CLONE url and send a POST request', function () {
                spyOn(this.W.ServerFacade, "_checkForCorruptedPagesInMainMenu");
                var inputSite = window;
                var inputTargetName = 'targetNameValue';
                var successFailureCallbacks = createSuccessFailureCallbackSpies();
                var expectedUrl = this.W.ServerFacade._urlBuilder.getCloneUrl();
                var expectedSendParams = {
                    sourceSiteId:this.mockSiteId,
                    targetName:inputTargetName,
                    documents:[
                        {'mockStructure':'mockValue'}
                    ],
                    dataNodes:{'mockDataItemId':'mockDataItemValue'},
                    metaSiteData:{'mockKey':'mockValue'}
                };
                this.W.ServerFacade._siteSerializer.serializeSiteStructure.andReturn(expectedSendParams.documents[0]);
                this.W.ServerFacade._siteSerializer.serializeSiteData.andReturn(expectedSendParams.dataNodes);
                spyOn(this.W.ServerFacade, '_getMetaSiteDto').andReturn(expectedSendParams.metaSiteData);
                this.W.ServerFacade.cloneDocument(inputSite, this.mockSiteId, inputTargetName, successFailureCallbacks.onSuccess, successFailureCallbacks.onError);

                expect(this.W.ServerFacade._checkForCorruptedPagesInMainMenu).toHaveBeenCalled();
                expect(this.W.ServerFacade._siteSerializer.serializeSiteStructure).toHaveBeenCalledWith(inputSite);
                expect(this.W.ServerFacade._siteSerializer.serializeSiteData).toHaveBeenCalledWith(inputSite);
                expect(this.W.ServerFacade._restClient.post).toHaveBeenCalledWith(expectedUrl, expectedSendParams, successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.post.argsForCall[0][1]).toBeEquivalentTo(expectedSendParams);
            });
        });

        xdescribe('saveDocument', function () {

            beforeEach(function () {

                this.inputSite = window;
                this.successFailureCallbacks = createSuccessFailureCallbackSpies();
                this.expectedUrl = 'mock://save.url';
                this.expectedVersion = 123;
                this.expectedSendParams = {
                    id:this.mockSiteId,
                    documents:[
                        {'mockStructure':'mockValue'}
                    ],
                    dataNodes:{'mockDataItemId':'mockDataItemValue'},
                    metaSiteData:{'mockKey':'mockValue'},
                    version:this.expectedVersion
                };

                // Spys
                spyOn(this.W.ServerFacade, "_checkForCorruptedPagesInMainMenu");
                this.W.ServerFacade._urlBuilder.getSaveDocumentUrl.andReturn(this.expectedUrl);
                this.W.Data.dirtyDataObjectsMap['SITE_SETTINGS'] = { getMeta:function () {
                    return 'isPersistent';
                } };
                this.W.ServerFacade._version = this.expectedVersion;
                this.W.ServerFacade._siteSerializer.serializeSiteStructure.andReturn(this.expectedSendParams.documents[0]);
                this.W.ServerFacade._siteSerializer.serializeSiteData.andReturn(this.expectedSendParams.dataNodes);
                spyOn(this.W.ServerFacade, '_getMetaSiteDto').andReturn(this.expectedSendParams.metaSiteData);
                //this.wrapedSuccessCallback = jasmine.createSpy('wrapedSuccessCallback');
                //this.successFailureCallbacks.onSuccess = this.wrapedSuccessCallback;
                //spyOn(this.W.ServerFacade, '_wrapSuccessCallbackWithVersionUpdater').andReturn(this.wrapedSuccessCallback);
            });

            it('should pass the site through serialization, get the save document url and send a POST request', function () {

                //TODO: This test should comply with (the never tested) WServerFacade saveDocument, it only tests SeverFacadeBase functionality

                this.W.ServerFacade.saveDocument(this.mockSiteId, this.inputSite, this.successFailureCallbacks.onSuccess, this.successFailureCallbacks.onError);

                expect(this.W.ServerFacade._checkForCorruptedPagesInMainMenu).toHaveBeenCalled();
                expect(this.W.ServerFacade._siteSerializer.serializeSiteStructure).toHaveBeenCalledWith(this.inputSite);
                expect(this.W.ServerFacade._siteSerializer.serializeSiteData).toHaveBeenCalledWith(this.inputSite);
                expect(this.W.ServerFacade._restClient.post).toHaveBeenCalledWith(this.expectedUrl, this.expectedSendParams, this.successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.post.argsForCall[0][1]).toBeEquivalentTo(this.expectedSendParams);
            });

        });

        describe('publishDocument', function () {
            it('should get the publish document url and send a POST request', function () {
                spyOn(this.W.ServerFacade, '_wrapSuccessCallbackWithVersionUpdater').andCallFake(function(func){return func;});
                spyOn(this.W.ServerFacade, '_reportUsedFontsBI');

                var successFailureCallbacks = createSuccessFailureCallbackSpies();
                var expectedUrl = this.W.ServerFacade._urlBuilder.getPublishDocumentUrl(this.mockSiteId);
                var expectedSendParams = {};

                this.W.ServerFacade.publishDocument(this.mockSiteId, successFailureCallbacks.onSuccess, successFailureCallbacks.onError);

                //successFailureCallbacks.onSuccess = this.wrapedSuccessCallback;

                expect(this.W.ServerFacade._restClient.post).toHaveBeenCalledWith(expectedUrl, expectedSendParams, successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.post.argsForCall[0][1]).toBeEquivalentTo(expectedSendParams);
            });
        });

        describe('publishTemplate', function () {

            it('should get the publish template url and send a POST request', function () {
                var successFailureCallbacks = createSuccessFailureCallbackSpies();
                var expectedUrl = this.W.ServerFacade._urlBuilder.getPublishTemplateUrl(this.mockSiteId);
                var expectedSendParams = {};

                this.W.ServerFacade.publishTemplate(this.mockSiteId, successFailureCallbacks.onSuccess, successFailureCallbacks.onError);

                expect(this.W.ServerFacade._restClient.post).toHaveBeenCalledWith(expectedUrl, expectedSendParams, successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.post.argsForCall[0][1]).toBeEquivalentTo(expectedSendParams);
            });

        });

        describe('sendAddressToMail', function () {

            it('should get the send mail url and send a POST request', function () {
                var successFailureCallbacks = createSuccessFailureCallbackSpies();
                var expectedUrl = this.W.ServerFacade._urlBuilder.getSendEmailUrl(this.mockSiteId);
                var expectedSendParams = {};

                this.W.ServerFacade.sendAddressToMail(this.mockSiteId, successFailureCallbacks.onSuccess, successFailureCallbacks.onError);

                expect(this.W.ServerFacade._restClient.post).toHaveBeenCalledWith(expectedUrl, expectedSendParams, successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.post.argsForCall[0][1]).toBeEquivalentTo(expectedSendParams);
            });

        });

        describe('saveHtmlAsTempStaticUrl', function () {

            it('should get the save html to statics url and send a POST request', function () {
                var mockHTML = '<html><body>im a mock!</body></html>';
                var successFailureCallbacks = createSuccessFailureCallbackSpies();
                var expectedUrl = this.W.ServerFacade._urlBuilder.getSaveHtmlTempUrl();
                var expectedSendParams = {
                    html:mockHTML
                };

                this.W.ServerFacade.saveHtmlAsTempStaticUrl(mockHTML, successFailureCallbacks.onSuccess, successFailureCallbacks.onError);

                expect(this.W.ServerFacade._restClient.post).toHaveBeenCalledWith(expectedUrl, expectedSendParams, successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.post.argsForCall[0][1]).toBeEquivalentTo(expectedSendParams);
            });

        });

        describe('getContentFromStaticUrl', function () {

            it('should get the get content from statics url and send a get request', function () {
                var mockUrl = 'http://mock.url';
                var successFailureCallbacks = createSuccessFailureCallbackSpies();
                var expectedUrl = this.W.ServerFacade._urlBuilder.getGetContentFromStaticUrlUrl(mockUrl);
                var expectedSendParams = {};

                this.W.ServerFacade.getContentFromStaticUrl(mockUrl, successFailureCallbacks.onSuccess, successFailureCallbacks.onError);

                expect(this.W.ServerFacade._restClient.get).toHaveBeenCalledWith(expectedUrl, expectedSendParams, successFailureCallbacks);
                expect(this.W.ServerFacade._restClient.get.argsForCall[0][1]).toBeEquivalentTo(expectedSendParams);
            });

        });

        describe("test _checkForCorruptedPagesInMainMenu", function () {
//        beforeEach(function(){
//            this.W.Preview = {};
//        });
            it('menu data and site structure should be identical, should not remove or add any elements to menu data', function () {
                var siteStructureData = this.W.Data.createDataItem({pages:["page1", "page2", "page3"]}, 'Document');
                var menuItem1 = {refId:"page1", items:[]};
                var menuItem2 = {refId:"page2", items:[]};
                var menuItem3 = {refId:"page3", items:[]};
                var mainMenuData = this.W.Data.createDataItem({items:[menuItem1, menuItem2, menuItem3]}, 'Menu');
                this.W.Preview.getPreviewManagers = function () {
                    return {Data:{
                        getDataByQuery:function (type) {
                            var dataItems = {'#SITE_STRUCTURE':siteStructureData, '#MAIN_MENU':mainMenuData};
                            return dataItems[type]
                        },
                        isDataAvailable:function () {
                            return true
                        }}
                    }
                }
                this.W.ServerFacade._checkForCorruptedPagesInMainMenu();
                expect(mainMenuData.getAllItems().length).toBeEquivalentTo(3);

            });

            it('menu data and site structure are not identical, should remove an item from menu data', function () {
                spyOn(LOG, "reportError");
                var siteStructureData = this.W.Data.createDataItem({pages:["page1", "page2", "page3"]}, 'Document');
                var menuItem1 = {refId:"page1", items:[]};
                var menuItem2 = {refId:"page2", items:[]};
                var menuItem4 = {refId:"page4", items:[]};
                var menuItem3 = {refId:"page3", items:[]};
                var mainMenuData = this.W.Data.createDataItem({items:[menuItem1, menuItem2, menuItem4, menuItem3]}, 'Menu');
                this.W.Preview.getPreviewManagers = function () {
                    return {Data:{
                        getDataByQuery:function (type) {
                            var dataItems = {'#SITE_STRUCTURE':siteStructureData, '#MAIN_MENU':mainMenuData};
                            return dataItems[type]
                        },
                        isDataAvailable:function () {
                            return true
                        }}
                    }
                }
                this.W.ServerFacade._checkForCorruptedPagesInMainMenu();
                expect(mainMenuData.getAllItems().length).toBeEquivalentTo(3);
                expect(mainMenuData.getAllItems()[2].get('refId')).toBeEquivalentTo('page3');
                expect(LOG.reportError).toHaveBeenCalled();
            });

            it('menu data and site structure are not identical, should add an item from menu data', function () {
                spyOn(LOG, "reportError");
                var siteStructureData = this.W.Data.createDataItem({pages:["page1", "page2", "page3", "page4"]}, 'Document');
                var menuItem1 = {refId:"page1", items:[]};
                var menuItem2 = {refId:"page2", items:[]};
                var menuItem3 = {refId:"page3", items:[]};
                var mainMenuData = this.W.Data.createDataItem({items:[menuItem1, menuItem2, menuItem3]}, 'Menu');
                this.W.Preview.getPreviewManagers = function () {
                    return {Data:{
                        getDataByQuery:function (type) {
                            var dataItems = {'#SITE_STRUCTURE':siteStructureData, '#MAIN_MENU':mainMenuData};
                            return dataItems[type]
                        },
                        isDataAvailable:function () {
                            return true
                        }}
                    }
                }
                this.W.ServerFacade._checkForCorruptedPagesInMainMenu();
                expect(mainMenuData.getAllItems().length).toBeEquivalentTo(4);
                expect(mainMenuData.getAllItems()[3].get('refId')).toBeEquivalentTo('page4');
                expect(LOG.reportError).toHaveBeenCalled();
            });

            it('menu data and site structure are not identical, should add and remove an item from menu data', function () {
                spyOn(LOG, "reportError");
                var siteStructureData = this.W.Data.createDataItem({pages:["page1", "page2", "page3", "page4"]}, 'Document');
                var menuItem1 = {refId:"page1", items:[]};
                var menuItem2 = {refId:"page2", items:[]};
                var menuItem5 = {refId:"page5", items:[]};
                var menuItem3 = {refId:"page3", items:[]};
                var mainMenuData = this.W.Data.createDataItem({items:[menuItem1, menuItem2, menuItem3]}, 'Menu');
                this.W.Preview.getPreviewManagers = function () {
                    return {Data:{
                        getDataByQuery:function (type) {
                            var dataItems = {'#SITE_STRUCTURE':siteStructureData, '#MAIN_MENU':mainMenuData};
                            return dataItems[type]
                        },
                        isDataAvailable:function () {
                            return true
                        }}
                    }
                }
                this.W.ServerFacade._checkForCorruptedPagesInMainMenu();
                expect(mainMenuData.getAllItems().length).toBeEquivalentTo(4);
                expect(mainMenuData.getAllItems()[2].get('refId')).toBeEquivalentTo('page3');
                expect(mainMenuData.getAllItems()[3].get('refId')).toBeEquivalentTo('page4');
                expect(LOG.reportError).toHaveBeenCalled();
            });

        });
    });


    describe("clearBackupSave", function () {
        it("should clear the saved site under siteId to an empty string", function () {
            spyOn(this.W.ServerFacade, '_getSiteId').andReturn("site-id-for-testing");
            this.W.ServerFacade.clearBackupSave();
            //after item removal localStorage will return null
            expect(window.localStorage.getItem(this.W.ServerFacade._getSiteId())).toBe(null);
        });
    });

    describe("_startBackgroundBackupProcess", function () {
        beforeEach(function () {
            this._mockSiteId = "site-id-for-testing";
            spyOn(this.W.ServerFacade, '_getSiteId').andReturn(this._mockSiteId);
            window.localStorage.removeItem('crashIndication_' + this._mockSiteId);
        });

        it("should save the crash indicator to the local storage", function () {
            var id = this._mockSiteId;

            this.W.ServerFacade._startBackgroundBackupProcess();
            expect(window.localStorage.getItem('crashIndication_' + this._mockSiteId)).not.toBeNull();
        });
    });

    describe("MobileQuickActions Experiment: Mobile Quick Actions", function () {
        beforeEach(function() {
            this.W.ServerFacade.resources.W.Data = this.W.Data;
            var qActions = this.W.Data.addDataItem('QUICK_ACTIONS', {"type":'QuickActions'});
            qActions.set('quickActionsMenuEnabled', false);
            qActions.set('navigationMenuEnabled', true);
            qActions.set('phoneEnabled', false);
            qActions.set('emailEnabled', true);
            qActions.set('addressEnabled', false);
            qActions.set('socialLinksEnabled', true);
            qActions.set('colorScheme','light');


            var contactDataItem = this.W.Data.addDataItem('CONTACT_INFORMATION', {"type":'ContactInformation'});
            contactDataItem.set('companyName', 'fakeCompany');
            contactDataItem.set('phone', 'fakePhone');
            contactDataItem.set('email', 'fakeEmail');
            contactDataItem.set('address', 'fakeAddress');
            contactDataItem.set('fax', '040-040');

            var socialLinks = this.W.Data.addDataItem('SOCIAL_LINKS', {"type":'SocialLinks'});
            socialLinks.set('twitter', 'http://www.twitter.com');
            socialLinks.set('facebook', 'http://www.facebook.com');

            var userMetaTags = this.W.Data.addDataItem('USER_META_TAGS', {"type":'AdvancedSeoSettingsDialog'});
            userMetaTags.set('userMetaTags', '<meta name="gaga" content="baga"/>');

            spyOn(this.W.ServerFacade, '_appendMetaSiteData').andReturn(undefined);
            spyOn(this.W.ServerFacade.resources.W.Preview._fullStructureSerializer, 'getChangedFullSiteStructure').andReturn({});
            spyOn(this.W.ServerFacade.resources.W.Preview._siteDataSerializer, 'serializeDataDelta').andReturn({});
            this.W.ServerFacade._siteSerializer = {
                serializeUpdatedPages:function() {},
                getDeletedPages:function() {},
                serializeDataDelta:function() {}
            };
        });

        describe("ServerFacade", function () {
            describe("_appendMetaSiteData" , function() {
                beforeEach(function(){
                    this.W.ServerFacade._addUsedFontsToData = function() {};
                });

                it("should create the siteMetaData params", function () {
                    var expectedResult = {
                        "quickActions": {
                            "socialLinks":[
                                {
                                    "id":"facebook",
                                    "url":"http://www.facebook.com"
                                },
                                {
                                    "id":"twitter",
                                    "url":"http://www.twitter.com"
                                }
                            ],
                            "colorScheme":"light",
                            "configuration": {
                                "quickActionsMenuEnabled":false,
                                "navigationMenuEnabled":true,
                                "phoneEnabled":false,
                                "emailEnabled":true,
                                "addressEnabled":false,
                                "socialLinksEnabled":true}
                        },"contactInfo": {
                            "companyName":"fakeCompany",
                            "phone":"fakePhone",
                            "email":"fakeEmail",
                            "address":"fakeAddress",
                            "fax":"040-040"
                        }, "preloader": {
                            "enabled":false
                        },"headTags": '<meta name="gaga" content="baga"/>'
                    };
                    var params = this.W.ServerFacade.getPartialSaveDocumentParams();
                    expect(params.siteMetaData).toEqual(expectedResult);
                });
            });
        });
    });
});