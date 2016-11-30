define(['lodash'], function (_) {
    'use strict';

    var BOX_SLIDE_SHOW_TYPE = 'wysiwyg.viewer.components.BoxSlideShow';
    var BOX_SLIDE_SHOW_SLIDE_TYPE = 'wysiwyg.viewer.components.BoxSlideShowSlide';

    var STRIP_SLIDE_SHOW_TYPE = 'wysiwyg.viewer.components.StripContainerSlideShow';
    var STRIP_SLIDE_SHOW_SLIDE_TYPE = 'wysiwyg.viewer.components.StripContainerSlideShowSlide';

    function getChildComponentTypeByStructure(child){
        return child.componentType;
    }

    function getChildComponentTypeByProps(child) {
        return child.props.structure.componentType;
    }

    return {
        getNextSlideIndex: function (allSlides, currentIndex) {
            var nextIndex = currentIndex + 1;
            if (nextIndex >= allSlides.length) {
                nextIndex = 0;
            }
            return nextIndex;
        },

        getPrevSlideIndex: function (allSlides, currentIndex) {
            var prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = allSlides.length - 1;
            }
            return prevIndex;
        },

        getSlidesFromChildrenByStructure: function (children) {
            return _.filter(children, function (child) {
                return getChildComponentTypeByStructure(child) === BOX_SLIDE_SHOW_SLIDE_TYPE || getChildComponentTypeByStructure(child) === STRIP_SLIDE_SHOW_SLIDE_TYPE;
            });
        },

        getSlidesFromChildrenByProps: function (children) {
            return _.filter(children, function (child) {
                return getChildComponentTypeByProps(child) === BOX_SLIDE_SHOW_SLIDE_TYPE || getChildComponentTypeByProps(child) === STRIP_SLIDE_SHOW_SLIDE_TYPE;
            });
        },

        getShownOnAllSlidesFromChildrenByStructure: function (children) {
            return _.reject(children, function (child) {
                return getChildComponentTypeByStructure(child) === BOX_SLIDE_SHOW_SLIDE_TYPE || getChildComponentTypeByStructure(child) === STRIP_SLIDE_SHOW_SLIDE_TYPE;
            });
        },

        getShownOnAllSlidesFromChildrenByProps: function (children) {
            return _.reject(children, function (child) {
                return getChildComponentTypeByProps(child) === BOX_SLIDE_SHOW_SLIDE_TYPE || getChildComponentTypeByProps(child) === STRIP_SLIDE_SHOW_SLIDE_TYPE;
            });
        },

        isBoxOrStripSlideShowComponent: function(compType){
            return compType === BOX_SLIDE_SHOW_TYPE || compType === STRIP_SLIDE_SHOW_TYPE;
        },

        isBoxOrStripSlideShowSlideComponent: function(compType){
            return compType === BOX_SLIDE_SHOW_SLIDE_TYPE || compType === STRIP_SLIDE_SHOW_SLIDE_TYPE;
        },

        getMatchingChildSlideType: function(compType){
            if (!this.isBoxOrStripSlideShowComponent(compType)){
                throw new Error("invalid comp type, not a box or strip slide show component");
            }
            return compType === BOX_SLIDE_SHOW_TYPE ? BOX_SLIDE_SHOW_SLIDE_TYPE : STRIP_SLIDE_SHOW_SLIDE_TYPE;
        }
    };
});
