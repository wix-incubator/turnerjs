define(['lodash',
    'testUtils',
    'wixappsCore/core/typesConverter',
    'fonts'
], function (_,
             /** testUtils */
             testUtils,
             /** wixappsCore.typesConverter */
             typesConverter,
             fonts) {
    'use strict';

    describe('Button proxy', function () {

        beforeEach(function () {
            this.viewDef = {
                comp: {
                    name: 'Button',
                    styleNS: 'default'
                }
            };
            spyOn(typesConverter, 'linkableButton').and.callThrough();
            spyOn(fonts.fontUtils, 'parseFontStr').and.returnValue({
                size: 10
            });
        });

        function getProxy(viewDef, data) {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            return testUtils.proxyBuilder('Button', props);
        }

        it('Should create a SiteButton component with the given skin', function () {
            var proxy = getProxy(this.viewDef);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.button.BasicButton');

            var ns = {
                'ecomViewCart': 'wysiwyg.viewer.skins.button.BasicButton',
                'ecomCheckout': 'wysiwyg.viewer.skins.button.DisabledLayerButton',
                'ecomAddToCart': 'wysiwyg.viewer.skins.button.BasicButton',
                'ecomRemoveFromCart': 'wysiwyg.viewer.skins.button.FixedFontButton',
                'ecomApplyCoupon': 'wysiwyg.viewer.skins.button.ApplyButtonEcom',
                'ecomAddProduct': 'wysiwyg.viewer.skins.button.AddProductButton'
            };

            _.forEach(ns, function (skin, styleNS) {
                this.viewDef.comp.styleNS = styleNS;
                proxy = getProxy(this.viewDef);
                expect(proxy.refs.component.props.skin).toEqual(skin);
            }, this);
        });

        it("should set button's label to 'Submit' as default label", function () {
            var proxy = getProxy(this.viewDef);
            var component = proxy.refs.component;

            expect(typesConverter.linkableButton).toHaveBeenCalledWith(undefined, proxy.props.viewProps.siteData);
            expect(component.props.compData.label).toEqual('Submit');
        });

        it("should not be displayed if the label is empty", function () {
            var data = "";
            var proxy = getProxy(this.viewDef, data);
            var component = proxy.refs.component;

            expect(typesConverter.linkableButton).toHaveBeenCalledWith(data, proxy.props.viewProps.siteData);
            expect(component.props.style.display).toEqual('none');
        });
    });
});
