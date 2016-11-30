define(['lodash', 'testUtils', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/imageProxy', 'components'], function (_, /** testUtils */testUtils, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe('Image proxy', function () {

        var data;
        var viewDef;

        beforeEach(function () {
            data = {
                src: 'http://images/myImage.png',
                title: 'image title',
                width: '50px',
                height: '70px'
            };

            viewDef = {
                id: 'image-proxy',
                comp: {
                    name: 'Image'
                }
            };
        });

        it('should create a WPhoto component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Image', props);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.photo.NoSkinPhoto');
        });

        it('should set compProp.displayMode to fill or the the mode define in the view definition', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Image', props);
            var component = proxy.refs.component;

            expect(component.props.compProp).toEqual({displayMode: "fill"});

            function validateImageMode(imageMode) {
                props.viewDef.comp.imageMode = imageMode;
                proxy = testUtils.proxyBuilder('Image', props);
                expect(proxy.refs.component.props.compProp).toEqual({displayMode: imageMode});
            }

            var modes = ['fill', 'full', 'fitWidthStrict', 'fitHeightStrict'];
            _.forEach(modes, validateImageMode);
        });

        it('should convert the data by using typeConverter', function () {
            spyOn(typesConverter, 'image').and.callThrough();
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Image', props);
            var component = proxy.refs.component;

            expect(typesConverter.image).toHaveBeenCalledWith(data, props.viewProps.resolveImageData, props.viewProps.siteData.serviceTopology, props.packageName, {});
            expect(component.props.compData).toEqual(typesConverter.image(data, props.viewProps.resolveImageData, props.viewProps.siteData.serviceTopology, props.packageName));
        });

        it('should set style only on the outer div', function () {
            viewDef.layout =
            {
                position: 'relative',
                backgroundColor: 'rgb(255, 255, 255)'
            };

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Image', props);
            var component = proxy.refs.component;

            // Image should get only width and height.
            expect(component.props.style).toEqual({width: 16, height: 16});
            var container = proxy.refs.container;

            // The component styles are set only on the outer div.
            expect(testUtils.getStyleObject(container)).toEqual(jasmine.objectContaining(viewDef.layout));
        });

        it('should set the of the component size to 16 x 16 when the definition size is dynamic', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Image', props);
            var component = proxy.refs.component;

            expect(component.props.style.width).toEqual(16);
            expect(component.props.style.height).toEqual(16);
        });

        it('should set the of the component size according to the measureMap values when the definition size is dynamic', function () {
            var width = 100;
            var height = 150;
            var innerComponentId = '0_' + viewDef.id;
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var compMeasures = {
                width: {},
                height: {}
            };
            compMeasures.width[innerComponentId] = width;
            compMeasures.height[innerComponentId] = height;
            props.viewProps.siteData.addMeasureMap(compMeasures);
            var proxy = testUtils.proxyBuilder('Image', props);
            var component = proxy.refs.component;

            expect(component.props.id).toEqual(innerComponentId);
            expect(component.props.style.width).toEqual(width);
            expect(component.props.style.height).toEqual(height);
        });
    });
});
