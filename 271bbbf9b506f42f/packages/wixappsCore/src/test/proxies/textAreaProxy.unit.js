define(['lodash', 'testUtils'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('text area proxy', function () {
        var viewDef, proxyData;

        beforeEach(function () {
            viewDef = {
                "comp": {
                    "name": "TextArea",
                    "styleNS": "ecomTextArea",
                    "isStyleEditable": "false",
                    "maxLength": "300",
                    "css": {
                        "width": "100%"
                    }
                }
            };

            proxyData = {
                _type: "EcomTextOption",
                id: "334906371",
                isMandatory: false,
                isSelectableList: false,
                optionType: "simpleText",
                selectedValue: -1,
                text: "eliran ha dubon ha shmanmanon",
                title: "",
                valid: true
            };
        });

        it('pass props.compData to the child', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('TextArea', props);
            var component = proxy.refs.component;

            var expected = {
                type: 'TextInput',
                value: 'eliran ha dubon ha shmanmanon',
                maxLength: 300
            };
            expect(component.props.compData).toEqual(expected);
        });

        it('should pass placeholder comp prop to the compProp of the component', function () {
            var expected = 'Enter your text here';
            viewDef.comp.placeholder = expected;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('TextArea', props);
            var component = proxy.refs.component;

            expect(component.props.compProp.placeholder).toEqual(expected);
        });

        it('should pass label comp prop to the compProps of the component', function () {
            var expected = 'This is a label';
            viewDef.comp.label = expected;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('TextArea', props);
            var component = proxy.refs.component;

            expect(component.props.compProp.label).toEqual(expected);
        });

        it('should pass message comp prop to the compProp of the component', function () {
            var expected = 'This is a message';
            viewDef.comp.message = expected;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('TextArea', props);
            var component = proxy.refs.component;

            expect(component.props.compProp.message).toEqual(expected);
        });

        it('should set compProp.message to the opposite of proxyData.valid if the message comp prop was not set', function () {
            _.forEach([false, true], function (valid) {
                proxyData.valid = valid;
                var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
                var proxy = testUtils.proxyBuilder('TextArea', props);
                var component = proxy.refs.component;

                expect(component.props.compProp.message).toEqual(!valid);
            });
        });

        it('should pass isPreset comp prop to the compProp of the component', function () {
            var expected = true;
            viewDef.comp.isPreset = expected;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('TextArea', props);
            var component = proxy.refs.component;

            expect(component.props.compProp.isPreset).toEqual(expected);
        });
    });
});
