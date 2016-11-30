define(['zepto', 'lodash', 'core', 'utils', 'animations', 'react', 'definition!tpa/handlers/tpaHandlers', 'tpa/utils/tpaUtils',
    'tpa/utils/tpaStyleUtils', 'tpa/bi/errors', 'tpa/handlers/anchorHandlers', 'tpa/services/clientSpecMapService', 'experiment', 'testUtils'],
    function($, _, core, utils, animations, React, tpaHandlerDef, tpaUtils, tpaStyleUtils, tpaErrors, anchorHandlers, clientSpecMapService, experiment, testUtils) {
    'use strict';

    describe('navigateToSection handler tests', function () {
        var siteAPI,
            mockComp,
            pageToWidget,
            pageServiceMock,
            spies,
            pageComponentsMock,
            siteData;

        beforeEach(function () {
            spies = {
                setState: jasmine.createSpy(),
                getCurrentUrlPageId: jasmine.createSpy().and.returnValue(0),
                navigateToPage: jasmine.createSpy(),
                getComponentById: jasmine.createSpy(),
                mapPageToWidgets: jasmine.createSpy(),
                getAppData: jasmine.createSpy(),
                getComponentsByPageId: jasmine.createSpy(),
                callback: jasmine.createSpy()
            };

            siteData = testUtils.mockFactory.mockSiteData();

            pageComponentsMock = [
                {
                    setState: spies.setState,
                    isTPASection: true
                }
            ];

            mockComp = {
                getAppData: spies.getAppData,
                setState: spies.setState
            };

            pageToWidget = {
                1: [
                    {
                        pageId: "pageId1",
                        tpaId: 1,
                        tpaPageId: undefined
                    },
                    {
                        pageId: "pageId2",
                        tpaId: 2,
                        tpaPageId: "tpaPageId"
                    }
                ]
            };

            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            _.assign(siteAPI, {
                getCurrentUrlPageId: spies.getCurrentUrlPageId,
                navigateToPage: spies.navigateToPage,
                getComponentById: spies.getComponentById,
                getComponentsByPageId: spies.getComponentsByPageId,
                getSiteData: function() { return siteData; }
            });

            pageServiceMock = {
                mapPageToWidgets: spies.mapPageToWidgets
            };

            spies.getComponentById.and.returnValue(mockComp);
            spies.mapPageToWidgets.and.returnValue(pageToWidget);
            spies.getAppData.and.returnValue({
                applicationId: '1'
            });
            spies.getComponentsByPageId.and.returnValue(pageComponentsMock);

            spyOn(utils.logger, 'reportBI');

            this.tpaHandlers = tpaHandlerDef($, _, React, core, utils, animations, null, pageServiceMock, clientSpecMapService, tpaUtils, tpaStyleUtils, tpaErrors, null, anchorHandlers, experiment);
        });

        it('should navigate to page even if not state of page ID is set', function () {
            this.tpaHandlers.navigateToSectionPage(siteAPI, {data: { }}, spies.callback);
            expect(spies.callback).not.toHaveBeenCalledWith({
                error: {
                    message: 'Page with app "' + window.name + '" was not found.'
                }
            });
            expect(spies.setState).toHaveBeenCalledWith({sectionUrlState:  undefined});
            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId1', pageAdditionalData: undefined}, undefined, undefined);
        });

        it('should navigate to page when site has a section app', function () {
            var msg = {
                data: {
                    sectionIdentifier: {
                        sectionId: 'tpaPageId'
                    }
                }
            };
            this.tpaHandlers.navigateToSectionPage(siteAPI, msg, spies.callback);

            expect(spies.callback).not.toHaveBeenCalledWith({
                error: {
                    message: 'Page with app "' + window.name + '" was not found.'
                }
            });
            expect(spies.setState).toHaveBeenCalledWith({sectionUrlState: undefined});
            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId2', pageAdditionalData: undefined}, undefined, undefined);
        });

        it('should not navigate to page when site a section app was not found', function () {
            var msg = {
                data: {
                    sectionIdentifier: {
                        sectionId: 'tpaPageId2'
                    }
                }
            };
            this.tpaHandlers.navigateToSectionPage(siteAPI, msg, spies.callback);

            expect(spies.callback).toHaveBeenCalledWith({
                error: {
                    message: 'App page with sectionId "tpaPageId2" was not found.'
                }
            });
            var expectedParams = {
                appDefinitionName: '',
                sectionId: 'tpaPageId2'
            };
            expect(utils.logger.reportBI).toHaveBeenCalledWith(siteData, tpaErrors.SDK_NAVIGATION_TO_SECTION_ERROR, expectedParams);
            expect(spies.setState).not.toHaveBeenCalled();
            expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
        });

        it('should navigate to page when site has a section app and API passed a state string', function () {
            this.tpaHandlers.navigateToSectionPage(siteAPI, {data: "state"}, spies.callback);
            expect(spies.callback).not.toHaveBeenCalledWith({
                error: {
                    message: 'Page with app "' + window.name + '" was not found.'
                }
            });
            expect(spies.setState).toHaveBeenCalledWith({sectionUrlState: 'state'});
            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId1', pageAdditionalData: "state"}, undefined, undefined);
        });

        it('should navigate to page when site has a section app and API passed a state object', function () {
            this.tpaHandlers.navigateToSectionPage(siteAPI, {data: {state: "state"}}, spies.callback);
            expect(spies.callback).not.toHaveBeenCalledWith({
                error: {
                    message: 'Page with app "' + window.name + '" was not found.'
                }
            });
            expect(spies.setState).toHaveBeenCalledWith({sectionUrlState: 'state'});
            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId1', pageAdditionalData: "state"}, undefined, undefined);
        });

        it('should handle navigateToSectionPage for site without multi apps', function () {
            spies.getAppData.and.returnValue({
                applicationId: '2',
                appDefinitionName: 'app-with-no-multi-app'
            });
            this.tpaHandlers.navigateToSectionPage(siteAPI, {}, spies.callback);
            expect(spies.callback).toHaveBeenCalledWith({
                error: {
                    message: 'Page with app "' + 'app-with-no-multi-app' + '" was not found.'
                }
            });
            expect(spies.setState).not.toHaveBeenCalledWith();
        });

        it('should report bi error navigateToSectionPage for site without multi apps', function () {
            spies.getAppData.and.returnValue({
                applicationId: '2',
                appDefinitionName: 'app-with-no-multi-app'
            });
            this.tpaHandlers.navigateToSectionPage(siteAPI, {}, spies.callback);
            var expectedParams = {
                appDefinitionName: 'app-with-no-multi-app',
                sectionId: ''
            };
            expect(utils.logger.reportBI).toHaveBeenCalledWith(siteData, tpaErrors.SDK_NAVIGATION_TO_SECTION_ERROR, expectedParams);
        });

        it('should return error when comp was not found', function () {
            spies.getComponentById.and.returnValue(undefined);
            this.tpaHandlers.navigateToSectionPage(siteAPI, {}, spies.callback);
            expect(spies.callback).toHaveBeenCalledWith({
                error: {
                    message: 'Component was not found.'
                }
            });

            var expectedParams = {
                appDefinitionName: '',
                sectionId: ''
            };

            expect(utils.logger.reportBI).toHaveBeenCalledWith(siteData, tpaErrors.SDK_NAVIGATION_TO_SECTION_ERROR, expectedParams);
        });

        it('should navigate to section page with no transition', function() {
            var msg = {
                data: {
                    sectionIdentifier: {
                        noTransition: true
                    }
                }
            };
            this.tpaHandlers.navigateToSectionPage(siteAPI, msg, spies.callback);
            expect(spies.callback).not.toHaveBeenCalled();

            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId1', pageAdditionalData: undefined, transition: 'none'}, undefined, undefined);

        });

        it('should navigate to section page with default transition in case noTransition is false', function() {
            var msg = {
                data: {
                    sectionIdentifier: {
                        noTransition: false
                    }
                }
            };
            this.tpaHandlers.navigateToSectionPage(siteAPI, msg, spies.callback);
            expect(spies.callback).not.toHaveBeenCalled();

            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId1', pageAdditionalData: undefined}, undefined, undefined);

        });

        it('should navigate to section with default transition', function() {
            this.tpaHandlers.navigateToSectionPage(siteAPI, {}, spies.callback);
            expect(spies.callback).not.toHaveBeenCalled();
            expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId1', pageAdditionalData: undefined}, undefined, undefined);

        });
    });
});
