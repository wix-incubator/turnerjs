define(['lodash', 'testUtils', 'siteUtils/core/menuUtils', 'siteUtils/core/linkRenderer'], function (_, testUtils, menuUtils, linkRenderer) {
    'use strict';

    function setCustomMenuData(siteData) {
        siteData.mock.menuData({items: []});
        siteData.mock.basicMenuItemData({id: 'bmi89b', label: 'Page 4', link: '#j4e', items: ['#bmi1vx9']});
        siteData.mock.basicMenuItemData({id: 'bmi1vx9', label: 'Contact', link: '#1f8h', items: []});
        siteData.mock.basicMenuItemData({id: 'bmi1fj6', label: 'Header', items: ['#bmi1wwb', '#bmizfs']});
        siteData.mock.basicMenuItemData({id: 'bmi1wwb', label: 'Scroll to Bottom', link: '#1us0', items: []});
        siteData.mock.basicMenuItemData({id: 'bmizfs', label: 'Web Address', link: '#1ykv', items: []});
        siteData.mock.basicMenuItemData({id: 'bmicuv', label: 'Email', link: '#1uuk', items: []});
        siteData.mock.customMenuData({items: ["#bmi89b", "#bmi1fj6", "#bmicuv"]});
        siteData.mock.pageLinkData({id: 'j4e', pageId: '#cfvg'});
        siteData.mock.pageLinkData({id: '1gjr', pageId: '#cee5'});
        siteData.mock.pageLinkData({id: '1f8h', pageId: '#c24vq'});
        siteData.mock.anchorLinkData({id: '1us0', anchorName: 'Scroll to Bottom', pageId: '#1gjr', anchorDataId: 'SCROLL_TO_BOTTOM'});
        siteData.mock.externalLinkData({id: '1ykv', url: 'http://www.ynet.co.il', target: '_blank'});
        siteData.mock.emailLinkData({id: '1uuk', recipient: 'shaila@wix.com', subject: 'This is a subject'});
    }

    function addPages(siteData) {
        siteData.addPageWithDefaults('mainPage');
        siteData.mock.pageData({"id": "mainPage", "title": "Home", "pageUriSEO": "home"});

        siteData.addPageWithDefaults('cjg9');
        siteData.mock.pageData({"id": "cjg9", "title": "Page 2", "pageUriSEO": "page2"});

        siteData.addPageWithDefaults('cee5');
        siteData.mock.pageData({"id": "cee5", "title": "Page 3", "pageUriSEO": "page3"});

        siteData.addPageWithDefaults('cfvg');
        siteData.mock.pageData({"id": "cfvg", "title": "Page 4", "pageUriSEO": "page4"});

        siteData.addPageWithDefaults('c24vq');
        siteData.mock.pageData({"id": "c24vq", "title": "Contact", "pageUriSEO": "form__map"});
    }

    function setMenuData(siteData) {
        var items = [
            {"refId": "#mainPage", "items": []},
            {"refId": "#cjg9", "items": [
                {"refId": "#cee5", "items": []}
            ]},
            {"refId": "#cfvg", "items": [
                {"refId": "#c24vq", "items": []}
            ]}
        ];
        siteData.mock.menuData({items: items});
    }

    var extraPixels = {left: 0, right: 0};

    describe('MenuUtils', function () {
        describe('simple', function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                addPages(this.siteData);
                setMenuData(this.siteData);
            });

            //only Same Width
            describe('getDropDownWidthIfOk  - menu is only on same width mode', function () {
                it("all menu items will receive 76 width and there total size is smaller than the menu size", function () {
                    var expectedWidths = [76, 76, 76, 76, 76];
                    var menuWidth = 513,
                        sameWidth = true,
                        stretch = false,
                        widths = [64, 72, 72, 72, 76],
                        maxWidth = 76,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
                it("all menu Items will receive 76 width but will not fit to menu width - function will return null ", function () {
                    var expectedWidths = null;
                    var menuWidth = 304,
                        sameWidth = true,
                        stretch = false,
                        widths = [64, 72, 72, 72, 76],
                        maxWidth = 76,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
                it("all menu Items will receive 75 width but will not fit to menu width - function will return null - width menu margins ", function () {
                    var expectedWidths = null;
                    var menuWidth = 304,
                        sameWidth = true,
                        stretch = false,
                        widths = [64, 71, 71, 71, 75],
                        maxWidth = 75,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 10;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
            });


            //only stretch
            describe('getDropDownWidthIfOk  - the menu is in stretch mode', function () {
                it("each menu Item will receive additional 55px - there is a remnant of 4 which the 4 first items will receive ", function () {
                    var expectedWidths = [88, 95, 95, 95, 98];
                    var menuWidth = 521,
                        sameWidth = false,
                        stretch = true,
                        widths = [34, 41, 41, 41, 45],
                        maxWidth = 45,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 10;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
                it("the sum of the menu items is bigger then the total menu width will return null", function () {
                    var expectedWidths = null;
                    var menuWidth = 304,
                        sameWidth = false,
                        stretch = true,
                        widths = [64, 72, 72, 72, 76],
                        maxWidth = 76,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
                it("each menu item will receive 9px there is no remnant", function () {
                    var expectedWidths = [73, 81, 81, 69];
                    var menuWidth = 304,
                        sameWidth = false,
                        stretch = true,
                        widths = [64, 72, 72, 60],
                        maxWidth = 72,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
                it("in stretch menu with more on second measure there will be 0 in the width array and the function will return null", function () {
                    var expectedWidths = null;
                    var menuWidth = 304,
                        sameWidth = false,
                        stretch = true,
                        widths = [73, 81, 81, 0, 0],
                        maxWidth = 81,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
            });


            //no  stretch and no same width
            describe('getDropDownWidthIfOk  - not width stretch and not with same width', function () {
                it("all menu widths is less then menu width and the return array will be like the original val of the arrays", function () {
                    var expectedWidths = [34, 41, 41, 41, 45];
                    var menuWidth = 521,
                        sameWidth = false,
                        stretch = false,
                        widths = [34, 41, 41, 41, 45],
                        maxWidth = 45,
                        removeMarginFromAllChildren = 64,
                        menuWidthToReduce = 10;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
                it("the sum of the menu items is bigger then the total menu width will return null", function () {
                    var expectedWidths = null;
                    var menuWidth = 304,
                        sameWidth = false,
                        stretch = false,
                        widths = [64, 72, 72, 72, 76],
                        maxWidth = 76,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });
            });

            //  stretch and  same width
            describe('getDropDownWidthIfOk  - menu is in mode of same width and stretch mode', function () {
                it("same width - all widths will get 45px - they all fit inside the menu width and due to strech will become 96px each the remnant is 1px and will be added to first item", function () {
                    var expectedWidths = [95, 94, 94, 94, 94];
                    var menuWidth = 521,
                        sameWidth = true,
                        stretch = true,
                        widths = [34, 41, 41, 41, 45],
                        maxWidth = 45,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 10;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });

                xit("second hover - the max and min diff is one px - the array will remain the same", function () {
                    var expectedWidths = [97, 96, 96, 96, 96];
                    var menuWidth = 521,
                        sameWidth = true,
                        stretch = true,
                        widths = [97, 96, 96, 96, 96],
                        maxWidth = 97,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 10;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });

                it("the sum of the menu items is bigger then the total menu width will return null", function () {
                    var expectedWidths = null;
                    var menuWidth = 304,
                        sameWidth = true,
                        stretch = true,
                        widths = [64, 72, 72, 72, 76],
                        maxWidth = 76,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });

                it("the max items is 87px and all items get it, due to strech they become 100px width and there is no remnant", function () {
                    var expectedWidths = [100, 100, 100, 100];
                    var menuWidth = 400,
                        sameWidth = true,
                        stretch = true,
                        widths = [80, 87, 87, 75],
                        maxWidth = 87,
                        removeMarginFromAllChildren = true,
                        menuWidthToReduce = 0;
                    var realWidths = menuUtils.getDropDownWidthIfOk(menuWidth, sameWidth, stretch, widths, menuWidthToReduce, maxWidth, removeMarginFromAllChildren, extraPixels);
                    expect(realWidths).toEqual(expectedWidths);
                });


            });
        });

        describe('getSiteMenuWithRender', function () {
            it('should return empty object link if the link data doesn\'t exist', function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                var idWithoutData = '#CUSTOM_MENU_HEADER';
                var pageData = {id: 'bmi89b', label: 'Contact', link: idWithoutData, items: []};
                this.siteData.mock.basicMenuItemData(pageData);
                this.siteData.mock.menuData({items: []});
                this.siteData.mock.customMenuData({items: ["#bmi89b"]});

                var siteMenu = menuUtils.getSiteMenuWithRender(this.siteData);
                var expected = _.assign(pageData, {link: null});
                expect(siteMenu).toEqual([jasmine.objectContaining(expected)]);
            });

            it('should contain rendered href links', function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                addPages(this.siteData);
                setMenuData(this.siteData);
                var navigationInfo = this.siteData.getExistingRootNavigationInfo(this.siteData.getFocusedRootId());

                var siteMenu = menuUtils.getSiteMenuWithRender(this.siteData, false, navigationInfo);
                for (var i = 0; i < siteMenu.length; i++) {
                    expect(_.has(siteMenu, '[' + i + '].link.render.href')).toBe(true);
                }
            });
        });

        describe('getSiteMenuWithoutRenderedLinks', function () {
            it('should return empty object link if the link data doesn\'t exist', function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                var idWithoutData = '#CUSTOM_MENU_HEADER';
                var pageData = {id: 'bmi89b', label: 'Contact', link: idWithoutData, items: []};
                this.siteData.mock.basicMenuItemData(pageData);
                this.siteData.mock.menuData({items: []});
                this.siteData.mock.customMenuData({items: ["#bmi89b"]});

                var siteMenu = menuUtils.getSiteMenuWithoutRenderedLinks(this.siteData);
                var expected = _.assign(pageData, {link: null});
                expect(siteMenu).toEqual([jasmine.objectContaining(expected)]);
            });

            it('should not contain rendered href links', function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                addPages(this.siteData);
                setMenuData(this.siteData);
                var navigationInfo = this.siteData.getExistingRootNavigationInfo(this.siteData.getFocusedRootId());

                var siteMenu = menuUtils.getSiteMenuWithoutRenderedLinks(this.siteData, false, navigationInfo);
                for (var i = 0; i < siteMenu.length; i++) {
                    expect(_.has(siteMenu, '[' + i + '].link.render.href')).toBe(false);
                }
            });
        });

        describe('nonHiddenPageIdsFromMainMenu', function () {
            it("nonHiddenPageIdsFromMainMenu - no hidden", function () {
                var expectedVal = ['0', '1', '2'];
                this.siteData = testUtils.mockFactory.mockSiteData();
                addPages(this.siteData);
                setMenuData(this.siteData);

                spyOn(linkRenderer, 'renderLink').and.returnValue({
                    href: 'mockHref',
                    target: 'mockTarget'
                });
                var realWidths = menuUtils.nonHiddenPageIdsFromMainMenu(this.siteData);
                expect(realWidths).toEqual(expectedVal);
            });


        });

        describe('Data parser', function () {
            describe('when site data has custom site menu data', function () {
                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData();
                    addPages(this.siteData);
                    setCustomMenuData(this.siteData);
                });

                it('should return custom site menu if it exists', function () {
                    var menu;

                    spyOn(linkRenderer, 'renderLink').and.returnValue({
                        href: 'mockHref',
                        target: 'mockTarget'
                    });

                    menu = menuUtils.getSiteMenuWithRender(this.siteData);
                    expect(menu).toEqual([{
                        "id" : "bmi89b",
                        "label": "Page 4",
                        "isVisible": true,
                        "isVisibleMobile": true,
                        "items": [{
                            "id": "bmi1vx9",
                            "label": "Contact",
                            "isVisible": true,
                            "isVisibleMobile": true,
                            "items": [],
                            "link": {
                                "type": "PageLink",
                                "id": "1f8h",
                                "pageId": this.siteData.getDataByQuery("#c24vq"),
                                "render": {"href": "mockHref", "target": "mockTarget"}
                            }
                        }],
                        "link": {
                            "type": "PageLink",
                            "id": "j4e",
                            "pageId": this.siteData.getDataByQuery("#cfvg"),
                            "render": {"href": "mockHref", "target": "mockTarget"}
                        }
                    }, {
                        "id": "bmi1fj6",
                        "label": "Header",
                        "isVisible": true,
                        "isVisibleMobile": true,
                        "items": [{
                            "id":"bmi1wwb",
                            "label": "Scroll to Bottom",
                            "isVisible": true,
                            "isVisibleMobile": true,
                            "items": [],
                            "link": {
                                "type": "AnchorLink",
                                "id": "1us0",
                                "anchorName": "Scroll to Bottom",
                                "pageId": this.siteData.getDataByQuery("#1gjr"),
                                "anchorDataId": "SCROLL_TO_BOTTOM",
                                "render": {"href": "mockHref", "target": "mockTarget"}
                            }
                        }, {
                            "id": "bmizfs",
                            "label": "Web Address",
                            "isVisible": true,
                            "isVisibleMobile": true,
                            "items": [],
                            "link": {
                                "type": "ExternalLink",
                                "id": "1ykv",
                                "url": "http://www.ynet.co.il",
                                "target": "_blank",
                                "render": {"href": "mockHref", "target": "mockTarget"}
                            }
                        }],
                        "link": null
                    }, {
                        "id": "bmicuv",
                        "label": "Email",
                        "isVisible": true,
                        "isVisibleMobile": true,
                        "items": [],
                        "link": {
                            "type": "EmailLink",
                            "id": "1uuk",
                            "recipient": "shaila@wix.com",
                            "subject": "This is a subject",
                            "body": "",
                            "render": {"href": "mockHref", "target": "mockTarget"}
                        }
                    }]);
                });

                it('should return custom site menu if it exists, filtered for pages', function () {
                    var menu;

                    spyOn(linkRenderer, 'renderLink').and.returnValue({
                        href: 'mockHref',
                        target: 'mockTarget'
                    });

                    menu = menuUtils.getSiteMenuWithRender(this.siteData, true);
                    expect(menu).toEqual([{
                        "id": "bmi89b",
                        "label": "Page 4",
                        "isVisible": true,
                        "isVisibleMobile": true,
                        "items": [{
                            "id": "bmi1vx9",
                            "label": "Contact",
                            "isVisible": true,
                            "isVisibleMobile": true,
                            "items": [],
                            "link": {
                                "type": "PageLink",
                                "id": "1f8h",
                                "pageId": this.siteData.getDataByQuery("#c24vq"),
                                "render": {"href": "mockHref", "target": "mockTarget"}
                            }
                        }],
                        "link": {
                            "type": "PageLink",
                            "id": "j4e",
                            "pageId": this.siteData.getDataByQuery("#cfvg"),
                            "render": {"href": "mockHref", "target": "mockTarget"}
                        }
                    }]);
                });
            });

            xdescribe('when site data does not have custom site menu data', function () {
                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData();
                    addPages(this.siteData);
                    setMenuData(this.siteData);
                });

                it("should return old menu in new format if custom site menu doesn't exist", function () {
                    var menu;

                    spyOn(linkRenderer, 'renderLink').and.returnValue({
                        href: 'mockHref',
                        target: 'mockTarget'
                    });

                    menu = menuUtils.getSiteMenuWithRender(this.siteData);

                    expect(menu).toEqual([{"label": "Home", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": this.siteData.getDataByQuery("#mainPage"), "render": {"href": "mockHref", "target": "mockTarget"}}}, {
                        "label": "Page 2",
                        "isVisible": true,
                        "isVisibleMobile": true,
                        "items": [{"label": "Page 3", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": this.siteData.getDataByQuery("#cee5"), "render": {"href": "mockHref", "target": "mockTarget"}}}],
                        "link": {"type": "PageLink", "pageId": this.siteData.getDataByQuery("#cjg9"), "render": {"href": "mockHref", "target": "mockTarget"}}
                    }, {
                        "label": "Page 4",
                        "isVisible": true,
                        "isVisibleMobile": true,
                        "items": [{"label": "Contact", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": this.siteData.getDataByQuery("#c24vq"), "render": {"href": "mockHref", "target": "mockTarget"}}}],
                        "link": {"type": "PageLink", "pageId": this.siteData.getDataByQuery("#cfvg"), "render": {"href": "mockHref", "target": "mockTarget"}}
                    }]);
                });
            });
        });
    });

});
