define([
    'lodash',
    'utils',
    'testUtils',
    'core/core/data/RuntimeDal',
    'core/core/data/pointers/DataAccessPointers',
    'core/core/data/pointers/pointersCache',
    'core/core/data/DisplayedJsonDal'
], function (
    _,
    utils,
    testUtils,
    RuntimeDal,
    DataAccessPointers,
    PointersCache,
    DisplayedJsonDal
) {
    'use strict';

    describe('RuntimeDal', function () {

        function getMockCompStructure(compId, layout, connectionId) {
            var comp = {
                id: compId,
                componentType: compId + 'Type',
                type: 'Component',
                skin: compId + 'skin',
                propertyQuery: compId + 'PropQuery',
                dataQuery: '#' + compId + 'DataQuery',
                designQuery: '#' + compId + 'DesignQuery',
                connectionQuery: connectionId,
                styleId: compId + 'PropQuery',
                layout: layout || {},
                modes: {
                    overrides: [{
                        modeIds: ['acive-page-mode-1'],
                        layout: {
                            nir: 'likes-beer'
                        }
                    }]
                }
            };

            return comp;
        }

        function getRuntimeDal(mockSiteData, siteAPI) {
            mockSiteData = mockSiteData || testUtils.mockFactory.mockSiteData();
            var fullPagesData = {pagesData: mockSiteData.pagesData};
            var cache = new PointersCache(mockSiteData, mockSiteData, fullPagesData);
            var displayedDal = new DisplayedJsonDal(mockSiteData, cache.getBoundCacheInstance(false));
            var pointers = new DataAccessPointers(cache);
            var mockSiteAPI = siteAPI || testUtils.mockFactory.mockSiteAPI(mockSiteData);
            var runtimeDal = new RuntimeDal(mockSiteAPI.getSiteData(), mockSiteAPI.getSiteDataAPI(), displayedDal, pointers);
            return runtimeDal;
        }

        describe('reset overrides', function () {
            it('should reset overrides of all components when changing view mode ', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', {data: testUtils.mockFactory.dataMocks.buttonData()});
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', null, true, compStructure.id, {dataQuery: compStructure.dataQuery});
                var runtimeDal = getRuntimeDal(siteData);

                runtimeDal.setCompData(compStructure.id, {label: 'shahar zur'});
                siteData.setMobileView(true);

                expect(runtimeDal.getCompData(compStructure.id)).toEqual(siteData.getDataByQuery(compStructure.dataQuery));
            });

            it('should reset overrides after navigation and after using the runtimeDal in the new page to all components in the old page', function () {
	            var pageId = 'page1';
	            var otherPageId = 'otherPage';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .addPageWithDefaults(otherPageId)
                    .setCurrentPage(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {data: testUtils.mockFactory.dataMocks.buttonData()});
                var compStructureOnOtherPage = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, otherPageId, {data: testUtils.mockFactory.dataMocks.buttonData()});

                var runtimeDal = getRuntimeDal(siteData);
                runtimeDal.setCompData(compStructure.id, {label: 'shahar zur'});

                siteData.setCurrentPage(otherPageId);
                runtimeDal.getCompData(compStructureOnOtherPage.id);

                siteData.setCurrentPage(pageId);
                expect(runtimeDal.getCompData(compStructure.id)).toEqual(siteData.getDataByQuery(compStructure.dataQuery));
            });

            it('should not reset overrides of components that still exist after navigation', function () {
	            var pageId = 'page1';
	            var otherPageId = 'otherPage';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .addPageWithDefaults(otherPageId)
                    .setCurrentPage(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', {data: testUtils.mockFactory.dataMocks.buttonData()});

                var runtimeDal = getRuntimeDal(siteData);
	            var runtimeData = {label: 'shahar zur'};
                runtimeDal.setCompData(compStructure.id, runtimeData);

                siteData.setCurrentPage(otherPageId);
	            var expected = _.defaults(runtimeData, siteData.getDataByQuery(compStructure.dataQuery));
                expect(runtimeDal.getCompData(compStructure.id)).toEqual(expected);
            });
        });

        describe('comp state', function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.siteData);
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            describe('getCompState', function () {
                it('should return a previously set state', function () {
                    this.runtimeDal.setCompState(this.compStructure.id, {key1: 'value1', key2: 'value2'});
                    var compState = this.runtimeDal.getCompState(this.compStructure.id);

                    expect(compState).toEqual({key1: 'value1', key2: 'value2'});
                });

                it('should return an updated state after setting it a second time', function () {
                    this.runtimeDal.setCompState(this.compStructure.id, {key1: 'value1', key2: 'value2'});
                    this.runtimeDal.setCompState(this.compStructure.id, {key1: 'updated value1', key2: 'updated value2'});

                    var compState = this.runtimeDal.getCompState(this.compStructure.id);

                    expect(compState).toEqual({key1: 'updated value1', key2: 'updated value2'});
                });

            });

            describe('setCompState', function () {
                it('should assign partial state into existing state', function () {
                    this.runtimeDal.setCompState(this.compStructure.id, {key1: 'value1', key2: 'value2'});
                    this.runtimeDal.setCompState(this.compStructure.id, {key1: 'updated value1'});

                    var compState = this.runtimeDal.getCompState(this.compStructure.id);

                    expect(compState).toEqual({key1: 'updated value1', key2: 'value2'});
                });

                it('should not do a deep merge for new state', function () {
                    this.runtimeDal.setCompState(this.compStructure.id, {key: {old: 'old value'}});
                    this.runtimeDal.setCompState(this.compStructure.id, {key: {new: 'new value'}});

                    var compState = this.runtimeDal.getCompState(this.compStructure.id);

                    expect(compState).toEqual({key: {new: 'new value'}});
                });

                it('should not overwrite other components', function () {
                    var otherComp = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.siteData);
                    this.runtimeDal.setCompState(this.compStructure.id, {key: 'value comp 1'});
                    this.runtimeDal.setCompState(otherComp.id, {key: 'value comp 2'});

                    var compState = this.runtimeDal.getCompState(this.compStructure.id);

                    expect(compState).toEqual({key: 'value comp 1'});
                });

                it('should return a number', function(){
                    var returnedValue = this.runtimeDal.setCompState(this.compStructure.id, {key1: 'value1', key2: 'value2'});

                    expect(_.isNumber(returnedValue)).toBe(true);
                });

                it('should return a bigger number for every set', function(){
                    var firstReturnedValue = this.runtimeDal.setCompData(this.compStructure.id, {key1: 'value1', key2: 'value2'});
                    var secondReturnedValue = this.runtimeDal.setCompData(this.compStructure.id, {key1: 'value3'});

                    expect(secondReturnedValue).toBeGreaterThan(firstReturnedValue);
                });
            });

            describe('removeCompState', function () {
                it('should remove the state of a component', function () {
                    this.runtimeDal.setCompState(this.compStructure.id, {shahar: 'zur'});
                    this.runtimeDal.removeCompState(this.compStructure.id);

                    expect(this.runtimeDal.getCompState(this.compStructure.id)).not.toBeDefined();
                });

                it('should remove the state of a component even if it has no state', function () {
                    this.runtimeDal.removeCompState(this.compStructure.id);

                    expect(this.runtimeDal.getCompState(this.compStructure.id)).not.toBeDefined();
                });
            });
        });

        describe('comp data', function () {
            var compId = 'compId';
            var compData = {id: compId + 'DataQuery', barvaz: 'oger', shahar: 'zur'};
            var pageId = 'page1';

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId)], pageId)
                    .addData(compData, pageId);

	            this.siteData.setRootNavigationInfo({pageId: pageId});

                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            it('if compData was not set, get the original compData', function () {

                expect(this.runtimeDal.getCompData(compId)).toEqual(compData);
            });


            it('should not change the document data when setting compData in runtime', function () {

            });

            it('set comp data partially should set only the property', function () {
                var newValue = {barvaz: 'oger1'};
                this.runtimeDal.setCompData(compId, newValue);
                var expected = _.defaults(newValue, compData);

                expect(this.runtimeDal.getCompData(compId)).toEqual(expected);
            });

            it('should return a number', function(){
                var returnedValue = this.runtimeDal.setCompData(compId, {key1: 'value1', key2: 'value2'});

                expect(_.isNumber(returnedValue)).toBe(true);
            });

            it('should return a bigger number for every set', function(){
                var firstReturnedValue = this.runtimeDal.setCompData(compId, {key1: 'value1', key2: 'value2'});
                var secondReturnedValue = this.runtimeDal.setCompData(compId, {key1: 'value3'});

                expect(secondReturnedValue).toBeGreaterThan(firstReturnedValue);
            });

            it('getCompData should include changes done to the original comp data which were not overwritten in runtime', function () {
                var newValue = {barvaz: 'oger-new'};
                this.runtimeDal.setCompData(compId, newValue);

                this.siteData.updateData(compData.id, {shahar: 'zur-new'}, pageId);

                expect(this.runtimeDal.getCompData(compId)).toEqual(jasmine.objectContaining({
                    barvaz: 'oger-new',
                    shahar: 'zur-new'
                }));
            });

	        it('should resolve refs in the original dataItem before merging it with the runtime data overrides', function () {
		        var externalLinkData = this.siteData.mock.externalLinkData();
		        this.siteData.updateData(compData.id, this.siteData.mock.imageData({link: '#' + externalLinkData.id}), pageId);

		        var runtimeLinkData = this.runtimeDal.getCompData(compId);

		        expect(runtimeLinkData.link).toEqual(externalLinkData);
	        });
        });

        describe('comp design', function() {
            var compId = 'compId';
            var compDesign = {id: compId + 'DesignQuery', barvaz: 'oger', shahar: 'zur'};
            var pageId = 'page1';

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId)], pageId)
                    .addDesign(compDesign, pageId);

                this.siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            it('if comp design was not set, get the original compDesign', function () {
                var actual = this.runtimeDal.getCompDesign(compId);

                expect(actual).toEqual(compDesign);
            });

            it('should not change the document data when setting compProps in runtime', function () {

            });

            it('set comp design partially should set only the property', function () {
                var newDesign = {shahar: 'ZUR'};
                this.runtimeDal.setCompDesign(compId, newDesign);

                var expected = _.defaults(newDesign, compDesign);
                expect(this.runtimeDal.getCompDesign(compId)).toEqual(expected);
            });

            it('getCompDesign should include changes done to the original comp design which were not overwritten in runtime', function () {
                var newValue = {barvaz: 'oger-new'};
                this.runtimeDal.setCompDesign(compId, newValue);

                this.siteData.updateDesign(compDesign.id, {shahar: 'zur-new'}, pageId);

                expect(this.runtimeDal.getCompDesign(compId)).toEqual(jasmine.objectContaining({
                    barvaz: 'oger-new',
                    shahar: 'zur-new'
                }));
            });
        });

        describe('comp props', function () {
            var compId = 'compId';
            var compProps = {id: compId + 'PropQuery', barvaz: 'oger', shahar: 'zur'};
            var pageId = 'page1';

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId)], pageId)
                    .addProperties(compProps, pageId);

	            this.siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            it('if comp props was not set, get the original compProps', function () {
                var actual = this.runtimeDal.getCompProps(compId);

                expect(actual).toEqual(compProps);
            });

            it('should not change the document data when setting compProps in runtime', function () {

            });

            it('set comp props partially should set only the property', function () {
                var newProps = {shahar: 'ZUR'};
                this.runtimeDal.setCompProps(compId, newProps);

                var expected = _.defaults(newProps, compProps);
                expect(this.runtimeDal.getCompProps(compId)).toEqual(expected);
            });

            it('should return a number', function(){
                var returnedValue = this.runtimeDal.setCompProps(compId, {key1: 'value1', key2: 'value2'});

                expect(_.isNumber(returnedValue)).toBe(true);
            });

            it('should return a bigger number for every set', function(){
                var firstReturnedValue = this.runtimeDal.setCompProps(compId, {key1: 'value1', key2: 'value2'});
                var secondReturnedValue = this.runtimeDal.setCompProps(compId, {key1: 'value3'});

                expect(secondReturnedValue).toBeGreaterThan(firstReturnedValue);
            });

            it('getCompProps should include changes done to the original comp props which were not overwritten in runtime', function () {
                var newValue = {barvaz: 'oger-new'};
                this.runtimeDal.setCompProps(compId, newValue);

                this.siteData.updateProperties(compProps.id, {shahar: 'zur-new'}, pageId);

                expect(this.runtimeDal.getCompProps(compId)).toEqual(jasmine.objectContaining({
                    barvaz: 'oger-new',
                    shahar: 'zur-new'
                }));
            });
        });

        describe('actions and behaviors', function () {
            var compId = 'compId';
            var pageId = 'page1';

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId)], pageId);

	            this.siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            describe('getActionsAndBehaviors', function(){

                function buildCompWithBehaviors(siteData, staticActionsBehaviorsObject){
                    return testUtils.mockFactory.mockComponent('someType', siteData, pageId, {behaviors: JSON.stringify(staticActionsBehaviorsObject)}, false);
                }

                it('default value of actions and behaviors should be an empty array', function () {
                    var actual = this.runtimeDal.getActionsAndBehaviors(compId);

                    expect(actual).toEqual([]);
                });

                it('getActionsAndBehaviors should be able to get actions & behaviors from the site structure', function () {
                    var staticActionsBehaviors = [{action: 'static action'}];

                    this.siteData.addBehaviors({id: 'utka', items: staticActionsBehaviors});
                    this.siteData.updatePageStructure(utils.siteConstants.MASTER_PAGE_ID, {behaviorQuery: 'utka'});

                    var SITE_STRUCTURE_ID = utils.siteConstants.SITE_STRUCTURE_ID;
                    expect(this.runtimeDal.getActionsAndBehaviors(SITE_STRUCTURE_ID)).toEqual(staticActionsBehaviors);
                });

                it('getActionsAndBehaviors should return actions & behaviors from the component structure when no runtime behaviors are set', function () {
                    var staticActionsBehaviors = [{action: 'static action'}];
                    var compStructure = buildCompWithBehaviors(this.siteData, staticActionsBehaviors);

                    expect(this.runtimeDal.getActionsAndBehaviors(compStructure.id)).toEqual([
                        {action: 'static action'}
                    ]);
                });

                it('getActionsAndBehaviors should merge actions & behaviors with the component structure', function() {
                    var staticActionsBehaviors = [{action: 'static action'}];
                    var compStructure = buildCompWithBehaviors(this.siteData, staticActionsBehaviors);

                    var dynamicActionsBehaviors = [{action: 'dynamic action'}];
                    this.runtimeDal.addActionsAndBehaviors(compStructure.id, dynamicActionsBehaviors);

                    expect(this.runtimeDal.getActionsAndBehaviors(compStructure.id).sort()).toEqual([
                        {action: 'static action'},
                        {action: 'dynamic action'}
                    ].sort());
                });

                it('getActionsAndBehaviors should include changes done to static comp behaviors after also adding runtime behaviors', function () {
                    var dynamicActionsBehaviors = [{action: 'dynamic action'}];
                    this.runtimeDal.addActionsAndBehaviors(compId, dynamicActionsBehaviors);

                    var staticActionsBehaviors = [{action: 'static action'}];
                    this.siteData.setComponentBehaviors(compId, staticActionsBehaviors, pageId);

                    expect(this.runtimeDal.getActionsAndBehaviors(compId).sort()).toEqual([
                        {action: 'static action'},
                        {action: 'dynamic action'}
                    ].sort());
                });

                it('add two actionsBehaviors', function () {
                    var actionAndBehavior1 = {barvaz: 'oger'};
                    var actionAndBehavior2 = {shahar: 'zur'};
                    this.runtimeDal.addActionsAndBehaviors(compId, actionAndBehavior1);
                    this.runtimeDal.addActionsAndBehaviors(compId, actionAndBehavior2);

                    expect(this.runtimeDal.getActionsAndBehaviors(compId)).toEqual([actionAndBehavior1, actionAndBehavior2]);
                });
            });


            describe('addActionsAndBehaviors', function(){

                it('should return a number', function(){
                    var returnedValue = this.runtimeDal.addActionsAndBehaviors(compId, {barvaz: 'oger'});

                    expect(_.isNumber(returnedValue)).toBe(true);
                });

                it('should return a bigger number for every add', function(){
                    var firstReturnedValue = this.runtimeDal.addActionsAndBehaviors(compId, {barvaz: 'oger'});
                    var secondReturnedValue = this.runtimeDal.addActionsAndBehaviors(compId, {heli: 'wow'});

                    expect(secondReturnedValue).toBeGreaterThan(firstReturnedValue);
                });
            });

            describe('removeActionsAndBehaviors', function () {

                it('removes action-behavior objects by event type', function () {
                    var actionAndBehavior = {action: {name: 'cellar'}};
                    this.runtimeDal.addActionsAndBehaviors(compId, {action: {name: 'door'}});
                    this.runtimeDal.addActionsAndBehaviors(compId, actionAndBehavior);
                    this.runtimeDal.addActionsAndBehaviors(compId, {action: {name: 'door'}});
                    this.runtimeDal.removeActionsAndBehaviors(compId, {action: {name: 'door'}});
                    expect(this.runtimeDal.getActionsAndBehaviors(compId)).toEqual([actionAndBehavior]);
                });

            });
        });

        describe('connections - getCompConnections', function () {
            var compId = 'compId';
            var pageId = 'page1';

            beforeEach(function () {
            testUtils.experimentHelper.openExperiments('connectionsData');
            this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId)], pageId);

                this.siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            function buildCompWithConnections(siteData, connections){
                return testUtils.mockFactory.mockComponent('someType', siteData, pageId, {connections: connections}, false);
            }

            it('should return an empty array if comp has no connections', function () {
                var actual = this.runtimeDal.getCompConnections(compId);

                expect(actual).toEqual([]);
            });

            it('should return connections from the component structure', function () {
                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, pageId);
                var connections = [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', {src: 'pic'})];
                var compStructure = buildCompWithConnections(this.siteData, connections);

                expect(this.runtimeDal.getCompConnections(compStructure.id)).toEqual(connections);
            });
        });

        describe('layout', function () {
            var compId = 'compId';
            var pageId = 'page1';
            var layout = {barvaz: 'oger', shahar: 'zur'};

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId, layout)], pageId);

	            this.siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            it('default of layout should be from the structure', function () {
                var actual = this.runtimeDal.getCompLayout(compId);

                expect(actual).toEqual(layout);
            });

            it('update the layout partially', function () {
                var currentLayout = this.runtimeDal.getCompLayout(compId);
                var partialValue = {barvaz: 'me-hakavkaz'};
                var expectedLayout = _.merge(currentLayout, partialValue);

                this.runtimeDal.updateCompLayout(compId, partialValue);

                expect(this.runtimeDal.getCompLayout(compId)).toEqual(expectedLayout);
            });

            it('should return a number', function(){
                var returnedValue = this.runtimeDal.updateCompLayout(compId, {barvaz: 'oger'});

                expect(_.isNumber(returnedValue)).toBe(true);
            });

            it('should return a bigger number for every add', function(){
                var firstReturnedValue = this.runtimeDal.updateCompLayout(compId, {barvaz: 'oger'});
                var secondReturnedValue = this.runtimeDal.updateCompLayout(compId, {heli: 'wow'});

                expect(secondReturnedValue).toBeGreaterThan(firstReturnedValue);
            });

            it('getCompLayout should include changes done to the original comp layout which were not overwritten in runtime', function () {
                var newValue = {barvaz: 'oger-new'};
                this.runtimeDal.updateCompLayout(compId, newValue);

                this.siteData.updatePageComponent(compId, {layout: {shahar: 'zur-new'}}, pageId);

                expect(this.runtimeDal.getCompLayout(compId)).toEqual(jasmine.objectContaining({
                    barvaz: 'oger-new',
                    shahar: 'zur-new'
                }));
            });
        });

        describe('getBoundingClientRect', function () {
            var compId = 'compId';
            var pageId = 'page1';
            var layout = {x: 200, y: 100, height: 300, width: 400};

            it('should return the layout from the structure if no measureMap exists', function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId, layout)], pageId);

	            siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(siteData);

                var actual = this.runtimeDal.getBoundingClientRect(compId);

                var expected = {height: 300, width: 400};
                expect(actual).toEqual(expected);
            });

            it('should return the updated layout from the DAL if no measureMap exists', function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId, layout)], pageId);
	            siteData.setRootNavigationInfo({pageId: pageId});

                this.runtimeDal = getRuntimeDal(siteData);
                this.runtimeDal.updateCompLayout(compId, {height: 200});

                var actual = this.runtimeDal.getBoundingClientRect(compId);

                var expected = {height: 200, width: 400};
                expect(actual).toEqual(expected);
            });

            it('should return the layout from measureMap if exists', function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId, layout)], pageId)
                    .addMeasureMap({
                        height: {compId: 3000},
                        width: {compId: 4000}
                    });
                this.runtimeDal = getRuntimeDal(siteData);

                var actual = this.runtimeDal.getBoundingClientRect(compId);

                var expected = {height: 3000, width: 4000};
                expect(actual).toEqual(expected);
            });

            it('should return the layout from measureMap if exists, even if layout was updated', function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId, layout)], pageId)
                    .addMeasureMap({
                        height: {compId: 3000},
                        width: {compId: 4000}
                    });

	            siteData.setRootNavigationInfo({pageId: pageId});

                this.runtimeDal = getRuntimeDal(siteData);
                this.runtimeDal.updateCompLayout(compId, {height: 200});

                var actual = this.runtimeDal.getBoundingClientRect(compId);

                var expected = {height: 3000, width: 4000};
                expect(actual).toEqual(expected);
            });
        });

        describe('component name', function() {

            var compId = 'compId';
            var compName = 'compName';
            var pageId = 'page1';

            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('connectionsData');
            });

            it('should get compId in case name does not exist', function() {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([getMockCompStructure(compId, {})], pageId);

	            siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(siteData);
                expect(this.runtimeDal.getCompName(compId)).toEqual(compId);
            });

            it('should get component name when exists', function() {
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compName)];

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .addConnections(testUtils.mockFactory.connectionMocks.connectionList(connections, 'connection1'), pageId)
                    .setPageComponents([getMockCompStructure(compId, {}, 'connection1')], pageId);

	            siteData.setRootNavigationInfo({pageId: pageId});
                this.runtimeDal = getRuntimeDal(siteData);
                expect(this.runtimeDal.getCompName(compId)).toEqual(compName);
            });

        });

        describe('getPageId', function () {
            it('should return the pageId of the component', function() {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .setPageComponents([
                        getMockCompStructure('page1comp1', {}),
                        getMockCompStructure('page1comp2', {})
                    ], 'page1')
                    .setPageComponents([
                        getMockCompStructure('masterPageComp1', {}),
                        getMockCompStructure('masterPageComp2', {})
                    ], 'masterPage');

	            siteData.setRootNavigationInfo({pageId: 'page1'});
                this.runtimeDal = getRuntimeDal(siteData);

                expect(this.runtimeDal.getPageId('page1')).toEqual('page1');
                expect(this.runtimeDal.getPageId('page1comp1')).toEqual('page1');
                expect(this.runtimeDal.getPageId('page1comp2')).toEqual('page1');
                expect(this.runtimeDal.getPageId('masterPageComp1')).toEqual('masterPage');
                expect(this.runtimeDal.getPageId('masterPageComp2')).toEqual('masterPage');
            });
            it('should return null if no such component exist', function(){
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .setPageComponents([
                        getMockCompStructure('page1comp1', {})
                    ], 'page1');

                siteData.setRootNavigationInfo({pageId: 'page1'});
                this.runtimeDal = getRuntimeDal(siteData);

                expect(this.runtimeDal.getPageId('page1comp2')).toEqual(null);
            });
        });

        describe('getParentId', function () {

            it('should return the ID of the given compoenent\'s parent', function() {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .setPageComponents([
                        testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', null, 'page1button1'),
                        testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                            components: [
                                testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', null, 'page1container1button1'),
                                testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', null, 'page1continer1photo1')
                            ]}, 'page1container1')
                    ], 'page1')
                    .setPageComponents([
                        testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', null, 'masterPagePhoto1')
                    ], 'masterPage');

	            siteData.setRootNavigationInfo({pageId: 'page1'});
                this.runtimeDal = getRuntimeDal(siteData);

                expect(this.runtimeDal.getParentId('page1')).toEqual(null);
                expect(this.runtimeDal.getParentId('page1button1')).toEqual('page1');
                expect(this.runtimeDal.getParentId('page1container1')).toEqual('page1');
                expect(this.runtimeDal.getParentId('page1container1button1')).toEqual('page1container1');
                expect(this.runtimeDal.getParentId('page1continer1photo1')).toEqual('page1container1');
                expect(this.runtimeDal.getParentId('masterPagePhoto1')).toEqual('masterPage');

            });

        });

        describe('registerChangeListeners', function() {

            beforeEach(function(){
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.siteData);
                this.runtimeDal = getRuntimeDal(this.siteData);
            });

            it('should notify registered listeners on new values of data, props, layout & state', function() {
                var testCases = [
                    {setter: 'setCompState', changeType: 'stateChange'},
                    {setter: 'setCompData', changeType: 'dataChange'},
                    {setter: 'setCompProps', changeType: 'propsChange'},
                    {setter: 'updateCompLayout', changeType: 'layoutChange'}
                ];

                var existingValue = {key1: 'value1', key2: 'value2'};
                var updatedValue = {key1: 'new-value1', key2: 'value2'};
                var expectedNotificationValue = {key1: 'new-value1', key2: 'value2'};

                _.forEach(testCases, function(testCase) {
                    this.runtimeDal[testCase.setter](this.compStructure.id, existingValue);

                    var changeListener1 = jasmine.createSpy('changeListener1');
                    var changeListener2 = jasmine.createSpy('changeListener2');
                    this.runtimeDal.registerChangeListener(changeListener1);
                    this.runtimeDal.registerChangeListener(changeListener2);

                    this.runtimeDal[testCase.setter](this.compStructure.id, updatedValue);

                    expect(changeListener1).toHaveBeenCalledWith(this.compStructure.id, {type: testCase.changeType, value: expectedNotificationValue});
                    expect(changeListener2).toHaveBeenCalledWith(this.compStructure.id, {type: testCase.changeType, value: expectedNotificationValue});
                }, this);
            });

            it('should not notify registered listeners on updates which did not cause a change', function() {
                var testCases = [
                    {setter: 'setCompState', changeType: 'stateChange'},
                    {setter: 'setCompData', changeType: 'dataChange'},
                    {setter: 'setCompProps', changeType: 'propsChange'},
                    {setter: 'updateCompLayout', changeType: 'layoutChange'}
                ];

                var existingValue = {key1: 'value1', key2: 'value2'};
                var updatedValue = _.clone(existingValue);

                _.forEach(testCases, function(testCase) {
                    this.runtimeDal[testCase.setter](this.compStructure.id, existingValue);

                    var changeListener1 = jasmine.createSpy('changeListener1');
                    var changeListener2 = jasmine.createSpy('changeListener2');
                    this.runtimeDal.registerChangeListener(changeListener1);
                    this.runtimeDal.registerChangeListener(changeListener2);

                    this.runtimeDal[testCase.setter](this.compStructure.id, updatedValue);

                    expect(changeListener1).not.toHaveBeenCalled();
                    expect(changeListener2).not.toHaveBeenCalled();
                }, this);
            });

        });


        describe('non-displayed components', function() {

            function addContainterWithCompNotDisplayedInMode(containerId, siteData, pageId, firstCompId, secondCompId, modeId) {
                var firstCompConnections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(firstCompId + 'Name')];
                var secondCompConnections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(secondCompId + 'Name')];

                testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {}, false, containerId, {
                    modes: {
                        definitions: [
                            {modeId: modeId}
                        ]
                    }});
                testUtils.mockFactory.mockComponent(firstCompId + 'Type', siteData, pageId, {connections: firstCompConnections}, false, firstCompId, {
                        layout: {testParam: 'original'},
                        modes: {
                            isHiddenByModes: false,
                            overrides: [{
                                modeIds: [modeId],
                                layout: {testParam: 'override'},
                                isHiddenByModes: true
                            }]
                        }
                    }, containerId);
                testUtils.mockFactory.mockComponent(secondCompId + 'Type', siteData, pageId, {connections: secondCompConnections}, false, secondCompId, {
                        layout: {testParam: 'original'},
                        modes: {
                            isHiddenByModes: true,
                            overrides: [{
                                modeIds: [modeId],
                                layout: {testParam: 'override'},
                                isHiddenByModes: false
                            }]
                        }
                    }, containerId);
            }

            beforeEach(function() {
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.testPageId = 'testPageId';
                this.testContainerId = 'containerWithModes';
                this.onlyInMasterCompId = 'onlyInMasterCompId';
                this.onlyInModeCompId = 'onlyInModeCompId';
                this.testModeId = 'testModeId';
                this.fullSiteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(this.testPageId)
                    .setCurrentPage(this.testPageId);
	            this.fullSiteData.setRootNavigationInfo({pageId: this.testPageId});

                addContainterWithCompNotDisplayedInMode(this.testContainerId, this.fullSiteData, this.testPageId, this.onlyInMasterCompId, this.onlyInModeCompId, this.testModeId);

                this.site = testUtils.mockFactory.mockWixSiteReactFromFullJson(this.fullSiteData);
                this.siteAPI = this.site.siteAPI;
	            this.runtimeDal = this.site.siteAPI.getRuntimeDal();
            });

            describe('getCompType', function() {

                it('should work for both displayed and not-displayed components', function() {
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.getCompType(this.onlyInMasterCompId)).toEqual(this.onlyInMasterCompId + 'Type');
                    expect(this.runtimeDal.getCompType(this.onlyInModeCompId)).toEqual(this.onlyInModeCompId + 'Type');

                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.getCompType(this.onlyInMasterCompId)).toEqual(this.onlyInMasterCompId + 'Type');
                    expect(this.runtimeDal.getCompType(this.onlyInModeCompId)).toEqual(this.onlyInModeCompId + 'Type');
                });

            });

            describe('getCompName', function() {

                it('should work for both displayed and not-displayed components', function() {
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.getCompName(this.onlyInMasterCompId)).toEqual(this.onlyInMasterCompId + 'Name');
                    expect(this.runtimeDal.getCompName(this.onlyInModeCompId)).toEqual(this.onlyInModeCompId + 'Name');

                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.getCompName(this.onlyInMasterCompId)).toEqual(this.onlyInMasterCompId + 'Name');
                    expect(this.runtimeDal.getCompName(this.onlyInModeCompId)).toEqual(this.onlyInModeCompId + 'Name');
                });

            });

            describe('getCompLayout', function() {

                it('should return the layout of the currently displayed structure', function() {
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.getCompLayout(this.onlyInModeCompId).testParam).toEqual('override');

                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.getCompLayout(this.onlyInMasterCompId).testParam).toEqual('original');
                });

            });

            describe('isDisplayed', function () {

                it('should return true for components in the displayed json and false for components that are not in the displayed json', function() {
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.isDisplayed(this.testPageId)).toEqual(true);
                    expect(this.runtimeDal.isDisplayed(this.testContainerId)).toEqual(true);
                    expect(this.runtimeDal.isDisplayed(this.onlyInModeCompId)).toEqual(true);
                    expect(this.runtimeDal.isDisplayed(this.onlyInMasterCompId)).toEqual(false);


                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.runtimeDal.isDisplayed(this.testPageId)).toEqual(true);
                    expect(this.runtimeDal.isDisplayed(this.testContainerId)).toEqual(true);
                    expect(this.runtimeDal.isDisplayed(this.onlyInModeCompId)).toEqual(false);
                    expect(this.runtimeDal.isDisplayed(this.onlyInMasterCompId)).toEqual(true);
                });

            });

        });

	    describe('popup hasBeenOpened flags', function() {
		    var popupId = 'c2345p';

		    beforeEach(function () {
			    this.runtimeDal = getRuntimeDal();
		    });

		    it('should be false for any unused popup', function() {
			    expect(this.runtimeDal.hasBeenPopupOpened(popupId)).toEqual(false);
		    });

		    it('should be true after .markPopupAsBeenOpened()', function() {
			    this.runtimeDal.markPopupAsBeenOpened(popupId);

			    expect(this.runtimeDal.hasBeenPopupOpened(popupId)).toEqual(true);
		    });
	    });

        describe('reset', function(){
            it('should reset the single runtimeDal store entry', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var originalData = testUtils.mockFactory.dataMocks.buttonData({label: 'original'});
                var pageId = mockSiteData.getCurrentUrlPageId();
                var compStructure = testUtils.mockFactory.mockComponent('someType', mockSiteData, pageId, {data: originalData});
                var expectedData = mockSiteData.getDataByQuery(compStructure.dataQuery, pageId);
                var runtimeDal = getRuntimeDal(mockSiteData);
                runtimeDal.setCompData(compStructure.id, {label: 'value1'});

                runtimeDal.reset();

                expect(runtimeDal.getCompData(compStructure.id)).toEqual(expectedData);
            });

            it('should reset all runtime store entries', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var originalData = testUtils.mockFactory.dataMocks.buttonData({label: 'original'});
                var originalProperties = testUtils.mockFactory.dataMocks.linkBarProperties();
                var pageId = mockSiteData.getCurrentUrlPageId();
                var compStructure = testUtils.mockFactory.mockComponent('someType', mockSiteData, pageId, {data: originalData, props: originalProperties});
                var expectedData = mockSiteData.getDataByQuery(compStructure.dataQuery, pageId);
                var expectedProperties = mockSiteData.getDataByQuery(compStructure.propertyQuery, pageId, mockSiteData.dataTypes.PROPERTIES);
                var runtimeDal = getRuntimeDal(mockSiteData);
                runtimeDal.setCompData(compStructure.id, {label: 'value1'});
                runtimeDal.setCompProps(compStructure.id, {iconSize: 20, spacing: 1});

                runtimeDal.reset();

                expect(runtimeDal.getCompData(compStructure.id)).toEqual(expectedData);
                expect(runtimeDal.getCompProps(compStructure.id)).toEqual(expectedProperties);
            });
        });

        describe('change view mode', function () {
            it('should not reuse pointers after changing viewMode', function () {
                var compId = 'compId';
                var pageId = 'page1';
	            var compStructure = getMockCompStructure(compId);
                var mobileCompStructure = _.defaults({propertyQuery: 'splitData'}, compStructure);
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([compStructure], pageId)
                    .setPageComponents([mobileCompStructure], pageId, true)
                    .addProperties({id: compId + 'PropQuery', barvaz: 'oger', shahar: 'zur'}, pageId)
                    .addProperties({id: 'splitData', barvaz: 'oger', reut: 'savir'}, pageId)
                    .setCurrentPage(pageId);

                this.runtimeDal = getRuntimeDal(siteData);
                var compProp = this.runtimeDal.getCompProps(compStructure.id);
                siteData.setMobileView(true);

                var mobileCompProp = this.runtimeDal.getCompProps(compStructure.id);
                expect(compProp).not.toEqual(mobileCompProp);

                siteData.setMobileView(false);
                compProp = this.runtimeDal.getCompProps(compStructure.id);
                expect(compProp).not.toEqual(mobileCompProp);
            });
        });
    });
});
