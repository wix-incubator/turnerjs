define([
    'lodash',
    'testUtils',
    'components/components/boxSlideShow/boxSlideShow/boxSlideShow',
    'components/components/boxSlideShowSlide/boxSlideShowSlide',
    'container'
], function(_, testUtils, boxSlideShow, boxSlideShowSlide, container) {
    'use strict';

    describe('slideNavigationMixin', function() {

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
                    "transDuration": 0.002,
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
            props.structure.children = _.map(children, 'props.structure');
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
            var definition = testUtils.getComponentFromDefinition(boxSlideShow, slideShowProps);
            return definition;
        }

	    var siteData;
	    beforeEach(function () {
		    var pageId = 'testPage';
		    var siteAPI = testUtils.mockFactory.mockSiteAPI();
		    siteData = siteAPI.getSiteData()
			    .addPageWithDefaults(pageId);
		    siteData.setRootNavigationInfo({pageId: pageId});
        });


        describe('moveNextSlide', function() {

            it('should increment current slide by 1 and mark transition state', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                boxSlideShowComp.setState({currentIndex: 1}, function() {
                    boxSlideShowComp.moveNextSlide(function(){
                        expect(boxSlideShowComp.state.currentIndex).toEqual(2);
                        expect(boxSlideShowComp.state.isInTransition).toEqual(false);
                        done();
                    });
                });
            });

            it('should increment only if component is not inTransition state', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                boxSlideShowComp.setState({currentIndex: 0}, function() {
                    boxSlideShowComp.moveNextSlide();
                    boxSlideShowComp.moveNextSlide();
                    boxSlideShowComp.moveNextSlide(function(){
                        expect(boxSlideShowComp.state.currentIndex).toEqual(1);
                        boxSlideShowComp.moveNextSlide(function(){
                            expect(boxSlideShowComp.state.currentIndex).toEqual(2);
                            done();
                        });
                    });
                });
            });

            it('should reset slide to 0 if exceeding number of slides', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                boxSlideShowComp.setState({currentIndex: 2}, function() {
                    boxSlideShowComp.moveNextSlide(function(){
                        expect(boxSlideShowComp.state.currentIndex).toEqual(0);
                        done();
                    });
                });

            });

        });

        describe('movePreviousSlide', function() {

            it('should decrement current slide by 1 and mark transition state', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                boxSlideShowComp.setState({currentIndex: 1}, function() {
                    boxSlideShowComp.movePreviousSlide(function(){
                        expect(boxSlideShowComp.state.currentIndex).toEqual(0);
                        expect(boxSlideShowComp.state.isInTransition).toEqual(false);
                        done();
                    });
                });
            });

            it('should deccrement only if component is not inTransition state', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                boxSlideShowComp.setState({currentIndex: 2}, function() {
                    boxSlideShowComp.movePreviousSlide();
                    boxSlideShowComp.movePreviousSlide(function(){
                        expect(boxSlideShowComp.state.currentIndex).toEqual(1);
                        boxSlideShowComp.movePreviousSlide(function(){
                            expect(boxSlideShowComp.state.currentIndex).toEqual(0);
                            done();
                        });
                    });
                });
            });

            it('should reset to last slide if currently on slide 0', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                var lastSlide = boxSlideShowComp.getSlidesFromChildren(boxSlideShowComp.props.children).length - 1;
                boxSlideShowComp.setState({currentIndex: 0}, function() {
                    boxSlideShowComp.movePreviousSlide(function(){
                        expect(boxSlideShowComp.state.currentIndex).toEqual(lastSlide);
                        expect(boxSlideShowComp.state.isInTransition).toEqual(false);
                        done();
                    });
                });
            });

        });

        describe('moveToSlide', function() {

            it('should set currentIndex to the given number and mark transition state', function() {
                var boxSlideShowComp = createSlideShowComponent();

                boxSlideShowComp.moveToSlide(2, function(){
                    expect(boxSlideShowComp.state.currentIndex).toEqual(2);
                    expect(boxSlideShowComp.state.isInTransition).toEqual(false);
                });
            });

            it('should notify change handler', function(done) {
                var boxSlideShowComp = createSlideShowComponent();
                spyOn(boxSlideShowComp, 'handleAction');

                boxSlideShowComp.moveToSlide(2, function(){
                    expect(boxSlideShowComp.handleAction).toHaveBeenCalledWith('change');
                    done();
                });
            });
        });

    });
});
