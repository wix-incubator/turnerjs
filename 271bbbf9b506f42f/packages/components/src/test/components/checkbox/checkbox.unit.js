define(['react', 'lodash', 'testUtils', 'components/components/checkbox/checkbox'], function (React, _, testUtils, checkbox) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;

    describe('checkbox', function () {

        function render(props) {
            return testUtils.getComponentFromDefinition(checkbox, props);
        }

        function mockProps () {
            var props = testUtils.mockFactory.mockProps()
                .setCompProp({type: 'CheckboxProperties'})
                .setCompData({})
                .setSkin("wysiwyg.viewer.skins.input.CheckboxBasicSkin");
            props.structure.componentType = 'wysiwyg.viewer.components.inputs.Checkbox';

            return props;
        }

        describe('publicState', function () {
            var checkboxClass = React.createClass(checkbox);

            it('should have a default public state', function () {
                expect(checkboxClass.publicState()).toEqual({valid: true});
            });

            it('should get the valid state from the component state', function () {
                expect(checkboxClass.publicState({valid: false})).toEqual({valid: false});
            });
        });

        describe('checkbox skinpart', function () {

            describe('checked value', function() {

                it('should be false when initialized with no data', function () {
                    var props = mockProps();
                    var checkboxComp = render(props);
                    var checkboxInput = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxInput.checked).toBe(false);
                });

                it('should update its value when the user clicks the checkbox', function () {
                    var props = mockProps();
                    var checkboxComp = render(props);
                    var checkboxInput = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');

                    React.addons.TestUtils.Simulate.change(checkboxInput);
                    expect(checkboxInput.checked).toBe(true);
                    React.addons.TestUtils.Simulate.change(checkboxInput);
                    expect(checkboxInput.checked).toBe(false);
                });

                it('should not update its value when set to "readOnly"', function () {
                    var props = mockProps().setCompProp({readOnly: true});
                    var checkboxComp = render(props);
                    var checkboxInput = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');

                    React.addons.TestUtils.Simulate.change(checkboxInput);
                    expect(checkboxInput.checked).toEqual(false);
                });
            });

            it('should be set with type="checkbox"', function () {
                var props = mockProps();
                var checkboxComp = render(props);
                var checkboxInput = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                expect(checkboxInput.getAttribute('type')).toEqual('checkbox');
            });


            describe('input element "required" attribute', function () {

                it('should not be set by default', function () {
                    var props = mockProps();
                    var checkboxComp = render(props);
                    var checkboxNode = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxNode.attributes.required).toBeUndefined();
                });

                it('should be set when compProp.required is true', function () {
                    var props = mockProps().setCompProp({required: true});
                    var checkboxComp = render(props);
                    var checkboxNode = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxNode.attributes.required).toBeDefined();
                });

                it('should not be set when compProp.required is false', function () {
                    var props = mockProps().setCompProp({required: false});
                    var checkboxComp = render(props);
                    var checkboxNode = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxNode.attributes.required).toBeUndefined();
                });

            });


            describe('input element "isDisabled" attribute', function () {

                it('should not be set by default', function () {
                    var props = mockProps();
                    var checkboxComp = render(props);
                    var checkboxNode = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxNode.attributes.disabled).toBeUndefined();
                });

                it('should be set when compProp.isDisabled is "true"', function () {
                    var props = mockProps().setCompProp({isDisabled: true});
                    var checkboxComp = render(props);
                    var checkboxNode = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxNode.attributes.disabled).toBeDefined();
                });

                it('should not be set when compProp.isDisabled is "off"', function () {
                    var props = mockProps().setCompProp({isDisabled: false});
                    var checkboxComp = render(props);
                    var checkboxNode = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                    expect(checkboxNode.attributes.disabled).toBeUndefined();
                });

            });

        });

        describe('compActions', function () {
            it('should handle click comp action', function() {
                var mockAction = {
                    type: 'comp',
                    sourceId: 'compId',
                    name: 'change'
                };
                var props = mockProps().setProps({
                    compActions: {change: mockAction}
                });

                var checkboxComp = render(props);
                spyOn(checkboxComp, 'handleAction');

                var checkboxInput = ReactTestUtils.findRenderedDOMComponentWithTag(checkboxComp, 'input');
                React.addons.TestUtils.Simulate.change(checkboxInput);

                expect(checkboxComp.handleAction).toHaveBeenCalledWith('change', {checked: true});
            });
        });

    });
});
