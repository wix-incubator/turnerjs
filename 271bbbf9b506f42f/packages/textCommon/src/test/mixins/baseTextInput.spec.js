/**
 * Created by alexandreroitman on 31/08/2016.
 */
define(['react', 'testUtils', 'textInput'], function (React, testUtils, textInput) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;

    function render(props) {
        return testUtils.getComponentFromDefinition(textInput, props);
    }

    function mockProps () {
        var compProps = testUtils.mockFactory.mockProps()
            .setCompProp({type: 'TextInputProperties'})
            .setCompData({})
            .setSkin("wysiwyg.viewer.skins.input.TextInputSkin");
        compProps.structure.componentType = 'wysiwyg.viewer.components.inputs.TextInput';

        return compProps;
    }

    describe('Text Input Browser native Validation', function(){
        describe('Validating pattern', function(){
            it('should invalidate using the pattern if there is a pattern in compData and value does not match the pattern', function() {
                var props = mockProps();
                props.compData = {
                    pattern: 'ab|cd'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: '222'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(false);
            });


            it('should validate using the pattern if there is a pattern in compData and value matches', function() {
                var props = mockProps();
                props.compData = {
                    pattern: 'ab|cd'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'ab'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(true);
            });
        });

        describe('Validating types email, phone number and url', function(){
            it('should validate email', function() {
                var props = mockProps();

                props.compData = {
                    textType: 'email'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'ab222@email.com'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(true);
            });

            it('should invalidate invalid email', function() {
                var props = mockProps();

                props.compData = {
                    textType: 'email'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'notValidEmail'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(false);
            });

            it('should validate URL', function() {
                var props = mockProps();

                props.compData = {
                    textType: 'url'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'http://my.url.today'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(true);
            });

            it('should invalidate invalid URL', function() {
                var props = mockProps();

                props.compData = {
                    textType: 'url'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'notValidURL'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(false);
            });

            it('should validate phone number', function() {
                var props = mockProps();

                props.compData = {
                    textType: 'tel'
                };
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: '+972-69-669-6969'}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(true);
            });

            it('should invalidate invalid phone number', function() {
                var props = mockProps();

                props.compData = {
                    textType: 'tel'
                };
                props.compProp = {required: true};
                var textInputComp = render(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: ''}});
                React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                expect(textInputComp.state.valid).toEqual(false);
            });
        });
    });


});
