define(['lodash',
        'testUtils',
        'documentServices/page/pageUtils',
        'documentServices/dataModel/dataModel',
        'documentServices/component/component',
        'documentServices/structure/structure',
        'documentServices/tpa/services/tpaDataService',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/tpa/services/tpaEventHandlersService',
        'documentServices/componentDetectorAPI/componentDetectorAPI'
    ],
    function(_, testUtils, pageUtils, dataModel, component, structure, tpaDataService, clientSpecMapService, installedTpaAppsOnSiteService, privateServicesHelper, tpaEventHandlersService, componentDetectorAPI) {
        'use strict';

        describe('tpaDataService', function() {

            describe('trigger public data change callbakcs', function() {
                var callback1, callback2, callback3, mockSiteData, mockPrivateServices, comp1, comp2, comp3, callback;

                beforeEach(function() {
                    callback1 = jasmine.createSpy('callback1');
                    callback2 = jasmine.createSpy('callback2');
                    callback3 = jasmine.createSpy('callback3');

                    callback = jasmine.createSpy('callback');

                    mockSiteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap('editor', {applicationId: '2000', type: 'editor', appDefinitionName: 'appName'});
                    mockSiteData.updateClientSpecMap('editor', {applicationId: '2002', type: 'editor', appDefinitionName: 'appName3'});


                    var pageId = mockSiteData.getCurrentUrlPageId();

                    var compData1 = {
                        applicationId: '2000',
                        type: 'TPAWidget',
                        tpaData: '#tpaData'
                    };
                    var tpaData = {
                        content: '{"key1": 1}',
                        id: 'tpaData',
                        type: "TPAData"
                    };

                    var compData2 = {
                        applicationId: '2000',
                        type: 'TPAWidget'
                    };
                    var compData3 = {
                        applicationId: '2002',
                        type: 'TPAWidget'
                    };

                    mockSiteData.addPageWithDefaults(pageId).setCurrentPage(pageId);
                    mockSiteData.addData(tpaData, pageId);

                    comp1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData1});
                    comp2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData2});
                    comp3 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData3});

                    tpaEventHandlersService.registerPublicDataChangedHandler(comp1.id, callback1);
                    tpaEventHandlersService.registerPublicDataChangedHandler(comp2.id, callback2);
                    tpaEventHandlersService.registerPublicDataChangedHandler(comp3.id, callback3);

                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                });

                it('should trigger handler only for the component on which set the data when setting data in Component scope', function() {
                    var compPointer1 = componentDetectorAPI.getComponentById(mockPrivateServices, comp1.id);
                    tpaDataService.set(mockPrivateServices, compPointer1, '123', 'value', 'COMPONENT', callback);

                    var content = {123 : 'value'};

                    expect(callback1).toHaveBeenCalledWith(content);
                    expect(callback2).not.toHaveBeenCalled();
                    expect(callback3).not.toHaveBeenCalled();

                });

                it('should trigger handlers only for all components app when setting data in App scope', function() {
                    var compPointer1 = componentDetectorAPI.getComponentById(mockPrivateServices, comp1.id);
                    tpaDataService.set(mockPrivateServices, compPointer1, 'appValue', 'value', 'APP', callback);

                    var content = {appValue : 'value'};

                    expect(callback1).toHaveBeenCalledWith(content);
                    expect(callback2).toHaveBeenCalledWith(content);
                    expect(callback3).not.toHaveBeenCalled();

                });
            });

            describe('data service', function() {
                var callback;
                var pageId = 'page1';
                var compPointer = {
                    id: 'comp1',
                    type: 'DESKTOP'
                };
                var MAX_SIZE_FOR_APP = 1000;
                var MAX_SIZE_FOR_COMP = 400;
                var MAX_SIZE_FOR_SUPER_APP_COMP = 2000;

                var bigValue = {
                    "123": {
                        "_id": "55fa9ba1cac654a7f01278fd",
                        "index": 0,
                        "guid": "74a79693-d887-49aa-9380-15e3e0892ef2",
                        "isActive": false,
                        "balance": "$1,827.59",
                        "picture": "http://placehold.it/32x32",
                        "age": 39,
                        "eyeColor": "green",
                        "name": "Concepcion Cummings",
                        "gender": "female",
                        "company": "UPLINX",
                        "email": "concepcioncummings@uplinx.com",
                        "phone": "+1 (963) 551-3831",
                        "address": "944 Legion Street, Stollings, Alaska, 9110",
                        "about": "Lorem officia do id ipsum dolor veniam ullamco nostrud occaecat ex. Elit laborum officia adipisicing qui dolor fugiat. Qui quis est dolor ullamco eu do commodo quis nostrud. Duis non in minim labore officia consectetur veniam. Magna est exercitation id quis velit laborum exercitation. Exercitation est excepteur nulla non laborum incididunt ullamco consectetur consequat minim proident est. Laborum nulla dolor fugiat sint dolore ea veniam fugiat enim magna consectetur tempor esse.\r\n",
                        "registered": "2015-03-07T03:26:15 -02:00",
                        "latitude": -88.455994,
                        "longitude": 109.67929,
                        "tags": [
                            "veniam",
                            "Lorem",
                            "occaecat",
                            "quis",
                            "cillum",
                            "culpa",
                            "aliquip"
                        ],
                        "friends": [
                            {
                                "id": 0,
                                "name": "Herring Robertson"
                            },
                            {
                                "id": 1,
                                "name": "Hester Burris"
                            },
                            {
                                "id": 2,
                                "name": "Ava Joseph"
                            }
                        ],
                        "greeting": "Hello, Concepcion Cummings! You have 4 unread messages.",
                        "favoriteFruit": "strawberry"
                    },
                    "222": {
                        "_id": "55fa9ba1cac654a7f01278fd",
                        "index": 0,
                        "guid": "74a79693-d887-49aa-9380-15e3e0892ef2",
                        "isActive": false,
                        "balance": "$1,827.59",
                        "picture": "http://placehold.it/32x32",
                        "age": 39,
                        "eyeColor": "green",
                        "name": "Concepcion Cummings",
                        "gender": "female",
                        "company": "UPLINX",
                        "email": "concepcioncummings@uplinx.com",
                        "phone": "+1 (963) 551-3831",
                        "address": "944 Legion Street, Stollings, Alaska, 9110",
                        "about": "Lorem officia do id ipsum dolor veniam ullamco nostrud occaecat ex. Elit laborum officia adipisicing qui dolor fugiat. Qui quis est dolor ullamco eu do commodo quis nostrud. Duis non in minim labore officia consectetur veniam. Magna est exercitation id quis velit laborum exercitation. Exercitation est excepteur nulla non laborum incididunt ullamco consectetur consequat minim proident est. Laborum nulla dolor fugiat sint dolore ea veniam fugiat enim magna consectetur tempor esse.\r\n",
                        "registered": "2015-03-07T03:26:15 -02:00",
                        "latitude": -88.455994,
                        "longitude": 109.67929,
                        "tags": [
                            "veniam",
                            "Lorem",
                            "occaecat",
                            "quis",
                            "cillum",
                            "culpa",
                            "aliquip"
                        ],
                        "friends": [
                            {
                                "id": 0,
                                "name": "Herring Robertson"
                            },
                            {
                                "id": 1,
                                "name": "Hester Burris"
                            },
                            {
                                "id": 2,
                                "name": "Ava Joseph"
                            }
                        ],
                        "greeting": "Hello, Concepcion Cummings! You have 4 unread messages.",
                        "favoriteFruit": "strawberry"
                    }
                };

                var valueForWixApp = {
                    "123": {
                        "about": "Lorem officia do id ipsum dolor veniam ullamco nostrud occaecat ex. Elit laborum officia adipisicing qui dolor fugiat. Qui quis est dolor ullamco eu do commodo quis nostrud. Duis non in minim labore officia consectetur veniam. Magna est exercitation id quis velit laborum exercitation. Exercitation est excepteur nulla non laborum incididunt ullamco consectetur consequat minim proident est. Laborum nulla dolor fugiat sint dolore ea veniam fugiat enim magna consectetur tempor esse.\r\n",
                        "registered": "2015-03-07T03:26:15 -02:00",
                        "latitude": -88.455994,
                        "longitude": 109.67929,
                        "greeting": "Hello, Concepcion Cummings! You have 4 unread messages.",
                        "favoriteFruit": "strawberry"
                    }
                };


                var mockPs;


                var compData;
                beforeEach(function() {
                    callback = jasmine.createSpy('callback');
                    compData = {
                        applicationId: '15'
                    };
                    spyOn(component.data, 'get').and.returnValue(compData);
                    spyOn(structure, 'isShowOnAllPages').and.returnValue(false);
                    spyOn(dataModel, 'addSerializedDataItemToPage');
                    spyOn(component.data, 'update');
                    spyOn(clientSpecMapService, 'getAppData');

                    var pages = {};
                    pages[pageId] = {components: [{id: compPointer.id}]};
                    var siteData = privateServicesHelper.getSiteDataWithPages(pages, pageId);
                    mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                describe('setValue', function() {
                    it('should return error if value is not valid', function() {
                        tpaDataService.set(mockPs, compPointer, '123', function(){}, 'APP', callback);

                        expect(callback).toHaveBeenCalledWith({error: {
                            'message': 'Invalid value: value should be of type: string, boolean, number or Json'
                        }});
                        expect(component.data.get).not.toHaveBeenCalled();
                    });

                    it('should set new data is component scope', function() {
                        tpaDataService.set(mockPs, compPointer, '123', 'value', 'COMPONENT', callback);

                        var content = {123 : 'value'};
                        var expectedTpaData = {
                            content: JSON.stringify(content),
                            id: jasmine.any(String),
                            type: 'TPAData'
                        };

                        var expectedCompData = _.clone(compData, true);
                        expectedCompData.tpaData = jasmine.any(String);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, pageId, expectedTpaData, jasmine.any(String));
                        expect(component.data.update).toHaveBeenCalledWith(mockPs, compPointer, expectedCompData);
                        expect(callback).toHaveBeenCalledWith(content);
                    });

                    it('should set new data is component scope in master page if comp is glued', function() {
                        var tempCompData = {
                            applicationId: '17'
                        };
                        component.data.get.and.returnValue(tempCompData);
                        mockPs.dal.addPageWithDefaults('masterPage', [{id: 'masterComp'}]);
                        var pagePointer = mockPs.pointers.components.getMasterPage('DESKTOP');
                        var cPointer = mockPs.pointers.components.getComponent('masterComp', pagePointer);
                        tpaDataService.set(mockPs, cPointer, '123', 'value', 'COMPONENT', callback);

                        var content = {'123' : 'value'};
                        var expectedTpaData = {
                            content: JSON.stringify(content),
                            id: jasmine.any(String),
                            type: 'TPAData'
                        };

                        var expectedCompData = _.clone(tempCompData);
                        expectedCompData.tpaData = jasmine.any(String);

                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, 'masterPage', expectedTpaData, jasmine.any(String));
                        expect(component.data.update).toHaveBeenCalledWith(mockPs, cPointer, expectedCompData);
                        expect(callback).toHaveBeenCalledWith(content);
                    });

                    it('should set new data is app scope', function() {
                        tpaDataService.set(mockPs, compPointer, '123', 'value', 'APP', callback);

                        var content = {'123' : 'value'};
                        var expectedTpaData = {
                            content: JSON.stringify(content),
                            id: 'tpaData-15',
                            type: 'TPAGlobalData'
                        };

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, 'masterPage', expectedTpaData, 'tpaData-15');
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith(content);
                    });

                    it('should update data is component scope', function() {
                        var oldCompData = _.clone(compData, true);
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                        oldCompData.tpaData = oldTpaData;
                        component.data.get.and.returnValue(oldCompData);
                        tpaDataService.set(mockPs, compPointer, '222', 'new-value-2', 'COMPONENT', callback);

                        var expectedContent = {
                            '123' : 'oldValue',
                            '222' : 'new-value-2'
                        };
                        var expectedTpaData = _.clone(oldTpaData);
                        expectedTpaData.content = JSON.stringify(expectedContent);

                        var expectedCompData = _.clone(oldCompData);
                        expectedCompData.tpaData = jasmine.any(String);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, pageId, expectedTpaData, 'tpaDataId');
                        expect(component.data.update).toHaveBeenCalledWith(mockPs, compPointer, expectedCompData);
                        expect(callback).toHaveBeenCalledWith(_.pick(expectedContent, '222'));
                    });

                    it('should update data is app scope', function() {
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaData-15',
                            type: 'TPAGlobalData'
                        };
                        mockPs.dal.addData(oldTpaData);
                        tpaDataService.set(mockPs, compPointer, '222', 'new-value-2', 'APP', callback);

                        var expectedContent = {
                            '123' : 'oldValue',
                            '222' : 'new-value-2'
                        };
                        var expectedTpaData = _.clone(oldTpaData);
                        expectedTpaData.content = JSON.stringify(expectedContent);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, 'masterPage', expectedTpaData, 'tpaData-15');
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith(_.pick(expectedContent, '222'));
                    });

                    it('should update key value in component scope', function() {
                        var oldCompData = _.clone(compData, true);
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                        oldCompData.tpaData = oldTpaData;
                        component.data.get.and.returnValue(oldCompData);
                        tpaDataService.set(mockPs, compPointer, '123', 'new-value', 'COMPONENT', callback);

                        var expectedContent = {"123" : "new-value"};

                        var expectedTpaData = {
                            content: JSON.stringify(expectedContent),
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };

                        var expectedCompData = _.clone(oldCompData);
                        expectedCompData.tpaData = jasmine.any(String);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, pageId, expectedTpaData, 'tpaDataId');
                        expect(component.data.update).toHaveBeenCalledWith(mockPs, compPointer, expectedCompData);
                        expect(callback).toHaveBeenCalledWith(expectedContent);
                    });

                    it('should update key value in app scope', function() {
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaData-15',
                            type: 'TPAGlobalData'
                        };
                        mockPs.dal.addData(oldTpaData);
                        tpaDataService.set(mockPs, compPointer, '123', 'new-value', 'APP', callback);

                        var expectedContent = {"123" : "new-value"};

                        var expectedTpaData = {
                            content: JSON.stringify(expectedContent),
                            id: 'tpaData-15',
                            type: 'TPAGlobalData'
                        };

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, 'masterPage', expectedTpaData, 'tpaData-15');
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith(expectedContent);
                    });

                    it('should not return error if trying to set key in app scope that exist in component scope', function() {
                        var oldCompData = _.clone(compData, true);
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                        oldCompData.tpaData = oldTpaData;
                        component.data.get.and.returnValue(oldCompData);

                        tpaDataService.set(mockPs, compPointer, '123', 'new-value', 'APP', callback);

                        var expectedContent = {"123" : "new-value"};

                        var expectedTpaData = {
                            content: JSON.stringify(expectedContent),
                            id: 'tpaData-15',
                            type: 'TPAGlobalData'
                        };
                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, 'masterPage', expectedTpaData, 'tpaData-15');
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith(expectedContent);
                    });

                    it('should return error if trying to set value in component scope that exceeds the provided content space', function() {
                        var oldCompData = _.clone(compData, true);
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                        oldCompData.tpaData = oldTpaData;
                        component.data.get.and.returnValue(oldCompData);
                        tpaDataService.set(mockPs, compPointer, '555', bigValue, 'COMPONENT', callback);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).not.toHaveBeenCalled();
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'Your app has exceeded the provided ' + MAX_SIZE_FOR_COMP + ' chars storage space'
                            }
                        });
                    });

                    it('should return error if trying to set value in component scope that exceeds the provided content space for a wix app', function() {
                        var oldCompData = _.clone(compData, true);
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                        oldCompData.tpaData = oldTpaData;
                        component.data.get.and.returnValue(oldCompData);
                        clientSpecMapService.getAppData.and.returnValue({
                            isWixTPA: true
                        });

                        tpaDataService.set(mockPs, compPointer, '555', bigValue, 'COMPONENT', callback);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).not.toHaveBeenCalled();
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'Your app has exceeded the provided ' + MAX_SIZE_FOR_SUPER_APP_COMP + ' chars storage space'
                            }
                        });
                    });

                    it('should update key value in component scope for a wix app', function() {
                        var oldCompData = _.clone(compData, true);
                        var oldTpaData = {
                            content: '{ "123" : "oldValue" }',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                        oldCompData.tpaData = oldTpaData;
                        component.data.get.and.returnValue(oldCompData);
                        clientSpecMapService.getAppData.and.returnValue({
                            isWixTPA: true
                        });
                        tpaDataService.set(mockPs, compPointer, '123', valueForWixApp, 'COMPONENT', callback);

                        var expectedContent = {"123" : valueForWixApp};

                        var expectedTpaData = {
                            content: JSON.stringify(expectedContent),
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };


                        var expectedCompData = _.clone(oldCompData);
                        expectedCompData.tpaData = jasmine.any(String);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, pageId, expectedTpaData, 'tpaDataId');
                        expect(component.data.update).toHaveBeenCalledWith(mockPs, compPointer, expectedCompData);
                        expect(callback).toHaveBeenCalledWith(expectedContent);
                    });



                    it('should return error if trying to set value in comp scope that exceeds the provided storage space', function() {
                        tpaDataService.set(mockPs, compPointer, '555', bigValue, 'APP', callback);

                        expect(component.data.get).toHaveBeenCalled();
                        expect(dataModel.addSerializedDataItemToPage).not.toHaveBeenCalled();
                        expect(component.data.update).not.toHaveBeenCalled();
                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'Your app has exceeded the provided ' + MAX_SIZE_FOR_APP + ' bytes storage space'
                            }
                        });
                    });

                    it('should not throw errors if callback is not provided in component', function(){
                        expect(tpaDataService.set.bind(null, mockPs, compPointer, 'key', 'value', 'COMPONENT')).not.toThrow();
                    });

                    it('should not throw errors if callback is not provided', function(){
                        expect(tpaDataService.set.bind(null, mockPs, compPointer, 'key1212', 'value', 'APP')).not.toThrow();
                    });
                });

                describe('getValue', function() {
                    it('should return error if key not found in component scope', function() {
                        var emptyCompData = {
                            applicationId: '18'
                        };
                        component.data.get.and.returnValue(emptyCompData);

                        tpaDataService.getComponentValue(mockPs, compPointer, '555', callback);

                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'key 555 not found in COMPONENT scope'
                            }
                        });
                    });

                    it('should return error if key not found in app scope', function() {
                        var emptyCompData = {
                            applicationId: '18'
                        };
                        component.data.get.and.returnValue(emptyCompData);

                        tpaDataService.getAppValue(mockPs, compPointer, '555', callback);

                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'key 555 not found in APP scope'
                            }
                        });
                    });

                    describe('should look for key in component and app data', function() {
                        beforeEach(function() {
                            var compData2 = {
                                applicationId: '17',
                                tpaData: {
                                    content: '{ "222": "componentValue"}',
                                    id: 'tpaDataId',
                                    type: 'TPAData'
                                }
                            };
                            component.data.get.and.returnValue(compData2);

                            var tpaData = {
                                content: '{ "333" : "oldValue"}',
                                id: 'tpaData-17',
                                type: 'TPAGlobalData'
                            };
                            mockPs.dal.addData(tpaData);
                        });

                        it('should return value from component data', function() {
                            tpaDataService.getComponentValue(mockPs, compPointer, '222', callback);

                            expect(callback).toHaveBeenCalledWith({
                                222: 'componentValue'
                            });
                        });

                        it('should return value from app data', function() {
                            tpaDataService.getAppValue(mockPs, '17', '333', callback);

                            expect(callback).toHaveBeenCalledWith({
                                '333' : 'oldValue'
                            });
                        });
                    });
                });

                describe('remove', function() {
                    it('should return error if key not found in component scope', function() {
                        var emptyCompData = {
                            applicationId: '18'
                        };
                        component.data.get.and.returnValue(emptyCompData);

                        tpaDataService.remove(mockPs, compPointer, '555', 'COMPONENT', callback);

                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'key 555 not found in COMPONENT scope'
                            }
                        });
                    });

                    it('should return error if key not found in app scope', function() {
                        var emptyCompData = {
                            applicationId: '18'
                        };
                        component.data.get.and.returnValue(emptyCompData);

                        tpaDataService.remove(mockPs, compPointer, '555', 'APP', callback);

                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'key 555 not found in APP scope'
                            }
                        });
                    });

                    describe('should look for key in component and app data', function() {
                        beforeEach(function() {
                            var compData2 = {
                                applicationId: '17',
                                tpaData: {
                                    content: '{ "222" : "componentValue" }',
                                    id: 'tpaDataId',
                                    type: 'TPAData'
                                }
                            };
                            component.data.get.and.returnValue(compData2);

                            var tpaData = {
                                content: '{ "333" : "oldValue" }',
                                id: 'tpaData-17',
                                type: 'TPAGlobalData'
                            };
                            mockPs.dal.addData(tpaData);
                        });

                        it('should return error if key not found in component scope', function() {
                            tpaDataService.remove(mockPs, compPointer, '555', 'COMPONENT', callback);

                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'key 555 not found in COMPONENT scope'
                                }
                            });
                        });

                        it('should return error if key not found in app scope', function() {
                            tpaDataService.remove(mockPs, compPointer, '555', 'APP', callback);

                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'key 555 not found in APP scope'
                                }
                            });
                        });

                        it('should remove value from component data', function() {
                            tpaDataService.remove(mockPs, compPointer, '222', 'COMPONENT', callback);

                            var expectedTpaData = {
                                content: '{}',
                                id: 'tpaDataId',
                                type: 'TPAData'
                            };

                            expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, pageId, expectedTpaData, expectedTpaData.id);
                            expect(callback).toHaveBeenCalledWith({
                                222: 'componentValue'
                            });
                        });

                        it('should remove value from app data', function() {
                            tpaDataService.remove(mockPs, compPointer, '333', 'APP', callback);

                            var expectedTpaData = {
                                content: '{}',
                                id: 'tpaData-17',
                                type: 'TPAGlobalData'
                            };

                            expect(dataModel.addSerializedDataItemToPage).toHaveBeenCalledWith(mockPs, 'masterPage', expectedTpaData, expectedTpaData.id);
                            expect(callback).toHaveBeenCalledWith({
                                '333' : 'oldValue'
                            });
                        });
                    });
                });

                describe('getMulti', function() {
                    it('should return error if key not found in component scope', function() {
                        var emptyCompData = {
                            applicationId: '18'
                        };
                        component.data.get.and.returnValue(emptyCompData);

                        tpaDataService.getComponentValues(mockPs, compPointer, ['555', '222'], callback);

                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'keys 555,222 not found in COMPONENT scope'
                            }
                        });
                    });

                    it('should return error if key not found in app scope', function() {
                        var emptyCompData = {
                            applicationId: '18'
                        };
                        component.data.get.and.returnValue(emptyCompData);

                        tpaDataService.getAppValues(mockPs, '17', ['555', '222'], callback);

                        expect(callback).toHaveBeenCalledWith({
                            error: {
                                message: 'keys 555,222 not found in APP scope'
                            }
                        });
                    });

                    describe('should look for keys in component and app data', function() {
                        beforeEach(function() {
                            var compData3 = {
                                applicationId: '17',
                                tpaData: {
                                    content: '{ "222": "componentValue", "444": "value2" }',
                                    id: 'tpaDataId',
                                    type: 'TPAData'
                                }
                            };
                            component.data.get.and.returnValue(compData3);

                            var tpaData = {
                                content: '{ "333": "oldValue", "555": "value2"}',
                                id: 'tpaData-17',
                                type: 'TPAData'
                            };
                            mockPs.dal.addData(tpaData);
                        });

                        it('should return error if key not found in component scope', function() {
                            tpaDataService.getComponentValues(mockPs, compPointer, ['666', '222'], callback);

                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'keys 666 not found in COMPONENT scope'
                                }
                            });
                        });

                        it('should get values from component data in app scope', function() {
                            tpaDataService.getComponentValues(mockPs, compPointer, ['222', '444'], callback);

                            expect(callback).toHaveBeenCalledWith({
                                222: 'componentValue',
                                444: 'value2'
                            });
                        });

                        it('should get values from component data in app scope even if duplicates keys are given', function() {
                            tpaDataService.getComponentValues(mockPs, compPointer, ['222', '444', '222'], callback);

                            expect(callback).toHaveBeenCalledWith({
                                222: 'componentValue',
                                444: 'value2'
                            });
                        });

                        it('should get values from app data', function() {
                            tpaDataService.getAppValues(mockPs, '17', ['333', '555'], callback);

                            expect(callback).toHaveBeenCalledWith({
                                '333': 'oldValue',
                                '555': 'value2'
                            });
                        });

                        it('should get values from app data even if duplicates keys are given', function() {
                            tpaDataService.getAppValues(mockPs, '17', ['333', '555', '333'], callback);

                            expect(callback).toHaveBeenCalledWith({
                                '333': 'oldValue',
                                '555': 'value2'
                            });
                        });
                    });
                });

                describe('runGarbageCollection', function() {
                    beforeEach(function() {
                        var dataItem = getDataItem();
                        dataItem.id = 'tpaData-1000';
                        mockPs.dal.addData(dataItem);
                        dataItem = getDataItem();
                        dataItem.id = 'tpaData-1020';
                        mockPs.dal.addData(dataItem);
                        spyOn(mockPs.dal, 'set').and.callThrough();
                        spyOn(mockPs.dal, 'remove').and.callThrough();
                    });

                    function getDataItem(){
                        return {
                            content: '{ "333": "oldValue", "555": "value2"}',
                            id: 'tpaDataId',
                            type: 'TPAData'
                        };
                    }

                    it('should not delete tpa data if there are no orphans one', function() {
                        spyOn(installedTpaAppsOnSiteService, 'getDeletedAppsIds').and.returnValue(undefined);

                        tpaDataService.runGarbageCollection(mockPs);

                        expect(mockPs.dal.set).not.toHaveBeenCalled();
                        expect(mockPs.dal.remove).not.toHaveBeenCalled();
                    });

                    it('should delete orphan tpa data', function() {
                        spyOn(installedTpaAppsOnSiteService, 'getDeletedAppsIds').and.returnValue(['1000', '1020']);

                        tpaDataService.runGarbageCollection(mockPs);

                        var pointer = mockPs.pointers.general.getOrphanPermanentDataNodes();
                        var orphanNodes = mockPs.dal.get(pointer);
                        expect(orphanNodes).toEqual(['tpaData-1000', 'tpaData-1020']);
                        expect(mockPs.dal.remove).toHaveBeenCalled();
                    });

                    it('should merge orphan tpa data with orphan nodes', function() {
                        spyOn(installedTpaAppsOnSiteService, 'getDeletedAppsIds').and.returnValue(['1000', '1020']);

                        tpaDataService.runGarbageCollection(mockPs);

                        var pointer = mockPs.pointers.general.getOrphanPermanentDataNodes();
                        var orphanNodes = mockPs.dal.get(pointer);
                        expect(orphanNodes).toEqual(['tpaData-1000', 'tpaData-1020']);
                        expect(mockPs.dal.remove).toHaveBeenCalled();

                    });
                });
            });
        });

    });
