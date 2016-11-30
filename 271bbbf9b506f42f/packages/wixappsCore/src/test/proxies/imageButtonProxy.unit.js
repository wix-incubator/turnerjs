define(['lodash', 'testUtils', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/imageButtonProxy', 'components'], function (_, /** testUtils */testUtils, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe('ImageButton proxy', function () {

        var data = {_type: "wix:Image", src: "images/icons/appbuilder_sprite.png", height: 15, width: 15, title: ""};

        var viewDef = {
            comp: {
                name: 'ImageButton',
                "isSprite": "true",
                "spriteDirection": "horizontal",
                "startPositionX": "50",
                "startPositionY": "60"
            }
        };

        it('should create a ImageButton component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('ImageButton', props);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual("wixapps.integration.skins.ImageButtonSkin");
        });

        it('props are passed to the component', function () {
            spyOn(typesConverter, 'icon').and.callThrough();
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('ImageButton', props);
            var component = proxy.refs.component;

            var expectedProps = {
                "isSprite": true,
                "spriteDirection": "horizontal",
                "startPositionX": 50,
                "startPositionY": 60
            };

            expect(component.props.compProp).toEqual(expectedProps);
        });

        it('should convert the data by using typeConverter', function () {
            spyOn(typesConverter, 'icon').and.callThrough();
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('ImageButton', props);
            var component = proxy.refs.component;

            expect(typesConverter.icon).toHaveBeenCalledWith(data, props.viewProps.resolveImageData, props.viewProps.siteData.serviceTopology, props.viewProps.packageName);
            expect(component.props.compData).toEqual(typesConverter.icon(data, props.viewProps.resolveImageData, props.viewProps.siteData.serviceTopology, props.viewProps.packageName));
        });
    });
});
