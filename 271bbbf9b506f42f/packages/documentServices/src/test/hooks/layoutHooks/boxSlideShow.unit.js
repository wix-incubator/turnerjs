define([
    'lodash', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/structure/structure',
    'documentServices/component/component',
    'documentServices/hooks/layoutHooks/boxSlideShow'
], function (_, testUtils,
             privateServicesHelper,
             structure,
             component,
             boxSlideShow) {
    'use strict';

    describe('boxSlideShow layout hook', function () {
        var pageId = 'pageId';
        var ps, siteData;
        var mockFactory = testUtils.mockFactory;

        function mockSlideShowComponent() {
            var slideShow = mockFactory.createStructure('wysiwyg.viewer.components.BoxSlideShow', {
                id: 'boxSlideShowId',
                layout: {
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100
                }
            });
            slideShow.components = _.map([1, 2, 3], function (slideId) {
                return mockFactory.createStructure('wysiwyg.viewer.components.BoxSlideShowSlide', {
                    layout: {
                        x: 0,
                        y: 0,
                        height: 100,
                        width: 100
                    }
                }, 'slide-' + slideId);
            });
            return slideShow;
        }

        beforeEach(function(){
            var slideShowComp = mockSlideShowComponent();
            siteData = mockFactory.mockSiteData()
                .addPageWithDefaults(pageId, [slideShowComp]);
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        });

        function executeHook(privateServices, compPointer, newLayoutToUpdate) {
            boxSlideShow(privateServices, compPointer, newLayoutToUpdate, structure.updateCompLayout);
        }

        it('should update children slides width and height according to new layout (and keep children in place)', function () {
            var pagePointer = ps.pointers.components.getPage(pageId, 'DESKTOP');
            var compPointer = ps.pointers.components.getComponent('boxSlideShowId', pagePointer);
            executeHook(ps, compPointer, {width: 20, height: 20, x: 150, y: 150});

            var compChildren = ps.pointers.components.getChildren(compPointer);
            _.forEach(compChildren, function(slide){
                expect(component.layout.get(ps, slide)).toContain({width: 20, height: 20, x: 50, y: 50});
            });
        });

        it('should update children slides width and height according to new layout (and keep children in place)', function () {
            var pagePointer = ps.pointers.components.getPage(pageId, 'DESKTOP');
            var compPointer = ps.pointers.components.getComponent('boxSlideShowId', pagePointer);
            executeHook(ps, compPointer, {width: 150, height: 150, x: 100});

            var compChildren = ps.pointers.components.getChildren(compPointer);
            _.forEach(compChildren, function(slide){
                expect(component.layout.get(ps, slide)).toContain({width: 150, height: 150, x: 0, y: 0});
            });
        });

        it('should do nothing if only position change', function () {
            var pagePointer = ps.pointers.components.getPage(pageId, 'DESKTOP');
            var compPointer = ps.pointers.components.getComponent('boxSlideShowId', pagePointer);
            executeHook(ps, compPointer, {x: 50, y: 50});

            var compChildren = ps.pointers.components.getChildren(compPointer);
            _.forEach(compChildren, function(slide){
                expect(component.layout.get(ps, slide)).toContain({width: 100, height: 100, x: 0, y: 0});
            });
        });
    });
});
