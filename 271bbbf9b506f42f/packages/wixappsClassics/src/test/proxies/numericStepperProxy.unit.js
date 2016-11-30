define(['react', 'reactDOM', 'wixappsCore', 'testUtils', 'wixappsClassics', 'components'
], function(React, ReactDOM, /** wixappsCore */wixapps, /** testUtils */testUtils) {
    'use strict';

    describe('NumericStepper proxy', function () {
        var viewDef, data, props;
        beforeEach(function () {
            viewDef = {
                comp: {
                    name: 'NumericStepper',
                    minValue: '1',
                    maxValue: '100'
                }
            };

            data = {
                value: '1',
                minValue: '1',
                maxValue: '100'
            };
            props = testUtils.proxyPropsBuilder(viewDef, data);
        });

        it('should create a NumericStepper component', function () {
            var proxy = testUtils.proxyBuilder('NumericStepper', props);
            var component = proxy.refs.component;

            // Validate default component is used
            expect(component.props.structure.componentType).toEqual('wysiwyg.common.components.NumericStepper');

            expect(component.props.skin).toEqual('wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperSimpleSkin');
        });

        it('should set the right compProp on the component', function () {
            var proxy = testUtils.proxyBuilder('NumericStepper', props);
            var component = proxy.refs.component;

            var expectedCompProp = {
                minValue: data.minValue,
                maxValue: data.maxValue
            };

            expect(component.props.compProp).toEqual(expectedCompProp);
        });

        it('should set the correct compData for the component', function () {
            var convertedValue = {type: 'NumericStepper', value: '1'};
            spyOn(wixapps.typesConverter, 'numeric').and.returnValue(convertedValue);
            var proxy = testUtils.proxyBuilder('NumericStepper', props);
            var component = proxy.refs.component;

            expect(wixapps.typesConverter.numeric).toHaveBeenCalledWith(data.value);

            expect(component.props.compData).toBe(convertedValue);

        });

        it('should fire an inputChanged event on input change', function () {
            props.viewDef.comp.events = {
                inputChanged: 'handleInputChange'
            };

            props.logic = {
                handleInputChange: jasmine.createSpy('handleInputChange')
            };

            var proxy = testUtils.proxyBuilder('NumericStepper', props);
            var component = proxy.refs.component;

            var input = component.refs.inputNumberInput;
            var newValue = "5";
            React.addons.TestUtils.Simulate.change(ReactDOM.findDOMNode(input), {target: {value: newValue}});

            expect(props.logic.handleInputChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: newValue}), undefined);
        });

        it('should fire inputChangedFailed when trying to set a number that is bigger then maxValue', function () {
            props.viewDef.comp.events = {
                inputChangedFailed: 'handleInputChangedFailed'
            };

            var actualPayload = null;
            props.logic = {
                handleInputChangedFailed: function (evt) {
                    actualPayload = evt.payload;
                }
            };

            var proxy = testUtils.proxyBuilder('NumericStepper', props);
            var component = proxy.refs.component;

            var input = component.refs.inputNumberInput;
            var newValue = "105";
            React.addons.TestUtils.Simulate.change(ReactDOM.findDOMNode(input), {target: {value: newValue}});

            var expectedPayload = {
                oldValue: Number(data.value),
                invalidValue: Number(newValue),
                minValue: Number(proxy.proxyData.minValue),
                maxValue: Number(proxy.proxyData.maxValue)
            };

            expect(actualPayload).toEqual(expectedPayload);
        });

        it('should not fire inputChangedFailed when trying to set a number that is smaller then minValue', function () {
            props.viewDef.comp.events = {
                inputChangedFailed: 'handleInputChangedFailed'
            };

            var actualPayload = null;
            props.logic = {
                handleInputChangedFailed: function (evt) {
                    actualPayload = evt.payload;
                }
            };

            var proxy = testUtils.proxyBuilder('NumericStepper', props);
            var component = proxy.refs.component;

            var input = component.refs;
            input = input.inputNumberInput;
            var newValue = "-5";
            React.addons.TestUtils.Simulate.change(ReactDOM.findDOMNode(input), {target: {value: newValue}});

            expect(actualPayload).toEqual(null);
        });
    });
});
