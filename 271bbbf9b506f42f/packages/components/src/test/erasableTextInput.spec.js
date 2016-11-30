define(['testUtils', 'components/components/erasableTextInput/erasableTextInput'],
    function (testUtils, erasableTextInput) {
        'use strict';

        var props;

        describe('ErasableTextInput component', function () {
            beforeEach(function () {
                props = testUtils.mockFactory.mockProps()
                    .setCompData({
                        value: "I'm a text"})
                    .setCompProp({
                        label: "I'm a label",
                        placeholder: "I'm a placeholder"})
                    .setProps({
                        message: "I'm a message",
                        onChange: function (/*event*/) {
                        },
                        onErase: function () {
                        }
                    });
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ErasableTextInput';
            });

            it('should set the $erase state to showButton if compData.value contains text', function () {
                var erasableTextInputComp = testUtils.getComponentFromDefinition(erasableTextInput, props);

                expect(erasableTextInputComp.state.$erase).toEqual('showButton');
            });

            it('should set the $erase state to hideButton if compData.value doesn\'t contain any text', function () {
                props.compData.value = '';
                var erasableTextInputComp = testUtils.getComponentFromDefinition(erasableTextInput, props);

                expect(erasableTextInputComp.state.$erase).toEqual('hideButton');
            });

            it('should set the erase skinpart\'s children to be "x"', function () {
                var erasableTextInputComp = testUtils.getComponentFromDefinition(erasableTextInput, props);

                var skinProperties = erasableTextInputComp.getSkinProperties();

                expect(skinProperties.erase.children).toEqual('x');
            });

            it('should call compProp.onErase when the erase button is clicked', function () {
                var erasableTextInputComp = testUtils.getComponentFromDefinition(erasableTextInput, props);

                var skinProperties = erasableTextInputComp.getSkinProperties();

                expect(skinProperties.erase.onClick).toBe(props.onErase);
            });
        });
    });
