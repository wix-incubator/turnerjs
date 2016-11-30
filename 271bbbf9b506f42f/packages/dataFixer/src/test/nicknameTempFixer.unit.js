define(['lodash', 'testUtils', 'dataFixer/plugins/nicknameTempFixer'], function(_, testUtils, nicknameTempFixer){
    'use strict';

    describe('nicknameTempFixer', function() {
        var compType = 'wysiwyg.viewer.components.SiteButton';

        function createCompStructureWithNickname(nickname, components) {
            var compStructure = {
                nickname: nickname,
                components: components
            };
            return testUtils.mockFactory.createStructure(compType, compStructure);
        }

        function addMobileCompToPage(siteData, pageId, compId, compNickname) {
            return testUtils.mockFactory.mockComponent(compType, siteData, pageId, {}, true, compId, {nickname: compNickname});
        }

        function addConnectionItemToPage(connectionId, pageId) {
            var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem('someControllerId', 'someRole');
            var connectionList = testUtils.mockFactory.connectionMocks.connectionList([connectionItem], connectionId);
            this.mockSiteData.addConnections(connectionList, pageId);
        }

        beforeEach(function(){
            testUtils.experimentHelper.openExperiments('connectionsData');
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            this.pageId = 'pageId';
            this.masterPageId = 'masterPage';
        });

        describe('when the components is in page', function () {
            it('should remove nickname from comp structure', function () {
                var comp = createCompStructureWithNickname('compNickname');
                this.mockSiteData.addPageWithDefaults(this.pageId, [comp]);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.components, {id: comp.id});
                expect(_.get(compStructure, 'nickname')).not.toBeDefined();
            });

            it('should add a new valid ConnectionList if the component has no connectionQuery', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [comp]);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var connectionQuery = _.get(comp, 'connectionQuery');
	            var connectionListData = pageJson.data.connections_data[connectionQuery];
                expect(testUtils.mockFactory.connectionMocks.isValidConnectionList(connectionListData)).toBeTruthy();
            });

            it('should add wixCode connection to a component', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [comp]);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var connectionQuery = _.get(comp, 'connectionQuery');
                expect(connectionQuery).toBeDefined();
                expect(pageJson.data.connections_data[connectionQuery].items[0].role).toBe(compNickname);
            });

            it('should add wixCode connection to a component that already has connections', function () {
                var compNickname = 'compNickname';
                var connectionId = 'connectionId';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [comp]);
                addConnectionItemToPage.call(this, connectionId, this.pageId);
                comp.connectionQuery = connectionId;
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var connectionsItem = _.get(pageJson, ['data', 'connections_data', connectionId, 'items']);
                expect(connectionsItem.length).toBe(2);
                expect(connectionsItem).toContain({type: 'WixCodeConnectionItem', role: compNickname});
            });

            it('should set the connectionQuery of the desktop component to the corresponding mobile component', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [comp]);
                var mobileComp = addMobileCompToPage(this.mockSiteData, this.pageId, comp.id, compNickname);
                var pageJson = this.mockSiteData.getPageData(this.pageId);
                nicknameTempFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.components, {id: comp.id});
                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(mobileCompStructure.connectionQuery).toEqual(compStructure.connectionQuery);
            });

            it('should remove the nickname from the mobile comp structure', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [comp]);
                var mobileComp = addMobileCompToPage(this.mockSiteData, this.pageId, comp.id);
                var pageJson = this.mockSiteData.getPageData(this.pageId);
                nicknameTempFixer.exec(pageJson);

                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(_.get(mobileCompStructure, 'nickname')).not.toBeDefined();
            });
        });

        describe('when the component is in masterPage', function () {
            it('should remove nickname from comp structure', function () {
                var comp = createCompStructureWithNickname('compNickname');
                testUtils.mockFactory.addCompToPage(this.mockSiteData, this.masterPageId, comp);
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);

                nicknameTempFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.children, {id: comp.id});
                expect(_.get(compStructure, 'nickname')).not.toBeDefined();
            });

            it('should add wixCode connection to a component', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                testUtils.mockFactory.addCompToPage(this.mockSiteData, this.masterPageId, comp);
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);

                nicknameTempFixer.exec(pageJson);

                var connectionQuery = _.get(comp, 'connectionQuery');
                expect(connectionQuery).toBeDefined();
                expect(pageJson.data.connections_data[connectionQuery].items[0].role).toBe(compNickname);
            });

            it('should add wixCode connection to a component that already has connections', function () {
                var compNickname = 'compNickname';
                var connectionId = 'connectionId';
                var comp = createCompStructureWithNickname(compNickname);
                testUtils.mockFactory.addCompToPage(this.mockSiteData, this.masterPageId, comp);

                addConnectionItemToPage.call(this, connectionId, this.masterPageId);
                comp.connectionQuery = connectionId;
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);

                nicknameTempFixer.exec(pageJson);

                var connectionsItem = _.get(pageJson, ['data', 'connections_data', connectionId, 'items']);
                expect(connectionsItem.length).toBe(2);
                expect(connectionsItem).toContain({type: 'WixCodeConnectionItem', role: compNickname});
            });

            it('should set the connectionQuery of the desktop component to the corresponding mobile component', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                testUtils.mockFactory.addCompToPage(this.mockSiteData, this.masterPageId, comp);
                var mobileComp = addMobileCompToPage(this.mockSiteData, this.masterPageId, comp.id, compNickname);
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);
                nicknameTempFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.children, {id: comp.id});
                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(mobileCompStructure.connectionQuery).toEqual(compStructure.connectionQuery);
            });

            it('should remove the nickname from the mobile comp structure', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                testUtils.mockFactory.addCompToPage(this.mockSiteData, this.masterPageId, comp);
                var mobileComp = addMobileCompToPage(this.mockSiteData, this.masterPageId, comp.id, compNickname);
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);
                nicknameTempFixer.exec(pageJson);

                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(_.get(mobileCompStructure, 'nickname')).not.toBeDefined();
            });
        });

        describe('when the component is the page', function () {
            it('should remove nickname from page structure', function () {
                this.mockSiteData.addPageWithDefaults(this.pageId).updatePageStructure(this.pageId, {nickname: 'pageNickName'});
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                expect(_.get(pageJson.structure, 'nickname')).not.toBeDefined();
            });

            it('should add wixCode connection to the page', function () {
                var nickname = 'pageNickName';
                this.mockSiteData.addPageWithDefaults(this.pageId).updatePageStructure(this.pageId, {nickname: nickname});
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var connectionQuery = _.get(pageJson.structure, 'connectionQuery');
                expect(connectionQuery).toBeDefined();
                expect(pageJson.data.connections_data[connectionQuery].items[0].role).toBe(nickname);
            });

            it('should add wixCode connection to a component that already has connections', function () {
                var nickname = 'pageNickName';
                var connectionId = 'connectionId';
                this.mockSiteData.addPageWithDefaults(this.pageId);
                addConnectionItemToPage.call(this, connectionId, this.pageId);
                this.mockSiteData.updatePageStructure(this.pageId, {nickname: nickname, connectionQuery: connectionId});
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var connectionsItem = _.get(pageJson, ['data', 'connections_data', connectionId, 'items']);
                expect(connectionsItem.length).toBe(2);
                expect(connectionsItem).toContain({type: 'WixCodeConnectionItem', role: nickname});
            });
        });

        describe('when the component is the masterPage', function () {
            it('should remove nickname from masterPage structure', function () {
                this.mockSiteData.updatePageStructure(this.masterPageId, {nickname: 'masterPageNickName'});
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);

                nicknameTempFixer.exec(pageJson);

                expect(_.get(pageJson.structure, 'nickname')).not.toBeDefined();
            });

            it('should not add wixCode connection masterPage', function () {
                this.mockSiteData.updatePageStructure(this.masterPageId, {nickname: 'masterPageNickName'});
                var pageJson = this.mockSiteData.getPageData(this.masterPageId);

                nicknameTempFixer.exec(pageJson);

                var connectionQuery = _.get(pageJson.structure, 'connectionQuery');
                expect(connectionQuery).not.toBeDefined();
                expect(_.get(pageJson, ['data', 'connections_data', connectionQuery])).not.toBeDefined();
            });
        });

        describe('mobile only components', function () {
            it('should remove nickname from mobile only components', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [], [comp]);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: comp.id});
                expect(mobileCompStructure.nickname).not.toBeDefined();
            });

            it('should convert mobile only component nickname to connectionQuery', function () {
                var compNickname = 'compNickname';
                var comp = createCompStructureWithNickname(compNickname);
                this.mockSiteData.addPageWithDefaults(this.pageId, [], [comp]);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                nicknameTempFixer.exec(pageJson);

                var connectionQuery = _.get(comp, 'connectionQuery');
                expect(connectionQuery).toBeDefined();
                expect(pageJson.data.connections_data[connectionQuery].items[0].role).toBe(compNickname);
            });
        });
    });
});
