define(['react', 'lodash', 'core', 'components/components/boxSlideShow/common/slideNavigationMixin'], function (React, _, core, slideNavigationMixin) {
    'use strict';

    var transitionGroup = React.createFactory(core.wixTransitionGroup);

    return {
        displayName: "boxSlideShow",
        mixins: [slideNavigationMixin],
        statics: {
            behaviors: {
                nextSlide: {methodName: 'moveNextSlide', params: []},
                prevSlide: {methodName: 'movePreviousSlide', params: []},
                moveToSlide: {methodName: 'moveToSlide', params: ['slide']}
            }
        },
        getSkinProperties: function () {
            return {
                "": {
                    'data-shouldhideoverflowcontent': this.props.compProp.shouldHideOverflowContent,
                    onSwipeLeft: this.clickMoveToNextSlide,
                    onSwipeRight: this.clickMoveToPreviousSlide
                },
                "inlineContent": {
                    parentConst: transitionGroup,
                    siteAPI: this.props.siteAPI,
                    siteData: this.props.siteData,
                    transition: this.props.compProp.transition,
                    transitionDuration: this.getTransitionDuration(),
                    transitionCallback: this.transitionCallback,
                    reverse: this.isDirectionLeftToRight ? !this.reverse : this.reverse,
                    children: [React.cloneElement(this.getSlidesFromChildren(this.props.children)[this.state.currentIndex], {
                        onMouseEnter: this.onMouseEnter,
                        onMouseLeave: this.onMouseLeave,
                        flexibleBoxHeight: this.props.compProp.flexibleBoxHeight,
                        shouldHideOverflowContent: this.props.compProp.shouldHideOverflowContent,
                        skin: this.getSkinExports().slide.skin,
                        styleId: this.props.styleId + 'slide',
                        parentId: this.props.id,
                        minHeight: this.props.structure.layout.height
                    })]
                },
                "shownOnAllSlides": {
                    children: this.getShownOnAllSlidesFromChildren(this.props.children)
                },
                "navigationArrows": {
                    'data-show-navigation-arrows': this.props.compProp.showNavigationButton,
                    style: this.getNavigationArrowsStyle()
                },
                "dotsMenuWrapper": {
                    'data-show-navigation-dots': this.props.compProp.showNavigationDots,
                    children: this.createDotsNavigationButtons(),
                    style: this.getDotsNavigationWrapperStyle()
                },
                "prevButton": {
                    onClick: this.clickMoveToPreviousSlide,
                    style: this.getArrowButtonStyle(true)
                },
                "nextButton": {
                    onClick: this.clickMoveToNextSlide,
                    style: this.getArrowButtonStyle(false)
                }
            };
        }
    };
});
