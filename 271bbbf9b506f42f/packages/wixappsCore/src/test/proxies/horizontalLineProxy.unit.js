define(['lodash', 'testUtils', 'wixappsCore/proxies/horizontalLineProxy', 'components'], function (_, /** testUtils */testUtils) {
    'use strict';

    var viewDef = {
        comp: {
            name: 'HorizontalLine'
        }
    };

    describe('HorizontalLine proxy', function () {
        it('should create a FiveGridLine component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef);
            var proxy = testUtils.proxyBuilder('HorizontalLine', props);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.FiveGridLineSkin');
        });

        it('Component root should be position relative', function () {
            var props = testUtils.proxyPropsBuilder(viewDef);
            var proxy = testUtils.proxyBuilder('HorizontalLine', props);
            var component = proxy.refs.component;

            expect(component.refs[''].style.position).toEqual('relative');
        });
    });
});
