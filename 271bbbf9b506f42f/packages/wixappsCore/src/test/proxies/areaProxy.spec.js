define(['lodash', 'testUtils', 'wixappsCore/proxies/areaProxy', 'components'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('Area proxy', function () {

        var viewDef = {
            comp: {
                name: 'Area',
                styleNS: 'default',
                items: [
                    {
                        comp: {
                            name: 'Box'
                        }
                    }
                ]
            }
        };

        var data = {"_type": "String", "text": "555"};

        it('should create an Area component and use styleNS to set skin', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Area', props);
            var component = proxy.refs.component;

            // Validate default component is used
            expect(component).toBeComponentOfType('wixapps.integration.components.Area');

            // Validate default skin
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.area.AppleArea');

            var ns = {
                'ecomCouponBox': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin',
                'ecomCartHeader': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin',
                'ecomEmptyCartBG': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin'
            };

            _.forEach(ns, function (skin, namespace) {
                props.viewDef.comp.styleNS = namespace;
                proxy = testUtils.proxyBuilder('Area', props);
                expect(proxy.refs.component.props.skin).toEqual(skin);
            });
        });

        it("should use vertical orientation by default or the one that was set in the view definition's orientation", function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Area', props);

            expect(proxy.getChildrenOrientation()).toEqual('vertical');
            expect(proxy.refs[0].props.orientation).toEqual('vertical');

            var validateOrientation = function (orientation) {
                props.viewDef.comp.orientation = orientation;
                proxy = testUtils.proxyBuilder('Area', props);
                expect(proxy.getChildrenOrientation()).toEqual(orientation);

                // Validate the actual props on the child proxy.
                expect(proxy.refs[0].props.orientation).toEqual(orientation);
            };

            validateOrientation('horizontal');
            validateOrientation('vertical');
        });
    });
});
