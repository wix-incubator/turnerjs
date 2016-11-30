define([
    'lodash', 'testUtils', 'react', 'reactDOM', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/sliderGalleryProxy', 'components'
], function(_, /** testUtils */testUtils, React, ReactDOM, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe('sliderGallery proxy', function () {

        var data = [
            {
                '_type': 'wix:LinkableImage',
                "title": "Water Droplets",
                "src": "cd6a81b7d29d88425609ecc053a00d16.jpg",
                "description": "Describe your image here",
                "width": 1000,
                "height": 750,
                link: {"_type": "wix:LinkBase"}
            },
            {
                '_type': 'wix:LinkableImage',
                "title": "Budding Tree",
                "src": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                "description": "Describe your image here",
                "width": 1000,
                "height": 750,
                link: {"_type": "wix:LinkBase"}
            },
            {
                '_type': 'wix:LinkableImage',
                "title": "Fallen Apples",
                "src": "8dfce587e3f99f17bba2d3346fea7a8d.jpg",
                "description": "Describe your image here",
                "width": 758,
                "height": 569,
                link: {"_type": "wix:LinkBase"}
            }
        ];

        function buildProps(viewDef) {
            var themeModel = {
                mockStyle: {
                    style: {
                        properties: {}
                    }
                }
            };
            var props = testUtils.proxyPropsBuilder(viewDef, data, undefined, themeModel);
            props.structure = {
                'styleId': 'mockStyle'
            };

            return props;
        }

        it('Create SliderGalleryProxy with default comp and skin', function () {
            var viewDef = {
                comp: {
                    name: 'SliderGallery'
                },
                layout: {
                    width: 0,
                    height: 0
                }
            };
            var props = buildProps(viewDef);
            var sliderGalleryProxy = testUtils.proxyBuilder('SliderGallery', props);
            var sliderGallery = sliderGalleryProxy.refs.component;

            // Validate default skin
            expect(sliderGallery.props.skin).toEqual('wysiwyg.viewer.skins.galleryselectableslider.SelectableSliderGalleryDefaultSkin');
        });

        it('handle selectionChanged event from the view', function () {
            var onImageSelected = jasmine.createSpy('onImageSelected');
            var viewDef = {
                comp: {
                    name: 'SliderGallery',
                    events: {
                        imageSelected: 'onImageSelected'
                    }
                },
                layout: {
                    width: 0,
                    height: 0
                }
            };
            var props = buildProps(viewDef);
            props.logic.onImageSelected = onImageSelected;

            var sliderGalleryProxy = testUtils.proxyBuilder('SliderGallery', props);
            var sliderGallery = sliderGalleryProxy.refs.component;
            var firstItemNode = ReactDOM.findDOMNode(sliderGallery.refs['01']);
            React.addons.TestUtils.Simulate.click(firstItemNode);

            var expectedEventData = {
                imageData: typesConverter.imageList({items: data}, props.viewProps.resolveImageData, props.viewProps.siteData.serviceTopology, props.viewProps.siteData).items[1],
                itemIndex: 1
            };
            expect(onImageSelected).toHaveBeenCalledWith(jasmine.objectContaining({payload: expectedEventData}), jasmine.any(String));
        });
    });
});
