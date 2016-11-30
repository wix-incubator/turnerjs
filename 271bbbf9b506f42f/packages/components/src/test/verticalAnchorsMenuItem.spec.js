define(['lodash',
    'react',
    'testUtils',
    'utils',
    'components/components/verticalAnchorsMenu/verticalAnchorsMenuItem'
], function (_, React, testUtils, utils, verticalAnchorsMenuItem) {

    'use strict';
    describe('VerticalAnchorsMenuItem Component', function () {
        it('should generate anchor link from anchor data', function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            var anchorData = siteData.mock.anchorData({
                id: 'anchor-1',
                name: 'test-anchor'
            });

            var props = _.assign({}, testUtils.mockFactory.mockProps(siteData), {
                anchorData: anchorData,
                styleId: 'test_style',
                svgShapeName: 'circle',
                isTablet: false,
                skinExports: {},
                siteData: siteData,
                isActive: false
            });

            var factory = React.createFactory(verticalAnchorsMenuItem);
            var TestUtils = React.addons.TestUtils;
            var component = TestUtils.renderIntoDocument(factory(props));

            var anchor = _.first(TestUtils.scryRenderedDOMComponentsWithTag(component, 'a'));
            var url = utils.wixUrlParser.getUrl(siteData, component.props.rootNavigationInfo);
            var actualUrlObj = utils.urlUtils.parseUrl(anchor.href);
            expect(actualUrlObj.path).toEqual('/' + url);
            expect(anchor.attributes['data-anchor'].value).toEqual(anchorData.id);
        });
    });
});