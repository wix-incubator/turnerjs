define(['lodash',
        'reactDOM',
    'testUtils',
    'wixappsCore/core/typesConverter',
    'fonts'
], function (_,
             ReactDOM,
             /** testUtils */
             testUtils,
             /** wixappsCore.typesConverter */
             typesConverter,
             fonts) {
    'use strict';

    describe('Button2proxy', function () {

        beforeEach(function () {
            this.viewDef = {
                comp: {
                    name: 'Button2',
                    styleNS: 'default'
                }
            };
            spyOn(typesConverter, 'linkableButton').and.callThrough();
            spyOn(fonts.fontUtils, 'parseFontStr').and.returnValue({
                size: 10
            });
        });

        function getProxy(viewDef) {
            var props = testUtils.proxyPropsBuilder(viewDef);
            return testUtils.proxyBuilder('Button2', props);
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

        it("should set button's label to empty string as default label", function () {
            var proxy = getProxy(this.viewDef);
            var component = proxy.refs.component;

            expect(typesConverter.linkableButton).toHaveBeenCalledWith(undefined, proxy.props.viewProps.siteData);
            expect(component.props.compData.label).toEqual('');
        });

        it("no height in this.viewDef - component height should be 30", function () {
            var proxy = getProxy(this.viewDef);
            var component = ReactDOM.findDOMNode(proxy.refs.component);

            expect(component.style.height).toEqual("30px");
        });

        it("has height in this.viewDef - component height should be like in the this.viewDef", function () {
            this.viewDef.comp.height = 75;
            var proxy = getProxy(this.viewDef);
            var component = ReactDOM.findDOMNode(proxy.refs.component);

            expect(component.style.height).toEqual("75px");
        });

        it("has width on layout - max-width is set to this width", function () {
            this.viewDef.layout = {width: 75};
            var proxy = getProxy(this.viewDef);
            var component = ReactDOM.findDOMNode(proxy.refs.component);

            expect(component.style["max-width"]).toEqual("75px");
        });

        it("no width on layout - max-width is undefined", function () {
            var proxy = getProxy(this.viewDef);
            var component = ReactDOM.findDOMNode(proxy.refs.component);

            expect(component.style["max-width"]).toEqual('');
        });

        it("should have overflow hidden on the link skinPart style", function () {
            var proxy = getProxy(this.viewDef);
            var component = proxy.refs.component;

            expect(component.refs.link.style.overflow).toEqual('hidden');
        });
    });
});
