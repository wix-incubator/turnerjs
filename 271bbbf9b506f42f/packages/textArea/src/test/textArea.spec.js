define(['react', 'lodash', 'testUtils', 'textArea'], function (React, _, testUtils, textArea) {
    'use strict';

    var props = {
        compData: {},
        compProp: {}
    };

    function createTextAreaProps(partialProps) {
        return testUtils.santaTypesBuilder.getComponentProps(textArea, _.merge({
            compData: {},
            compProp: {},
            skin: "TextAreaDefaultSkin"
        }, partialProps));
    }

    function createTextAreaComp(partialProps) {
        props = createTextAreaProps(partialProps);
        return testUtils.getComponentFromDefinition(textArea, props);
    }

    describe("TextArea component", function () {
        describe('Wix Code', function(){
            it('should handleAction change onChange', function() {
                var textAreaComp = createTextAreaComp({
                    compData: {
                        value: 'initial val'
                    }
                });
                spyOn(textAreaComp, 'handleAction');
                var node = textAreaComp.refs.textarea;

                React.addons.TestUtils.Simulate.change(node, {target: {value: 'newVal'}});

                expect(textAreaComp.handleAction).toHaveBeenCalled();
            });

            it('should handleAction blur onBlur', function() {
                var textAreaComp = createTextAreaComp();
                spyOn(textAreaComp, 'handleAction');
                var node = textAreaComp.refs.textarea;

                React.addons.TestUtils.Simulate.blur(node, {target: {value: 'newVal'}});

                expect(textAreaComp.handleAction).toHaveBeenCalled();
            });

            it('should handleAction focus onFocus', function() {
                var textAreaComp = createTextAreaComp();
                spyOn(textAreaComp, 'handleAction');
                var node = textAreaComp.refs.textarea;

                React.addons.TestUtils.Simulate.focus(node, {target: {value: 'newVal'}});

                expect(textAreaComp.handleAction).toHaveBeenCalled();
            });

            it('should handleAction keyup onKeyUp', function() {
                var textAreaComp = createTextAreaComp();
                spyOn(textAreaComp, 'handleAction');
                var node = textAreaComp.refs.textarea;

                React.addons.TestUtils.Simulate.keyUp(node, {target: {value: 'newVal'}});

                expect(textAreaComp.handleAction).toHaveBeenCalled();
            });
        });


        describe('onClick', function(){
            it('should call select on the textarea when it is clicked', function() {
                var textAreaComp = createTextAreaComp({
                    compProp: {isPreset: true}
                });
                var textareaNode = textAreaComp.refs.textarea;
                spyOn(textareaNode, 'select');

                React.addons.TestUtils.Simulate.click(textareaNode, {});

                expect(textareaNode.select).toHaveBeenCalled();
            });
        });
    });

});
