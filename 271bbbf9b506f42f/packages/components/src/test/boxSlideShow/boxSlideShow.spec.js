define(['lodash', 'testUtils', 'react', 'components/components/boxSlideShow/boxSlideShow/boxSlideShow', 'components/components/boxSlideShowSlide/boxSlideShowSlide', 'container', 'reactDOM'],
    function(_, /** testUtils */testUtils, React, boxSlideShow, boxSlideShowSlide, container, ReactDOM) {
    'use strict';

    describe('boxSlideShow component', function () {
        var siteData;

        function createSlideShowSlideProps(index){
            var props = testUtils.mockFactory.mockProps(siteData)
                .setCompData({
                    "type": "BoxSlideShowSlide",
                    "title": "slide" + index
                }).setNodeStyle({
                    height: 360,
                    width: 480
                }).setSkin("wysiwyg.common.components.boxSlideShowSlide.viewer.skins.boxSlideShowSlideSkin");
            props.structure.componentType = 'wysiwyg.viewer.components.BoxSlideShowSlide';
            return props;
        }

        function createSlideShowProps(children){
            var props = testUtils.mockFactory.mockProps(siteData)
                .setCompProp({
                    "type": "BoxSlideShowProperties",
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
                    "navigationButtonSize": 15,
                    "navigationButtonMargin": 24,
                    "navigationDotsSize": 6,
                    "navigationDotsMargin": 24,
                    "navigationDotsGap": 15,
                    "navigationDotsAlignment": "center"
                })
                .setLayout({
                    height: 360,
                    width: 480
                })
                .setNodeStyle({
                    height: 360,
                    width: 480
                })
                .setSkin("wysiwyg.common.components.boxSlideShow.viewer.skins.thinArrowsLargeSelectedCircleSkin");
            props.structure.componentType = 'wysiwyg.viewer.components.BoxSlideShow';
            props.children = children;
            return props;
        }

        function createSlideShowComponent(){
            var slides = _.map([0, 1, 2], function(index){
                var slideProps = createSlideShowSlideProps(index);
                return testUtils.getComponentReactElementFromDefinition(boxSlideShowSlide, slideProps);
            });
            var genericCompProps = testUtils.mockFactory.mockProps(siteData).setSkin('wysiwyg.viewer.skins.area.CircleArea');
            genericCompProps.structure.componentType = 'mobile.core.components.Container';
            var shownOnAllSlidesGenericComp = testUtils.getComponentReactElementFromDefinition(container, genericCompProps);
            var slideShowProps = createSlideShowProps(slides.concat(shownOnAllSlidesGenericComp));
            return testUtils.getComponentFromDefinition(boxSlideShow, slideShowProps);
        }

        beforeEach(function(){
            siteData = testUtils.mockFactory.mockSiteData();
        });

        it('should create a boxSlideShow component with a single slide child (first slide)', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties['']['data-shouldhideoverflowcontent']).toEqual(true);
            expect(skinProperties.inlineContent.children.length).toEqual(1);

            var slideExpectedProps = {parentId: boxSlideShowComp.props.id, flexibleBoxHeight: false, shouldHideOverflowContent: true, compData: {type: 'BoxSlideShowSlide', title: 'slide0'}};
            expect(skinProperties.inlineContent.children[0].props).toContain(slideExpectedProps);
            expect(skinProperties.inlineContent.reverse).toEqual(true);
            expect(skinProperties.inlineContent.transition).toEqual('SlideHorizontal');
            expect(skinProperties.inlineContent.transitionDuration).toEqual(1);
        });

        it('should create a boxSlideShow component with shown on all slides children', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.shownOnAllSlides.children.length).toEqual(1);
            expect(skinProperties.shownOnAllSlides.children[0].props).toContain({skin: 'wysiwyg.viewer.skins.area.CircleArea'});
            expect(skinProperties.inlineContent.transitionDuration).toEqual(1);
        });

        it('should create a boxSlideShow component with navigation dots', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.dotsMenuWrapper['data-show-navigation-dots']).toEqual(true);
            expect(skinProperties.dotsMenuWrapper.style).toEqual({bottom: 19.5, justifyContent: 'center', WebkitJustifyContent: 'center'});
            expect(skinProperties.dotsMenuWrapper.children.length).toEqual(3);
            _.forEach(skinProperties.dotsMenuWrapper.children, function(dotChild, dotIndex){
                var expectedStyle = {height: 6, marginLeft: 7.5, marginRight: 7.5, width: 6};
                if (dotIndex === 0){
                    expectedStyle.height = 9;
                    expectedStyle.width = 9;
                }
                expect(dotChild.props.children.props.style).toEqual(expectedStyle);
            });
        });

        it('should create a boxSlideShow component with navigation arrows', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.navigationArrows['data-show-navigation-arrows']).toEqual(true);
            expect(skinProperties.navigationArrows.style).toEqual({top: 'calc(50% - 15px)'});
            expect(skinProperties.nextButton.style).toEqual({right: 16.5, width: 15});
            expect(skinProperties.prevButton.style).toEqual({left: 16.5, width: 15});
        });

        it('should be able to navigate to the next slide', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var domNode = ReactDOM.findDOMNode(boxSlideShowComp.refs.nextButton);
            React.addons.TestUtils.Simulate.click(domNode);
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContent.children.length).toEqual(1);
            expect(skinProperties.inlineContent.children[0].props).toContain({compData: {type: 'BoxSlideShowSlide', title: 'slide1'}});
        });

        it('should be able to navigate to the previous slide', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var domNode = ReactDOM.findDOMNode(boxSlideShowComp.refs.prevButton);
            React.addons.TestUtils.Simulate.click(domNode);
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContent.children.length).toEqual(1);
            expect(skinProperties.inlineContent.children[0].props).toContain({compData: {type: 'BoxSlideShowSlide', title: 'slide2'}});
        });

        it('should be able to navigate to a specific slide', function () {
            var boxSlideShowComp = createSlideShowComponent();
            var domNode = ReactDOM.findDOMNode(boxSlideShowComp.refs.dotsMenuWrapper.children[2]);
            React.addons.TestUtils.Simulate.click(domNode);
            var skinProperties = boxSlideShowComp.getSkinProperties();
            expect(skinProperties.inlineContent.children.length).toEqual(1);
            expect(skinProperties.inlineContent.children[0].props).toContain({compData: {type: 'BoxSlideShowSlide', title: 'slide2'}});
        });
    });
});
