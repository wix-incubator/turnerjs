define(['testUtils', 'react', 'lodash', 'components/components/wGooglePlusOne/wGooglePlusOne'], function (/** testUtils */ testUtils, React, _, WGooglePlusOne) {
    'use strict';

    var createWGooglePlusOneComponent = function (size, annotation) {
        var props = testUtils.mockFactory.mockProps()
            .setCompProp({
                size: size,
                annotation: annotation
            });
        props.structure.componentType = 'wysiwyg.viewer.components.WGooglePlusOne';

        props.siteAPI.registerMockSiteAspect('externalScriptLoader', {
            loadScript: function () {
            },
            getScriptDescription: function () {
                return {
                    NAME: 'GoogleApi',
                    SRC: 'fake//apis.google.com/js/plusone.js'
                };
            }
        });

        return testUtils.getComponentFromDefinition(WGooglePlusOne, props);
    };

    var expectedPropsArray = [
        {
            className: 'g-plusone',
            'data-size': 'small',
            'data-annotation': 'bubble'
        },
        {
            className: 'g-plusone',
            'data-size': 'small',
            'data-annotation': 'none'
        },
        {
            className: 'g-plusone',
            'data-size': 'small',
            'data-annotation': 'inline'
        },
        {
            className: 'g-plusone',
            'data-size': 'medium',
            'data-annotation': 'bubble'
        },
        {
            className: 'g-plusone',
            'data-size': 'medium',
            'data-annotation': 'none'
        },
        {
            className: 'g-plusone',
            'data-size': 'medium',
            'data-annotation': 'inline'
        },
        {
            className: 'g-plusone',
            'data-size': 'standard',
            'data-annotation': 'bubble'
        },
        {
            className: 'g-plusone',
            'data-size': 'standard',
            'data-annotation': 'none'
        },
        {
            className: 'g-plusone',
            'data-size': 'standard',
            'data-annotation': 'inline'
        },
        {
            className: 'g-plusone',
            'data-size': 'tall',
            'data-annotation': 'bubble'
        },
        {
            className: 'g-plusone',
            'data-size': 'tall',
            'data-annotation': 'none'
        },
        {
            className: 'g-plusone',
            'data-size': 'tall',
            'data-annotation': 'inline'
        }
    ];

    describe('Google Plus One Component', function () {

        describe('Test the children', function () {

            it('should return DIV with correct attributes', function () {
                _.forEach(expectedPropsArray, function (expectedProps) {
                    var wGPlusOneComp = createWGooglePlusOneComponent(expectedProps['data-size'], expectedProps['data-annotation']),
                        divElem = wGPlusOneComp.getSkinProperties().googlePlus.children,
                        divComp = React.addons.TestUtils.renderIntoDocument(divElem);

                    expect(divComp).toBeComponentOfType('div');
                    _.forEach(divElem.props, function (value, key) {
                        expect(value).toEqual(expectedProps[key]);
                    });
                });
            });
        });
    });
});
