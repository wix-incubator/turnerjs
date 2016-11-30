define(['testUtils', 'santaProps/types/modules/RenderFlagsSantaTypes'], function (/** testUtils */ testUtils, RenderFlagsSantaTypes) {
    'use strict';

    describe('RenderFlagsSantaTypes.', function () {

        it('should return componentViewMode from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                componentViewMode: 'preview'
            };

            var componentViewMode = RenderFlagsSantaTypes.componentViewMode.fetch({siteData: siteData});
            var componentViewModeRequired = RenderFlagsSantaTypes.componentViewMode.isRequired.fetch({siteData: siteData});

            expect(componentViewMode).toEqual(siteData.renderFlags.componentViewMode);
            expect(componentViewModeRequired).toEqual(siteData.renderFlags.componentViewMode);
        });

        it('should return isPlayingAllowed from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                isPlayingAllowed: false
            };

            var isPlayingAllowed = RenderFlagsSantaTypes.isPlayingAllowed.fetch({siteData: siteData});
            var isPlayingAllowedRequired = RenderFlagsSantaTypes.isPlayingAllowed.isRequired.fetch({siteData: siteData});

            expect(isPlayingAllowed).toEqual(false);
            expect(isPlayingAllowedRequired).toEqual(false);
        });

        it('should return shouldResetComponent from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                shouldResetComponent: false
            };

            var shouldResetComponent = RenderFlagsSantaTypes.shouldResetComponent.fetch({siteData: siteData});
            var shouldResetComponentRequired = RenderFlagsSantaTypes.shouldResetComponent.isRequired.fetch({siteData: siteData});

            expect(shouldResetComponent).toEqual(false);
            expect(shouldResetComponentRequired).toEqual(false);
        });

        it('should return renderFixedPositionContainers from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                renderFixedPositionContainers: false
            };

            var renderFixedPositionContainers = RenderFlagsSantaTypes.renderFixedPositionContainers.fetch({siteData: siteData});
            var renderFixedPositionContainersRequired = RenderFlagsSantaTypes.renderFixedPositionContainers.isRequired.fetch({siteData: siteData});

            expect(renderFixedPositionContainers).toEqual(false);
            expect(renderFixedPositionContainersRequired).toEqual(false);
        });

        it('should return renderFixedPositionBackgrounds from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                renderFixedPositionBackgrounds: false
            };

            var renderFixedPositionBackgrounds = RenderFlagsSantaTypes.renderFixedPositionBackgrounds.fetch({siteData: siteData});
            var renderFixedPositionBackgroundsRequired = RenderFlagsSantaTypes.renderFixedPositionBackgrounds.isRequired.fetch({siteData: siteData});

            expect(renderFixedPositionBackgrounds).toEqual(false);
            expect(renderFixedPositionBackgroundsRequired).toEqual(false);
        });

        it('should return shouldResetGalleryToOriginalState from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                shouldResetGalleryToOriginalState: false
            };

            var shouldResetGalleryToOriginalState = RenderFlagsSantaTypes.shouldResetGalleryToOriginalState.fetch({siteData: siteData});
            var shouldResetGalleryToOriginalStateRequired = RenderFlagsSantaTypes.shouldResetGalleryToOriginalState.isRequired.fetch({siteData: siteData});

            expect(shouldResetGalleryToOriginalState).toEqual(false);
            expect(shouldResetGalleryToOriginalStateRequired).toEqual(false);
        });

        it('should return showControllers from siteData.renderFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.renderFlags = {
                showControllers: true
            };

            var showControllers = RenderFlagsSantaTypes.showControllers.fetch({siteData: siteData});

            expect(showControllers).toEqual(true);
        });

        describe('componentPreviewState', function(){
            it('should return componentPreviewState for current component if defined in renderFlags.componentPreviewStates', function(){
                var siteData = testUtils.mockFactory.mockSiteData();
                var compId = 'comp-1';
                var compStructure = {
                    id: compId
                };
                var mockPreviewState = 'active';
                var componentPreviewStates = {};
                componentPreviewStates[compId] = mockPreviewState;

                siteData.renderFlags = {
                    componentPreviewStates: componentPreviewStates
                };



                var componentPreviewState = RenderFlagsSantaTypes.componentPreviewState.fetch({siteData: siteData}, {structure: compStructure});
                var componentPreviewStateRequired = RenderFlagsSantaTypes.componentPreviewState.isRequired.fetch({siteData: siteData}, {structure: compStructure});

                expect(componentPreviewState).toEqual(mockPreviewState);
                expect(componentPreviewStateRequired).toEqual(mockPreviewState);
            });

            it('should return undefined for current component if not defined in renderFlags.componentPreviewStates', function(){
                var siteData = testUtils.mockFactory.mockSiteData();
                var compId = 'comp-1';
                var compStructure = {
                    id: compId
                };
                siteData.renderFlags = {
                    componentPreviewStates: {}
                };

                var componentPreviewState = RenderFlagsSantaTypes.componentPreviewState.fetch({siteData: siteData}, {structure: compStructure});
                var componentPreviewStateRequired = RenderFlagsSantaTypes.componentPreviewState.isRequired.fetch({siteData: siteData}, {structure: compStructure});

                expect(componentPreviewState).not.toBeDefined();
                expect(componentPreviewStateRequired).not.toBeDefined();
            });
        });
    });
});
