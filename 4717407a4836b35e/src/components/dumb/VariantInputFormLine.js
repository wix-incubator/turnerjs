
import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
} from 'react-native';

import { InputBox } from './InputBox';

import editFormStyles from '../../styles/EditStyles';

export class VariantInputFormLine extends Component {
    get field() {
        return this._field;
    }
    render() {
        const props = this.props;

        return (
            <View style={editFormStyles('inputLine.flexRow')}>
                <Text testID="label" style={[
                    editFormStyles('toggleLine.text'),
                    editFormStyles('inputLine.label')
                ]}>{props.title}</Text>
                <InputBox
                    style={editFormStyles('inputLine.inputBox')}
                    testID="inputBox"
                    onChange={props.onChange}
                    name={'quantity'}
                    value={props.value}
                    keyboardType="numeric"
                    maxLength={5}
                    onFocus={(e) => {
                      props.onFocus && props.onFocus(this._field);
                    }}
                    ref={r => r && (this._field = r.field)}
                />
            </View>
        );
    }
}

VariantInputFormLine.propTypes = {
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onFocus: PropTypes.func
};