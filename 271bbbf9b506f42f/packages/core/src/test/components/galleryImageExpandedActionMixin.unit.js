define([
    'lodash',
    'testUtils',
    'core/components/galleryImageExpandedActionMixin'
], function (_, testUtils, galleryImageExpandedActionMixin) {
    'use strict';

    describe('galleryImageExpandedActionMixin', function () {
        function getMockComponentDefinition() {
            return {
                mixins: [galleryImageExpandedActionMixin],
                render: function () {
                    return null;
                }
            };
        }

        describe('handleImageExpandedAction', function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.siteData.pagesData.currentPage.structure.components = [
                    {
                        componentType: 'wysiwyg.viewer.components.SlideShowGallery',
                        id: 'SlideShowGallery',
                        dataQuery: 'SlideShowGalleryDataQuery',
                        items: [{id: 'SlideShowGalleryDataItem'}]
                    },
                    {
                        componentType: 'wysiwyg.viewer.components.SliderGallery',
                        id: 'SliderGallery',
                        dataQuery: 'SliderGalleryDataQuery',
                        items: [{id: 'SliderGalleryDataItem'}]
                    },
                    {
                        componentType: 'wysiwyg.viewer.components.PaginatedGridGallery',
                        id: 'PaginatedGridGallery',
                        dataQuery: 'PaginatedGridGalleryDataQuery',
                        items: [{id: 'PaginatedGridGalleryDataItem'}]
                    },
                    {
                        componentType: 'wysiwyg.viewer.components.MatrixGallery',
                        id: 'MatrixGallery',
                        dataQuery: 'MatrixGalleryDataQuery',
                        items: [{id: 'MatrixGalleryDataItem'}]
                    },
                    {
                        componentType: 'wysiwyg.viewer.components.UnknownGallery',
                        id: 'UnknownGallery',
                        dataQuery: 'UnknownGalleryDataQuery',
                        items: [{id: 'UnknownGalleryDataItem'}]
                    }
                ];
                this.structure = this.siteData.pagesData.currentPage.structure;
                this.nativeGalleries = _.reject(this.structure.components, {id: 'UnknownGallery'});
                this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
                this.behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                this.props = testUtils.mockFactory.mockProps(this.siteData, this.siteAPI);
                this.props.pageId = 'currentPage';
                spyOn(this.behaviorsAspect, 'handleAction').and.callThrough();
                spyOn(this.siteData, 'getDataByQuery').and.callFake(function (query) {
                    return _.find(this.structure.components, {dataQuery: query});
                }.bind(this));
            });

            it('should not handle action if expanded image does not belong to a native gallery', function () {
                this.props.compData = {id: 'UnknownGalleryDataItem'};
                var renderedComp = testUtils.getComponentFromDefinition(getMockComponentDefinition(), this.props);
                renderedComp.handleImageExpandedAction();
                expect(this.behaviorsAspect.handleAction).not.toHaveBeenCalled();
            });

            it('should handle action if expanded image belongs to a native gallery', function () {
                _.forEach(this.nativeGalleries, function (gallery) {
                    var expandedImageId = gallery.items[0].id;
                    this.props.id = expandedImageId;
                    this.props.compData = {id: expandedImageId};
                    var renderedComp = testUtils.getComponentFromDefinition(getMockComponentDefinition(), this.props);
                    renderedComp.handleImageExpandedAction();
                    expect(this.behaviorsAspect.handleAction).toHaveBeenCalled();
                }, this);
            });

            it('should call handleAction w/ the proper event name and arguments for both image expand and item clicked', function () {
                var i = 0;
                _.forEach(this.nativeGalleries, function (gallery) {
                    var expandedImageId = gallery.items[0].id;
                    this.props.id = expandedImageId;
                    this.props.compData = {id: expandedImageId};
                    var renderedComp = testUtils.getComponentFromDefinition(getMockComponentDefinition(), this.props);

                    renderedComp.handleImageExpandedAction();
                    var actionHandler = {
                        name: 'imageExpanded',
                        pageId: 'currentPage',
                        sourceId: gallery.id,
                        type: 'comp'
                    };
                    var lastCallArgs = this.behaviorsAspect.handleAction.calls.mostRecent().args;
                    expect(lastCallArgs[0]).toEqual(actionHandler);
                    expect(lastCallArgs[1].id).toEqual(expandedImageId);

                    actionHandler = {
                        name: 'itemClicked',
                        pageId: 'currentPage',
                        sourceId: gallery.id,
                        type: 'comp'
                    };

                    var argFor = this.behaviorsAspect.handleAction.calls.argsFor(i);
                    expect(argFor[0]).toEqual(actionHandler);
                    expect(argFor[1].id).toEqual(expandedImageId);
                    i += 2;
                }, this);
            });

        });
    });
});
