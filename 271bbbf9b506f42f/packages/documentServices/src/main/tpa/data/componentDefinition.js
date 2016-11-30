define([], function() {
    'use strict';

    var getComponentDefinition = function(compParams){
        var compType = compParams && compParams.compType;

        var imageArr = [
            {
                'type': 'Image',
                'title': 'Water Droplets',
                'uri': 'cd6a81b7d29d88425609ecc053a00d16.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Budding Tree',
                'uri': '44dab8ba8e2b5ec71d897466745a1623.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Fallen Apples',
                'uri': '8dfce587e3f99f17bba2d3346fea7a8d.jpg',
                'description': 'Describe your image here',
                'width': 758,
                'height': 569
            },
            {
                'type': 'Image',
                'title': 'Water Droplets',
                'uri': 'cd6a81b7d29d88425609ecc053a00d16.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Budding Tree',
                'uri': '44dab8ba8e2b5ec71d897466745a1623.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Fallen Apples',
                'uri': '8dfce587e3f99f17bba2d3346fea7a8d.jpg',
                'description': 'Describe your image here',
                'width': 758,
                'height': 569
            },
            {
                'type': 'Image',
                'title': 'Water Droplets',
                'uri': 'cd6a81b7d29d88425609ecc053a00d16.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Budding Tree',
                'uri': '44dab8ba8e2b5ec71d897466745a1623.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Fallen Apples',
                'uri': '8dfce587e3f99f17bba2d3346fea7a8d.jpg',
                'description': 'Describe your image here',
                'width': 758,
                'height': 569
            },
            {
                'type': 'Image',
                'title': 'Water Droplets',
                'uri': 'cd6a81b7d29d88425609ecc053a00d16.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Budding Tree',
                'uri': '44dab8ba8e2b5ec71d897466745a1623.jpg',
                'description': 'Describe your image here',
                'width': 1000,
                'height': 750
            },
            {
                'type': 'Image',
                'title': 'Fallen Apples',
                'uri': '8dfce587e3f99f17bba2d3346fea7a8d.jpg',
                'description': 'Describe your image here',
                'width': 758,
                'height': 569
            }

        ];

        //TODO: build component definition, should be ready in 2 weeks according to Shaharz
        var compMap = {
            'addHoneycomb': {
                'layout': {
                    'rotationInDegrees': 0,
                    'width': 626,
                    'height': 723,
                    'scale': 1,
                    'x': 130,
                    'y': 32,
                    'fixedPosition': false
                },
                'componentType': 'tpa.viewer.components.Honeycomb',
                'type': 'Component',
                'skin': 'wysiwyg.viewer.skins.TPAHoneycombSkin',
                'data': {
                    'items': imageArr,
                    'type': 'ImageList'
                },
                'props': {
                    'numOfColumns': 4,
                    'numOfHoles': 2,
                    'imageShape': 'hexagon',
                    'expandEnabled': false,
                    'margin': 1,
                    'font': 'arial',
                    'imageScale': 'x1',

                    'textMode': 'titleAndDescription',
                    'alignText': 'left',
                    'rolloverAnimation': 'colorOnly',
                    'galleryImageOnClickAction': 'zoomMode',
                    'type': 'HoneycombProperties',
                    'layoutSeed': 50
                },
                'style': {
                    'componentClassName': 'tpa.viewer.components.Honeycomb',
                    'pageId': '',
                    'compId': 'i4skqikv',
                    'styleType': 'custom',

                    'style': {
                        'propertiesSource': {
                            'color1': 'theme',
                            'color2': 'theme',
                            'color3': 'theme',
                            'color4': 'theme',
                            'color5': 'theme',
                            'version': 'value'
                        },
                        'properties': {
                            'alpha-color4': '0.7',
                            'alpha-color5': '1',
                            'color1': 'color_18',
                            'color2': 'color_1',
                            'color3': 'color_15',
                            'color4': 'color_11',
                            'color5': 'color_11',
                            'version': '1',
                            'alpha-color1': '1',
                            'alpha-color2': '1',
                            'alpha-color3': '1'
                        },
                        'groups': {}
                    },
                    'type': 'TopLevelStyle',
                    'skin': 'wysiwyg.viewer.skins.TPAHoneycombSkin'
                }
            }
        };

        return compMap[compType];
    };

    return {
        getComponentDefinition: getComponentDefinition
    };
});
