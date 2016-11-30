define(['wixappsBuilder/core/dataSelectorFactory', 'testUtils'], function(dataSelectorFactory, testUtils) {
    'use strict';

    describe('dataSelectorFactory', function() {

        function fakeAppService() {
            return {
                type: 'appbuilder',
                instanceId: 'fakeInstanceId'
            };
        }

        function fakeInstanceVersion() {
            return '1234';
        }

        function mockSiteData(appbuilderData) {
            return testUtils.mockFactory.mockSiteData({
                wixapps: {
                    appbuilder: appbuilderData
                }
            });
        }

        describe('Manual Data Selector', function() {

            function createManualSelectorDef(type, itemIds) {
                return {
                    id: '',
                    forType: type,
                    logicalTypeName: 'IB.ManualSelectedList',
                    itemIds: itemIds
                };
            }

            describe('getData', function() {

                it('should filter non-existing items from the returned data', function() {

                    var siteData = mockSiteData({
                        items: {
                            testTypeId: {
                                existingItem1: {_iid: 'existingItem1'},
                                existingItem2: {_iid: 'existingItem2'},
                                existingItem3: {_iid: 'existingItem3'}
                            }
                        }
                    });

                    var dataSelectorItemIds = ['existingItem1', 'nonExistingItem1', 'existingItem2', 'existingItem3', 'nonExistingItem2'];
                    var manualSelectorDef = createManualSelectorDef('testTypeId', dataSelectorItemIds);

                    var manualDataSelector = dataSelectorFactory.getDataSelector(manualSelectorDef, siteData, fakeAppService(), fakeInstanceVersion());
                    var returnedData = manualDataSelector.getData();

                    expect(returnedData).toEqual([
                        ['testTypeId', 'existingItem1'],
                        ['testTypeId', 'existingItem2'],
                        ['testTypeId', 'existingItem3']
                    ]);

                });

            });

        });

        describe('All Items of Type Data Selector', function() {

            function createAllItemsOfTypeSelectorDef(type) {
                return {
                    logicalTypeName: 'IB.AllItemsOfType',
                    forType: type
                };
            }

            describe('getData', function() {

                it('should return all items of the configured type only', function() {
                    var siteData = mockSiteData({
                        items: {
                            testTypeId: {
                                existingItem1: {_iid: 'existingItem1'},
                                existingItem2: {_iid: 'existingItem2'},
                                existingItem3: {_iid: 'existingItem3'}
                            },
                            testTypeId2: {
                                itemOfAnotherType: {_iid: 'itemOfAnotherType'}
                            }
                        }
                    });

                    var allItemsDataSelectorDef = createAllItemsOfTypeSelectorDef('testTypeId');
                    var allItemsDataSelector = dataSelectorFactory.getDataSelector(allItemsDataSelectorDef, siteData, fakeAppService(), fakeInstanceVersion());
                    var returnedData = allItemsDataSelector.getData();

                    expect(returnedData).toEqual([
                        ['testTypeId', 'existingItem1'],
                        ['testTypeId', 'existingItem2'],
                        ['testTypeId', 'existingItem3']
                    ]);
                });


                it('should return an empty array if no items exist for the configured type', function() {
                    var siteData = mockSiteData({
                        items: {
                            testTypeId2: {
                                itemOfAnotherType: {_iid: 'itemOfAnotherType'}
                            }
                        }
                    });

                    var allItemsDataSelectorDef = createAllItemsOfTypeSelectorDef('testTypeId');
                    var allItemsDataSelector = dataSelectorFactory.getDataSelector(allItemsDataSelectorDef, siteData, fakeAppService(), fakeInstanceVersion());
                    var returnedData = allItemsDataSelector.getData();

                    expect(returnedData).toEqual([]);
                });

            });

            describe('getRequest', function() {

                it('should return a request with an empty filter', function() {
                    var siteData = mockSiteData({
                        items: {
                            testTypeId: {
                                existingItem1: {_iid: 'existingItem1'},
                                existingItem2: {_iid: 'existingItem2'},
                                existingItem3: {_iid: 'existingItem3'}
                            },
                            testTypeId2: {
                                itemOfAnotherType: {_iid: 'itemOfAnotherType'}
                            }
                        }
                    });

                    var allItemsDataSelectorDef = createAllItemsOfTypeSelectorDef('testTypeId');
                    var allItemsDataSelector = dataSelectorFactory.getDataSelector(allItemsDataSelectorDef, siteData, fakeAppService(), fakeInstanceVersion());
                    var request = allItemsDataSelector.getRequest(null, jasmine.createSpy('requestSuccess'), jasmine.createSpy('requestError'));

                    expect(request.data.filter).toEqual({});
                });

            });

        });

    });

});
