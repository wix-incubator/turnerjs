define(['lodash', 'testUtils', 'documentServices/siteAccessLayer/DocumentServicesSiteAPI'], function (_, testUtils, DocumentServicesSiteAPI) {
    'use strict';

    describe('DocumentServicesSiteAPI', function () {

        var siteAPI;
        var mockWixSiteReact;

        function getMockWixSiteReactComp() {
            var site = testUtils.mockFactory.mockWixSiteReact();

            _.set(site, 'props.siteData.siteId', 'mockSiteId');

            spyOn(site, 'setState');
            spyOn(site, 'updateSingleComp');
            spyOn(site, 'isDomOnlyByMethodNamesAndCompId');
            spyOn(site, 'updateMultipleComps');
            spyOn(site, 'markInvokedMethodNames');

            return site;
        }

        describe('forceUpdate', function () {

            beforeEach(function () {
                mockWixSiteReact = getMockWixSiteReactComp();
                siteAPI = new DocumentServicesSiteAPI(mockWixSiteReact);
                spyOn(siteAPI, 'isComponentRenderedOnSite').and.returnValue(true);
            });

            it('should update multiple comps if all comps need DOM only change', function () {
                var noEnforceAnchors = true;
                var comps = [{}];
                var methodNames = 'domOnlyMethod';

                mockWixSiteReact.isDomOnlyByMethodNamesAndCompId.and.returnValue(true);
                siteAPI.forceUpdate(noEnforceAnchors, comps, methodNames);
                expect(mockWixSiteReact.updateMultipleComps).toHaveBeenCalled();
            });

            it('should update single comp if only one comp is passed with non DOM only change', function () {
                var noEnforceAnchors = true;
                var comps = [{}];
                var methodNames = 'mockMethodNames';

                mockWixSiteReact.isDomOnlyByMethodNamesAndCompId.and.returnValue(false);
                siteAPI.forceUpdate(noEnforceAnchors, comps, methodNames);
                expect(mockWixSiteReact.updateSingleComp).toHaveBeenCalled();
            });

            it('should update entire site if more than one comps is passed but not all comps need DOM only change', function () {
                var noEnforceAnchors = true;
                var comps = [{}, {}];
                var methodNames = 'notDomOnlyMethod';

                mockWixSiteReact.isDomOnlyByMethodNamesAndCompId.and.returnValue(false);
                siteAPI.forceUpdate(noEnforceAnchors, comps, methodNames);
                expect(mockWixSiteReact.setState).toHaveBeenCalled();
            });

            it('should update entire site if comps is not an array', function () {
                var noEnforceAnchors = true;
                var comps = 'notArray';
                var methodNames = 'notDomOnlyMethod';

                mockWixSiteReact.isDomOnlyByMethodNamesAndCompId.and.returnValue(false);
                siteAPI.forceUpdate(noEnforceAnchors, comps, methodNames);
                expect(mockWixSiteReact.setState).toHaveBeenCalled();
            });

            it('should update entire site if comps is an empty array', function () {
                var noEnforceAnchors = true;
                var comps = [];
                var methodNames = 'notDomOnlyMethod';

                mockWixSiteReact.isDomOnlyByMethodNamesAndCompId.and.returnValue(false);
                siteAPI.forceUpdate(noEnforceAnchors, comps, methodNames);
                expect(mockWixSiteReact.setState).toHaveBeenCalled();
            });

        });

        //TODO: Alissa implement
        describe("isComponentRenderedOnSite", function(){
            it("should return true if comp on masterPage", function(){

            });

            it("should return true if comp on primary page", function(){

            });

            it("should return true if comp on popup page", function(){

            });

            it("should return false if comp is rendered in some other container, like aspects container", function(){

            });

            it("should return false if no such comp rendered", function(){

            });
        });

        describe('getAllCompsUnderRoot', function() {
            beforeEach(function() {
                this.testContainerId = 'testContainer';
                this.testModeId = 'testMode';
                this.compNotInTestMode = 'compNotInTestMode';
                this.compOutOfContainer = 'compOutOfContainer';
                this.testPageId = 'testPage';
                var desktopCompsStructure = _.map(['desktopComp1', 'desktopComp2'], function (desktopCompId) {
                    return testUtils.mockFactory.createStructure(desktopCompId + 'Type', {}, desktopCompId);
                }, this);
                var compNotInTestModeStructure = testUtils.mockFactory.createStructure(this.compNotInTestMode + 'Type', {
                    layout: {testParam: 'original'},
                    modes: {
                        isHiddenByModes: false,
                        overrides: [{
                            modeIds: [this.testModeId],
                            layout: {testParam: 'override'},
                            isHiddenByModes: true
                        }]
                    }
                }, this.compNotInTestMode);
                var containerComps = desktopCompsStructure.concat(
                    compNotInTestModeStructure
                );
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(this.testPageId)
                    .setPageComponents([
                        testUtils.mockFactory.createStructure(this.compOutOfContainer + 'Type', {}, this.compOutOfContainer),
                        testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                            modes: {definitions: [{modeId: this.testModeId}]},
                            components: containerComps
                        }, this.testContainerId)
                    ], this.testPageId)
                    .setCurrentPage(this.testPageId);

                var site = testUtils.mockFactory.mockWixSiteReactFromFullJson(this.siteData);
                this.DocumentServicesSiteAPI = new DocumentServicesSiteAPI(site);
            });


            it('should return components that are under the given rootId', function() {
                var returnedCompsInDesktop = this.DocumentServicesSiteAPI.getAllCompsUnderRoot(this.testPageId);
                expect(_.map(returnedCompsInDesktop, 'id').sort()).toEqual([
                        this.compOutOfContainer,
                        this.testContainerId,
                        this.compNotInTestMode,
                        'desktopComp1', 'desktopComp2', this.testPageId
                    ].sort()
                );
            });

            it('should return components even if they are not currently displayed', function() {
                this.DocumentServicesSiteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);

                var returnedComponents = this.DocumentServicesSiteAPI.getAllCompsUnderRoot(this.testPageId);

                expect(_.map(returnedComponents, 'id')).toContain(this.compNotInTestMode);
            });

        });

    });

});
