import React, {Component, PropTypes} from 'react';
import {
    Text,
    TextInput,
    View,
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import editFormStyles from '../../styles/EditStyles';

const valuePostfix = {
    price: (value) => {
        let cleanValue;
        let priceText = '';

        if (value) {
            [cleanValue] = value.match(/^(?:(?:-?(?:0|\d{1,9}))(?:\.\d{0,2})?)|-/) || [''];
            priceText = cleanValue;
        }

        return priceText;
    },
    quantity: (text) => {
        let cleanValue;
        let priceText = '0';
        let value = text.replace(/^([-0]+)([0-9]+)/, '$2');

        if (value) {
            [cleanValue] = value.match(/^(?:(?:-?(?:0|\d{1,9}))?)|-/) || [''];
            priceText = cleanValue;
        }

        return priceText;
    },
    identity: value => value
};

export class InputBox extends Component {
    constructor(props){
        super(props);

        const value = (valuePostfix[this.props.name] || valuePostfix.identity)(props.value);

        this.state = {
            value,
            isValid: props.isValid != null ? props.isValid : true
        };
    }
    changeText(text, isSave = true){
        const value = (valuePostfix[this.props.name] || valuePostfix.identity)(text);
        const isValid = this.props.validateOnChange ? (this.props.onValidate ? this.props.onValidate(value) : !(this.props.required && !value)) : this.state.isValid;

        isSave && this.save(value, isValid);

        this.setState({
            value,
            isValid
        });
    }
    componentWillReceiveProps(nextProps){
        (nextProps.isValid !== this.props.isValid) && this.setState({isValid: nextProps.isValid})
    }
    onEndEditing(){
        this.props.validateOnBlur && this.validate();
    }
    renderLabel() {
        return (
            <Animatable.Text
                 ref="label"
                 transition={['top', 'opacity', 'fontSize']}
                 duration={200}
                 style={[
                    editFormStyles('inputBox.label', !!this.state.value || !this.state.isValid),
                    editFormStyles('inputBox.labelColor', this.state.isValid),
                ]}>{
                    this.state.isValid
                        ? (this.props.label + (this.props.inputSymbol ? ` (${this.props.inputSymbol})` : ''))
                        : (this.props.errorMessage ? this.props.errorMessage : `${this.props.label} field is required`)}
            </Animatable.Text>
        )
    }
    save(_value, isValid){
        const value = this.props.keyboardType && this.props.keyboardType === 'numeric'
            ? (_value !== '' ? parseFloat(_value) : _value)
            : _value;

        this.props.onChange(this.props.name, value, isValid);
    }
    focus(){
        this._field.focus();
    }
    get field() {
        return this._field;
    }
    validate(){
        const isValid = this.props.onValidate ? this.props.onValidate(this.state.value) : !(this.props.required && !this.state.value);

        this.setState({
            isValid: isValid
        });

        return isValid;
    }
    blur() {
        this._field.blur();
    }
    get isValid() {
        return this.state.isValid;
    }
    render() {
        const props = this.props;

        return (
            <View style={[
                    editFormStyles('inputBox'),
                    editFormStyles('inputBox.positionStyles', props.position),
                    (props.style || {})
                ]}>
                    <View style={editFormStyles('inputBox.wrapper', this.state.isValid)}>
                        <TextInput
                            style={[
                                editFormStyles('inputBox.input'),
                                editFormStyles('inputBox.withMargin', !!props.label),
                                props.textColor && this.state.isValid ?
                                { color: props.textColor } :
                                !this.state.isValid && props.errorTextColor ?
                                    { color: props.errorTextColor } :
                                    {}
                            ]}
                            ref={field => this._field = field}
                            multiline={props.isMultiline || false}
                            keyboardType={props.keyboardType || 'default'}
                            returnKeyType={props.returnKeyType || 'next'}
                            placeholder={!this.state.isValid || !props.label ? '' : (props.label + (props.inputSymbol ? ` (${props.inputSymbol})` : ''))}
                            maxLength={props.maxLength}
                            value={this.state.value}
                            underlineColorAndroid="#e8e9ec"
                            onChangeText={this.changeText.bind(this)}
                            onEndEditing={this.onEndEditing.bind(this)}
                            onFocus={props.onFocus}
                            onBlur={props.onBlur}
                            onSubmitEditing={props.onSubmitEditing}
                        />
                        {props.label ? this.renderLabel() : null}
                </View>
            </View>
        )
    }
}

InputBox.propTypes = {
    label: PropTypes.string,
    textColor: PropTypes.string,
    errorTextColor: PropTypes.string,
    errorMessage: PropTypes.string,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    position: PropTypes.string,
    isValid: PropTypes.bool,
    inputSymbol: PropTypes.string,
    isMultiline: PropTypes.bool,
    required: PropTypes.bool,
    keyboardType: PropTypes.string,
    returnKeyType: PropTypes.string,
    maxLength: PropTypes.number,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    validateOnBlur: PropTypes.bool,
    validateOnChange: PropTypes.bool,
    onValidate: PropTypes.func
};
