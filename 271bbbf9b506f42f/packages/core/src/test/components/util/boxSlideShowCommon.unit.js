define(['lodash', 'core/components/util/boxSlideShowCommon'], function (_, boxSlideShowCommon) {
    'use strict';

    describe('boxSlideShowCommon utility functions', function () {

        it("getNextSlideIndex - should get next index in a cyclic manner", function () {
            var allSlides = [0, 1, 2, 3];
            expect(boxSlideShowCommon.getNextSlideIndex(allSlides, 1)).toEqual(2);
            expect(boxSlideShowCommon.getNextSlideIndex(allSlides, 3)).toEqual(0);
        });

        it("getPrevSlideIndex - should get prev index in a cyclic manner", function () {
            var allSlides = [0, 1, 2, 3];
            expect(boxSlideShowCommon.getPrevSlideIndex(allSlides, 3)).toEqual(2);
            expect(boxSlideShowCommon.getPrevSlideIndex(allSlides, 0)).toEqual(3);
        });

        it("getSlidesFromChildrenByStructure - should get only children that are slides components out of structure", function () {
            var children = [
                {id: 0, componentType: 'wysiwyg.viewer.components.BoxSlideShowSlide'},
                {id: 1, componentType: 'wysiwyg.viewer.components.BoxSlideShowSlide'},
                {id: 2, componentType: 'otherMockType'}
            ];
            expect(boxSlideShowCommon.getSlidesFromChildrenByStructure(children)).toEqual([children[0], children[1]]);
        });

        it("getShownOnAllSlidesFromChildrenByStructure - should get only children that are not slides components out of structure", function () {
            var children = [
                {id: 0, componentType: 'wysiwyg.viewer.components.BoxSlideShowSlide'},
                {id: 1, componentType: 'wysiwyg.viewer.components.BoxSlideShowSlide'},
                {id: 2, componentType: 'otherMockType'}
            ];
            expect(boxSlideShowCommon.getShownOnAllSlidesFromChildrenByStructure(children)).toEqual([children[2]]);
        });

        it("getSlidesFromChildrenByProps - should get only children that are slides components out of props", function () {
            var child0 = {id: 0, props: {structure: {componentType: 'wysiwyg.viewer.components.StripContainerSlideShowSlide'}}};
            var child1 = {id: 1, props: {structure: {componentType: 'wysiwyg.viewer.components.StripContainerSlideShowSlide'}}};
            var child2 = {id: 2, props: {structure: {componentType: 'otherMockType'}}};
            var children = [child0, child1, child2];

            expect(boxSlideShowCommon.getSlidesFromChildrenByProps(children)).toEqual([children[0], children[1]]);
        });

        it("getShownOnAllSlidesFromChildrenByProps - should get only children that are not slides components out of props", function () {
            var child0 = {id: 0, props: {structure: {componentType: 'wysiwyg.viewer.components.StripContainerSlideShowSlide'}}};
            var child1 = {id: 1, props: {structure: {componentType: 'wysiwyg.viewer.components.StripContainerSlideShowSlide'}}};
            var child2 = {id: 2, props: {structure: {componentType: 'otherMockType'}}};
            var children = [child0, child1, child2];

            expect(boxSlideShowCommon.getShownOnAllSlidesFromChildrenByProps(children)).toEqual([children[2]]);
        });

        it("isBoxOrStripSlideShowComponent - should return true only for boxSlideShow or stripSlideShow component type", function () {
            expect(boxSlideShowCommon.isBoxOrStripSlideShowComponent('wysiwyg.viewer.components.BoxSlideShow')).toEqual(true);
            expect(boxSlideShowCommon.isBoxOrStripSlideShowComponent('wysiwyg.viewer.components.StripContainerSlideShow')).toEqual(true);
            expect(boxSlideShowCommon.isBoxOrStripSlideShowComponent('otherMockType')).toEqual(false);
        });

        it("isBoxOrStripSlideShowSlideComponent - should return true only for boxSlideShowSlide or stripSlideShowSlide component type", function () {
            expect(boxSlideShowCommon.isBoxOrStripSlideShowSlideComponent('wysiwyg.viewer.components.BoxSlideShow')).toEqual(false);
            expect(boxSlideShowCommon.isBoxOrStripSlideShowSlideComponent('wysiwyg.viewer.components.StripContainerSlideShow')).toEqual(false);
            expect(boxSlideShowCommon.isBoxOrStripSlideShowSlideComponent('wysiwyg.viewer.components.BoxSlideShowSlide')).toEqual(true);
            expect(boxSlideShowCommon.isBoxOrStripSlideShowSlideComponent('wysiwyg.viewer.components.StripContainerSlideShowSlide')).toEqual(true);
        });

        it("getMatchingChildSlideType - should return boxSlideShowSlide for boxSlideShow and stripSlideShowSlide for stripSlideShow", function () {
            expect(boxSlideShowCommon.getMatchingChildSlideType('wysiwyg.viewer.components.BoxSlideShow')).toEqual('wysiwyg.viewer.components.BoxSlideShowSlide');
            expect(boxSlideShowCommon.getMatchingChildSlideType('wysiwyg.viewer.components.StripContainerSlideShow')).toEqual('wysiwyg.viewer.components.StripContainerSlideShowSlide');
            expect(function(){
                boxSlideShowCommon.getMatchingChildSlideType('otherMockType');
            }).toThrow();
        });
    });
});
