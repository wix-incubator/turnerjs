define(['lodash', 'testUtils', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/imageButtonProxy', 'components'], function (_, /** testUtils */testUtils, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    describe('ErasableTextInputProxy', function () {
        var data = {
            title: "I'm a text"
        };

        var viewDef = {
            comp: {
                "name": "ErasableTextInput",
                "skin": "ecommerce.skins.mcom.MobileErasableTextInputSkin",
                "label": "I'm a label",
                "placeholder": "I'm a placeholder",
                "message": "I'm a message"
            }
        };

        it('should create an ErasableTextInput component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('ErasableTextInput', props);
            var component = proxy.refs.component;

            // Validate default component is used
            expect(component).toBeComponentOfType('wysiwyg.viewer.components.inputs.ErasableTextInput');

            // Validate default skin
            expect(component.props.skin).toEqual("ecommerce.skins.mcom.MobileErasableTextInputSkin");
        });

        it('should pass the props to the component and set the event handlers on the compProp obj', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('ErasableTextInput', props);
            var component = proxy.refs.component;

            var expectedProps = {
                "label": "I'm a label",
                "placeholder": "I'm a placeholder",
                "message": "I'm a message"
            };

            expect(component.props.compProp.label).toContain(expectedProps.label);
            expect(component.props.compProp.placeholder).toContain(expectedProps.placeholder);
            expect(component.props.message).toContain(expectedProps.message);
            expect(typeof component.props.onChange).toEqual("function");
            expect(typeof component.props.onErase).toEqual("function");
        });

        it('should convert the data by using typeConverter', function () {
            spyOn(typesConverter, 'text').and.callThrough();
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('ErasableTextInput', props);
            var component = proxy.refs.component;

            expect(typesConverter.text).toHaveBeenCalledWith(data);
            expect(component.props.compData).toEqual(typesConverter.text(data));
        });
    });
});
