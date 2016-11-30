define(['lodash', 'testUtils', 'coreUtils', 'siteUtils/core/menuUtils', 'siteUtils/core/SiteData'], function (_, testUtils, coreUtils, menuUtils, SiteData) {
    'use strict';
    var MOBILE_MAX_WIDTH = 600;

    describe('SiteData', function () {
        describe("isMobileView", function () {
            beforeEach(function () {
                this.mockData = {
                    pagesData: {},
                    serviceModel: {
                        staticMediaUrl: 'static-media-url'
                    },
                    currentUrl: {
                        query: {}
                    },
                    requestModel: {
                        userAgent: ''
                    },
                    rendererModel: {
                        siteMetaData: {
                            adaptiveMobileOn: false
                        },
                        siteInfo: {
                            siteId: '1'
                        }
                    }
                };
            });
            var masterPageDataWithMobileStructure = {
                structure: {
                    "mobileComponents": [
                        {
                            "type": "Container",
                            "layout": {
                                "width": 320,
                                "height": 548,
                                "x": 0,
                                "y": 0,
                                "scale": 1,
                                "rotationInDegrees": 0,
                                "anchors": [
                                    {
                                        "distance": 0,
                                        "topToTop": 518,
                                        "originalValue": 518,
                                        "type": "BOTTOM_TOP",
                                        "locked": true,
                                        "targetComponent": "PAGES_CONTAINER"
                                    }
                                ]
                            },
                            "styleId": "hc2",
                            "id": "SITE_HEADER",
                            "components": [
                                {
                                    "type": "Component",
                                    "layout": {
                                        "width": 280,
                                        "height": 183,
                                        "x": 20,
                                        "y": 70,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 17,
                                                "topToTop": 200,
                                                "originalValue": 270,
                                                "type": "BOTTOM_TOP",
                                                "locked": true,
                                                "targetComponent": "Cntnr1"
                                            }
                                        ]
                                    },
                                    "styleId": "wp3",
                                    "id": "WPht2-qa1",
                                    "dataQuery": "#cyt8",
                                    "skin": "wysiwyg.viewer.skins.photo.CirclePhoto",
                                    "propertyQuery": "WPht2-qa1",
                                    "componentType": "wysiwyg.viewer.components.WPhoto"
                                },
                                {
                                    "type": "Container",
                                    "layout": {
                                        "width": 280,
                                        "height": 170,
                                        "x": 20,
                                        "y": 270,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 10,
                                                "topToTop": 180,
                                                "originalValue": 450,
                                                "type": "BOTTOM_TOP",
                                                "locked": true,
                                                "targetComponent": "WRchTxt0-xxc"
                                            }
                                        ]
                                    },
                                    "styleId": "Cntnr1_hkdk5fwf",
                                    "id": "Cntnr1",
                                    "components": [
                                        {
                                            "type": "Component",
                                            "layout": {
                                                "width": 230,
                                                "height": 150,
                                                "x": 25,
                                                "y": 10,
                                                "scale": 1,
                                                "rotationInDegrees": 0,
                                                "anchors": [
                                                    {
                                                        "distance": 10,
                                                        "topToTop": 10,
                                                        "originalValue": 170,
                                                        "type": "BOTTOM_PARENT",
                                                        "locked": true,
                                                        "targetComponent": "Cntnr1"
                                                    }
                                                ]
                                            },
                                            "styleId": "txtNew",
                                            "id": "WRchTxt14-c9z",
                                            "dataQuery": "#cysm",
                                            "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                                            "componentType": "wysiwyg.viewer.components.WRichText"
                                        }
                                    ],
                                    "skin": "wysiwyg.viewer.skins.area.LiftedShadowArea",
                                    "componentType": "mobile.core.components.Container"
                                },
                                {
                                    "type": "Component",
                                    "layout": {
                                        "width": 300,
                                        "height": 40,
                                        "x": 20,
                                        "y": 488,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 10,
                                                "topToTop": 50,
                                                "originalValue": 508,
                                                "type": "BOTTOM_TOP",
                                                "locked": true,
                                                "targetComponent": "ScrnWdthCntnr2"
                                            }
                                        ]
                                    },
                                    "styleId": "lb1",
                                    "id": "LnkBr0-d6p",
                                    "dataQuery": "#cydf",
                                    "skin": "wysiwyg.viewer.skins.LinkBarNoBGSkin",
                                    "propertyQuery": "mobile_ckij",
                                    "componentType": "wysiwyg.viewer.components.LinkBar"
                                },
                                {
                                    "type": "Container",
                                    "layout": {
                                        "width": 320,
                                        "height": 10,
                                        "x": 0,
                                        "y": 538,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 0,
                                                "topToTop": 508,
                                                "originalValue": 518,
                                                "type": "BOTTOM_PARENT",
                                                "locked": true,
                                                "targetComponent": "SITE_HEADER"
                                            }
                                        ]
                                    },
                                    "styleId": "sc3",
                                    "id": "ScrnWdthCntnr2",
                                    "components": [],
                                    "skin": "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                                    "componentType": "wysiwyg.viewer.components.ScreenWidthContainer"
                                },
                                {
                                    "type": "Component",
                                    "layout": {
                                        "width": 50,
                                        "height": 50,
                                        "x": 250,
                                        "y": 10,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 10,
                                                "topToTop": 60,
                                                "originalValue": 70,
                                                "type": "BOTTOM_TOP",
                                                "locked": true,
                                                "targetComponent": "WPht2-qa1"
                                            }
                                        ]
                                    },
                                    "styleId": "tm1",
                                    "id": "TINY_MENU",
                                    "dataQuery": "#MAIN_MENU",
                                    "skin": "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                    "componentType": "wysiwyg.viewer.components.mobile.TinyMenu"
                                },
                                {
                                    "type": "Component",
                                    "layout": {
                                        "width": 280,
                                        "height": 25,
                                        "x": 20,
                                        "y": 450,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 13,
                                                "topToTop": 40,
                                                "originalValue": 493,
                                                "type": "BOTTOM_TOP",
                                                "locked": true,
                                                "targetComponent": "LnkBr0-d6p"
                                            }
                                        ]
                                    },
                                    "styleId": "txtNew",
                                    "id": "WRchTxt0-xxc",
                                    "dataQuery": "#clac",
                                    "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                                    "componentType": "wysiwyg.viewer.components.WRichText"
                                }
                            ],
                            "skin": "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                            "componentType": "wysiwyg.viewer.components.HeaderContainer"
                        },
                        {
                            "type": "Container",
                            "layout": {
                                "width": 320,
                                "height": 71,
                                "x": 0,
                                "y": 1857,
                                "scale": 1,
                                "rotationInDegrees": 0,
                                "anchors": [
                                    {
                                        "distance": 0,
                                        "topToTop": 2195,
                                        "originalValue": 2353,
                                        "type": "BOTTOM_PARENT",
                                        "locked": true,
                                        "targetComponent": "masterPage"
                                    }
                                ]
                            },
                            "styleId": "fc2",
                            "id": "SITE_FOOTER",
                            "components": [
                                {
                                    "type": "Component",
                                    "layout": {
                                        "width": 300,
                                        "height": 40,
                                        "x": 20,
                                        "y": 17,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 14,
                                                "topToTop": 17,
                                                "originalValue": 71,
                                                "type": "BOTTOM_PARENT",
                                                "locked": true,
                                                "targetComponent": "SITE_FOOTER"
                                            }
                                        ]
                                    },
                                    "styleId": "lb1",
                                    "id": "LnkBr1",
                                    "dataQuery": "#cmm5",
                                    "skin": "wysiwyg.viewer.skins.LinkBarNoBGSkin",
                                    "propertyQuery": "mobile_c13ng",
                                    "componentType": "wysiwyg.viewer.components.LinkBar"
                                }
                            ],
                            "skin": "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                            "componentType": "wysiwyg.viewer.components.FooterContainer"
                        },
                        {
                            "type": "Container",
                            "layout": {
                                "width": 320,
                                "height": 1294,
                                "x": 0,
                                "y": 548,
                                "scale": 1,
                                "rotationInDegrees": 0,
                                "anchors": [
                                    {
                                        "distance": 15,
                                        "topToTop": 1677,
                                        "originalValue": 2195,
                                        "type": "BOTTOM_TOP",
                                        "locked": true,
                                        "targetComponent": "SITE_FOOTER"
                                    }
                                ]
                            },
                            "styleId": "pc2",
                            "id": "PAGES_CONTAINER",
                            "components": [
                                {
                                    "type": "Container",
                                    "layout": {
                                        "width": 320,
                                        "height": 1294,
                                        "x": 0,
                                        "y": 0,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [
                                            {
                                                "distance": 0,
                                                "topToTop": 0,
                                                "originalValue": 2402,
                                                "type": "BOTTOM_PARENT",
                                                "locked": true,
                                                "targetComponent": "PAGES_CONTAINER"
                                            }
                                        ]
                                    },
                                    "styleId": "null",
                                    "id": "SITE_PAGES",
                                    "components": [],
                                    "skin": "wysiwyg.viewer.skins.PageGroupSkin",
                                    "propertyQuery": "SITE_PAGES",
                                    "componentType": "wysiwyg.viewer.components.PageGroup"
                                }
                            ],
                            "skin": "wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen",
                            "componentType": "wysiwyg.viewer.components.PagesContainer"
                        }
                    ]
                }
            };

            it('should return false for mobile view when there is no mobile structure', function () {
                this.mockData.pagesData = {
                    masterPage: {
                        structure: {}
                    }
                };
                var site = new SiteData(this.mockData);
                expect(site.isMobileView()).toEqual(false);
            });

            it("should return undefined for mobile view when master page isn't loaded yet", function () {
                var site = new SiteData(this.mockData);
                expect(site.isMobileView()).toBeUndefined();
            });

            it('should return false for mobile view when mobile optimized view is off', function () {
                this.mockData.pagesData = {masterPage: masterPageDataWithMobileStructure};
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isMobileDevice").and.returnValue(true);
                expect(site.isMobileView()).toEqual(false);
            });

            it('should return true for mobile view when mobile optimized view is on', function () {
                this.mockData.pagesData = {masterPage: masterPageDataWithMobileStructure};
                this.mockData.rendererModel.siteMetaData.adaptiveMobileOn = true;
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isMobileDevice").and.returnValue(true);
                expect(site.isMobileView()).toEqual(true);
            });

            it('should return true for mobile view when query param showMobileView is true', function () {
                this.mockData.pagesData = {masterPage: masterPageDataWithMobileStructure};
                this.mockData.rendererModel.siteMetaData.adaptiveMobileOn = false;
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isMobileDevice").and.returnValue(false);
                site.currentUrl.query.showmobileview = 'true';

                var result = site.isMobileView();

                expect(result).toEqual(true);
            });
        });

        describe("setRootNavigationInfo", function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .addPageWithData('popup1', {isPopup: true});

            });
            it("should set page and master page info if overriding true", function () {
                var info = {pageId: 'page1', aa: 'aa'};
                var clonedInfo = _.clone(info);

                this.siteData.setRootNavigationInfo(info, true);

                expect(this.siteData.getExistingRootNavigationInfo('page1')).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo(this.siteData.MASTER_PAGE_ID)).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo('popup1')).toBeUndefined();
            });

            it("should set page and master page info if overriding false", function () {
                var info = {pageId: 'page1', aa: 'aa'};
                var clonedInfo = _.clone(info);

                this.siteData.setRootNavigationInfo(info, false);

                expect(this.siteData.getExistingRootNavigationInfo('page1')).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo(this.siteData.MASTER_PAGE_ID)).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo('popup1')).toBeUndefined();
            });

            it("should set the primary/current page if overriding true", function () {
                var info = {pageId: 'page1', aa: 'aa', title: 'pageTitle'};

                this.siteData.setRootNavigationInfo(info, true);

                expect(this.siteData.getPrimaryPageId()).toBe('page1');
                expect(this.siteData.getCurrentUrlPageId()).toBe('page1');
            });

            it("should set the primary/current page if overriding false", function () {
                var info = {pageId: 'page1', aa: 'aa', title: 'pageTitle'};

                this.siteData.setRootNavigationInfo(info, false);

                expect(this.siteData.getPrimaryPageId()).toBe('page1');
                expect(this.siteData.getCurrentUrlPageId()).toBe('page1');
            });


            it("should set popup info only, if overriding true and passed a popup info", function () {
                var primaryInfo = {pageId: 'page1', aa: 'aa'};
                var clonedPrimaryInfo = _.clone(primaryInfo);
                this.siteData.setRootNavigationInfo(primaryInfo);

                var info = {pageId: 'popup1', aa: 'aa'};
                var clonedInfo = _.clone(info);

                this.siteData.setRootNavigationInfo(info, true);

                expect(this.siteData.getExistingRootNavigationInfo('popup1')).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo('page1')).toEqual(clonedPrimaryInfo);
                expect(this.siteData.getExistingRootNavigationInfo(this.siteData.MASTER_PAGE_ID)).toEqual(clonedPrimaryInfo);
            });

            it("should set popup info only if overriding false and passed a popup info", function () {
                var primaryInfo = {pageId: 'page1', aa: 'aa'};
                var clonedPrimaryInfo = _.clone(primaryInfo);
                this.siteData.setRootNavigationInfo(primaryInfo);

                var info = {pageId: 'popup1', aa: 'aa'};
                var clonedInfo = _.clone(info);

                this.siteData.setRootNavigationInfo(info, false);

                expect(this.siteData.getExistingRootNavigationInfo('popup1')).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo('page1')).toEqual(clonedPrimaryInfo);
                expect(this.siteData.getExistingRootNavigationInfo(this.siteData.MASTER_PAGE_ID)).toEqual(clonedPrimaryInfo);
            });

            it("should set current popup id and leave the primary page id as is", function () {
                var primaryInfo = {pageId: 'page1', aa: 'aa'};

                this.siteData.setRootNavigationInfo(primaryInfo);
                expect(this.siteData.getPrimaryPageId()).toBe('page1');
                expect(this.siteData.getCurrentPopupId()).toBeFalsy();

                var info = {pageId: 'popup1', aa: 'aa'};

                this.siteData.setRootNavigationInfo(info);
                expect(this.siteData.getPrimaryPageId()).toBe('page1');
                expect(this.siteData.getCurrentPopupId()).toBe('popup1');
            });

            it("should set page and master page (primary page) and remove popup page id overriding passed as true", function () {
                var primaryInfo = {pageId: 'page1', aa: 'aa'};
                this.siteData.setRootNavigationInfo(primaryInfo);
                var info = {pageId: 'popup1', aa: 'aa'};
                this.siteData.setRootNavigationInfo(info);

                var newPrimaryInfo = {pageId: 'page2', aa: 'bb'};
                this.siteData.setRootNavigationInfo(newPrimaryInfo, true);

                expect(this.siteData.getCurrentPopupId()).toBeNull();
                expect(this.siteData.getExistingRootNavigationInfo('page2')).toEqual(newPrimaryInfo);
                expect(this.siteData.getExistingRootNavigationInfo(this.siteData.MASTER_PAGE_ID)).toEqual(newPrimaryInfo);
            });

            it("should set page and master page and leave popup as is if overriding false and passed a primary page info", function () {
                var primaryInfo = {pageId: 'page1', aa: 'aa'};
                this.siteData.setRootNavigationInfo(primaryInfo);
                var info = {pageId: 'popup1', aa: 'aa'};
                var clonedInfo = _.clone(info);
                this.siteData.setRootNavigationInfo(info);

                var newPrimaryInfo = {pageId: 'page2', aa: 'bb'};
                this.siteData.setRootNavigationInfo(newPrimaryInfo, false);

                expect(this.siteData.getExistingRootNavigationInfo('popup1')).toEqual(clonedInfo);
                expect(this.siteData.getExistingRootNavigationInfo('page2')).toEqual(newPrimaryInfo);
                expect(this.siteData.getExistingRootNavigationInfo(this.siteData.MASTER_PAGE_ID)).toEqual(newPrimaryInfo);
            });
            //I think we need that shit only for the site bg data.. if so, need to fix site bg data
            it("should clear cache when page is changed", function () {
                this.siteData.addPageWithDefaults('page1')
                    .addPageWithDefaults('page2')
                    .addData({id: 'link1', 'payload': '1'}, 'page1')
                    .addData({id: 'link1', 'payload': '2'}, 'page2')
                    .addData({type: 'Image', id: 'data1', link: 'link1'}, 'masterPage');

                this.siteData.setRootNavigationInfo({pageId: 'page1'});
                expect(this.siteData.getDataByQuery('data1').link.payload).toBe('1');

                this.siteData.setRootNavigationInfo({pageId: 'page2'});
                expect(this.siteData.getDataByQuery('data1').link.payload).toBe('2');
            });
        });

        describe('getFocusedRootId', function () {

            it("should return result of siteData.getPrimaryPageId", function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1'),
                    siteData = new SiteData(mockSiteModel);

                expect(siteData.getFocusedRootId()).toBe(siteData.getPrimaryPageId());
            });


            it('should return current page if there is no popup page', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('currentPage'),
                    siteData = new SiteData(mockSiteModel);

                expect(siteData.getFocusedRootId()).toBe('currentPage');
            });

            it('should return popup if there is a popup page', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page')
                    .addPopupPageWithDefaults('popup')
                    .setCurrentPage('popup'),
                    siteData = new SiteData(mockSiteModel);

                expect(siteData.getFocusedRootId()).toBe('popup');
            });

        });

        describe("isTabletDevice", function () {
            beforeEach(function () {
                this.mockData = {
                    serviceModel: {
                        staticMediaUrl: 'static-media-url'
                    },
                    currentUrl: {
                        query: {}
                    },
                    requestModel: {
                        userAgent: ''
                    }
                };
            });

            it('should return false if isApple device and not tablet device', function () {
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(true);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(MOBILE_MAX_WIDTH - 10);
                expect(site.isTabletDevice()).toEqual(false);
            });

            it('should return false if isApple device and not tablet device', function () {
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(true);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(MOBILE_MAX_WIDTH - 10);
                expect(site.isTabletDevice()).toEqual(false);
            });

            it('should return true if isApple device and tablet device (ipad)', function () {
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(true);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(MOBILE_MAX_WIDTH + 10);
                spyOn(site.mobile, "isPortrait").and.returnValue(false);
                expect(site.isTabletDevice()).toEqual(true);
            });

            it('should return false if device is mobile and not tablet (has touch screen and has width less then max tablet width)', function () {
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(MOBILE_MAX_WIDTH - 10);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                expect(site.isTabletDevice()).toEqual(false);
            });

            it('should return true if isNewChromeOnAndroid device and tablet device', function () {
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(false);
                spyOn(site.mobile, "isNewChromeOnAndroid").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(MOBILE_MAX_WIDTH + 10);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "isPortrait").and.returnValue(false);
                expect(site.isTabletDevice()).toEqual(true);
            });

            it('should return true if device is tablet but not apple or android', function () {
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(false);
                spyOn(site.mobile, "isNewChromeOnAndroid").and.returnValue(false);
                spyOn(site.mobile, "getDevicePixelRatio").and.returnValue(1);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(700);
                spyOn(site.mobile, "isPortrait").and.returnValue(false);
                expect(site.isTabletDevice()).toEqual(true);
            });

            it('should return true if device is iPad pro, which is bigger than normal tablet size', function () {
                this.mockData.requestModel.userAgent = "Mozilla/5.0 (iPad; CPU OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 Safari/601.1";
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(true);
                spyOn(site.mobile, "isNewChromeOnAndroid").and.returnValue(false);
                spyOn(site.mobile, "getDevicePixelRatio").and.returnValue(2);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(1366);
                spyOn(site.mobile, "isPortrait").and.returnValue(true);
                expect(site.isTabletDevice()).toEqual(true);
            });

            it('should return false if device is an Android phone', function () {
                this.mockData.requestModel.userAgent = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(false);
                spyOn(site.mobile, "isNewChromeOnAndroid").and.returnValue(true);
                spyOn(site.mobile, "getDevicePixelRatio").and.returnValue(1);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(MOBILE_MAX_WIDTH - 10);
                spyOn(site.mobile, "isPortrait").and.returnValue(true);
                expect(site.isTabletDevice()).toEqual(false);
            });

            it('should return true if device is an a big Android tablet', function () {
                this.mockData.requestModel.userAgent = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Safari/535.19";
                var site = new SiteData(this.mockData);
                spyOn(site.mobile, "isAppleMobileDevice").and.returnValue(false);
                spyOn(site.mobile, "isNewChromeOnAndroid").and.returnValue(true);
                spyOn(site.mobile, "getDevicePixelRatio").and.returnValue(1);
                spyOn(site.mobile, "isTouchScreen").and.returnValue(true);
                spyOn(site.mobile, "getScreenWidth").and.returnValue(1600);
                spyOn(site.mobile, "isPortrait").and.returnValue(true);
                expect(site.isTabletDevice()).toEqual(true);
            });
        });

        describe('service topology ', function () {
            beforeEach(function () {
                this.mockData = {
                    pagesData: {},
                    serviceTopology: {
                        "serverName": "app33.aus",
                        "cacheKillerVersion": "1",
                        "scriptsDomainUrl": "http://static.parastorage.com/",
                        "usersScriptsRoot": "http://static.parastorage.com/services/wix-users/2.388.0",
                        "biServerUrl": "http://frog.wix.com/",
                        "userServerUrl": "http://users.wix.com/",
                        "billingServerUrl": "http://premium.wix.com/",
                        "mediaRootUrl": "http://static.wixstatic.com/",
                        "logServerUrl": "http://frog.wix.com/plebs",
                        "monitoringServerUrl": "http://TODO/",
                        "usersClientApiUrl": "https://users.wix.com/wix-users",
                        "publicStaticBaseUri": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "basePublicUrl": "http://www.wix.com/",
                        "postLoginUrl": "http://www.wix.com/my-account",
                        "postSignUpUrl": "http://www.wix.com/new/account",
                        "baseDomain": "wix.com",
                        "staticMediaUrl": "http://static.wixstatic.com/media",
                        "staticAudioUrl": "http://storage.googleapis.com/static.wixstatic.com/mp3",
                        "emailServer": "http://assets.wix.com/common-services/notification/invoke",
                        "blobUrl": "http://static.parastorage.com/wix_blob",
                        "htmlEditorUrl": "http://editor.wix.com/html",
                        "siteMembersUrl": "https://users.wix.com/wix-sm",
                        "scriptsLocationMap": {
                            "bootstrap": "http://static.parastorage.com/services/bootstrap/2.920.0",
                            "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                            "wix-insta-template": "http://static.parastorage.com/services/experiments/wix-insta-template/1.8.0",
                            "automation": "http://static.parastorage.com/services/automation/1.23.0",
                            "ecommerce": "http://static.parastorage.com/services/ecommerce/1.170.0",
                            "wixapps": "http://static.parastorage.com/services/wixapps/2.385.0",
                            "web": "http://static.parastorage.com/services/web/2.920.0",
                            "numericstepper": "http://static.parastorage.com/services/experiments/numericstepper/1.11.0",
                            "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                            "tpa": "http://static.parastorage.com/services/tpa/2.801.0",
                            "ck-editor": "http://static.parastorage.com/services/ck-editor/1.82.0",
                            "subscribeform": "http://static.parastorage.com/services/experiments/subscribeform/1.20.0",
                            "ecomfeedback": "http://static.parastorage.com/services/experiments/ecomfeedback/1.12.0",
                            "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                            "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.11.0",
                            "backtotopbutton": "http://static.parastorage.com/services/experiments/backtotopbutton/1.12.0",
                            "langs": "http://static.parastorage.com/services/langs/2.408.0",
                            "verifypremium": "http://static.parastorage.com/services/experiments/verifypremium/1.8.0",
                            "core": "http://static.parastorage.com/services/core/2.920.0",
                            "mobilequicktour": "http://static.parastorage.com/services/experiments/mobilequicktour/1.15.0",
                            "editormenu": "http://static.parastorage.com/services/experiments/editormenu/1.154.0",
                            "skins": "http://static.parastorage.com/services/skins/2.920.0"
                        },
                        "developerMode": false,
                        "userFilesUrl": "http://static.parastorage.com/",
                        "staticHTMLComponentUrl": "http://www.412remodeling.com.usrfiles.com/",
                        "secured": false,
                        "ecommerceCheckoutUrl": "https://www.safer-checkout.com/",
                        "premiumServerUrl": "https://premium.wix.com/",
                        "appRepoUrl": "http://assets.wix.com/wix-lists-ds-webapp",
                        "publicStaticsUrl": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "staticDocsUrl": "http://media.wix.com/ugd"
                    },
                    currentUrl: {
                        query: {}
                    },
                    rendererModel: {
                        metaSiteId: "173f28a5-8ac6-4324-8166-f02b583d5fed",
                        languageCode: "en",
                        siteMetaData: {
                            adaptiveMobileOn: false
                        },
                        siteInfo: {
                            siteId: '1'
                        }
                    },
                    requestModel: {
                        userAgent: ''
                    }
                };
            });
            it("staticMediaUrl", function () {
                var site = new SiteData(this.mockData);
                expect(site.getStaticMediaUrl()).toEqual('http://static.wixstatic.com/media');
            });
            it("getServiceTopologyProperty(prop) should retrieve properties from the serviceTopology", function () {
                var site = new SiteData(this.mockData);
                expect(site.getServiceTopologyProperty('serverName')).toEqual('app33.aus');
                expect(site.getServiceTopologyProperty('scriptsDomainUrl')).toEqual('http://static.parastorage.com/');
            });
            it("metaSiteId", function () {
                var site = new SiteData(this.mockData);
                expect(site.getMetaSiteId()).toBe("173f28a5-8ac6-4324-8166-f02b583d5fed");
            });
            it("getCurrentLanguage()", function () {
                var site = new SiteData(this.mockData);
                expect(site.getLanguageCode()).toBe("en");
            });
            it("Should return a default image for empty url", function () {
                var site = new SiteData(this.mockData);
                expect(site.getMediaFullStaticUrl('')).toEqual(site.getStaticMediaUrl() + '/');
            });
            it("Should return a default image for empty url", function () {
                var site = new SiteData(this.mockData);
                expect(site.getMediaFullStaticUrl('mock')).toEqual(site.getStaticMediaUrl() + '/mock');
            });
        });

        describe("clientSpecMap", function () {
            beforeEach(function () {
                this.mockData = {
                    pagesData: {},
                    rendererModel: {
                        "metaSiteId": "6dda33ff-ca4e-405f-8f71-e54ec22a72eb",
                        "siteInfo": {
                            "applicationType": "HtmlWeb",
                            "documentType": "UGC",
                            "siteId": "bac442c8-b7fd-4bd1-ac7e-096fec2fc800",
                            "siteTitleSEO": "reactest"
                        },
                        "clientSpecMap": {
                            "1": {
                                "type": "wixapps",
                                "applicationId": 1,
                                "appDefinitionId": "e4c4a4fb-673d-493a-9ef1-661fa3823ad7",
                                "datastoreId": "138d5d48-8fae-d05a-109b-550066a8aaea",
                                "packageName": "menu",
                                "state": "Initialized",
                                "widgets": {
                                    "1660c5f3-b183-4e6c-a873-5d6bbd918224": {
                                        "widgetId": "1660c5f3-b183-4e6c-a873-5d6bbd918224",
                                        "defaultHeight": 100,
                                        "defaultWidth": 400
                                    }
                                }
                            },
                            "2": {
                                "type": "appbuilder",
                                "applicationId": 2,
                                "appDefinitionId": "3d590cbc-4907-4cc4-b0b1-ddf2c5edf297",
                                "instanceId": "138d5d48-9339-6ae5-6f96-1812d38e1e6d",
                                "state": "Initialized"
                            },
                            "13": {
                                "type": "sitemembers",
                                "applicationId": 13,
                                "collectionType": "Open",
                                "smtoken": "189e3da1bd292f9f2c0b4416bcdaca87e158bbe737ef42f18981c21a37df63c6e8f9a27f4dd396d2df894d5ea08d39414a3c0dfde0bfc8610fd3c84c73b3dbce2bd813f55c080b39df8d1f3e174e7a7bd53abe24f14950c5a58a3c54ebd917f3",
                                "smcollectionId": "1c0ce759-060e-4bff-8e3d-7208a9e6dda2"
                            },
                            "15": {
                                "type": "ecommerce",
                                "applicationId": 15,
                                "appDefinitionId": "55a88716-958a-4b91-b666-6c1118abdee4",
                                "magentoStoreId": "46922251",
                                "packageName": "ecommerce",
                                "widgets": {
                                    "30b4a102-7649-47d9-a60b-bfd89dcca135": {
                                        "widgetId": "30b4a102-7649-47d9-a60b-bfd89dcca135",
                                        "defaultHeight": 585,
                                        "defaultWidth": 960
                                    },
                                    "adbeffec-c7df-4908-acd0-cdd23155a817": {
                                        "widgetId": "adbeffec-c7df-4908-acd0-cdd23155a817",
                                        "defaultHeight": 150,
                                        "defaultWidth": 500
                                    },
                                    "f72a3898-8520-4b60-8cd6-24e4e20d483d": {
                                        "widgetId": "f72a3898-8520-4b60-8cd6-24e4e20d483d",
                                        "defaultHeight": 600,
                                        "defaultWidth": 840
                                    },
                                    "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c": {
                                        "widgetId": "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c",
                                        "defaultHeight": 50,
                                        "defaultWidth": 200
                                    },
                                    "cd54a28f-e3c9-4522-91c4-15e6dd5bc514": {
                                        "widgetId": "cd54a28f-e3c9-4522-91c4-15e6dd5bc514",
                                        "defaultHeight": 50,
                                        "defaultWidth": 200
                                    },
                                    "c614fb79-dbec-4ac7-b9b0-419669fadecc": {
                                        "widgetId": "c614fb79-dbec-4ac7-b9b0-419669fadecc",
                                        "defaultHeight": 50,
                                        "defaultWidth": 200
                                    },
                                    "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a": {
                                        "widgetId": "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a",
                                        "defaultHeight": 150,
                                        "defaultWidth": 800
                                    },
                                    "ae674d74-b30b-47c3-aba0-0bd220e25a69": {
                                        "widgetId": "ae674d74-b30b-47c3-aba0-0bd220e25a69",
                                        "defaultHeight": 150,
                                        "defaultWidth": 220
                                    },
                                    "fbd55289-7136-4c7d-955c-3088974c1f93": {
                                        "widgetId": "fbd55289-7136-4c7d-955c-3088974c1f93",
                                        "defaultHeight": 150,
                                        "defaultWidth": 220
                                    }
                                },
                                "state": "Initialized"
                            },
                            "16": {
                                "type": "public",
                                "applicationId": 16,
                                "appDefinitionId": "13016589-a9eb-424a-8a69-46cb05ce0b2c",
                                "appDefinitionName": "Comments",
                                "instance": "YHr7cugLVYcxhsYWJmjzN86u6xHRY10IDHC9vF5VpGk.eyJpbnN0YW5jZUlkIjoiMTM4ZTdlNjAtOTYwOC00MjVhLTYzZTEtODg3NzIzMzQxYWNjIiwic2lnbkRhdGUiOiIyMDE0LTEyLTExVDExOjAxOjA1LjAzNloiLCJ1aWQiOiJkYzZmYWJiZC0wNTU0LTRjN2YtYTcwMi0wYjcyNjY2OTEyNzciLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS4yNTQvNjUyMzgiLCJkZW1vTW9kZSI6ZmFsc2V9",
                                "sectionPublished": true,
                                "sectionMobilePublished": false,
                                "sectionSeoEnabled": true,
                                "widgets": {
                                    "130165ba-4eeb-4a87-3121-a3cf2a86d2ca": {
                                        "widgetUrl": "https://comments.wixplus.com/",
                                        "widgetId": "130165ba-4eeb-4a87-3121-a3cf2a86d2ca",
                                        "refreshOnWidthChange": true,
                                        "mobileUrl": "https://comments.wixplus.com/mobile.html",
                                        "published": true,
                                        "mobilePublished": true,
                                        "seoEnabled": true
                                    }
                                },
                                "appRequirements": {
                                    "requireSiteMembers": false
                                },
                                "installedAtDashboard": true,
                                "permissions": {
                                    "revoked": false
                                }
                            },
                            "17": {
                                "type": "public",
                                "applicationId": 17,
                                "appDefinitionId": "12aacf69-f3fb-5334-2847-e00a8f13c12f",
                                "appDefinitionName": "Form Builder",
                                "instance": "0nZahKoo33uNHKBELL1E8JTa_e21yxyZj8N1nqs-2Aw.eyJpbnN0YW5jZUlkIjoiMTM5MWUxYWItMzQ3OC0yY2U2LWZmMWEtMzhiN2VlODE1MmEwIiwic2lnbkRhdGUiOiIyMDE0LTEyLTExVDExOjAxOjA1LjAzNloiLCJ1aWQiOiJkYzZmYWJiZC0wNTU0LTRjN2YtYTcwMi0wYjcyNjY2OTEyNzciLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS4yNTQvNjUyMzgiLCJkZW1vTW9kZSI6ZmFsc2V9",
                                "sectionPublished": true,
                                "sectionMobilePublished": false,
                                "sectionSeoEnabled": true,
                                "widgets": {
                                    "12aacf69-f3be-4d15-c1f5-e10b8281822e": {
                                        "widgetUrl": "http://www.123contactform.com/wix.php",
                                        "widgetId": "12aacf69-f3be-4d15-c1f5-e10b8281822e",
                                        "refreshOnWidthChange": true,
                                        "mobileUrl": "http://www.123contactform.com/wix.php?forcemobile=1",
                                        "published": true,
                                        "mobilePublished": true,
                                        "seoEnabled": true
                                    }
                                },
                                "appRequirements": {
                                    "requireSiteMembers": false
                                },
                                "installedAtDashboard": true,
                                "permissions": {
                                    "revoked": true
                                }
                            }
                        },
                        "premiumFeatures": [],
                        "geo": "ISR",
                        "languageCode": "en",
                        "previewMode": false,
                        "userId": "dc6fabbd-0554-4c7f-a702-0b7266691277",
                        "siteMetaData": {
                            "contactInfo": {
                                "companyName": "",
                                "phone": "",
                                "fax": "",
                                "email": "",
                                "address": ""
                            },
                            "adaptiveMobileOn": false,
                            "preloader": {
                                "enabled": false
                            },
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
                            }
                        }
                    },
                    serviceTopology: {
                        "serverName": "app33.aus",
                        "cacheKillerVersion": "1",
                        "scriptsDomainUrl": "http://static.parastorage.com/",
                        "usersScriptsRoot": "http://static.parastorage.com/services/wix-users/2.388.0",
                        "biServerUrl": "http://frog.wix.com/",
                        "userServerUrl": "http://users.wix.com/",
                        "billingServerUrl": "http://premium.wix.com/",
                        "mediaRootUrl": "http://static.wixstatic.com/",
                        "logServerUrl": "http://frog.wix.com/plebs",
                        "monitoringServerUrl": "http://TODO/",
                        "usersClientApiUrl": "https://users.wix.com/wix-users",
                        "publicStaticBaseUri": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "basePublicUrl": "http://www.wix.com/",
                        "postLoginUrl": "http://www.wix.com/my-account",
                        "postSignUpUrl": "http://www.wix.com/new/account",
                        "baseDomain": "wix.com",
                        "staticMediaUrl": "http://static.wixstatic.com/media",
                        "staticAudioUrl": "http://storage.googleapis.com/static.wixstatic.com/mp3",
                        "emailServer": "http://assets.wix.com/common-services/notification/invoke",
                        "blobUrl": "http://static.parastorage.com/wix_blob",
                        "htmlEditorUrl": "http://editor.wix.com/html",
                        "siteMembersUrl": "https://users.wix.com/wix-sm",
                        "scriptsLocationMap": {
                            "bootstrap": "http://static.parastorage.com/services/bootstrap/2.920.0",
                            "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                            "wix-insta-template": "http://static.parastorage.com/services/experiments/wix-insta-template/1.8.0",
                            "automation": "http://static.parastorage.com/services/automation/1.23.0",
                            "ecommerce": "http://static.parastorage.com/services/ecommerce/1.170.0",
                            "wixapps": "http://static.parastorage.com/services/wixapps/2.385.0",
                            "web": "http://static.parastorage.com/services/web/2.920.0",
                            "numericstepper": "http://static.parastorage.com/services/experiments/numericstepper/1.11.0",
                            "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                            "tpa": "http://static.parastorage.com/services/tpa/2.801.0",
                            "ck-editor": "http://static.parastorage.com/services/ck-editor/1.82.0",
                            "subscribeform": "http://static.parastorage.com/services/experiments/subscribeform/1.20.0",
                            "ecomfeedback": "http://static.parastorage.com/services/experiments/ecomfeedback/1.12.0",
                            "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                            "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.11.0",
                            "backtotopbutton": "http://static.parastorage.com/services/experiments/backtotopbutton/1.12.0",
                            "langs": "http://static.parastorage.com/services/langs/2.408.0",
                            "verifypremium": "http://static.parastorage.com/services/experiments/verifypremium/1.8.0",
                            "core": "http://static.parastorage.com/services/core/2.920.0",
                            "mobilequicktour": "http://static.parastorage.com/services/experiments/mobilequicktour/1.15.0",
                            "editormenu": "http://static.parastorage.com/services/experiments/editormenu/1.154.0",
                            "skins": "http://static.parastorage.com/services/skins/2.920.0"
                        },
                        "developerMode": false,
                        "userFilesUrl": "http://static.parastorage.com/",
                        "staticHTMLComponentUrl": "http://www.412remodeling.com.usrfiles.com/",
                        "secured": false,
                        "ecommerceCheckoutUrl": "https://www.safer-checkout.com/",
                        "premiumServerUrl": "https://premium.wix.com/",
                        "appRepoUrl": "http://assets.wix.com/wix-lists-ds-webapp",
                        "publicStaticsUrl": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "staticDocsUrl": "http://media.wix.com/ugd"
                    },
                    currentUrl: {
                        query: {}
                    },
                    siteHeader: {
                        userId: "3f2c8f4e-7a01-4c26-8d43-5ee33e3d1e07"
                    },
                    requestModel: {
                        userAgent: ''
                    }
                };
            });
            it("getClientSpecMapEntryByType(type) should return all entries with the given type", function () {
                var site = new SiteData(this.mockData);
                var siteMembersEntries = site.getClientSpecMapEntriesByType('sitemembers');
                var siteMembersEntry = siteMembersEntries.length && siteMembersEntries[0];
                expect(siteMembersEntry).toEqual(this.mockData.rendererModel.clientSpecMap[13]);
            });
            it("getSMToken", function () {
                var site = new SiteData(this.mockData);
                var smToken = site.getSMToken();
                expect(smToken).toBe(this.mockData.rendererModel.clientSpecMap[13].smtoken);
            });
            it("getUserId - should return userId from siteHeader", function () {
                var site = new SiteData(this.mockData);
                var userId = site.getUserId();
                expect(userId).toBe("3f2c8f4e-7a01-4c26-8d43-5ee33e3d1e07");
            });
        });

        describe("SiteData.getSiteWidth()", function () {
            var site;
            beforeEach(function () {
                this.mockData = testUtils.mockFactory.mockSiteModel();
            });
            it("should be 320 for mobile", function () {
                this.mockData.rendererModel.siteMetaData.adaptiveMobileOn = true;
                site = new SiteData(this.mockData);
                spyOn(site, "isMobileView").and.returnValue(true);
                expect(site.getSiteWidth()).toBe(320);
            });
            it("should be 520 for facebook sites", function () {
                this.mockData.rendererModel.siteInfo.applicationType = "HtmlFacebook";
                site = new SiteData(this.mockData);
                expect(site.getSiteWidth()).toBe(520);
            });
            it("should be 980 otherwise", function () {
                site = new SiteData(this.mockData);
                expect(site.getSiteWidth()).toBe(980);
            });
            it("should retrieve site width from master page if exists", function () {
                this.mockData = testUtils.mockFactory.mockSiteModel()
                    .addData({id: 'masterPage', renderModifiers: {siteWidth: 999}}, 'masterPage');

                site = new SiteData(this.mockData);
                expect(site.getSiteWidth()).toBe(999);
            });
        });

        describe("Site Title & Meta tags", function () {

            beforeEach(function () {
                this.mockData = testUtils.mockFactory.mockSiteModel({
                    pagesData: {
                        'masterPage': {
                            data: {
                                'document_data': {
                                    'home': {'title': "Home"},
                                    'page1': {'title': 'Page 1', 'pageTitleSEO': 'hello'},
                                    'page2': {'title': 'Page2'}
                                }
                            }
                        }
                    },
                    currentUrl: {query: {}},
                    rendererModel: {
                        siteMetaData: {
                            adaptiveMobileOn: false
                        },
                        siteInfo: {
                            applicationType: 'UGC',
                            siteTitleSEO: 'Global Site Title',
                            siteId: '1'
                        }
                    }
                });
            });

            it("should show the dynamic page title for dynamic pages", function () {
                var siteData = new SiteData(this.mockData);
                spyOn(siteData, 'getCurrentUrlPageId').and.returnValue('page1');
                siteData.addDynamicResponseForUrl('someURL', {
                    title: 'dynamicPageTitle',
                    pageId: 'page1'
                });

                var title = siteData.getCurrentUrlPageTitle();

                expect(title).toBe("dynamicPageTitle");
            });

            it("should show the main site title on the homepage.", function () {
                var siteData = new SiteData(this.mockData);
                spyOn(siteData, 'getCurrentUrlPageId').and.returnValue('home');
                spyOn(siteData, 'getMainPageId').and.returnValue('home');

                var title = siteData.getCurrentUrlPageTitle();

                expect(title).toBe("Global Site Title");
            });

            it("should set the title to the page's custom title, if set by the user.", function () {
                var siteData = new SiteData(this.mockData);
                spyOn(siteData, 'getCurrentUrlPageId').and.returnValue('page1');

                var title = siteData.getCurrentUrlPageTitle();

                expect(title).toBe("hello");
            });

            it("should set the title to be the global site name with the page name if no explicit page title is set", function () {
                var siteData = new SiteData(this.mockData);
                spyOn(siteData, 'getCurrentUrlPageId').and.returnValue('page2');

                var title = siteData.getCurrentUrlPageTitle();

                expect(title).toBe("Global Site Title | Page2");
            });
        });

        describe("Pages SEO Meta tags", function () {
            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('sv_addRobotsIndexingMetaTag');
                this.mockData = {
                    pagesData: {
                        'masterPage': {
                            data: {
                                'document_data': {
                                    'mainPage': {},
                                    'page1': {
                                        'title': 'Page 1',
                                        'pageTitleSEO': 'hello page1',
                                        'descriptionSEO': 'the seo description of page1',
                                        'indexable': true
                                    },
                                    'page2': {
                                        'title': 'Page2',
                                        'pageTitleSEO': 'page2 title',
                                        'descriptionSEO': 'page2 desc',
                                        'metaKeywordsSEO': "melon, mango",
                                        'metaOgTags': [{'property': 'og:image', 'content': 'aaa.jpg'}],
                                        'indexable': false
                                    }
                                }
                            }
                        }
                    },
                    serviceModel: {},
                    currentUrl: {query: {}},
                    rendererModel: {
                        siteMetaData: {
                            adaptiveMobileOn: false
                        },
                        siteInfo: {
                            applicationType: 'UGC',
                            siteTitleSEO: 'Global Site Title',
                            siteId: '1'
                        }
                    },
                    requestModel: {
                        userAgent: ''
                    }
                };
            });

            it("should get the description & keywords SEO meta tag for a given page", function () {
                var siteData = new SiteData(this.mockData);
                var pageId = "page2";
                var descriptionMetaTag = "page2 desc";
                var keywordsMetaTag = "melon, mango";
                var ogTags = [{property: 'og:image', content: 'aaa.jpg'}];
                var robotsMetaTag = 'noindex';
                var defaultRobotsMetaTag = 'index';

                var metaTags = siteData.getPageSEOMetaData(pageId);

                expect(metaTags).toBeDefined();
                expect(_.toArray(metaTags).length).toBe(4);
                expect(metaTags.description).toBe(descriptionMetaTag);
                expect(metaTags.keywords).toBe(keywordsMetaTag);
                expect(metaTags.ogTags).toEqual(ogTags);
                expect(metaTags.robotIndex).toEqual(robotsMetaTag);

                pageId = "mainPage";
                metaTags = siteData.getPageSEOMetaData(pageId);
                expect(metaTags).toBeDefined();
                expect(_.keys(metaTags).length).toBe(4);
                expect(metaTags.description).not.toBeDefined();
                expect(metaTags.keywords).not.toBeDefined();
                expect(metaTags.ogTags).not.toBeDefined();
                expect(metaTags.robotIndex).toEqual(defaultRobotsMetaTag);
            });

            it("should get the description & keywords SEO meta tag for current page", function () {
                var siteData = new SiteData(this.mockData);
                var pageId = "";
                siteData.setRootNavigationInfo({pageId: 'page2'});
                var descriptionMetaTag = "page2 desc";
                var keywordsMetaTag = "melon, mango";
                var robotMetaTag = 'noindex';

                var metaTags = siteData.getPageSEOMetaData(pageId);

                expect(metaTags).toBeDefined();
                expect(_.toArray(metaTags).length).toBe(4);
                expect(metaTags.description).toBe(descriptionMetaTag);
                expect(metaTags.keywords).toBe(keywordsMetaTag);
                expect(metaTags.robotIndex).toEqual(robotMetaTag);
            });
        });

        describe('isDebugMode and hasDebugQueryParam', function () {

            beforeEach(function () {
                this.mockData = {
                    pagesData: {},
                    serviceTopology: {
                        "serverName": "app33.aus",
                        "cacheKillerVersion": "1",
                        "scriptsDomainUrl": "http://static.parastorage.com/",
                        "usersScriptsRoot": "http://static.parastorage.com/services/wix-users/2.388.0",
                        "biServerUrl": "http://frog.wix.com/",
                        "userServerUrl": "http://users.wix.com/",
                        "billingServerUrl": "http://premium.wix.com/",
                        "mediaRootUrl": "http://static.wixstatic.com/",
                        "logServerUrl": "http://frog.wix.com/plebs",
                        "monitoringServerUrl": "http://TODO/",
                        "usersClientApiUrl": "https://users.wix.com/wix-users",
                        "publicStaticBaseUri": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "basePublicUrl": "http://www.wix.com/",
                        "postLoginUrl": "http://www.wix.com/my-account",
                        "postSignUpUrl": "http://www.wix.com/new/account",
                        "baseDomain": "wix.com",
                        "staticMediaUrl": "http://static.wixstatic.com/media",
                        "staticAudioUrl": "http://storage.googleapis.com/static.wixstatic.com/mp3",
                        "emailServer": "http://assets.wix.com/common-services/notification/invoke",
                        "blobUrl": "http://static.parastorage.com/wix_blob",
                        "htmlEditorUrl": "http://editor.wix.com/html",
                        "siteMembersUrl": "https://users.wix.com/wix-sm",
                        "scriptsLocationMap": {
                            "bootstrap": "http://static.parastorage.com/services/bootstrap/2.920.0",
                            "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                            "wix-insta-template": "http://static.parastorage.com/services/experiments/wix-insta-template/1.8.0",
                            "automation": "http://static.parastorage.com/services/automation/1.23.0",
                            "ecommerce": "http://static.parastorage.com/services/ecommerce/1.170.0",
                            "wixapps": "http://static.parastorage.com/services/wixapps/2.385.0",
                            "web": "http://static.parastorage.com/services/web/2.920.0",
                            "numericstepper": "http://static.parastorage.com/services/experiments/numericstepper/1.11.0",
                            "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                            "tpa": "http://static.parastorage.com/services/tpa/2.801.0",
                            "ck-editor": "http://static.parastorage.com/services/ck-editor/1.82.0",
                            "subscribeform": "http://static.parastorage.com/services/experiments/subscribeform/1.20.0",
                            "ecomfeedback": "http://static.parastorage.com/services/experiments/ecomfeedback/1.12.0",
                            "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                            "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.11.0",
                            "backtotopbutton": "http://static.parastorage.com/services/experiments/backtotopbutton/1.12.0",
                            "langs": "http://static.parastorage.com/services/langs/2.408.0",
                            "verifypremium": "http://static.parastorage.com/services/experiments/verifypremium/1.8.0",
                            "core": "http://static.parastorage.com/services/core/2.920.0",
                            "mobilequicktour": "http://static.parastorage.com/services/experiments/mobilequicktour/1.15.0",
                            "editormenu": "http://static.parastorage.com/services/experiments/editormenu/1.154.0",
                            "skins": "http://static.parastorage.com/services/skins/2.920.0"
                        },
                        "developerMode": false,
                        "userFilesUrl": "http://static.parastorage.com/",
                        "staticHTMLComponentUrl": "http://www.412remodeling.com.usrfiles.com/",
                        "secured": false,
                        "ecommerceCheckoutUrl": "https://www.safer-checkout.com/",
                        "premiumServerUrl": "https://premium.wix.com/",
                        "appRepoUrl": "http://assets.wix.com/wix-lists-ds-webapp",
                        "publicStaticsUrl": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "staticDocsUrl": "http://media.wix.com/ugd"
                    },
                    currentUrl: {
                        query: {}
                    },
                    rendererModel: {
                        metaSiteId: "173f28a5-8ac6-4324-8166-f02b583d5fed",
                        languageCode: "en",
                        siteMetaData: {
                            adaptiveMobileOn: false
                        },
                        siteInfo: {
                            siteId: '1'
                        }
                    },
                    requestModel: {
                        userAgent: ''
                    }
                };
            });

            it('should return false if url has no "debug" param', function () {
                var siteData = new SiteData(this.mockData);
                expect(siteData.isDebugMode()).toBeFalsy();
            });

            it('should return false if url has "debug" param, but its value is not "all"', function () {
                this.mockData.currentUrl.query.debug = 'bla';
                var siteData = new SiteData(this.mockData);
                expect(siteData.isDebugMode()).toBeFalsy();
            });

            it('should return true if url has "debug" param, and its value is "all"', function () {
                this.mockData.currentUrl.query.debug = 'all';
                var siteData = new SiteData(this.mockData);
                expect(siteData.isDebugMode()).toBeTruthy();
            });

            it('should return true if url has a non empty "debug" param', function () {
                this.mockData.currentUrl.query.debug = 'platform';
                var siteData = new SiteData(this.mockData);
                expect(siteData.hasDebugQueryParam()).toBeTruthy();
            });

            it('should return true if url has "debug" param and its value is a "all"', function () {
                this.mockData.currentUrl.query.debug = 'all';
                var siteData = new SiteData(this.mockData);
                expect(siteData.hasDebugQueryParam()).toBeTruthy();
            });

            it('should return false if url has no "debug" param', function () {
                var siteData = new SiteData(this.mockData);
                expect(siteData.hasDebugQueryParam()).toBeFalsy();
            });

        });

        describe('functions related to pages', function () {

            beforeEach(function () {
                this.mockData = {
                    publicModel: {
                        pageList: {
                            pages: [{pageId: 'page1'}, {pageId: 'page2'}]
                        }
                    },
                    pagesData: {page1: 'page1data'},
                    serviceTopology: {
                        "serverName": "app33.aus",
                        "cacheKillerVersion": "1",
                        "scriptsDomainUrl": "http://static.parastorage.com/",
                        "usersScriptsRoot": "http://static.parastorage.com/services/wix-users/2.388.0",
                        "biServerUrl": "http://frog.wix.com/",
                        "userServerUrl": "http://users.wix.com/",
                        "billingServerUrl": "http://premium.wix.com/",
                        "mediaRootUrl": "http://static.wixstatic.com/",
                        "logServerUrl": "http://frog.wix.com/plebs",
                        "monitoringServerUrl": "http://TODO/",
                        "usersClientApiUrl": "https://users.wix.com/wix-users",
                        "publicStaticBaseUri": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "basePublicUrl": "http://www.wix.com/",
                        "postLoginUrl": "http://www.wix.com/my-account",
                        "postSignUpUrl": "http://www.wix.com/new/account",
                        "baseDomain": "wix.com",
                        "staticMediaUrl": "http://static.wixstatic.com/media",
                        "staticAudioUrl": "http://storage.googleapis.com/static.wixstatic.com/mp3",
                        "emailServer": "http://assets.wix.com/common-services/notification/invoke",
                        "blobUrl": "http://static.parastorage.com/wix_blob",
                        "htmlEditorUrl": "http://editor.wix.com/html",
                        "siteMembersUrl": "https://users.wix.com/wix-sm",
                        "scriptsLocationMap": {
                            "bootstrap": "http://static.parastorage.com/services/bootstrap/2.920.0",
                            "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                            "wix-insta-template": "http://static.parastorage.com/services/experiments/wix-insta-template/1.8.0",
                            "automation": "http://static.parastorage.com/services/automation/1.23.0",
                            "ecommerce": "http://static.parastorage.com/services/ecommerce/1.170.0",
                            "wixapps": "http://static.parastorage.com/services/wixapps/2.385.0",
                            "web": "http://static.parastorage.com/services/web/2.920.0",
                            "numericstepper": "http://static.parastorage.com/services/experiments/numericstepper/1.11.0",
                            "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                            "tpa": "http://static.parastorage.com/services/tpa/2.801.0",
                            "ck-editor": "http://static.parastorage.com/services/ck-editor/1.82.0",
                            "subscribeform": "http://static.parastorage.com/services/experiments/subscribeform/1.20.0",
                            "ecomfeedback": "http://static.parastorage.com/services/experiments/ecomfeedback/1.12.0",
                            "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                            "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.11.0",
                            "backtotopbutton": "http://static.parastorage.com/services/experiments/backtotopbutton/1.12.0",
                            "langs": "http://static.parastorage.com/services/langs/2.408.0",
                            "verifypremium": "http://static.parastorage.com/services/experiments/verifypremium/1.8.0",
                            "core": "http://static.parastorage.com/services/core/2.920.0",
                            "mobilequicktour": "http://static.parastorage.com/services/experiments/mobilequicktour/1.15.0",
                            "editormenu": "http://static.parastorage.com/services/experiments/editormenu/1.154.0",
                            "skins": "http://static.parastorage.com/services/skins/2.920.0"
                        },
                        "developerMode": false,
                        "userFilesUrl": "http://static.parastorage.com/",
                        "staticHTMLComponentUrl": "http://www.412remodeling.com.usrfiles.com/",
                        "secured": false,
                        "ecommerceCheckoutUrl": "https://www.safer-checkout.com/",
                        "premiumServerUrl": "https://premium.wix.com/",
                        "appRepoUrl": "http://assets.wix.com/wix-lists-ds-webapp",
                        "publicStaticsUrl": "http://static.parastorage.com/services/wix-public/1.109.0",
                        "staticDocsUrl": "http://media.wix.com/ugd"
                    },
                    currentUrl: {
                        query: {}
                    },
                    rendererModel: {
                        metaSiteId: "173f28a5-8ac6-4324-8166-f02b583d5fed",
                        languageCode: "en",
                        siteMetaData: {
                            adaptiveMobileOn: false
                        },
                        siteInfo: {
                            siteId: '1'
                        }
                    },
                    requestModel: {
                        userAgent: ''
                    }
                };
            });
            describe('getAllPageIds', function () {
                it('should return all the pageIds from the publicModel when the publicModel exists', function () {
                    var siteData = new SiteData(this.mockData);
                    var allPageIds = siteData.getAllPageIds();
                    expect(allPageIds).toContain(['page1', 'page2']);
                    expect(allPageIds.length).toBe(2);
                });
                it('should return all the pageIds from the pagesData when there is not publicModel', function () {
                    this.mockData.publicModel = null;
                    var siteData = new SiteData(this.mockData);
                    var allPageIds = siteData.getAllPageIds();
                    expect(allPageIds).toContain(['page1']);
                    expect(allPageIds.length).toBe(1);
                });
            });
            describe('getPagesDataItems', function () {
                it('should return the pages data items for all pages when in the viewer (ie publicModel is present)', function () {
                    var siteData = new SiteData(this.mockData);
                    spyOn(siteData, 'getDataByQuery').and.callFake(function (pageId) {
                        return pageId;
                    });
                    var pagesDataItems = siteData.getPagesDataItems();
                    expect(pagesDataItems).toContain(['page1', 'page2']);
                    expect(pagesDataItems.length).toBe(2);
                });
                it('should return the pages data items for all pages loaded into pagesData when there is no publicModel (i.e. preview)', function () {
                    this.mockData.publicModel = null;
                    var siteData = new SiteData(this.mockData);
                    spyOn(siteData, 'getDataByQuery').and.callFake(function (pageId) {
                        return pageId;
                    });
                    var pagesDataItems = siteData.getPagesDataItems();
                    expect(pagesDataItems).toContain(['page1']);
                });
            });
        });

        function getDataByQueryTests() {
            it('should get components from masterPage only if currentPage is not defined', function () {
                var query = 'data_id';
                var data = {id: query, type: 'Image', src: 'http://barvaz.oger'};
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addData(data, 'masterPage');

                var siteData = new SiteData(siteModel);

                expect(siteData.getDataByQuery(query)).toEqual(data);
            });

            it('should return the data from the current page document_data', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'test_query';
                var expected = {type: 'Image', id: query};
                var pageId = 'testPage';
                siteModel
                    .addPageWithDefaults(pageId)
                    .addData(expected, pageId);

                var siteData = new SiteData(siteModel);

                expect(siteData.getDataByQuery(query, pageId)).toEqual(expected);
                expect(siteData.getDataByQuery(query, pageId, siteData.dataTypes.DATA)).toEqual(expected);
            });

            it('should return the same data from the current page document_data when query starts with # or not', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'test_query';
                var expected = {type: 'Image', id: query};
                var pageId = 'testPage';
                siteModel
                    .addPageWithDefaults(pageId)
                    .addData(expected, pageId);

                var siteData = new SiteData(siteModel);

                expect(siteData.getDataByQuery(query, pageId)).toEqual(siteData.getDataByQuery('#' + query, pageId));
            });

            it('should return empty object when page doesn\'t exist', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'test_query';
                var siteData = new SiteData(siteModel);
                expect(siteData.getDataByQuery(query, 'noExistPageId')).toEqual({});
            });

            it('should return data from masterPage when no pageId was set', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'};
                siteModel.addData(expected, 'masterPage');
                var siteData = new SiteData(siteModel);
                expect(siteData.getDataByQuery(query)).toEqual(expected);
            });

            it('should return data from masterPage when no pageId was set', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'};
                siteModel.addData(expected, 'masterPage');
                var siteData = new SiteData(siteModel);
                expect(siteData.getDataByQuery(query)).toEqual(expected);
            });

            it('should return data from currentPageId when no pageId or masterPage was set', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var pageId = 'newPageId';
                var expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'};
                siteModel
                    .addPageWithDefaults(pageId)
                    .addData(expected, pageId);

                var siteData = new SiteData(siteModel);
                siteData.setRootNavigationInfo({pageId: pageId}, true);

                expect(siteData.getDataByQuery(query)).toEqual(expected);
                expect(siteData.getDataByQuery(query, 'masterPage')).toEqual(expected);
            });

            it('should return properties data only when the properties dataType is set', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var pageId = 'newPageId';
                var expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'};
                siteModel
                    .addPageWithDefaults(pageId)
                    .addProperties(expected, pageId);

                var siteData = new SiteData(siteModel);
                siteData.setRootNavigationInfo({pageId: pageId}, true);

                expect(siteData.getDataByQuery(query)).toBeNull();
                expect(siteData.getDataByQuery(query, pageId, siteData.dataTypes.PROPERTIES)).toEqual(expected);
                expect(siteData.getDataByQuery(query, 'masterPage', siteData.dataTypes.PROPERTIES)).toEqual(expected);
            });

            it('should return theme data only when the theme dataType is set', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var pageId = 'newPageId';
                var expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'};
                siteModel
                    .addPageWithDefaults(pageId)
                    .addCompTheme(expected);

                var siteData = new SiteData(siteModel);

                expect(siteData.getDataByQuery(query)).toBeNull();
                expect(siteData.getDataByQuery(query, pageId, siteData.dataTypes.THEME)).toEqual(expected);
                expect(siteData.getDataByQuery(query, 'masterPage', siteData.dataTypes.THEME)).toEqual(expected);
            });

            it('should return behaviors data only when behaviors dataType is set', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var pageId = 'newPageId';
                var expected = {
                    id: query,
                    type: 'ObsoleteBehaviorsList',
                    items: JSON.parse('[{"action":"screenIn","name":"SpinIn","delay":0,"duration":1.2,"params":{"cycles":2,"direction":"cw"},"targetId":""}]')
                };
                siteModel
                    .addPageWithDefaults(pageId)
                    .addBehaviors(expected, pageId);

                var siteData = new SiteData(siteModel);
                siteData.setRootNavigationInfo({pageId: pageId}, true);

                expect(siteData.getDataByQuery(query)).toBeNull();
                expect(siteData.getDataByQuery(query, pageId, siteData.dataTypes.BEHAVIORS)).toEqual(expected);
                expect(siteData.getDataByQuery(query, 'masterPage', siteData.dataTypes.BEHAVIORS)).toEqual(expected);
            });

            it('should return undefined if the data is not on the currentPage or the masterPage', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var query = 'itemId';
                var pageId = 'newPageId';
                var otherPageId = 'otherPage';
                var expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'};
                siteModel
                    .addPageWithDefaults(pageId)
                    .addPageWithDefaults(otherPageId)
                    .addData(expected, pageId)
                    .addProperties(expected, pageId);

                var siteData = new SiteData(siteModel);
                siteData.setRootNavigationInfo({pageId: pageId}, true);

                expect(siteData.getDataByQuery(query, otherPageId)).toBeNull();
                expect(siteData.getDataByQuery(query, otherPageId, siteData.dataTypes.PROPERTIES)).toBeNull();
            });

            it('should resolve array of refs data', function () {
                var mockFactory = testUtils.mockFactory;
                var imageData = mockFactory.dataMocks.imageData({id: 'image-1'});
                var imageListData = mockFactory.dataMocks.imageList({items: ['image-1']});

                var siteModel = mockFactory.mockSiteModel()
                    .addData(imageData, 'masterPage')
                    .addData(imageListData, 'masterPage');

                var siteData = new SiteData(siteModel);

                var expected = _.assign({}, imageListData, {items: [imageData]});
                expect(siteData.getDataByQuery(imageListData.id)).toEqual(expected);
            });

            it('should return the value of the property when resolving deep array string value', function () {
                var imageListData = {id: 'imageListId', type: 'TestType', items: ['regular value']};
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addData(imageListData, 'masterPage');

                var siteData = new SiteData(siteModel);

                var expected = _.assign({}, imageListData, {items: ['regular value']});
                expect(siteData.getDataByQuery('imageListId')).toEqual(expected);
            });

            it('should return the value of the property when resolving deep object\'s string value', function () {
                var imageListData = {
                    id: 'imageListId', type: 'BasicMenuItem', items: {
                        text: 'regular value'
                    }
                };
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addData(imageListData, 'masterPage');

                var siteData = new SiteData(siteModel);

                var expected = _.assign({}, imageListData, {items: {text: 'regular value'}});
                expect(siteData.getDataByQuery('imageListId')).toEqual(expected);
            });

            it('should resolve refs data', function () {
                var mockFactory = testUtils.mockFactory;
                var linkData = mockFactory.dataMocks.externalLinkData({id: 'link-1'});
                var imageData = mockFactory.dataMocks.imageData({id: 'image-1', link: 'link-1'});
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addData(linkData, 'masterPage')
                    .addData(imageData, 'masterPage');

                var siteData = new SiteData(siteModel);

                var expected = _.assign({}, imageData, {link: linkData});
                expect(siteData.getDataByQuery(imageData.id)).toEqual(expected);
            });

            it('should not resolve refs data if there is no data attached to them', function () {
                var imageListData = {id: 'imageListId', type: 'BasicMenuItem', items: ['#refId']};
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addData(imageListData, 'masterPage');

                var siteData = new SiteData(siteModel);

                var expected = _.clone(imageListData);
                expected.items = [null];
                expect(siteData.getDataByQuery('imageListId')).toEqual(expected);
            });

            it('should resolve deep refs', function () {
                var mockFactory = testUtils.mockFactory;
                var linkData = mockFactory.dataMocks.externalLinkData({id: 'link-1'});
                var mobileImageData = mockFactory.dataMocks.imageData({
                    id: 'mobileImageId',
                    link: 'link-1',
                    src: 'http://shahar.zur'
                });
                var desktopImageData = mockFactory.dataMocks.imageData({
                    id: 'desktopImageId',
                    link: 'link-1',
                    src: 'http://heli.wow'
                });
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addPageWithDefaults('testPage')
                    .addData(linkData)
                    .addData(mobileImageData)
                    .addData(desktopImageData);

                var pageBackgrounds = siteModel.pagesData.masterPage.data.document_data.testPage.pageBackgrounds;
                pageBackgrounds.desktop.ref = '#desktopImageId';
                pageBackgrounds.mobile.ref = '#mobileImageId';

                var siteData = new SiteData(siteModel);

                var pageData = siteData.getDataByQuery('testPage');
                expect(pageData.pageBackgrounds.desktop.ref).toEqual(_.assign({}, desktopImageData, {link: linkData}));
                expect(pageData.pageBackgrounds.mobile.ref).toEqual(_.assign({}, mobileImageData, {link: linkData}));
            });



                it('should get data by query from the current popup', function () {
                    var query = 'itemId',
                        popupId = 'popup1',
                        expected = {id: query, type: 'Image', src: 'http://barvaz.oger.com'},
                        mockSiteModel = testUtils.mockFactory.mockSiteData()
                            .addPageWithDefaults('page1')
                            .addPopupPageWithDefaults(popupId)
                            .addData(expected, popupId)
                            .setCurrentPage(popupId),
                        siteData = new SiteData(mockSiteModel);

                    expect(siteData.getDataByQuery(query, popupId)).toEqual(expected);
                });

        }

        describe('getDataByQuery', getDataByQueryTests);

        describe('resolveData', function () {
            it('should resolve refs data', function () {
                var mockFactory = testUtils.mockFactory;
                var linkData = mockFactory.dataMocks.externalLinkData({id: 'link-1'});
                var imageData = mockFactory.dataMocks.imageData({id: 'image-1', link: 'link-1'});
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addData(linkData, 'masterPage')
                    .addData(imageData, 'masterPage');

                var siteData = new SiteData(siteModel);

                var expected = _.assign({}, imageData, {link: linkData});
                expect(siteData.resolveData(imageData, 'masterPage', siteData.dataTypes.DATA)).toEqual(expected);
            });

            it('should resolve deep refs', function () {
                var mockFactory = testUtils.mockFactory;
                var linkData = mockFactory.dataMocks.externalLinkData({id: 'link-1'});
                var mobileImageData = mockFactory.dataMocks.imageData({
                    id: 'mobileImageId',
                    link: 'link-1',
                    src: 'http://shahar.zur'
                });
                var desktopImageData = mockFactory.dataMocks.imageData({
                    id: 'desktopImageId',
                    link: 'link-1',
                    src: 'http://heli.wow'
                });
                var pageId = 'testPage';
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addPageWithDefaults(pageId)
                    .addData(linkData)
                    .addData(mobileImageData)
                    .addData(desktopImageData);

                var pageBackgrounds = siteModel.pagesData.masterPage.data.document_data.testPage.pageBackgrounds;
                pageBackgrounds.desktop.ref = '#desktopImageId';
                pageBackgrounds.mobile.ref = '#mobileImageId';

                var siteData = new SiteData(siteModel);

                var pageNonResolvedData = siteData.pagesData.masterPage.data.document_data[pageId];
                var pageData = siteData.resolveData(pageNonResolvedData);
                expect(pageData.pageBackgrounds.desktop.ref).toEqual(_.assign({}, desktopImageData, {link: linkData}));
                expect(pageData.pageBackgrounds.mobile.ref).toEqual(_.assign({}, mobileImageData, {link: linkData}));
            });
        });

        describe('renderFlags.isPageProtectionEnabled', function () {
            it('should be false if #isViewerMode returns false', function () {
                var siteData = instantiateSiteDataWithViewerMode(false);
                expect(siteData.renderFlags.isPageProtectionEnabled).toBe(false);
            });

            it('should be true if #isViewerMode returns true', function () {
                var siteData = instantiateSiteDataWithViewerMode(true);
                expect(siteData.renderFlags.isPageProtectionEnabled).toBe(true);
            });

            function instantiateSiteDataWithViewerMode(isViewerMode) {
                SiteData.prototype.currentUrl = {query: {}};
                spyOn(SiteData.prototype, 'isViewerMode').and.returnValue(isViewerMode);
                return new SiteData({});
            }
        });

        describe('getExternalBaseUrl', function () {
            it('should return the externalBaseUrl in the publicModel if it exists', function () {
                this.mockData = {publicModel: {externalBaseUrl: 'mockExternalBaseUrl/mockPath'}};
                var site = new SiteData(this.mockData);
                var externalBaseUrl = site.getExternalBaseUrl();
                expect(externalBaseUrl).toBe('mockExternalBaseUrl/mockPath');
            });
        });

        describe('getMainPagePath', function () {

            it('free site', function () {
                this.mockData = {
                    publicModel: {
                        pageList: {mainPageId: 'mainPage'},
                        externalBaseUrl: 'http://user.wix.com/site'
                    }, serviceTopology: {}, rendererModel: {siteInfo: {}}, requestModel: {cookie: ''}
                };
                var site = new SiteData(this.mockData);
                site.currentUrl = coreUtils.urlUtils.parseUrl(site.publicModel.externalBaseUrl);

                expect(site.getMainPagePath()).toBe('/site');
            });

            it('premium site', function () {
                this.mockData = {
                    publicModel: {
                        pageList: {mainPageId: 'mainPage'},
                        externalBaseUrl: 'http://www.premium.com/'
                    }, serviceTopology: {}, rendererModel: {siteInfo: {}}, requestModel: {cookie: ''}
                };
                var site = new SiteData(this.mockData);
                site.currentUrl = coreUtils.urlUtils.parseUrl(site.publicModel.externalBaseUrl);

                expect(site.getMainPagePath()).toBe('/');
            });

        });

        describe('public model sessionInfo', function () {

            describe('Hub Security Token', function () {
                it('should get the hub security from public model', function () {
                    this.mockData = {publicModel: {sessionInfo: {hs: 'HSNEW'}}};

                    var site = new SiteData(this.mockData);

                    expect(site.getHubSecurityToken()).toBe('HSNEW');
                });
            });

            describe('svSession', function () {
                it('should get the svSession from publicModel sessionInfo', function () {
                    this.mockData = {publicModel: {sessionInfo: {svSession: 'svSession123'}}};

                    var site = new SiteData(this.mockData);

                    expect(site.getSvSession()).toBe('svSession123');
                });
            });

        });

        describe('getRenderedRootsUnderMasterPage', function () {

            it('should return masterPage and current page', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .addPageWithDefaults('page2')
                    .addPopupPageWithDefaults('popup1')
                    .setCurrentPage('page1');

                var siteData = new SiteData(mockSiteModel);

                expect(siteData.getRenderedRootsUnderMasterPage()).toEqual(['masterPage', 'page1']);
            });

            it('should not return ids of popups', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .addPopupPageWithDefaults('popup1')
                    .setCurrentPage('popup1');

                var siteData = new SiteData(mockSiteModel);

                expect(siteData.getRenderedRootsUnderMasterPage()).not.toContain('popup1');
            });

        });

        describe('getPageTitle', function () {
            it('should return the page title if page is already loaded', function () {
                this.mockSiteModel = testUtils.mockFactory.mockSiteModel();
                var pageId = 'someId';
                var pageTitle = 'someTitle';
                var pageData = testUtils.mockFactory.dataMocks.pageData({id: pageId, title: pageTitle});
                this.mockSiteModel.addPageWithData(pageId, pageData);
                var siteData = new SiteData(this.mockSiteModel);

                var result = siteData.getPageTitle(pageId);

                expect(result).toEqual(pageTitle);
            });

            it('should return the page title if page has not been loaded yet', function () {
                this.mockSiteModel = testUtils.mockFactory.mockSiteModel();
                var pageId = 'someId';
                var pageTitle = 'someTitle';
                var currentPublicModel = this.mockSiteModel.publicModel;
                var newPublicModel = _.cloneDeep(currentPublicModel);
                newPublicModel.pageList.pages = newPublicModel.pageList.pages.concat({
                    pageId: pageId,
                    urls: [pageId],
                    title: pageTitle,
                    pageUriSEO: 'somePageUriSeo'
                });
                this.mockSiteModel.updatePublicModel(newPublicModel);
                var siteData = new SiteData(this.mockSiteModel);

                var result = siteData.getPageTitle(pageId);

                expect(result).toEqual(pageTitle);
            });

            it('should return the page title in document services mode', function () {
                this.mockSiteModel = testUtils.mockFactory.mockSiteModel(null, true);
                var pageId = 'someId';
                var pageTitle = 'someTitle';
                var pageData = testUtils.mockFactory.dataMocks.pageData({id: pageId, title: pageTitle});
                this.mockSiteModel.addPageWithData(pageId, pageData);
                var siteData = new SiteData(this.mockSiteModel);

                var result = siteData.getPageTitle(pageId);

                expect(result).toEqual(pageTitle);

            });
        });

        describe('getPagesDataForRmi', function () {

            beforeEach(function () {
                spyOn(menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue([{id:'currentPage', isVisible:true, items:[], label:'mockCurrentTitle', link:{pageId:{id:'currentPage', pageUriSEO:'currentPage'}, type:'pageLink', label:'mockCurrentTitle'}},
                                                                {id:'page1', isVisible:true, items:[], label:'mockPage1Title', link:{pageId:{id:'page1', pageUriSEO:'page1'}, type:'pageLink', label:'mockPage1Title'}}]);
            });

            it('get pages url data -  not on preview - should return urls ', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .setCurrentPage('page1')
                    .addData({id: 'page1', title: 'mockPage1Title', hidePage: true, pageUriSEO: 'page1'}, 'masterPage')
                    .addData({
                        id: 'currentPage',
                        title: 'mockCurrentTitle',
                        hidePage: false,
                        pageUriSEO: 'currentPage'
                    }, 'masterPage');

                expect(mockSiteModel.getPagesDataForRmi()).toEqual({
                    currentPageId: 'page1',
                    baseUrl: 'mockExternalBaseUrl',
                    pagesData: [
                        {id:'currentPage', fullUrl: 'mockExternalBaseUrl', title:'mockCurrentTitle', url:'/currentPage', visible:true},
                        {id:'page1', fullUrl: 'mockExternalBaseUrl#!mockPage1Title/page1', title:'mockPage1Title', url:'/page1', visible:true}
                    ]
                });
            });

            it('get pages url data -  preview - not published ', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData(null, true)
                    .addPageWithDefaults('page1')
                    .setCurrentPage('page1')
                    .addData({id: 'page1', title: 'mockPage1Title', hidePage: true, pageUriSEO: 'page1'}, 'masterPage')
                    .addData({
                        id: 'currentPage',
                        title: 'mockCurrentTitle',
                        hidePage: false,
                        pageUriSEO: 'currentPage'
                    }, 'masterPage');

                expect(mockSiteModel.getPagesDataForRmi()).toEqual({
                    currentPageId: 'page1',
                    baseUrl: '',
                    pagesData: [
                        {id: 'currentPage', fullUrl: '', title: 'mockCurrentTitle', url: '/currentPage', visible: true},
                        {id: 'page1', fullUrl: '', title: 'mockPage1Title', url: '/page1', visible: true}
                    ]
                });
            });

            it('get pages url data -  preview -  published ', function () {
                var mockSiteModel = testUtils.mockFactory.mockSiteData(null, true)
                    .addPageWithDefaults('page1')
                    .setCurrentPage('page1')
                    .addData({id: 'page1', title: 'mockPage1Title', hidePage: true, pageUriSEO: 'page1'}, 'masterPage')
                    .addData({
                        id: 'currentPage',
                        title: 'mockCurrentTitle',
                        hidePage: false,
                        pageUriSEO: 'currentPage'
                    }, 'masterPage');
                mockSiteModel.documentServicesModel.isPublished = true;
                expect(mockSiteModel.getPagesDataForRmi()).toEqual({
                    currentPageId: 'page1',
                    baseUrl: 'http://user.wix.com/example',
                    pagesData: [
                        {id: 'currentPage', fullUrl: 'http://user.wix.com/example', title:'mockCurrentTitle', url:'/currentPage', visible:true},
                        {id: 'page1', fullUrl: 'http://user.wix.com/example#!mockPage1Title/page1', title:'mockPage1Title', url:'/page1', visible:true}
                    ]
                });
            });

        });

        describe('isPlatformAppOnPage', function () {
            it('should return true if app is on this page', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var pageId = siteData.getPrimaryPageId();
                var appId = 'appId';

                siteData.setPagePlatformApp(pageId, appId, true);

                expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeTruthy();
            });

            it('should return false if app is not on any page', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var pageId = siteData.getPrimaryPageId();
                var appId = 'appId';

                expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeFalsy();
            });

            it('should return false if app is not on this page', function () {
                var otherPageId = 'otherPage';
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(otherPageId);
                var pageId = siteData.getPrimaryPageId();
                var appId = 'appId';

                siteData.setPagePlatformApp(otherPageId, appId, true);

                expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeFalsy();
            });
        });
    });
});
