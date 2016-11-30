define([
    'core',
    'siteUtils',
    'react',
    'lodash',
    'testUtils',
    'components/components/slideShowGallery/slideShowGallery',
    'reactDOM',
    'galleriesCommon'
],
    function(core, siteUtils, React, _, testUtils, slideShowGallery, ReactDOM, galleriesCommon) {
        'use strict';

        var galleriesHelperFunctions = galleriesCommon.utils.galleriesHelperFunctions;
        var mockWindowTouchEventAspect = {
            registerToWindowTouchEvent: function () {
            }
        };

        var siteData, items;

        var createSlideShowComponent = function (optionalItems) {
            var props = testUtils.mockFactory.mockProps(siteData)
                .setCompData(siteData.mock.imageList({items: optionalItems || items})).setCompProp({
                    autoplayInterval: 5,
                    galleryImageOnClickAction: "zoomMode",
                    goToLinkText: "Go to link",
                    imageMode: "clipImage",
                    showAutoplay: true,
                    showCounter: true,
                    showNavigation: true,
                    autoplay: true
                }).setNodeStyle({
                    height: 360,
                    width: 480
                }).setSkin("wysiwyg.viewer.skins.gallery.SlideShowTextFloating");
            props.id = 'mockId';
            props.siteAPI.registerMockSiteAspect('windowTouchEvents', mockWindowTouchEventAspect);
            props.structure.componentType = 'wysiwyg.viewer.components.SlideShowGallery';

            return testUtils.getComponentFromDefinition(slideShowGallery, props);
        };

        function getProperty(slideShow, property) {
            return ReactDOM.findDOMNode(slideShow.refs[property]);
        }

        var displayerComp = {
            getInitialState: function () {
                return {
                    $showPanel: "notShowPanel"
                };
            },
            render: function () {
                return React.DOM.div();
            },
            getPanelState: function () {
                return this.state.$showPanel;
            },
            setPanelState: function (val) {
                this.setState({
                    $showPanel: val
                });
            },
            setTransitionPhase: function (transPhase) {
                this.setState({
                    $transitionPhase: transPhase
                });
            }
        };
        describe('slideshow  Component', function () {
            beforeEach(function () {
                siteData = testUtils.mockFactory.mockSiteData();
                items = [
                    siteData.mock.imageData({id: 'image124b'}),
                    siteData.mock.imageData({id: 'image1vpl'}),
                    siteData.mock.imageData({id: 'imageey8'})
                ];
                spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(React.createFactory(React.createClass(displayerComp)));
                spyOn(core.compMixins.animationsMixin, 'sequence').and.callFake(testUtils.mockSequence);
                spyOn(galleriesCommon.mixins.galleryAutoPlayMixin, 'autoplayCallback');
                spyOn(siteData.mobile, 'isTabletDevice').and.returnValue(false);
                spyOn(siteData.mobile, 'isMobileDevice').and.returnValue(false);
            });

            describe('Panel States', function () {
                it('show Panel - click on Image should show panel', function () {
                    var slideShow = createSlideShowComponent();

                    slideShow.hideShowPanel({type: "mouseenter", "target": {id: "mockId"}});

                    expect(slideShow.state.displayerPanelState).toEqual("showPanel");
                    expect(slideShow.refs.mockIdimage124b0.state.$showPanel).toEqual("showPanel");
                });

                it('hide Panel - click on Image should hide panel', function () {
                    var slideShow = createSlideShowComponent();
                    slideShow.hideShowPanel({type: "mouseenter", "target": {id: "mockId"}});
                    slideShow.hideShowPanel({type: "mouseleave", "target": {id: "mockId"}});

                    expect(slideShow.state.displayerPanelState).toEqual("notShowPanel");
                    expect(slideShow.refs.mockIdimage124b0.state.$showPanel).toEqual("notShowPanel");
                });
            });

            describe('paging between images', function () {
                it('next function - change the state to the next page', function () {

                    var slideShow = createSlideShowComponent();

                    slideShow.moveSlide(false);

                    expect(slideShow.state.currentIndex).toEqual(1);
                });

                it('next - verify circular - next form last image return the first image', function () {

                    var slideShow = createSlideShowComponent();
                    slideShow.moveSlide(false);
                    slideShow.moveSlide(false);
                    slideShow.moveSlide(false);

                    expect(slideShow.state.currentIndex).toEqual(0);
                });

                it('prev function - change the state to the prev page', function () {

                    var slideShow = createSlideShowComponent();

                    slideShow.moveSlide(true);

                    expect(slideShow.state.currentIndex).toEqual(slideShow.props.compData.items.length - 1);
                });
                it('prev function - change the state to the prev page', function () {

                    var slideShow = createSlideShowComponent();

                    slideShow.moveSlide(true);
                    slideShow.moveSlide(true);

                    expect(slideShow.state.currentIndex).toEqual(1);
                });


            });
            describe('get displayer after scaling sizes', function () {
                it('getDisplayerSizeAfterScaling', function () {
                    var expectedSizeAfterScaling = {
                        "displayerSize": {"width": 480, "height": 360},
                        "imageWrapperSize": {"imageWrapperHeight": 360, "imageWrapperWidth": 480, "imageWrapperMarginLeft": 0, "imageWrapperMarginRight": 0, "imageWrapperMarginTop": 0, "imageWrapperMarginBottom": 0}
                    };
                    var slideShow = createSlideShowComponent();
                    var displayerData = items[0];
                    displayerData.width = 419;
                    displayerData.height = 120;
                    spyOn(galleriesHelperFunctions, 'getSkinHeightDiff').and.returnValue(0);
                    spyOn(galleriesHelperFunctions, 'getSkinWidthDiff').and.returnValue(0);

                    var actualSizeAfterScaling = slideShow.getDisplayerSizeAfterScaling(displayerData);

                    expect(actualSizeAfterScaling).toEqual(expectedSizeAfterScaling);
                });
            });

            describe('generation of next and prev displayer for animation', function () {
                it('generateNextPagesIfNeeded - create array with prev displayer and next displayer', function () {
                    var slideShow = createSlideShowComponent();
                    var displayersArr = slideShow.generateNextPagesIfNeeded();
                    expect(displayersArr.length).toEqual(2);
                });
                it('generateNextPagesIfNeeded - for one displayer in slide show array is empty', function () {
                    var slideShow = createSlideShowComponent();
                    slideShow.props.compData.items = ["#image124b"];
                    var displayersArr = slideShow.generateNextPagesIfNeeded();

                    expect(displayersArr.length).toEqual(0);

                });
            });

            describe('createDisplayer', function () {
                it('createDisplayer - return displayer constructor', function () {
                    var displayerData = items[0];
                    var slideShow = createSlideShowComponent();

                    var displayersConstructor = slideShow.createDisplayer(displayerData, 0);

                    expect(displayersConstructor).toBeDefined();
                });
            });

            describe('getInitialState', function () {
                it('getInitialState - return Object with default values', function () {
                    var expectedIntialState = {
                        currentIndex: 0,
                        shouldAutoPlay: true,
                        $slideshow: "autoplayOn",
                        $mobile: "notMobile",
                        $displayDevice: "desktopView",
                        displayerPanelState: "notShowPanel",
                        $touchRollOverSupport: 'touchRollOut',
                        $animationInProcess: null
                    };
                    var slideShow = createSlideShowComponent();
                    spyOn(slideShow.props.siteAPI, 'isZoomOpened').and.returnValue(false);

                    var intitalStateObj = slideShow.getInitialState();

                    expect(intitalStateObj).toEqual(jasmine.objectContaining(expectedIntialState));
                });
                it('componentWillReceiveProps', function () {
                    var slideShow = createSlideShowComponent();
                    spyOn(slideShow.props.siteAPI, 'isZoomOpened').and.returnValue(false);
                    slideShow.state.$slideshow = "autoplayOff";
                    slideShow.componentWillReceiveProps(slideShow.props);

                    expect(slideShow.state.$slideshow).toEqual("autoplayOn");
                });
            });

            describe('autoplay', function () {
                it('should not be enabled by default if the slideshow has no items', function () {
                    var slideShow = createSlideShowComponent([]);

                    expect(slideShow.state.$slideshow).toBe('autoplayOff');
                });
            });

            describe('getSkinProperties', function () {

                it('getSkinProperties - buttonPrev', function () {
                    var slideShow = createSlideShowComponent();

                    var btnPrevObj = getProperty(slideShow, "buttonPrev");
                    expect(btnPrevObj.style.visibility).toEqual("visible");
                });

                it('getSkinProperties - buttonNext', function () {
                    var slideShow = createSlideShowComponent();

                    var btnNextObj = getProperty(slideShow, "buttonNext");
                    expect(btnNextObj.style.visibility).toEqual("visible");
                });

                it('getSkinProperties - counter', function () {
                    var slideShow = createSlideShowComponent();

                    var counterObj = getProperty(slideShow, "counter");
                    expect(counterObj.style.visibility).toEqual("visible");
                    expect(counterObj.innerHTML).toEqual("1/3");

                });

                it('getSkinProperties - autoplay', function () {
                    var slideShow = createSlideShowComponent();

                    var autoPlayObj = getProperty(slideShow, "autoplay");
                    expect(autoPlayObj.style.visibility).toEqual("visible");
                });

                it('getSkinProperties - adjustFlexibleHeight - regular mode', function () {
                    var slideShow = createSlideShowComponent();

                    var propertiesObj = slideShow.getSkinProperties();
                    expect(propertiesObj.itemsContainer.style.height).toEqual("100%");
                    expect(propertiesObj.border.style.height).toEqual(360);
                    expect(propertiesObj[""].style.height).toEqual(360);
                });
                it('getSkinProperties - adjustFlexibleHeight - flexibleHeight mode', function () {
                    items[0].height = 120;
                    items[0].width = 419;
                    var slideShow = createSlideShowComponent();
                    slideShow.props.compProp.imageMode = "flexibleHeight";

                    var propertiesObj = slideShow.getSkinProperties();
                    expect(propertiesObj.itemsContainer.style.height).toEqual("100%");
                    expect(propertiesObj.border.style.height).toEqual(137);
                    expect(propertiesObj[""].style.height).toEqual(137);
                });
            });
        });


    });
