define(['lodash', 'utils', 'testUtils', 'wixCode/handlers/wixCodeHandlers', 'core/siteRender/SiteAspectsSiteAPI'], function(_, utils, testUtils, wixCodeHandlers, SiteAspectsSiteAPI) {
   'use strict';

    describe('wixCode Handlers', function() {

        var siteAPI, siteData;
        var siteMenu = [
            {
                isVisible: true,
                isVisibleMobile: true,
                label: 'page1',
                items: [],
                link: {
                    pageId: {
                        id: 'pageId1',
                        pageUriSEO: 'page1Url'
                    },
                    type: 'PageLink'
                }
            },
            {
                isVisible: true,
                isVisibleMobile: true,
                label: 'page2',
                items: [],
                link: {
                    pageId: {
                        id: 'pageId2',
                        pageUriSEO: 'page2Url'
                    },
                    type: 'PageLink'
                }
            },
            {
                isVisible: true,
                isVisibleMobile: true,
                label: 'page3',
                link: {
                    pageId: {
                        id: 'pageId3',
                        pageUriSEO: 'page3Url'
                    },
                    type: 'PageLink'
                }
            },
            {
                isVisible: true,
                isVisibleMobile: true,
                items: [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'innerHeader',
                        items: [
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'bottom',
                                items: [],
                                link: {
                                    anchorDataId: 'SCROLL_TO_BOTTOM',
                                    pageId: {
                                        id: 'pageId2',
                                        pageUriSEO: 'page2Url'
                                    },
                                    type: 'AnchorLink'
                                }
                            },
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'top',
                                items: [],
                                link: {
                                    anchorDataId: 'SCROLL_TO_TOP',
                                    pageId: {
                                        id: 'pageId2',
                                        pageUriSEO: 'page2Url'
                                    },
                                    type: 'AnchorLink'
                                }
                            }
                        ],
                        link: null
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'someAnchor',
                        items: [],
                        link: {
                            anchorDataId: '#dataItem-ilkmxo9a',
                            pageId: {
                                id: 'pageId2',
                                pageUriSEO: 'page2Url'
                            },
                            type: 'AnchorLink'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'someAnchorOnSamePage',
                        items: [],
                        link: {
                            anchorDataId: {
                                compId:'comp-iljhcbk5',
                                id: 'dataItem-iljhcbk8',
                                name:'Anchor 1'
                            },
                            pageId: {
                                id: 'pageId2',
                                pageUriSEO: 'page2Url'
                            },
                            type: 'AnchorLink'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'ynet',
                        items: [],
                        link: {
                            url: 'http://www.ynet.co.il',
                            type: 'ExternalLink'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'document',
                        items: [],
                        link: {
                            docId: '1234.pdf',
                            render: {
                                href: 'http://media.wix.com/ugd/1234.pdf'
                            },
                            name: 'doc.pdf',
                            type: 'DocumentLink'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'email',
                        items: [],
                        link: {
                            recipient: 'user@wix.com',
                            render: {
                                href: 'mailto:user@wix.com'
                            },
                            type: 'EmailLink'
                        }
                    }
                ],
                label: 'header',
                link: null
            }
        ];

        beforeEach(function() {
            siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults('nqcb6')
                .addPageWithDefaults('c1dmp');
            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            spyOn(siteAPI, 'getPageUrlFor').and.callFake(function(id){
                return 'fullUrlFor' + id;
            });
            spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);
        });


        it('should handle getSiteMenu', function() {
            var callbackFn = jasmine.createSpy('callback');
            wixCodeHandlers.getSiteMenu(siteAPI, {}, callbackFn);
            expect(callbackFn).toHaveBeenCalledWith([
                {
                    $type: 'PAGE',
                    title: 'page1',
                    children: [],
                    url: '/page1Url'
                },
                {
                    $type: 'PAGE',
                    title: 'page2',
                    children: [],
                    url: '/page2Url'
                },
                {
                    $type: 'PAGE',
                    title: 'page3',
                    children: [],
                    url: '/page3Url'
                },
                {
                    $type: 'HEADER',
                    title: 'header',
                    children: [
                        {
                            $type: 'HEADER',
                            title: 'innerHeader',
                            children: [
                                {
                                    $type: 'LINK',
                                    title: 'bottom',
                                    children: [],
                                    url: '/page2Url#bottom'
                                },
                                {
                                    $type: 'LINK',
                                    title: 'top',
                                    children: [],
                                    url: '/page2Url#top'
                                }
                            ]
                        },
                        {
                            $type: 'LINK',
                            title: 'someAnchor',
                            children: [],
                            url: '/page2Url#dataItem-ilkmxo9a'
                        },
                        {
                            $type: 'LINK',
                            title: 'someAnchorOnSamePage',
                            children: [],
                            url: '/page2Url#dataItem-iljhcbk8'
                        },
                        {
                            $type: 'LINK',
                            title: 'ynet',
                            children: [],
                            url: 'http://www.ynet.co.il'
                        },
                        {
                            $type: 'LINK',
                            title: 'document',
                            children: [],
                            url: 'document://1234.pdf'
                        },
                        {
                            $type: 'LINK',
                            title: 'email',
                            children: [],
                            url: 'mailto:user@wix.com'
                        }
                    ]
                }
            ]);
        });

        it('should handle windowBoundingRect', function(){
            var callbackFn = jasmine.createSpy('callback');
            spyOn(SiteAspectsSiteAPI.prototype, 'getDocumentSize').and.returnValue({height: 1000, width: 1000});
            spyOn(SiteAspectsSiteAPI.prototype, 'getSiteScroll').and.returnValue({x: 0, y: 0});
            spyOn(SiteAspectsSiteAPI.prototype, 'getWindowSize').and.returnValue({height: 1000, width: 1000});
            var siteAspectsSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
            wixCodeHandlers.windowBoundingRect(siteAspectsSiteAPI, {}, callbackFn);
            expect(callbackFn).toHaveBeenCalledWith({
                window: {height: 1000, width: 1000},
                document: {height: 1000, width: 1000},
                scroll: {x: 0, y: 0}
            });
        });

        describe('should handle navigateTo', function() {

            var siteAspectsSiteAPI;
            var routerDef = {
                prefix: 'animals',
                appId: '34234',
                config: {
                    routerFunctionName: 'animals',
                    siteMapFunctionName: 'siteMapFunc'
                }
            };

            beforeEach(function() {
                siteData.rendererModel.routers = {
                    configMap: {
                        5: routerDef
                    }
                };
                testUtils.experimentHelper.openExperiments('sv_dpages');
                siteAspectsSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
                spyOn(siteAspectsSiteAPI, 'handleNavigation');
            });

            it('when navigating to a dynamic page link', function() {
                var msg = {
                    data: {
                        type: 'DynamicPageLink',
                        pageId: 'animals/dog'
                    }
                };
                var navigationInfo = {
                    routerDefinition: routerDef,
                    innerRoute: 'dog',
                    pageAdditionalData: 'animals/dog'
                };
                wixCodeHandlers.navigateTo(siteAspectsSiteAPI, msg);
                expect(siteAspectsSiteAPI.handleNavigation).toHaveBeenCalledWith(navigationInfo, '#', true);
            });

            it('when navigating to a page link', function() {
                var msg = {
                    data: {
                        type: 'PageLink',
                        pageId: 'c1dmp'
                    }
                };
                var navigationInfo = {
                    pageId: 'c1dmp'
                };
                wixCodeHandlers.navigateTo(siteAspectsSiteAPI, msg);
                expect(siteAspectsSiteAPI.handleNavigation).toHaveBeenCalledWith(navigationInfo, '#', true);
            });
        });
    });
});
