define(['utils', 'testUtils', 'lodash', 'tpa/utils/sitePages'], function (utils, testUtils, _, sitePages) {
    'use strict';

    var siteMenu;
    var siteData;
    var BASE_URL = 'http://baseUrl';

    describe('sitePages', function () {
        beforeEach(function(){
            siteData = testUtils.mockFactory.mockSiteData();
            siteData.getDataByQuery = function (query) {
                    if (query === 'MAIN_MENU') {
                        return '';
                    }
                    return {
                        title: 'title',
                        hidePage: false,
                        pageId: 'pageId',
                        tpaPageId: 'tpaPageId',
                        pageUriSEO: 'pageId'
                    };

                };

            siteData.getMainPageId = jasmine.createSpy('getMainPageId').and.returnValue('pageId2');
            siteData.getClientSpecMap = jasmine.createSpy('getClientSpecMap').and.returnValue({});
            siteData.urlFormatModel = {format: 'slash'};
            siteData.currentUrl = utils.urlUtils.parseUrl(BASE_URL);
        });

        describe('getSitePagesInfoData', function () {
            it('should return all sites pages', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [],
                        link: {
                            pageId: {
                                id: 'pageId1'
                            }
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: {
                                id: '#pageId2'
                            }
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page3',
                        link: {
                            pageId: {
                                id: '#pageId3'
                            }
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesInfoData(siteData);
                expect(pages.length).toBe(3);
                expect(pages[0].hide).toBe(false);
                expect(pages[0].id).toBe('pageId1');
                expect(pages[0].title).toBe('page1');
                expect(pages[0].url).toBeUndefined();
            });

            it('should specify for each page if it is the main page', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'subPageOfPage1',
                                link: {
                                    pageId: {
                                        id: 'subPageId'
                                    }
                                }
                            }
                        ],
                        link: {
                            pageId: 'pageId1'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: {
                                id: '#pageId2'
                            }
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page3',
                        link: {
                            pageId: {
                                id: '#pageId3'
                            }
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesInfoData(siteData);

                expect(pages[0].isHomepage).toBe(false);
                expect(pages[0].subPages[0].isHomepage).toBe(false);
                expect(pages[1].isHomepage).toBe(true);
                expect(pages[2].isHomepage).toBe(false);
            });

            it('should return main page for subPage', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'subPageOfPage1',
                                link: {
                                    pageId: {
                                        id: 'subPageId'
                                    }
                                }
                            }
                        ],
                        link: {
                            pageId: 'pageId1'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: '#pageId2'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page3',
                        link: {
                            pageId: '#pageId3'
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                siteData.getMainPageId.and.returnValue('subPageId');
                var pages = sitePages.getSitePagesInfoData(siteData);

                expect(pages[0].isHomepage).toBe(false);
                expect(pages[0].subPages[0].isHomepage).toBe(true);
                expect(pages[1].isHomepage).toBe(false);
                expect(pages[2].isHomepage).toBe(false);
            });

            it('should return site sub pages when site has menuItems', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [],
                        link: {
                            pageId: 'pageId1'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: '#pageId2'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        items: [
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'page4',
                                link: {
                                    pageId: {
                                        id: 'pageId4'
                                    }
                                }
                            }
                        ],
                        label: 'page3'
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesInfoData(siteData);
                expect(pages.length).toBe(3);
                var subPages = pages[2].subPages;
                expect(subPages.length).toBe(1);
                expect(subPages[0].id).toBe('pageId4');
            });

            it('should return site sub pages', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [],
                        link: {
                            pageId: 'pageId1'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: '#pageId2'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        items: [
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'page4',
                                link: {
                                    pageId: {
                                        id: 'pageId4'
                                    }
                                }
                            }
                        ],
                        label: 'page3',
                        link: {
                            pageId: '#pageId3'
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesInfoData(siteData);
                expect(pages.length).toBe(3);
                var subPages = pages[2].subPages;
                expect(subPages.length).toBe(1);
                expect(subPages[0].id).toBe('pageId4');
            });

            it('should remove # from site id', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [],
                        link: {
                            pageId: {
                                id: 'pageId1'
                            }
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: {
                                id: '#pageId2'
                            }
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        items: [],
                        label: 'page3',
                        link: {
                            pageId: {
                                id: '#pageId3'
                            }
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesInfoData(siteData);
                expect(pages.length).toBe(3);
                expect(pages[0].id).toBe('pageId1');
                expect(pages[1].id).toBe('pageId2');
                expect(pages[2].id).toBe('pageId3');
            });

            describe('when filterHideFromMenuPages is true', function () {

                it('should remove pages with hideFormMenu flag true', function () {
                    siteData.getClientSpecMap.and.returnValue({
                        1: {
                            widgets: {
                                widget1: {
                                    appPage: {
                                        id: 'product_page',
                                        hideFromMenu: true
                                    }
                                }
                            }
                        }
                    });
                    siteMenu = [
                        {
                            isVisible: true,
                            isVisibleMobile: true,
                            label: 'page1',
                            items: [],
                            link: {
                                type: 'PageLink',
                                pageId: {
                                    id: 'pageId1',
                                    tpaApplicationId: 1,
                                    tpaPageId: 'product_page'
                                }
                            }
                        }
                    ];
                    spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                    var pages = sitePages.getSitePagesInfoData(siteData, {filterHideFromMenuPages: true});
                    expect(pages.length).toBe(0);
                });

                it('should not remove pages with hideFormMenu flag false', function () {
                    siteData.getClientSpecMap.and.returnValue({
                        1: {
                            widgets: {
                                widget1: {
                                    appPage: {
                                        id: 'product_page',
                                        hideFromMenu: false
                                    }
                                }
                            }
                        }
                    });
                    siteMenu = [
                        {
                            isVisible: true,
                            isVisibleMobile: true,
                            label: 'page1',
                            items: [],
                            link: {
                                type: 'PageLink',
                                pageId: {
                                    id: 'pageId1',
                                    tpaApplicationId: 1,
                                    tpaPageId: 'product_page'
                                }
                            }
                        }
                    ];
                    spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                    var pages = sitePages.getSitePagesInfoData(siteData, {filterHideFromMenuPages: true});
                    expect(pages.length).toBe(1);
                });

                it('should not remove links which are not to pages', function () {
                    siteMenu = [
                        {
                            'id': 'dataItem-iqca7vii',
                            'label': 'New Link',
                            'isVisible': true,
                            'isVisibleMobile': true,
                            'items': [],
                            'link': {
                                'type': 'AnchorLink',
                                'anchorDataId': 'SCROLL_TO_TOP',
                                'pageId': {
                                    'type': 'Document',
                                    'id': 'SITE_STRUCTURE'
                                },
                                'id': 'dataItem-iqca80xb'
                            }
                        },
                        {
                            'id': 'dataItem-iqcan9vz',
                            'label': 'Menu Header',
                            'isVisible': true,
                            'isVisibleMobile': true,
                            'items': [],
                            'link': null
                        }
                    ];
                    spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                    var pages = sitePages.getSitePagesInfoData(siteData, {filterHideFromMenuPages: true});
                    expect(pages.length).toBe(2);
                });
            });

        });

        describe('getSitePagesData', function () {
            it('should return site full pages data', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [],
                        link: {
                            pageId: 'pageId1'
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesData(siteData);
                expect(pages[0].title).toBe('title');
                expect(pages[0].pageId).toBe('pageId');
                expect(pages[0].tpaPageId).toBe('tpaPageId');
            });

            it('should return site sub pages data', function () {
                siteMenu = [
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page1',
                        items: [],
                        link: {
                            pageId: 'pageId1'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        label: 'page2',
                        items: [],
                        link: {
                            pageId: '#pageId2'
                        }
                    },
                    {
                        isVisible: true,
                        isVisibleMobile: true,
                        items: [
                            {
                                isVisible: true,
                                isVisibleMobile: true,
                                label: 'page4',
                                link: {
                                    pageId: 'pageId4'
                                }
                            }
                        ],
                        label: 'page3',
                        link: {
                            pageId: '#pageId3'
                        }
                    }
                ];
                spyOn(utils.menuUtils, 'getSiteMenuWithoutRenderedLinks').and.returnValue(siteMenu);

                var pages = sitePages.getSitePagesData(siteData);
                expect(pages.length).toBe(4);
            });
        });
    });

    describe('getSitePagesInfoData - when includePagesUrl is true', function() {
        var mockSiteData;
        beforeEach(function() {
            mockSiteData = testUtils.mockFactory.mockSiteData();

            mockSiteData.getClientSpecMap = jasmine.createSpy('getClientSpecMap').and.returnValue({});
            mockSiteData.getClientSpecMap.and.returnValue({});
            mockSiteData.urlFormatModel = {format: 'slash'};
            spyOn(mockSiteData, 'getExternalBaseUrl').and.returnValue(BASE_URL);

            mockSiteData.addPageWithDefaults('cfvg');
            mockSiteData.mock.pageData({'id': 'cfvg', 'title': 'Page 4', 'pageUriSEO': 'page4'});

            mockSiteData.addPageWithDefaults('cjg9');
            mockSiteData.mock.pageData({'id': 'cjg9', 'title': 'Page 2', 'pageUriSEO': 'page2'});

            mockSiteData.mock.basicMenuItemData({id: 'bmi89b', label: 'Page 4', link: '#j4e', items: ['#bmi1vx9']});
            mockSiteData.mock.basicMenuItemData({id: 'bmi1vx9', label: 'Contact', link: '#1gjr', items: []});

            mockSiteData.mock.basicMenuItemData({id: 'bmi1fj6', label: 'Header', items: ['#bmi1wwb', '#bmizfs']});
            mockSiteData.mock.basicMenuItemData({id: 'bmi1wwb', label: 'Scroll to Bottom', link: '#1us0', items: []});
            mockSiteData.mock.basicMenuItemData({id: 'bmizfs', label: 'Web Address', link: '#1ykv', items: []});

            mockSiteData.mock.customMenuData({items: ['#bmi89b', '#bmi1fj6']});
            mockSiteData.mock.pageLinkData({id: 'j4e', pageId: '#cfvg'});
            mockSiteData.mock.pageLinkData({id: '1gjr', pageId: '#cjg9'});

            mockSiteData.mock.anchorLinkData({id: '1us0', anchorName: 'Scroll to Bottom', pageId: '#1gjr', anchorDataId: 'SCROLL_TO_BOTTOM'});
            mockSiteData.mock.externalLinkData({id: '1ykv', url: 'http://www.ynet.co.il', target: '_blank'});
        });

        it('should add url only to pages data based on base url given in options', function() {
            var pages = sitePages.getSitePagesInfoData(mockSiteData, {includePagesUrl: true, baseUrl: 'http://maya'});
            var expectedPages = [
                {
                    'title': 'Page 4',
                    'id': 'cfvg',
                    'hide': false,
                    'subPages': [
                        {
                            'title': 'Contact',
                            'id': 'cjg9',
                            'hide': false,
                            'isHomepage': false,
                            'url': 'http://maya/page2'
                        }
                    ],
                    'isHomepage': false,
                    'url': 'http://maya/page4'
                },
                {
                    'subPages': [
                        {
                            'title': 'Scroll to Bottom',
                            'id': '1gjr',
                            'hide': false,
                            'isHomepage': false
                        },
                        {
                            'title': 'Web Address',
                            'id': undefined,
                            'hide': false,
                            'isHomepage': false
                        }
                    ],
                    'isHomepage': false
                }
            ];
            expect(pages).toEqual(expectedPages);
        });

        it('should add url to all pages data based on public site url', function() {
            var expectedPages = [
                {
                    'title': 'Page 4',
                    'id': 'cfvg',
                    'hide': false,
                    'subPages': [
                        {
                            'title': 'Contact',
                            'id': 'cjg9',
                            'hide': false,
                            'isHomepage': false,
                            'url': BASE_URL + '/page2'
                        }
                    ],
                    'isHomepage': false,
                    'url': BASE_URL + '/page4'
                },
                {
                    'subPages': [
                        {
                            'title': 'Scroll to Bottom',
                            'id': '1gjr',
                            'hide': false,
                            'isHomepage': false
                        },
                        {
                            'title': 'Web Address',
                            'id': undefined,
                            'hide': false,
                            'isHomepage': false
                        }
                    ],
                    'isHomepage': false
                }
            ];

            var pages = sitePages.getSitePagesInfoData(mockSiteData, {includePagesUrl: true});
            expect(pages).toEqual(expectedPages);
        });
    });
});
