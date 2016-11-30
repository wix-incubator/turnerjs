define([
    'siteUtils',
    'react',
    'testUtils',
    'lodash',
    'components/components/sliderGallery/sliderGallery',
    'reactDOM'
],
    function(siteUtils, React, /** testUtils*/ testUtils, _, sliderGallery, ReactDOM) {
        'use strict';

        /** test.SiteData */


        var mockWindowTouchEventAspect = {
            registerToWindowTouchEvent: function () {}
        };

        var mockSiteData, mockLink, mockImages, mockImageList;



        function getComponent(properties) {
            return testUtils.getComponentFromDefinition(sliderGallery, properties);
        }

        var props = {};

        describe("SliderGallery component", function() {
            beforeEach(function() {
                mockSiteData = testUtils.mockFactory.mockSiteData();
                mockLink = mockSiteData.mock.externalLinkData();
                mockImages = [
                    mockSiteData.mock.imageData({link: mockSiteData.mock.utils.toRef(mockLink)}),
                    mockSiteData.mock.imageData({link: ''}),
                    mockSiteData.mock.imageData({link: ''})
                ];
                mockImageList = mockSiteData.mock.imageList({"items": mockSiteData.mock.utils.toRef(mockImages)});
            });

            beforeEach(function () {
                spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);

                props = testUtils.mockFactory.mockProps(mockSiteData)
                    .setSkin("wysiwyg.viewer.skins.galleryselectableslider.SelectableSliderGalleryDefaultSkin")
                    .setCompData(mockImageList)
                    .setCompProp({
                        maxRows: 2,
                        numCols: 3,
                        showMoreLabel: "show Additional Items",
                        margin: 15,
                        incRows: 2
                    })
                    .setThemeStyle({
                        id: "mockStyle",
                        style: {properties: {}}
                    })
                    .setNodeStyle({
                        height: 300,
                        width: 700
                    });
                props.siteAPI.registerMockSiteAspect('windowTouchEvents', mockWindowTouchEventAspect);
                props.structure.componentType = 'wysiwyg.viewer.components.SliderGallery';


            });

            describe('public state', function () {
                var sliderGalleryClass = React.createClass(sliderGallery);

                function getPropsInfo(propsOverrides) {
                    return {
                        props: testUtils.mockFactory.dataMocks.sliderGalleryProperties(propsOverrides)
                    };
                }

                it('should create default public state', function () {
                    var publicState = sliderGalleryClass.publicState(null, getPropsInfo());
                    expect(publicState).toEqual({currentIndex: 0});
                });

                it('should get the public state according to the component state', function () {
                    var state = {currentIndex: 4};
                    var publicState = sliderGalleryClass.publicState(state, getPropsInfo());
                    expect(publicState).toEqual(state);
                });

                it('should get the initial public state according to compProp.selectedItemIndex', function () {
                    var publicState = sliderGalleryClass.publicState(null, getPropsInfo({selectedItemIndex: 3}));
                    expect(publicState).toEqual({currentIndex: 3});
                });
            });

            describe("animation logic", function() {
                //// TODO NMO 27/07/2014 15:12 shimil - This should be added after the changes are done in the animation logic
            });

            describe("selectable items", function() {
                // test the selectability option of the images (SelecteableSliderGallery functionality added directly to SliderGallery)

                it('default selected index', function() {
                    var sliderGalleryComp = getComponent(props);
                    var initialState = sliderGalleryComp.state;

                    expect(initialState.currentIndex).toEqual(0);
                });

                it('displayer click handler is invoked', function() {
                    var sliderGalleryComp = getComponent(props);

                    var itemsContainerNode = ReactDOM.findDOMNode(sliderGalleryComp.refs.images);

                    //click on the second displayer elements
                    React.addons.TestUtils.Simulate.click(itemsContainerNode.children[1]);

                    expect(sliderGalleryComp.state.currentIndex).toEqual(1);
                });

                it('displayer click handler invokes the provided onSelectionChanged function', function() {
                    var spyFunc = props.onImageSelected = jasmine.createSpy();

                    var sliderGalleryComp = getComponent(props);

                    var itemsContainerNode = ReactDOM.findDOMNode(sliderGalleryComp.refs.images);

                    //click on the second displayer elements
                    React.addons.TestUtils.Simulate.click(itemsContainerNode.children[1]);

                    expect(spyFunc).toHaveBeenCalledWith(jasmine.objectContaining({payload: {itemIndex: 1, imageData: '#' + mockImages[1].id}}), jasmine.any(String));
                    expect(sliderGalleryComp.state.currentIndex).toEqual(1);
                });
            });
        });
    });
