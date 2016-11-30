define(['lodash', 'testUtils', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/imageButtonProxy', 'components'], function (_, /** testUtils */testUtils, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe('TextInput proxy', function () {
        var data = "I'm a text";

        var viewDef = {
            comp: {
                name: 'TextInput',
                "label": "I'm a label",
                placeholder: "I'm a placeholder"
            }
        };

        it('should create a ImageButton component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TextInput', props);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual("wysiwyg.viewer.skins.appinputs.AppsTextInputSkin");
        });

        it('props are passed to the component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TextInput', props);
            var component = proxy.refs.component;

            var expectedProps = {
                "label": "I'm a label",
                placeholder: "I'm a placeholder"
            };

            expect(component.props.compProp).toEqual(expectedProps);
        });

        it('should convert the data by using typeConverter', function () {
            spyOn(typesConverter, 'text').and.callThrough();
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TextInput', props);
            var component = proxy.refs.component;

            expect(typesConverter.text).toHaveBeenCalledWith(data);
            expect(component.props.compData).toEqual(typesConverter.text(data));
        });
    });
});
