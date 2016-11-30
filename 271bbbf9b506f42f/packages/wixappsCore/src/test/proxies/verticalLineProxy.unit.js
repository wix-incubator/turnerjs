define(['lodash', 'testUtils', 'wixappsCore/proxies/horizontalLineProxy', 'components'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('HorizontalLine proxy', function () {
        it('should create a FiveGridLine component', function () {
            var viewDef = {
                comp: {
                    name: 'VerticalLine'
                }
            };
            var props = testUtils.proxyPropsBuilder(viewDef);
            var proxy = testUtils.proxyBuilder('VerticalLine', props);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.VerticalLineSkin');
        });
    });
});
