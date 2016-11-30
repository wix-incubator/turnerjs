define(['lodash', 'dataFixer/plugins/customSiteMenuFixer'], function (_, customSiteMenuFixer) {
    'use strict';

    describe('customSiteMenuFixer', function () {

        function addMockPageDataItem(docData, pageId, isPopup) {
            docData[pageId] = {
                id: pageId,
                title: pageId + '-title',
                hidePage: false,
                mobileHidePage: false,
                type: 'Page',
                isPopup: isPopup
            };
        }

        function addMockMainMenuItem(docData, pageIds) {
            docData.MAIN_MENU = {
                id: 'MAIN_MENU',
                items: _.map(pageIds, function (pageId) {
                    return {refId: '#' + pageId};
                }),
                metaData: {},
                type: 'Menu'
            };
        }

        function addMockCustomMainMenuItem(docData, items) {
            docData.CUSTOM_MAIN_MENU = {
                id: 'CUSTOM_MAIN_MENU',
                items: items,
                metaData: {},
                type: 'Menu'
            };
        }

        function addMockPageLinkItem(docData, id, pageId) {
            docData[id] = {
                id: id,
                metaData: {},
                pageId: '#' + pageId,
                type: 'PageLink'
            };
        }

        function addMockBasicMenuItem(docData, id, pageLinkId) {
            docData[id] = {
                id: id,
                isVisible: true,
                isVisibleMobile: true,
                items: [],
                label: id = '-title',
                link: '#' + pageLinkId,
                metaData: {},
                type: "BasicMenuItem"
            };
        }

        function getEmptySiteJson() {
            return {
                structure: {},
                data: {
                    document_data: {}
                }
            };
        }

        describe('conversion from MAIN_MENU to CUSTOM_MAIN_MENU', function () {

            var json, docData;
            var pageIds = ['page1', 'page2', 'page3'];

            beforeEach(function () {
                json = getEmptySiteJson();
                docData = json.data.document_data;
                addMockMainMenuItem(docData, pageIds);
                _.forEach(pageIds, addMockPageDataItem.bind(null, docData));
            });

            it("should create CUSTOM_MAIN_MENU item", function () {
                customSiteMenuFixer.exec(json, pageIds);
                expect(docData.CUSTOM_MAIN_MENU).toEqual({
                    id: 'CUSTOM_MAIN_MENU',
                    items: ['#bmi0', '#bmi1', '#bmi2'],
                    name: 'Custom Main Menu',
                    type: 'CustomMenu',
                    metaData: {}
                });

            });

            it("should create CUSTOM_MENUS item", function () {
                customSiteMenuFixer.exec(json, pageIds);
                expect(docData.CUSTOM_MENUS).toEqual({
                    id: 'CUSTOM_MENUS',
                    menus: ['#CUSTOM_MAIN_MENU'],
                    type: 'CustomMenusCollection',
                    metaData: {}
                });
            });

            it('should clear MAIN_MENU.items', function () {
                customSiteMenuFixer.exec(json, pageIds);
                expect(docData.MAIN_MENU.items.length).toBe(0);
            });

            it('should create PageLink item for each page', function () {
                customSiteMenuFixer.exec(json, pageIds);
                expect(docData.pglk0).toEqual({id: 'pglk0', type: 'PageLink', pageId: '#page1', metaData: {}});
                expect(docData.pglk1).toEqual({id: 'pglk1', type: 'PageLink', pageId: '#page2', metaData: {}});
                expect(docData.pglk2).toEqual({id: 'pglk2', type: 'PageLink', pageId: '#page3', metaData: {}});

            });

            it('should create BasicMenuItem item for each PageLink', function () {
                customSiteMenuFixer.exec(json, pageIds);
                expect(docData.bmi0).toEqual({
                    id: 'bmi0',
                    label: 'page1-title',
                    isVisible: true,
                    isVisibleMobile: true,
                    items: [],
                    link: '#pglk0',
                    type: 'BasicMenuItem',
                    metaData: {}
                });
                expect(docData.bmi1).toEqual({
                    id: 'bmi1',
                    label: 'page2-title',
                    isVisible: true,
                    isVisibleMobile: true,
                    items: [],
                    link: '#pglk1',
                    type: 'BasicMenuItem',
                    metaData: {}
                });
                expect(docData.bmi2).toEqual({
                    id: 'bmi2',
                    label: 'page3-title',
                    isVisible: true,
                    isVisibleMobile: true,
                    items: [],
                    link: '#pglk2',
                    type: 'BasicMenuItem',
                    metaData: {}
                });
            });
        });

        it('should add missing menu items according to pages in site', function () {
            var json = getEmptySiteJson();
            var docData = json.data.document_data;

            addMockCustomMainMenuItem(docData, ['#bmi1', '#bmi2']);
            addMockMainMenuItem(docData, []);
            addMockBasicMenuItem(docData, 'bmi1', 'pglk1');
            addMockBasicMenuItem(docData, 'bmi2', 'pglk2');
            addMockPageLinkItem(docData, 'pglk1', 'pg1');
            addMockPageLinkItem(docData, 'pglk2', 'pg2');
            addMockPageDataItem(docData, 'pg1');
            addMockPageDataItem(docData, 'pg2');
            addMockPageDataItem(docData, 'pg3');
            addMockPageDataItem(docData, 'pg4');

            var pageIdsArray = ["pg1", "pg2", "pg3", "pg4"];
            var menuItems = ["#bmi1", "#bmi2", "#bmi3", "#bmi4"];

            customSiteMenuFixer.exec(json, pageIdsArray);

            expect(docData.CUSTOM_MAIN_MENU.items).toEqual(menuItems);
            expect(docData.bmi3).toBeDefined();
            expect(docData.bmi3.link).toEqual("#pglk3");
            expect(docData.bmi4).toBeDefined();
            expect(docData.bmi4.link).toBe("#pglk4");
            expect(docData.pglk3).toBeDefined();
            expect(docData.pglk3.pageId).toBe("#pg3");
            expect(docData.pglk4).toBeDefined();
            expect(docData.pglk4.pageId).toBe("#pg4");

        });

        it('should not add missing menu items for popup pages', function () {
            var json = getEmptySiteJson();
            var docData = json.data.document_data;

            addMockCustomMainMenuItem(docData, []);
            addMockMainMenuItem(docData, []);

            addMockPageDataItem(docData, 'notPopup1', false);
            addMockPageDataItem(docData, 'popup1', true);

            var pageIdsArray = ["notPopup1", "popup1"];
            var menuItems = ["#bmi0"];


            customSiteMenuFixer.exec(json, pageIdsArray);


            expect(docData.CUSTOM_MAIN_MENU.items).toEqual(menuItems);

            expect(docData.bmi0).toBeDefined();
            expect(docData.bmi0.link).toEqual("#pglk0");
            expect(docData.pglk0).toBeDefined();
            expect(docData.pglk0.pageId).toBe("#notPopup1");

            expect(docData.bmi1).not.toBeDefined();
            expect(docData.pglk1).not.toBeDefined();
        });
    });
});
