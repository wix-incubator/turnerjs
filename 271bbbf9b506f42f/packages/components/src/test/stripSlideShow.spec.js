define(['lodash', 'testUtils', 'react', 'components/components/boxSlideShow/stripSlideShow/stripSlideShow', 'components/components/boxSlideShowSlide/stripSlideShowSlide', 'container', 'reactDOM'],
    function(_, /** testUtils */testUtils, React, stripSlideShow, stripSlideShowSlide, container, ReactDOM) {
    'use strict';

    describe('StripContainerSlideShow component', function () {
        var siteData;

        function createSlideShowSlideProps(index){
            var props = testUtils.mockFactory.mockProps(siteData)
                .setCompData({
                    "type": "StripContainerSlideShowSlide",
                    "title": "slide" + index
                }).setSkin("wysiwyg.common.components.boxSlideShowSlide.viewer.skins.boxSlideShowSlideSkin");
            props.structure.componentType = 'wysiwyg.viewer.components.StripContainerSlideShowSlide';
            return props;
        }

        function createSlideShowProps(children){
            var props = testUtils.mockFactory.mockProps(siteData)
                .setCompProp({
                    "type": "StripContainerSlideShowProperties",
                    "transition": "SlideHorizontal",
                    "autoPlayInterval": 2,
                    "autoPlay": false,
                    "transDuration": 1,
                    "pauseAutoPlayOnMouseOver": true,
                    "direction": "LTR",
                    "shouldHideOverflowContent": true,
                    "flexibleBoxHeight": false,
                    "showNavigationButton": true,
                    "showNavigationDots": true,
                    "navigationButtonSize": 13,
                    "navigationButtonMargin": 30,
                    "navigationDotsSize": 10,
                    "navigationDotsMargin": 20,
                    "navigationDotsGap": 20,
                    "navigationDotsAlignment": "center"
                })
                .setLayout({
                    height: 200,
                    width: 800
                })
                .setSkin("wysiwyg.common.components.stripSlideShow.viewer.skins.thinArrowsLargeSelectedCircleSkin");
            props.structure.componentType = 'wysiwyg.viewer.components.StripContainerSlideShow';
            props.children = children;
            return props;
        }

        function createSlideShowComponent(){
            var slides = _.map([0, 1, 2], function(index){
                var slideProps = createSlideShowSlideProps(index);
                return testUtils.getComponentReactElementFromDefinition(stripSlideShowSlide, slideProps);
            });
            var genericCompProps = testUtils.mockFactory.mockProps(siteData).setSkin('wysiwyg.viewer.skins.area.CircleArea');
            genericCompProps.structure.componentType = 'wysiwyg.viewer.components.StripContainerSlideShow';

            var shownOnAllSlidesGenericComp = testUtils.getComponentReactElementFromDefinition(container, genericCompProps);
            var slideShowProps = createSlideShowProps(slides.concat(shownOnAllSlidesGenericComp));
            return testUtils.getComponentFromDefinition(stripSlideShow, slideShowProps);
        }

        beforeEach(function(){
            siteData = testUtils.mockFactory.mockSiteData();
        });

        it('should create a StripContainerSlideShow component with a single slide child (first slide)', function () {
            var StripContainerSlideShowComp = createSlideShowComponent();
            var skinProperties = StripContainerSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContentParent.style).toEqual({overflow: 'hidden'});
            expect(skinProperties.inlineContent.children.length).toEqual(1);

            var slideExpectedProps = {parentId: StripContainerSlideShowComp.props.id, flexibleBoxHeight: false, shouldHideOverflowContent: true, compData: {type: 'StripContainerSlideShowSlide', title: 'slide0'}};
            expect(skinProperties.inlineContent.children[0].props).toContain(slideExpectedProps);
            expect(skinProperties.inlineContent.reverse).toEqual(true);
            expect(skinProperties.inlineContent.transition).toEqual('SlideHorizontal');
            expect(skinProperties.inlineContent.transitionDuration).toEqual(1);
        });

        it('should create a StripContainerSlideShow component with shown on all slides children', function () {
            var StripContainerSlideShowComp = createSlideShowComponent();
            var skinProperties = StripContainerSlideShowComp.getSkinProperties();
            expect(skinProperties.shownOnAllSlides.children.length).toEqual(1);
            expect(skinProperties.shownOnAllSlides.children[0].props).toContain({skin: 'wysiwyg.viewer.skins.area.CircleArea'});
            expect(skinProperties.inlineContent.transitionDuration).toEqual(1);
        });

        it('should create a StripContainerSlideShow component with navigation dots', function () {
            var StripContainerSlideShowComp = createSlideShowComponent();
            var skinProperties = StripContainerSlideShowComp.getSkinProperties();
            expect(skinProperties.dotsMenuWrapper['data-show-navigation-dots']).toEqual(true);
            expect(skinProperties.dotsMenuWrapper.style).toEqual({bottom: 12, justifyContent: 'center', WebkitJustifyContent: 'center'});
            expect(skinProperties.dotsMenuWrapper.children.length).toEqual(3);
            _.forEach(skinProperties.dotsMenuWrapper.children, function(dotChild, dotIndex){
                var expectedStyle = {height: 10, marginLeft: 10, marginRight: 10, width: 10};
                if (dotIndex === 0){
                    expectedStyle.height = 16;
                    expectedStyle.width = 16;
                }
                expect(dotChild.props.children.props.style).toEqual(expectedStyle);
            });
        });

        it('should create a StripContainerSlideShow component with navigation arrows', function () {
            var StripContainerSlideShowComp = createSlideShowComponent();
            var skinProperties = StripContainerSlideShowComp.getSkinProperties();
            expect(skinProperties.navigationArrows['data-show-navigation-arrows']).toEqual(true);
            expect(skinProperties.navigationArrows.style).toEqual({top: 'calc(50% - 13px)'});
            expect(skinProperties.nextButton.style).toEqual({right: 23.5, width: 13});
            expect(skinProperties.prevButton.style).toEqual({left: 23.5, width: 13});
        });

        it('should be able to navigate to the next slide', function () {
            var StripContainerSlideShowComp = createSlideShowComponent();
            var domNode = ReactDOM.findDOMNode(StripContainerSlideShowComp.refs.nextButton);
            React.addons.TestUtils.Simulate.click(domNode);
            var skinProperties = StripContainerSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContent.children.length).toEqual(1);
            expect(skinProperties.inlineContent.children[0].props).toContain({compData: {type: 'StripContainerSlideShowSlide', title: 'slide1'}});
        });

        it('should be able to navigate to the previous slide', function () {
            var StripContainerSlideShowComp = createSlideShowComponent();
            var domNode = ReactDOM.findDOMNode(StripContainerSlideShowComp.refs.prevButton);
            React.addons.TestUtils.Simulate.click(domNode);
            var skinProperties = StripContainerSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContent.children.length).toEqual(1);
            expect(skinProperties.inlineContent.children[0].props).toContain({compData: {type: 'StripContainerSlideShowSlide', title: 'slide2'}});
        });

        it('should be able to navigate to a specific slide', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var domNode = ReactDOM.findDOMNode(boxSlideShowComp.refs.dotsMenuWrapper.children[2]);
            React.addons.TestUtils.Simulate.click(domNode);
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContent.children.length).toEqual(1);
            expect(skinProperties.inlineContent.children[0].props).toContain({compData: {type: 'StripContainerSlideShowSlide', title: 'slide2'}});
        });
    });
});
