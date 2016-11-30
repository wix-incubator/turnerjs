define(['lodash', 'testUtils', 'core/core/dataRequirementsChecker'], function(_, testUtils, dataRequirementsChecker){
    'use strict';

    function testRequest(request, url, packageName, name){
        expect(request.url).toBe(url);
        expect(request.name).toBe(name);
        expect(request.packageName).toBe(packageName);
    }

    function copyPageToFullJson(siteData, fullJson, pageId) {
        _.set(fullJson, ['pagesData', pageId], _.cloneDeep(_.get(siteData, ['pagesData', pageId])));
    }

    describe("dataRequirementsChecker", function(){

        beforeEach(function(){
            this.fullPagesData = {
                pagesData: {}
            };
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.fullPagesData.pagesData = _.cloneDeep(this.siteData.pagesData);
            this.siteData.santaBase = 'http://sample.com/';
        });

        describe('When no pages are loaded', function () {

            it('should return an array with request for master page and page if no pages at all', function(){
                var pageId = 'fakePage';
                var MASTER_PAGE_CONST_ID = 'masterPage';
                this.siteData.addPageWithData(pageId, {id: 'someDataId'});

                this.siteData.pagesData = {}; // simulate no pages data
                this.fullPagesData.pagesData = {}; // simulate no pages data

                var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': pageId});

                expect(requests.length).toBe(2);
                expect(_.last(requests[0].urls[0].split('/'))).toEqual(MASTER_PAGE_CONST_ID);
                expect(_.last(requests[1].urls[0].split('/'))).toEqual(pageId);
            });

            it('should return an array with a request for the page if masterPage is loaded', function(){
                var pageId = 'fakePage';
                this.siteData.addPageWithData(pageId, {id: 'someDataId'});
                delete this.siteData.pagesData[pageId]; // simulate no page data

                var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': pageId});
                expect(requests.length).toBe(1);
                expect(_.last(requests[0].urls[0].split('/'))).toEqual(pageId);
            });
        });

        describe('Popup pages', function () {

            describe('When the page requested is a popup page', function () {

                it('should request the popup page if it wasn\'t loaded', function () {
                    var popupPageId = 'fakePopupPageId';
                    var somePageId = 'fakePageId';

                    this.siteData.addPageWithData(popupPageId, {isPopup: true});
                    this.fullPagesData.pagesData[popupPageId] = this.siteData.pagesData[popupPageId];
                    this.siteData.addPage({id: somePageId});
                    this.fullPagesData.pagesData[somePageId] = this.siteData.pagesData[somePageId];
                    delete this.siteData.pagesData[popupPageId];
                    delete this.fullPagesData.pagesData[popupPageId];

                    this.siteData.setCurrentPage(somePageId);

                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': popupPageId});

                    expect(requests.length).toBe(1);
                    expect(_.last(requests[0].urls[0].split('/'))).toEqual(popupPageId);
                });

                it('should also request the primary page if it wasn\'t loaded', function () {
                    var popupPageId = 'fakePopupPageId';
                    var somePageId = 'fakePageId';

                    this.siteData.addPageWithData(popupPageId, {isPopup: true});
                    this.siteData.addPage({id: somePageId});
                    delete this.siteData.pagesData[popupPageId];
                    delete this.siteData.pagesData[somePageId];
                    this.siteData.setCurrentPage(somePageId);

                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': popupPageId});

                    expect(requests.length).toBe(2);
                    expect(_.last(requests[0].urls[0].split('/'))).toEqual(popupPageId);
                    expect(_.last(requests[1].urls[1].split('/'))).toEqual(somePageId);
                });

                it('shouldn\'t request any page if they were loaded', function () {
                    var popupPageId = 'fakePopupPageId';
                    var somePageId = 'fakePageId';

                    this.siteData.addPageWithData(popupPageId, {isPopup: true});
                    this.siteData.addPage({id: somePageId});
                    copyPageToFullJson(this.siteData, this.fullPagesData, popupPageId);
                    copyPageToFullJson(this.siteData, this.fullPagesData, somePageId);

                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': popupPageId});

                    expect(requests.length).toBe(0);
                });
            });
        });

        describe('With pages data loaded', function () {

            beforeEach(function(){
                this.siteData
                  .addPageWithDefaults('page1')
                  .addPageWithDefaults('page2')
                  .addPageWithDefaults('page3');

                this.siteData.publicModel.pageList.mainPageId = 'page3';
                this.siteData.santaBase = 'http://sample.com/';

                ['page1', 'page2', 'page3'].forEach(copyPageToFullJson.bind(this, this.siteData, this.fullPagesData));
            });

            describe("components data", function(){
                it("should return an empty array if pages loaded and no components", function(){
                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': 'page1'});
                    expect(requests.length).toBe(0);
                });

                it("should return an empty array if comps have no analyzers", function(){
                    this.siteData.pagesData.page1.structure = {
                        'componentType': 'page',
                        'children': [{componentType: 'testComp'}]
                    };
                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': 'page1'});
                    expect(requests.length).toBe(0);
                });

                function getRequest(url){
                    return {
                        'url': url,
                        'name': url,
                        'packageName': 'comps'
                    };
                }

                it("should not return an empty array if a comp have an analyser and is on a popup page", function(){
                    var popupPageId = 'fakePopupPageId';
                    this.siteData.addPageWithData(popupPageId, {isPopup: true});

                    dataRequirementsChecker.registerCheckerForCompType('testComp', function () {
                        return [getRequest('testComp')];
                    });

                    this.siteData.pagesData[popupPageId].structure = {
                        'componentType': 'page',
                        'children': [{componentType: 'testComp'}]
                    };
                    copyPageToFullJson(this.siteData, this.fullPagesData, popupPageId);
                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: popupPageId});
                    expect(requests.length).toBe(1);
                    testRequest(requests[0], 'testComp', 'comps', 'testComp');
                });

                it("should not return an empty array if a comp have an analyser", function(){
                    dataRequirementsChecker.registerCheckerForCompType('testComp', function () {
                        return [getRequest('testComp')];
                    });
                    this.siteData.pagesData.page1.structure = {
                        'componentType': 'page',
                        'children': [{componentType: 'testComp'}]
                    };
                    copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');
                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': 'page1'});
                    expect(requests.length).toBe(1);
                    testRequest(requests[0], 'testComp', 'comps', 'testComp');
                });

                it("should return multiple requests", function(){
                    dataRequirementsChecker.registerCheckerForCompType('testComp1', function(){
                        return [getRequest('testComp1')];
                    });
                    dataRequirementsChecker.registerCheckerForCompType('testComp2', function(){
                        return [getRequest('testComp2'), getRequest('testComp22')];
                    });
                    this.siteData.pagesData.page1.structure = {
                        'componentType': 'page',
                        'children': [{componentType: 'testComp1'},
                            {componentType: 'parent',
                                'children':[{componentType: 'dummy'}, {componentType: 'testComp2'}]}]
                    };
                    copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                    var requests = dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': 'page1'});
                    expect(requests.length).toBe(3);
                    testRequest(requests[0], 'testComp1', 'comps', 'testComp1');
                    testRequest(requests[1], 'testComp2', 'comps', 'testComp2');
                    testRequest(requests[2], 'testComp22', 'comps', 'testComp22');
                });
            });

        describe('componentInfo', function () {
            it('should resolve the skin from the style definition if styleId defined', function (done) {
                var skin = 'test-skin';
                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.skins).toEqual([skin]);
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                var compStructure = testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                compStructure.styleId = 'style-id';
                this.siteData.addCompTheme({
                    type: 'TopLevelStyle',
                    styleType: 'custom',
                    skin: skin,
                    style: {
                        groups: {},
                        properties: {},
                        propertiesSource: {}
                    },
                    id: 'style-id'
                });
                copyPageToFullJson(this.siteData, this.fullPagesData, 'masterPage');
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should resolve the skin from the structure if styleId is not defined', function (done) {
                var skin = 'test-skin';
                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.skins).toEqual([skin]);
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                var compStructure = testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                compStructure.skin = skin;
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should resolve skins for all component modes', function (done) {
                var skin = 'test-skin';
                var modeSkin1 = 'modeSkin1';
                var modeSkin2 = 'modeSkin2';
                var compStructure = testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                compStructure.modes = {
                    definitions: [],
                    overrides: [{
                        modeIds: ['someMode'],
                        styleId: 'modeStyle1'
                    }, {
                        modeIds: ['someMode2'],
                        styleId: 'modeStyle2'
                    }]
                };
                this.siteData.addCompTheme({
                    type: 'TopLevelStyle',
                    styleType: 'custom',
                    skin: modeSkin1,
                    style: {
                        groups: {},
                        properties: {},
                        propertiesSource: {}
                    },
                    id: 'modeStyle1'
                });
                this.siteData.addCompTheme({
                    type: 'TopLevelStyle',
                    styleType: 'custom',
                    skin: modeSkin2,
                    style: {
                        groups: {},
                        properties: {},
                        propertiesSource: {}
                    },
                    id: 'modeStyle2'
                });
                compStructure.skin = skin;
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.skins).toEqual([skin, modeSkin1, modeSkin2]);
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should include the resolved data of the component', function (done) {
                var data = {
                    title: 'a title'
                };

                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.data).toEqual(data);
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                var compStructure = testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1', {data: data});
                data = this.siteData.getDataByQuery(compStructure.dataQuery, 'page1');
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should set data to null if the component has no data', function (done) {
                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.data).toBeNull();
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should include the resolved properties of the component', function (done) {
                var properties = {
                    title: 'a title'
                };

                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.properties).toEqual(properties);
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                var compStructure = testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1', {properties: properties});
                properties = this.siteData.getDataByQuery(compStructure.propertyQuery, 'page1', this.siteData.dataTypes.PROPERTIES);
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should set properties to null if the component has no properties', function (done) {
                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.properties).toBeNull();
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should include the component id', function (done) {
                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.id).toEqual(compStructure.id);
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                var compStructure = testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });

            it('should include the page id', function (done) {
                function dataChecker(siteData, componentInfo) {
                    expect(componentInfo.pageId).toEqual('page1');
                    done();
                }

                dataRequirementsChecker.registerCheckerForCompType('MyComponent', dataChecker);
                testUtils.mockFactory.mockComponent('MyComponent', this.siteData, 'page1');
                copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
            });
        });

        describe("all comps of type data", function() {
            it("should call the requestGetter with an array of all comps of the registered type", function () {
                var requestGetter = jasmine.createSpy("requestGetter");

                    dataRequirementsChecker.registerCheckerForAllCompsOfType('testComp1', requestGetter);
                    this.siteData.pagesData.page1.structure = {
                        'componentType': 'page',
                        'children': [
                            {
                                componentType: 'testComp1',
                                skin: "skin1",
                                id: "comp1"
                            },
                            {
                                componentType: 'parent', 'children': [
                                {
                                    componentType: 'testComp1',
                                    skin: "skin2",
                                    id: "comp2"
                                },
                                {componentType: 'testComp2'}
                            ]
                            }
                        ]
                    };
                    copyPageToFullJson(this.siteData, this.fullPagesData, 'page1');

                    dataRequirementsChecker.getNeededRequests(this.siteData, this.fullPagesData, {'pageId': 'page1'});

                    var compInfoArr = [
                        {
                            data: null,
                            properties: null,
                            id: "comp1",
                            skins: ['skin1'],
                            pageId: 'page1'
                        },
                        {
                            data: null,
                            properties: null,
                            id: "comp2",
                            skins: ['skin2'],
                            pageId: 'page1'
                        }
                    ];

                    expect(requestGetter.calls.count()).toEqual(1);
                    expect(requestGetter).toHaveBeenCalledWith(this.siteData, compInfoArr, {pageId: "page1"});
                });
            });
        });
    });
});
