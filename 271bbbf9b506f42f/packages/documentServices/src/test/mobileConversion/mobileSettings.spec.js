define(['lodash', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/mobileConversion/mobileSettings', 'documentServices/siteMetadata/siteMetadata'], function (_, privateServicesHelper, mobileSettings, siteMetadata) {
    'use strict';

    describe('mobileSettings', function () {

        var mockData, defaultSiteMetaData, siteMetaDataSpy;
        beforeEach(function(){
            mockData = {
                rendererModel: {
                    "siteMetaData": {
                        "preloader": {
                            "enabled": false,
                            "uri": "d8af22_296c7d5da09c4607ba9d2991b520b627.jpg"
                        },
                        "adaptiveMobileOn": true,
                        "quickActions": {
                            "socialLinks": [
                                {
                                    "id": "facebook",
                                    "url": "http:\/\/facebook.com\/"
                                }
                            ],
                            "colorScheme": "dark",
                            "configuration": {
                                "quickActionsMenuEnabled": false,
                                "navigationMenuEnabled": true,
                                "phoneEnabled": true,
                                "emailEnabled": false,
                                "addressEnabled": true,
                                "socialLinksEnabled": false
                            }
                        },
                        "contactInfo": {
                            "companyName": "comp",
                            "phone": "53543",
                            "fax": "0540654",
                            "email": "fe@bgbg.com",
                            "address": "kjhkjugbik 54654"
                        }
                    }
                },
                editorModel: {
                    metaSiteData: {
                        adaptiveMobileOn: true
                    }
                }
            };
            var siteData = privateServicesHelper.getSiteDataWithPages();
            siteData.rendererModel = mockData.rendererModel;
            siteData.editorModel = mockData.editorModel;
            var jsonPaths = {siteData: [{path: ['pagesData'], optional: false}, {path:['rendererModel'], optional: false}, {path: ['editorModel'], optional: false}]};
            this.privateServicesMock = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, jsonPaths);
            this.dal = this.privateServicesMock.dal;
            siteMetaDataSpy = spyOn(siteMetadata, 'setProperty').and.callThrough();

            defaultSiteMetaData = {
                "preloader": {
                    "enabled": false,
                    "uri": ""
                },
                "adaptiveMobileOn": true,
                "quickActions": {
                    "socialLinks": [],
                    "colorScheme": "dark",
                    "configuration": {
                        "quickActionsMenuEnabled": false,
                        "navigationMenuEnabled": true,
                        "phoneEnabled": false,
                        "emailEnabled": false,
                        "addressEnabled": false,
                        "socialLinksEnabled": false
                    }
                },
                "contactInfo": {
                    "companyName": "",
                    "phone": "",
                    "fax": "",
                    "email": "",
                    "address": ""
                }
            };
        });

        describe("init", function(){
            it("initialize - should set default value if siteMetaData doesn't exist", function(){
                spyOn(this.dal, 'get').and.callFake(function(){return null;});
                mobileSettings.initialize(this.privateServicesMock);
                expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, defaultSiteMetaData);
            });

            it("initialize - should do nothing if siteMetaData exists", function(){
                mobileSettings.initialize(this.privateServicesMock);
                expect(siteMetaDataSpy).not.toHaveBeenCalled();
            });
        });

        describe("quickActions", function(){
            describe("quickActions configuration", function(){
                it("isQuickActionsEnabled - should return if quickActions is enabled or not", function(){
                    expect(mobileSettings.actionBar.isEnabled(this.privateServicesMock)).toEqual(false);
                });

                it("enableQuickActions - should set quickActionsMenuEnabled", function(){
                    var cloned = _.cloneDeep(mockData.rendererModel.siteMetaData);
                    cloned.quickActions.configuration.quickActionsMenuEnabled = true;

                    mobileSettings.actionBar.enable(this.privateServicesMock, true);
                    expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);
                });

                it("enableQuickActions - should throw for illegal input", function(){
                    expect(function(){mobileSettings.enableQuickActions(this.privateServicesMock, null);}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                });

                it("getColorScheme - should get current color scheme", function(){
                    expect(mobileSettings.actionBar.colorScheme.get(this.privateServicesMock)).toEqual("dark");
                });

                it("setColorScheme - should set quickActions color scheme", function(){
                    var cloned = _.cloneDeep(mockData.rendererModel.siteMetaData);
                    cloned.quickActions.colorScheme = "light";

                    mobileSettings.actionBar.colorScheme.set(this.privateServicesMock, "light");
                    expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);
                });

                it("setColorScheme - should throw for illegal input", function(){
                    expect(function(){mobileSettings.setQuickActionsColorScheme(this.privateServicesMock, "aaa");}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                });
            });

            describe("actions configuration", function(){
                it("getQuickActionsEnabledMap - should return a map with all actions values and if they are enabled", function(){
                    //spyOn(this.dal, 'get').and.callFake(fakeDalGet);
                    expect(mobileSettings.actionBar.actions.getEnabled(this.privateServicesMock)).toEqual({
                        "navigationMenu": true,
                        "phone": true,
                        "email": false,
                        "address": true,
                        "socialLinks": false
                    });
                });

                it("enableActions - should enable actions according to map", function(){
                    mockData.rendererModel.siteMetaData.quickActions.configuration.navigationMenuEnabled = false;
                    mockData.rendererModel.siteMetaData.quickActions.configuration.socialLinksEnabled = true;

                    mobileSettings.actionBar.actions.enable(this.privateServicesMock, {
                        navigationMenu: false,
                        socialLinks: true
                    });
                    expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, mockData.rendererModel.siteMetaData);
                });

                it("enableActions - should throw for illegal input", function(){
                    expect(function(){mobileSettings.actionBar.actions.enable(this.privateServicesMock, {"illegal": "input"});}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                    expect(function(){mobileSettings.actionBar.actions.enable(this.privateServicesMock, {"phone": "illegalInput"});}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                });

                it("getActions - should return a map with all actions and their values", function(){
                    expect(mobileSettings.actionBar.actions.get(this.privateServicesMock)).toEqual({
                        "phone": "53543",
                        "email": "fe@bgbg.com",
                        "address": "kjhkjugbik 54654",
                        "socialLinks": {facebook : 'http://facebook.com/', twitter : '', pinterest : '', google_plus : '', tumblr : '', blogger : '', linkedin : '', youtube : '', vimeo : '', flickr : ''}
                    });
                });

                it("updateActions - should update actions according to map", function(){
                    var cloned = mockData.rendererModel.siteMetaData;
                    cloned.contactInfo.phone = "111";
                    cloned.contactInfo.email = "a@gmail.com";
                    cloned.quickActions.socialLinks = [{"id": "twitter", "url": "http:\/\/twitter.com\/"}];

                    mobileSettings.actionBar.actions.update(this.privateServicesMock, {
                        "phone": "111",
                        "email": "a@gmail.com",
                        "socialLinks": {
                            facebook : '',
                            twitter : 'http://twitter.com/'
                        }
                    });
                    expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);
                });

                it("updateActions - should throw for illegal input", function(){
                    expect(function(){mobileSettings.actionBar.actions.update(this.privateServicesMock, {"illegal": "input"});}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                    expect(function(){mobileSettings.actionBar.actions.enable(this.privateServicesMock, {"phone": 123});}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                    expect(function(){mobileSettings.actionBar.actions.enable(this.privateServicesMock, {"socialLinks": {"illegal": "input"}});}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                    expect(function(){mobileSettings.actionBar.actions.enable(this.privateServicesMock, {"socialLinks": {"facebook": true}});}.bind(this)).toThrow();
                    expect(siteMetaDataSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe("preloader", function(){
            it("preloader.isEnabled - should return if preloader is enabled or not", function(){
                expect(mobileSettings.preloader.isEnabled(this.privateServicesMock)).toEqual(false);
            });

            it("preloader.enable - should set preloader enabled", function(){
                var cloned = mockData.rendererModel.siteMetaData;
                cloned.preloader.enabled = true;

                mobileSettings.preloader.enable(this.privateServicesMock, true);
                expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);
            });

            it("preloader.enable - should throw for illegal input", function(){
                expect(function(){mobileSettings.preloader.enable(this.privateServicesMock, null);}.bind(this)).toThrow();
                expect(siteMetaDataSpy).not.toHaveBeenCalled();
            });

            it("getPreloaderProperty - should get the current value for the given property", function(){
                expect(mobileSettings.preloader.get(this.privateServicesMock)).toEqual({
                    companyName: "comp",
                    logoUrl: "d8af22_296c7d5da09c4607ba9d2991b520b627.jpg"
                });
            });

            it("preloader.update - should set preloader single or multiple properties", function(){
                var cloned = mockData.rendererModel.siteMetaData;
                cloned.contactInfo.companyName = "otherComp";

                mobileSettings.preloader.update(this.privateServicesMock, {
                    companyName: "otherComp"
                });
                expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);

                cloned.contactInfo.companyName = "yetAnotherCompany";
                cloned.preloader.uri = "uri.jpg";
                mobileSettings.preloader.update(this.privateServicesMock, {
                    companyName: "yetAnotherCompany",
                    logoUrl: "uri.jpg"
                });
                expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);
            });

            it("preloader.update - should throw for illegal input", function(){
                expect(function(){mobileSettings.preloader.update(this.privateServicesMock, {"mockProp": "mockValue"});}.bind(this)).toThrow();
                expect(siteMetaDataSpy).not.toHaveBeenCalled();
            });
        });

        describe("optimizedView", function(){
            it("isMobileOptimizedViewOn - should return if mobileOptimized is enabled or not", function(){
                expect(mobileSettings.isOptimized(this.privateServicesMock)).toEqual(true);
            });

            it("enableOptimizedView - should set preloader enabled", function(){
                var cloned = mockData.rendererModel.siteMetaData;
                cloned.adaptiveMobileOn = false;

                mobileSettings.enableOptimizedView(this.privateServicesMock, false);
                expect(siteMetaDataSpy).toHaveBeenCalledWith(this.privateServicesMock, siteMetadata.PROPERTY_NAMES.SITE_META_DATA, cloned);
            });

            it("enableOptimizedView - should throw for illegal input", function(){
                expect(function(){mobileSettings.enableOptimizedView(this.privateServicesMock, null);}.bind(this)).toThrow();
                expect(siteMetaDataSpy).not.toHaveBeenCalled();
            });
        });

    });
});
