define(['lodash', "wixappsCore/core/proxyFactory",
    "wixappsCore/proxies/mixins/siteButtonProxy",
    'testUtils', 'wixappsCore/core/typesConverter',
    "wixappsCore/util/localizer",
    "fonts"
], function (_,
             /** wixappsCore.proxyFactory */
             proxyFactory,
             siteButtonProxy,
             /** testUtils */
             testUtils,
             /** wixappsCore.typesConverter */
             typesConverter,
             localizer,
             fonts) {
    'use strict';
    describe('siteButtonProxy', function () {
        beforeAll(function () {
            var TestSiteButtonProxy = {
                mixins: [siteButtonProxy],
                getDefaultLabel: function () {
                    return "";
                },
                getAdditionalStyle: function () {
                    return {};
                },
                transformSkinProperties: _.identity
            };

            proxyFactory.register('TestSiteButtonProxy', TestSiteButtonProxy);
        });

        afterAll(function () {
            proxyFactory.invalidate('TestSiteButtonProxy');
        });

        beforeEach(function () {
            this.viewDef = {
                comp: {
                    skin: 'wysiwyg.viewer.skins.button.BasicButton',
                    name: 'TestSiteButtonProxy'
                }
            };
            spyOn(typesConverter, 'linkableButton').and.callThrough();
            spyOn(typesConverter, 'link').and.callThrough();
            spyOn(fonts.fontUtils, 'parseFontStr').and.returnValue({
                size: 10
            });
        });

        it("should use view definition's label and not the label from the data", function () {
            this.viewDef.comp.label = 'view definition label';
            var data = 'data label';
            var props = testUtils.proxyPropsBuilder(this.viewDef, data);

            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(component.props.compData.label).toEqual(props.viewDef.comp.label);
        });

        it("should use the label from the data when there's no label set in the view definition", function () {
            var data = 'data label';
            var props = testUtils.proxyPropsBuilder(this.viewDef, data);

            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(typesConverter.linkableButton).toHaveBeenCalledWith(proxy.proxyData, props.viewProps.siteData);
            expect(component.props.compData.label).toEqual(proxy.proxyData);
        });

        it('should accept both String and object as data', function () {
            var data = 'data label';
            var props = testUtils.proxyPropsBuilder(this.viewDef, data);
            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(typesConverter.linkableButton).toHaveBeenCalledWith(proxy.proxyData, props.viewProps.siteData);
            expect(component.props.compData.label).toEqual(proxy.proxyData);

            data = {
                label: 'object data label'
            };
            props = testUtils.proxyPropsBuilder(this.viewDef, data);

            typesConverter.linkableButton.calls.reset();
            proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            component = proxy.refs.component;

            expect(typesConverter.linkableButton).toHaveBeenCalledWith(proxy.proxyData, props.viewProps.siteData);
            expect(component.props.compData).toEqual(typesConverter.linkableButton(proxy.proxyData, props.viewProps.siteData));
        });

        it('should set the link property of the component data to an empty string', function () {
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(component.props.compData.link).toEqual(null);
        });

        it('should set compProp according to align from view definition', function () {
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            // Default align is center.
            expect(component.props.compProp).toEqual({align: 'center', margin: 0, padding: ''});

            function validateAlignment(align) {
                props.viewDef.comp.align = align;
                proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
                expect(proxy.refs.component.props.compProp.align).toEqual(align);
            }

            validateAlignment('right');
            validateAlignment('left');
        });

        it('should set compProp according to margin from view definition', function () {
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(component.props.compProp).toEqual({align: 'center', margin: 0, padding: ''});

            function validateMargin(margin) {
                props.viewDef.comp.margin = margin;
                proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
                expect(proxy.refs.component.props.compProp.margin).toEqual(parseInt(margin, 10));
            }

            validateMargin("50");
            validateMargin(15);
        });

        it('should set compProp according to padding from view definition', function () {
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(component.props.compProp).toEqual({align: 'center', margin: 0, padding: ''});

            function validatePadding(padding) {
                props.viewDef.comp.labelPadding = padding;
                proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
                expect(proxy.refs.component.props.compProp.padding).toEqual(padding);
            }

            validatePadding("8px");
            validatePadding("0 8px 12px 4px");
        });

        it('should translate texts surrounded with @ using the translation bundle', function () {
            this.viewDef.comp.label = '@LABEL_KEY@';
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            spyOn(localizer, 'localize').and.callThrough();

            var translatedLabel = 'Translated Label';
            var localizationBundle = {'LABEL_KEY': translatedLabel};
            props.viewProps.getLocalizationBundle = function () {
                return localizationBundle;
            };

            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);

            // Translate text in the format @key@ using the textProxy mixin
            expect(localizer.localize).toHaveBeenCalledWith(props.viewDef.comp.label, localizationBundle);
            expect(proxy.refs.component.props.compData.label).toEqual(translatedLabel);
        });

        it('should create a wysiwyg link from corresponding data and take label from view def', function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.addPageWithDefaults('cee5');
            var pageData = siteData.getDataByQuery("cee5");
            var data = {
                "_type": "wix:PageLink",
                "pageId": pageData
            };

            this.viewDef.comp.label = 'something else';
            var props = testUtils.proxyPropsBuilder(this.viewDef, data, siteData);
            var proxy = testUtils.proxyBuilder('TestSiteButtonProxy', props);
            var component = proxy.refs.component;

            expect(component.props.compData.label).toEqual('something else');
            expect(component.props.compData.link).toEqual({
                type: 'PageLink',
                pageId: pageData
            });
            expect(component.props.compData.type).toEqual("LinkableButton");
        });
    });
});
