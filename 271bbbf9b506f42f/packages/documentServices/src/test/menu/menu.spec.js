define([
    'lodash',
    'utils',
    'documentServices/page/pageUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/dataModel/dataModel',
    'documentServices/dataModel/dataValidators',
    'documentServices/constants/constants',
    'documentServices/menu/menu',
    'documentServices/menu/menuUtils',
    'documentServices/page/pageData',
    'documentServices/tpa/tpa'
], function (_,
             utils,
             pageUtils,
             privateServicesHelper,
             dataModel,
             dataValidators,
             constants,
             menu,
             menuUtils,
             pageDataModule,
             tpa) {
    'use strict';

    describe('Menu', function () {

        var ps, siteData;
        beforeEach(function () {
            var data = {
                CUSTOM_MAIN_MENU: {
                    id: 'CUSTOM_MAIN_MENU',
                    items: ['#preExsistingItem'],
                    type: 'CustomMenu',
                    link: '#link'
                }
            };

            siteData = privateServicesHelper.getSiteDataWithPages()
                .addData(data.CUSTOM_MAIN_MENU, 'masterPage')
                .addData({
                    id: 'MAIN_MENU',
                    items: []
                }, 'masterPage')
                .addData({
                    id: 'preExsistingItem',
                    link: '#link1'
                });
            spyOn(dataValidators, 'validateDataBySchema');
            spyOn(dataModel, 'createDataItemByType').and.callFake(function (privateServices, type) {
                if (type === 'PageLink') {
                    return {pageId: '', type: 'PageLink'};
                }

                if (type === 'BasicMenuItem') {
                    return {
                        link: '',
                        items: [],
                        label: '',
                        isVisible: true,
                        isVisibleMobile: true,
                        type: 'BasicMenuItem'
                    };
                }

                return {
                    mockKey: 'mockValue',
                    type: type
                };
            });
            var dataCounter = 0;
            spyOn(dataModel, 'generateNewDataItemId').and.callFake(function () {
                return 'mockDataId' + (dataCounter++);
            });
        });

        function getDataItem(privateServices, itemId) {
            var pointer = privateServices.pointers.data.getDataItemFromMaster(itemId);
            return privateServices.dal.get(pointer);
        }

        describe('add', function () {
            beforeEach(function () {
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should be able to add page menu item', function () {
                menu.addPageItem(ps, 'mockPageId', 'mockPageTitle');

                expect(getDataItem(ps, 'mockDataId1')).toEqual({
                    pageId: 'mockPageId',
                    type: 'PageLink',
                    id: 'mockDataId1',
                    metaData: {isPreset: false}
                });
                expect(getDataItem(ps, 'mockDataId0')).toEqual({
                    link: '#mockDataId1',
                    items: [],
                    label: 'mockPageTitle',
                    isVisible: true,
                    isVisibleMobile: true,
                    type: 'BasicMenuItem',
                    id: 'mockDataId0',
                    metaData: {isPreset: false}
                });
                expect(getDataItem(ps, 'CUSTOM_MAIN_MENU').items).toEqual(['#preExsistingItem', '#mockDataId0']);
            });

            it('should be able to add link menu item', function () {
                var linkData = dataModel.createDataItemByType(ps, 'MockLinkType');
                var dataId = menu.getNewMenuItemId(ps);
                menu.addLinkItem(ps, dataId, _.merge(linkData, {foo: 'bar'}), 'mockLabel');

                expect(getDataItem(ps, 'mockDataId1')).toEqual({
                    mockKey: 'mockValue',
                    type: 'MockLinkType',
                    foo: 'bar',
                    id: 'mockDataId1',
                    metaData: {isPreset: false}
                });
                expect(getDataItem(ps, 'mockDataId0')).toEqual({
                    link: '#mockDataId1',
                    items: [],
                    label: 'mockLabel',
                    isVisible: true,
                    isVisibleMobile: true,
                    type: 'BasicMenuItem',
                    id: 'mockDataId0',
                    metaData: {isPreset: false}
                });
                expect(getDataItem(ps, 'CUSTOM_MAIN_MENU').items).toEqual(['#preExsistingItem', '#mockDataId0']);
            });

            it('should throw if trying to add a link menu item of type PageLink', function () {
                function addPageLinkMenuItem() {
                    var linkData = dataModel.createDataItemByType(ps, 'PageLink');
                    var dataId = menu.getNewMenuItemId(ps);
                    menu.addLinkItem(ps, dataId, _.merge(linkData, {foo: 'bar'}), 'mockLabel');
                }

                expect(addPageLinkMenuItem).toThrow(new Error('Explicitly adding a LinkItem of type "PageLink" is not allowed'));
            });


            it('should not throw if trying to add a link menu item of type PageLink', function () {
                function addPageLinkMenuItem() {
                    var linkData = dataModel.createDataItemByType(ps, 'PageLink');
                    var dataId = menu.getNewMenuItemId(ps);
                    spyOn(pageDataModule, 'isPopup').and.returnValue(true);
                    menu.addLinkItem(ps, dataId, _.merge(linkData, {foo: 'bar'}), 'mockLabel');
                }

                expect(addPageLinkMenuItem).not.toThrow(new Error('Explicitly adding a LinkItem of type "PageLink" is not allowed'));
            });

            it('should be able to add header menu item', function () {
                var dataId = menu.getNewMenuItemId(ps),
                    hideItem = false,
                    hideItemMobile = false;

                menu.addHeaderItem(ps, dataId, 'mockLabel', null, hideItem, hideItemMobile);

                expect(getDataItem(ps, 'mockDataId0')).toEqual({
                    link: '#CUSTOM_MENU_HEADER',
                    items: [],
                    label: 'mockLabel',
                    isVisible: !hideItem,
                    isVisibleMobile: !hideItemMobile,
                    type: 'BasicMenuItem',
                    id: 'mockDataId0',
                    metaData: {isPreset: false}
                });
                expect(getDataItem(ps, 'CUSTOM_MAIN_MENU').items).toEqual(['#preExsistingItem', '#mockDataId0']);
            });

            it('should throw if adding menu item to a non-existing parent', function () {
                var dataId = menu.getNewMenuItemId(ps);
                expect(function () {
                    menu.addHeaderItem(ps, dataId, 'mockLabel', 'nonExistingParent');
                }).toThrow(new Error('Parent "nonExistingParent" does not exist'));
            });

            it('should throw if adding menu item to a non-legal parent', function () {
                var dataId = menu.getNewMenuItemId(ps);
                ps.dal.set(ps.pointers.data.getDataItemFromMaster('existingIllegalParent'), {
                    id: 'existingIllegalParent',
                    type: 'mockType'
                });
                expect(function () {
                    menu.addHeaderItem(ps, dataId, 'mockLabel', 'existingIllegalParent');
                }).toThrow(new Error('Parent of type "mockType" is not a legal parent. Please provide parent of types "BasicMenuItem" or "CustomMenu" only'));
            });

            it('should throw if adding menu item to a a sub item', function () {
                var itemA = menu.getNewMenuItemId(ps);
                var itemB = menu.getNewMenuItemId(ps);
                var dataId3 = menu.getNewMenuItemId(ps);
                menu.addHeaderItem(ps, itemA, 'mockLabelA');
                menu.addHeaderItem(ps, itemB, 'mockLabelB', itemA);

                expect(function () {
                    menu.addHeaderItem(ps, dataId3, 'mockLabelC', itemB);
                }).toThrow(new Error('Cannot add/move items into a sub item'));
            });

        });

        describe('delete', function () {
            beforeEach(function () {
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should be able to delete menu item (and flatten sub menu items, if any)', function () {
                var itemId = 'mockDataId2';
                menu.addHeaderItem(ps, itemId, 'mockLabel', 'CUSTOM_MAIN_MENU');
                menu.addLinkItem(ps, 'mockDataId4', {}, 'mockPageTitle', itemId);
                menu.addLinkItem(ps, 'mockDataId5', {}, 'mockPageTitle', itemId);

                menu.deleteItem(ps, itemId);

                expect(getDataItem(ps, 'CUSTOM_MAIN_MENU').items).toEqual(['#preExsistingItem', '#mockDataId4', '#mockDataId5']);
                expect(getDataItem(ps, 'mockDataId2')).toBeUndefined();
            });

            it('should throw if trying to remove a PageLink', function () {
                menu.addPageItem(ps, 'mockPageId', 'mockPageTitle');

                function deletePage() {
                    menu.deleteItem(ps, 'mockDataId0');
                }

                expect(deletePage).toThrow(new Error('Explicitly deleting a page link item is not allowed'));
            });
        });

        describe('getMenu', function () {

            beforeEach(function () {

                var mockDocumentData = {
                    CUSTOM_MAIN_MENU: {
                        id: 'CUSTOM_MAIN_MENU',
                        type: 'CustomMenu',
                        items: [
                            '#bmi1'
                        ]
                    },
                    MAIN_MENU: {
                        id: 'MAIN_MENU',
                        type: 'Menu',
                        items: []
                    },
                    bmi1: {
                        type: 'BasicMenuItem',
                        id: 'bmi1',
                        label: 'mockLabel1',
                        isVisible: true,
                        isVisibleMobile: true,
                        link: '#link1',
                        items: [
                            '#bmi2'
                        ]
                    },
                    bmi2: {
                        type: 'BasicMenuItem',
                        id: 'bmi2',
                        label: 'mockLabel2',
                        isVisible: true,
                        isVisibleMobile: true,
                        link: '#link2',
                        items: []
                    },
                    link1: {
                        id: 'link1',
                        type: 'PageLink',
                        pageId: '#mockPageId'
                    },
                    link2: {
                        id: 'link2',
                        type: 'PageLink',
                        pageId: '#mockPageId2'
                    }

                };

                siteData.addData(_.values(mockDocumentData), 'masterPage');
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should get menu object with rendered links', function () {
                siteData.addPageWithDefaults('mockPageId')
                    .addPageWithDefaults('mockPageId2');
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var menuItems = menu.getMenu(ps);
                expect(menuItems).toEqual([{
                    id: 'bmi1',
                    label: 'mockLabel1',
                    isVisible: true,
                    isVisibleMobile: true,
                    items: [{
                        id: 'bmi2',
                        label: 'mockLabel2',
                        isVisible: true,
                        isVisibleMobile: true,
                        items: [],
                        link: {id: 'link2', type: 'PageLink', pageId: '#mockPageId2'}
                    }],
                    link: {id: 'link1', type: 'PageLink', pageId: '#mockPageId'}
                }]);
            });

            it('should handle menu items with links that don\'t contain pageId', function () {
                var externalLinkData = siteData.mock.externalLinkData({id: 'externalLinkId'});
                var menuItemData = siteData.mock.menuItemData({
                    id: 'yonti_ha_gever',
                    link: '#externalLinkId',
                    label: 'יונתי הגברצח'
                });
                siteData.mock.customMenuData({items: ['#yonti_ha_gever']});

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var actual = menu.getMenu(ps);
                var expected = [jasmine.objectContaining(_.defaults({link: externalLinkData}, _.omit(menuItemData, 'type')))];

                expect(actual).toEqual(expected);
            });

            describe('when filterHiddenFromMenuPages param is true', function () {

                beforeEach(function () {
                    siteData.addPageWithData('mockPageId', {tpaPageId: 'product_page', tpaApplicationId: 1});
                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                it('should remove pages with hideFromMenu flag true', function () {
                    spyOn(tpa, 'isPageMarkedAsHideFromMenu').and.returnValue(true);

                    var menuItems = menu.getMenu(ps, true);

                    expect(menuItems.length).toEqual(0);
                    expect(tpa.isPageMarkedAsHideFromMenu).toHaveBeenCalledWith(ps, 1, 'product_page');
                });

                it('should not remove pages with hideFromMenu flag false', function () {
                    spyOn(tpa, 'isPageMarkedAsHideFromMenu').and.returnValue(false);

                    var menuItems = menu.getMenu(ps, true);

                    expect(menuItems.length).toEqual(1);
                    expect(tpa.isPageMarkedAsHideFromMenu).toHaveBeenCalledWith(ps, 1, 'product_page');
                });

                it('should not remove links which are not to pages', function () {
                    spyOn(tpa, 'isPageMarkedAsHideFromMenu').and.returnValue(true);
                    siteData.mock.externalLinkData({id: 'externalLinkId'});
                    siteData.mock.menuItemData({
                        id: 'yonti_ha_gever',
                        link: '#externalLinkId',
                        label: 'label'
                    });
                    siteData.mock.customMenuData({items: ['#yonti_ha_gever']});
                    ps.syncDisplayedJsonToFull();

                    var menuItems = menu.getMenu(ps, true);

                    expect(menuItems.length).toEqual(1);
                    expect(tpa.isPageMarkedAsHideFromMenu).not.toHaveBeenCalledWith(ps, 1, 'product_page');
                });
            });

        });

        describe('moveItem', function () {

            beforeEach(function () {
                var data = {
                    'CUSTOM_MAIN_MENU': {
                        id: 'CUSTOM_MAIN_MENU',
                        items: [
                            '#itemA',
                            '#itemB',
                            '#itemC'
                        ]
                    },
                    'parentX': {
                        id: 'parentX',
                        items: [
                            '#itemX1',
                            '#itemX2'
                        ]
                    },
                    'parentY': {
                        id: 'parentY',
                        items: [
                            '#itemY1',
                            '#itemY2'
                        ]
                    }
                };
                siteData.addData(_.values(data), 'masterPage');
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should move item from index A to index B at the same parent', function () {
                var itemId = 'itemA';
                spyOn(menuUtils, 'validateParent');
                spyOn(menuUtils, 'getSiteMenu').and.returnValue([]);
                menu.moveItem(ps, itemId, null, 1);
                expect(getDataItem(ps, 'CUSTOM_MAIN_MENU').items).toEqual(['#itemB', '#itemA', '#itemC']);
            });

            it('should move item from index A at parentX to index B at parent Y', function () {
                var itemId = 'itemX1';
                var oldParent = 'parentX';
                var newParent = 'parentY';
                spyOn(menuUtils, 'validateParent');
                spyOn(menuUtils, 'getSiteMenu').and.returnValue([{id: oldParent, items: [{id: itemId}]}]);
                menu.moveItem(ps, itemId, newParent, 1);
                expect(getDataItem(ps, oldParent).items).toEqual(['#itemX2']);
                expect(getDataItem(ps, newParent).items).toEqual(['#itemY1', '#itemX1', '#itemY2']);
            });

            it('should throw if itemId does not exist in parent', function () {
                spyOn(menuUtils, 'validateParent');
                spyOn(menuUtils, 'getSiteMenu').and.returnValue([]);
                expect(function () {
                    menu.moveItem(ps, 'fakeItem', null, 1);
                }).toThrow(new Error('Cannot find item #fakeItem at parent #CUSTOM_MAIN_MENU'));
            });

            describe('menu utils', function () {
                it('should throw if parentId === itemId', function () {
                    expect(function () {
                        menuUtils.validateParent(ps, 'fakeId', '#fakeId');
                    }).toThrow(new Error('menu item fakeId cannot be a parent for itself'));
                });
            });
        });

        describe("getters", function () {
            beforeEach(function () {
                siteData.addData([{id: 'item1', link: '#CUSTOM_MENU_HEADER'}, {id: 'CUSTOM_MENU_HEADER'},
                    {id: 'item2', link: '#pageLink'}, {id: 'pageLink', type: 'PageLink'},
                    {id: 'item3', link: '#someLink'}, {id: 'someLink'}], 'masterPage');
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            describe('getItemType', function () {
                it('should return "header" for header item', function () {
                    expect(menu.getItemType(ps, '#item1')).toBe(constants.MENU_ITEM_TYPES.HEADER);
                });

                it('should return "page" for page item', function () {
                    expect(menu.getItemType(ps, '#item2')).toBe(constants.MENU_ITEM_TYPES.PAGE);
                });

                it('should return "link" for link item', function () {
                    expect(menu.getItemType(ps, '#item3')).toBe(constants.MENU_ITEM_TYPES.LINK);
                });
            });

            describe("isItemRemovable", function () {
                it('should return true for header items', function () {
                    expect(menu.isItemRemovable(ps, '#item1')).toBeTruthy();
                });

                it('should return false for page items', function () {
                    expect(menu.isItemRemovable(ps, '#item2')).toBeFalsy();
                });

                it('should return true for link items', function () {
                    expect(menu.isItemRemovable(ps, '#item3')).toBeTruthy();
                });
            });
        });

        describe('setItemLabel', function () {
            var mockMenuItemId = 'mockMenuItemId';
            beforeEach(function () {
                siteData.addData({
                    id: mockMenuItemId
                }, 'masterPage');
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should set new label to existing menu item', function () {
                var mockNewLabel = 'mockNewLabel';
                menu.setItemLabel(ps, mockMenuItemId, mockNewLabel);
                expect(getDataItem(ps, mockMenuItemId).label).toBe(mockNewLabel);
            });

            it('should throw if setting label for non existing menu item', function () {
                var mockNewLabel = 'mockNewLabel';
                expect(function () {
                    menu.setItemLabel(ps, 'nonExisting', mockNewLabel);
                }).toThrow(new Error('Cannot update item with "nonExisting", it does not exist'));

            });

        });

        describe('setItemVisibility', function () {
            var mockMenuItemId = 'mockMenuItemId';
            beforeEach(function () {
                siteData.addData({
                    id: mockMenuItemId,
                    type: 'BasicMenuItem',
                    label: 'some label'
                }, 'masterPage');
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should set new label to existing menu item', function () {
                menu.setItemVisibility(ps, mockMenuItemId, true, true);
                var data = getDataItem(ps, mockMenuItemId);
                expect(data.isVisible).toBeFalsy();
                expect(data.isVisibleMobile).toBeFalsy();
            });

            it('should throw if setting label for non existing menu item', function () {
                expect(function () {
                    menu.setItemVisibility(ps, 'nonExisting', true, true);
                }).toThrow(new Error('Cannot update item with "nonExisting", it does not exist'));
            });

        });

        describe('pageDataChanged', function () {

            function addDataItemToMasterPage(dataItem) {
                siteData.pagesData.masterPage.data.document_data[dataItem.id] = dataItem;
            }

            function createMockPrivateServices(existingPageId, mockPageTitle) {
                siteData = privateServicesHelper.getSiteDataWithPages();

                addDataItemToMasterPage({type: 'Page', id: 'mockPageId', title: mockPageTitle});
                addDataItemToMasterPage({type: 'CustomMenu', id: 'CUSTOM_MAIN_MENU', items: []});

                if (existingPageId) {
                    addDataItemToMasterPage({type: 'PageLink', id: 'mockPageLinkId3', pageId: '#' + existingPageId});
                    addDataItemToMasterPage({type: 'PageLink', id: 'mockPageLinkId2', pageId: '#' + existingPageId});
                    addDataItemToMasterPage({type: 'PageLink', id: 'mockPageLinkId', pageId: '#' + existingPageId});
                    addDataItemToMasterPage({
                        type: 'BasicMenuItem',
                        id: 'mockMenuItemId',
                        link: '#mockPageLinkId',
                        label: 'original label'
                    });
                }

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                return ps;
            }

            function getMenuItemForPageId(pageId) {
                var menuItemPointer;
                var pageLinkPointers = ps.pointers.data.getDataItemsWithPredicate({
                    type: 'PageLink',
                    pageId: '#' + pageId
                });
                for (var i = 0; pageLinkPointers.length; i++) {
                    menuItemPointer = ps.pointers.data.getDataItemWithPredicate({
                        type: 'BasicMenuItem',
                        link: '#' + pageLinkPointers[i].id
                    });
                    if (menuItemPointer) {
                        return menuItemPointer;
                    }
                }
            }

            it('should update existing menu item if page exists', function () {
                var mockPageId = 'mockPageId';
                var newLabel = 'new label';

                ps = createMockPrivateServices(mockPageId);
                pageUtils.executePageDataChangedCallback(ps, mockPageId, {title: newLabel});

                var menuItemPointer = getMenuItemForPageId(mockPageId);

                expect(ps.dal.get(menuItemPointer).label).toEqual(newLabel);
            });

            it('should create new menu item if page does not exist', function () {
                var mockPageId = 'mockPageId';
                var mockPageTitle = 'new label';

                ps = createMockPrivateServices(null, mockPageTitle);
                pageUtils.executePageDataChangedCallback(ps, mockPageId);

                var menuItemPointer = getMenuItemForPageId(mockPageId);
                var newMenuItemData = ps.dal.get(menuItemPointer);

                expect(newMenuItemData).toBeDefined();
                expect(newMenuItemData.label).toEqual(mockPageTitle);
            });


        });

        describe('updateLinkItem', function () {
            beforeEach(function () {
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should throw if trying to add a link menu item of type PageLink', function () {
                function addPageLinkMenuItem() {
                    var linkData = dataModel.createDataItemByType(ps, 'PageLink');
                    var dataId = menu.getNewMenuItemId(ps);
                    menu.updateLinkItem(ps, dataId, _.merge(linkData, {foo: 'bar'}), 'mockLabel');
                }

                expect(addPageLinkMenuItem).toThrow(new Error('Explicitly setting a LinkItem of type "PageLink" is not allowed'));
            });

            it('should not throw if trying to add a link menu item of type PageLink', function () {
                function addPageLinkMenuItem() {
                    var linkData = dataModel.createDataItemByType(ps, 'PageLink');
                    var dataId = menu.getNewMenuItemId(ps);
                    spyOn(pageDataModule, 'isPopup').and.returnValue(true);
                    menu.updateLinkItem(ps, dataId, _.merge(linkData, {foo: 'bar'}), 'mockLabel');
                }

                expect(addPageLinkMenuItem).not.toThrow(new Error('Explicitly setting a LinkItem of type "PageLink" is not allowed'));
            });
        });
    });
});
