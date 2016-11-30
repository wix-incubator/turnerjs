define(['lodash', 'core', 'reactDOM'], function(_, /** core */core, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;
    var minValue = 0;
    var maxValue = 999;

    function changeValue(delta, event, domID) {
        if (this.state.currentValue) {
            var value = parseInt(this.state.currentValue, 10) + delta;
            var inputNode = ReactDOM.findDOMNode(this.refs.inputNumberInput);

            event.target = inputNode;
            checkInput.call(this, event, domID, this.state.currentValue, String(value));
        }
    }

    function onChange(event, domID, value) {
        value = value || event.target.value;
        if (value) {
            checkInput.call(this, event, domID, this.state.currentValue, value);
        } else {
            this.setState({currentValue: value, previousValue: this.state.currentValue});
        }
    }

    function checkInput(event, domID, oldValue, newValue) {
        var newIntValue = Number(newValue);
        var oldIntValue = Number(oldValue);
        var isSmallerThanMin = newIntValue < this.state.minValue;
        var isBiggerThanMax = newIntValue > this.state.maxValue;

        if (newValue === '' || isNaN(newIntValue)) {
            newIntValue = oldIntValue;
            return;
        } else if (isSmallerThanMin){
            newIntValue = this.state.minValue;
        } else if (isBiggerThanMax) {
            if (this.props.onInputChangedFailed) {
                event.type = 'inputChangedFailed';
                event.payload = {
                    oldValue: oldIntValue,
                    invalidValue: newIntValue,
                    maxValue: this.state.maxValue,
                    minValue: this.state.minValue
                };

                this.props.onInputChangedFailed(event, domID);
                newIntValue = this.state.maxValue;
            }
        }
        newValue = String(newIntValue);
        if (this.props.onInputChange && newIntValue !== oldIntValue) {
            event.type = 'inputChanged';
            event.payload = newValue;
            this.props.onInputChange(event, domID);
        }

        this.setState({currentValue: newValue, previousValue: String(oldIntValue)});
    }

    function onKeyDown(event) {
        return event.key !== 'space' &&
            (!event.shiftKey || event.keyCode >= 35 && event.keyCode <= 40) &&
            (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.shiftKey || event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 96 && event.keyCode <= 105);
    }

    function onBlur(event, domID) {
        checkInput.call(this, event, domID, this.state.previousValue, this.state.currentValue);
    }

    /**
     * @class components.NumericStepper
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "NumericStepper",
        mixins: [mixins.skinBasedComp],


        getInitialState: function () {
            return this.getState(this.props);
        },

        getState: function (props) {
            return {
                '$validation': props.compProp.message ? 'invalid' : 'valid',
                currentValue: this.props.compData.value,
                previousValue: this.props.compData.value,
                minValue: _.isUndefined(this.props.compProp.minValue) ? minValue : Number(this.props.compProp.minValue),
                maxValue: _.isUndefined(this.props.compProp.maxValue) ? maxValue : Number(this.props.compProp.maxValue)
            };
        },

        componentWillReceiveProps: function (props) {
            this.setState(this.getState(props));
        },

        getSkinProperties: function () {
            return {
                inputNumberInput: {
                    value: this.state.currentValue,
                    onChange: onChange.bind(this),
                    onKeyDown: onKeyDown.bind(this),
                    onBlur: onBlur.bind(this)
                },
                plus: {
                    onClick: changeValue.bind(this, 1)
                },
                minus: {
                    onClick: changeValue.bind(this, -1)
                }
            };
        }
    };
});
