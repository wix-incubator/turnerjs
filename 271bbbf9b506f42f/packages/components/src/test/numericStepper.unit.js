define([
    'lodash',
    'testUtils',
    'react',
    'components/components/numericStepper/numericStepper',
    'reactDOM'
],
    function(
        _,
        /** testUtils */ testUtils,
        React,
        numericStepper,
        ReactDOM) {
    'use strict';


    describe('numericStepper component', function () {
        var props = {};

        beforeEach(function() {
            props = testUtils.mockFactory.mockProps();
            _.assign(props, {
                skin: 'wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperSimpleSkin',
                compProp: {},
                compData: {
                    "value": "5"
                },
                structure: {
                    componentType: 'wysiwyg.common.components.NumericStepper'
                }
            });
        });
        it('Creates component', function () {

            /** @type components.NumericStepper */
            var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);
            var refData = numericStepperComp.getSkinProperties();
            expect(refData).toBeDefined();
            expect(refData.inputNumberInput).toBeDefined();
            expect(refData.plus).toBeDefined();
            expect(refData.minus).toBeDefined();
        });

        it('Creates component with value props', function () {
            /** @type components.NumericStepper */
            var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);
            numericStepperComp.componentWillReceiveProps(props);
            var refData = numericStepperComp.getSkinProperties();

            expect(refData.inputNumberInput.value).toEqual(props.compData.value);
        });


        describe('handle value change', function () {
            var minValue = 1, maxValue = 1000;

            beforeEach(function() {
                props.setCompProp({
                    minValue: minValue,
                    maxValue: maxValue
                }).setSkin("wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperSimpleSkin");
            });

            it('on valid input change value is passed', function () {
                var onInputChange = jasmine.createSpy('onInputChange');
                props.onInputChange = onInputChange;
                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var input = numericStepperComp.refs.inputNumberInput;
                var newInputValue = "10";
                var change = {target: {value: newInputValue}};
                React.addons.TestUtils.Simulate.change(ReactDOM.findDOMNode(input), change);

                expect(onInputChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: change.target.value}), undefined);
                expect(input.value).toBe(newInputValue);
            });

            it('on input smaller than min', function () {
                props.onInputChangedFailed = jasmine.createSpy('inputChangedFailedMaxValue');
                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var input = numericStepperComp.refs.inputNumberInput;
                var newValue = "0";
                var change = {target: {value: newValue}};
                React.addons.TestUtils.Simulate.change(ReactDOM.findDOMNode(input), change);

                expect(input.value).toBe(String(minValue));
            });

            it('on input larger than max', function () {
                props.onInputChangedFailed = jasmine.createSpy('inputChangedFailedMaxValue');
                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var input = numericStepperComp.refs.inputNumberInput;
                var newValue = "10000";
                React.addons.TestUtils.Simulate.change(ReactDOM.findDOMNode(input), {target: {value: newValue}});

                var expectedPayload = {
                    oldValue: Number(props.compData.value),
                    invalidValue: Number(newValue),
                    minValue: Number(props.compProp.minValue),
                    maxValue: Number(props.compProp.maxValue)
                };
                expect(props.onInputChangedFailed).toHaveBeenCalledWith(jasmine.objectContaining({payload: expectedPayload}), undefined);
                expect(input.value).toBe(String(maxValue));
            });

        });

        describe('handle value change via controls', function () {
            beforeEach(function() {
                props.setCompProp({
                    minValue: 1,
                    maxValue: 10
                }).setSkin("wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperHorizontalSkin");
            });

            it('on plus', function () {
                var onInputChange = jasmine.createSpy('onInputChange');
                props.onInputChange = onInputChange;
                var value = 5;
                props.compData = {
                    value: String(value)
                };

                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var plus = ReactDOM.findDOMNode(numericStepperComp.refs.plus);
                React.addons.TestUtils.Simulate.click(plus);

                var expectedValue = String(value + 1);
                expect(onInputChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: expectedValue}), jasmine.any(String));
                expect(numericStepperComp.refs.inputNumberInput.value).toBe(expectedValue);
            });

            it('on plus when reaching maxValue', function () {
                props.onInputChangedFailed = jasmine.createSpy('inputChangedFailedMaxValue');
                var value = props.compProp.maxValue;
                props.compData = {
                    value: String(value)
                };

                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var plus = ReactDOM.findDOMNode(numericStepperComp.refs.plus);
                React.addons.TestUtils.Simulate.click(plus);

                var expectedPayload = {
                    oldValue: Number(props.compData.value),
                    invalidValue: value + 1,
                    minValue: Number(props.compProp.minValue),
                    maxValue: Number(props.compProp.maxValue)
                };
                expect(props.onInputChangedFailed).toHaveBeenCalledWith(jasmine.objectContaining({payload: expectedPayload}), jasmine.any(String));
                expect(numericStepperComp.refs.inputNumberInput.value).toBe("10");
            });

            it('on minus', function () {
                var onInputChange = jasmine.createSpy('onInputChange');
                props.onInputChange = onInputChange;
                var value = 5;
                props.compData = {
                    value: String(value)
                };

                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var minus = ReactDOM.findDOMNode(numericStepperComp.refs.minus);
                React.addons.TestUtils.Simulate.click(minus);

                var expectedValue = String(value - 1);
                expect(onInputChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: expectedValue}), jasmine.any(String));
                expect(numericStepperComp.refs.inputNumberInput.value).toBe(expectedValue);
            });

            it('on minus when reaching minValue', function () {
                props.onInputChangedFailed = jasmine.createSpy('inputChangedFailedMaxValue');
                var value = props.compProp.minValue;
                props.compData = {
                    value: String(value)
                };

                var numericStepperComp = testUtils.getComponentFromDefinition(numericStepper, props);

                var minus = ReactDOM.findDOMNode(numericStepperComp.refs.minus);
                React.addons.TestUtils.Simulate.click(minus);

                expect(numericStepperComp.refs.inputNumberInput.value).toBe("1");
            });
        });
    });
});
