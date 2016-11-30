define([
    'lodash',
    'testUtils',
    'siteUtils/customDataResolvers/connectionListDataResolver'
], function (_, testUtils, connectionListDataResolver) {
    'use strict';
    describe('connectionListDataResolver', function () {

        beforeEach(function () {
            testUtils.experimentHelper.openExperiments('connectionsData');
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.getData = this.siteData.dataResolver.getDataByQuery.bind(this, this.siteData.pagesData, 'masterPage', 'masterPage', this.siteData.dataTypes.CONNECTIONS);
            this.config = {a: 'b'};
        });

        it('should call connectionListDataResolver for data of type "ConnectionItem"', function () {
            var spy = spyOn(connectionListDataResolver, 'resolve');
            var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData);
            var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', this.config);
            var connectionList = testUtils.mockFactory.connectionMocks.connectionList([connectionItem]);
            this.siteData.addConnections(connectionList);
            var expectedConnectionList = _.set(_.assign({}, connectionList), 'items.0.config', JSON.stringify(this.config));

            this.getData(connectionList.id);

            expect(spy).toHaveBeenCalledWith(expectedConnectionList, jasmine.any(Function));
        });

        it('should parse connection config (single connection)', function () {
            var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData);
            var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', this.config);
            var connectionList = testUtils.mockFactory.connectionMocks.connectionList([connectionItem]);
            this.siteData.addConnections(connectionList);

            var result = this.getData(connectionList.id);

            expect(_.get(result, 'items.0.config')).toEqual(connectionItem.config);
            expect(_.map(result.items, _.partialRight(_.omit, 'config'))).toEqual([_.omit(connectionItem, 'config')]);
        });

        it('should do nothing if connection has no config', function(){
            var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData);
            var connectionItemNoConfig = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole');
            var connectionList = testUtils.mockFactory.connectionMocks.connectionList([connectionItemNoConfig]);
            this.siteData.addConnections(connectionList);

            var result = this.getData(connectionList.id);

            expect(result).toEqual(connectionList);
            _.forEach(result.items, function(resultItem){
                expect(resultItem.config).toBeUndefined();
            });
        });

        it('should parse all connection configs and do nothing for connections with no configs (multiple connections)', function(){
            var otherConfig = {b: 'a'};
            var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData);
            var connectionItemWithConfigA = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'roleA', this.config);
            var connectionItemWithoutConfig = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'roleC');
            var connectionItemWithConfigB = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'roleB', otherConfig);
            var connectionList = testUtils.mockFactory.connectionMocks.connectionList([connectionItemWithConfigA, connectionItemWithoutConfig, connectionItemWithConfigB]);
            this.siteData.addConnections(connectionList);

            var result = this.getData(connectionList.id);

            expect(_.get(result, 'items.0.config')).toEqual(connectionItemWithConfigA.config);
            expect(_.get(result, 'items.1.config')).toBeUndefined();
            expect(_.get(result, 'items.2.config')).toEqual(connectionItemWithConfigB.config);
            expect(_.map(result.items, _.partialRight(_.omit, 'config'))).toEqual(_.map(connectionList.items, _.partialRight(_.omit, 'config')));
        });

    });
});
