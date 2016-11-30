import React, {Component, PropTypes} from 'react';
import {Text, View, Image, Platform, TouchableOpacity} from 'react-native';

import {InputBox} from '../dumb/InputBox';
import * as CONSTANTS from '../../utils/constants';

export class QuantityLine extends Component {
  constructor(props) {
    super(props)
  }

  changeValue(value) {
    this._field.changeText(value.toString(), false);
  }

  render() {
    const props = this.props;
    return <View style={{paddingTop: 20}}>
      <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexGrow: 1, marginHorizontal: 20}}>
          <InputBox
            style={{
                marginBottom: 0,
                flexGrow: undefined
            }}
            ref={(field) => this._field = field}
            name={'quantity'}
            value={`${props.value}`}
            label=""
            onChange={(field, value) => props.onChange(value)}
            keyboardType="numeric"
            errorTextColor="#f1726b"
            errorMessage="Not in Stock"
            onValidate={(val) => val <= props.maxQuantity}
            validateOnChange={true}
          />
        </View>
        <View
          style={{width: 104, height: 42, borderColor: '#e8e9ec', borderWidth: 1, borderRadius: 42, flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={() => props.onChange(props.value - 1)}
                            style={{flex: 0.5, alignItems: 'center', justifyContent: 'center', height: 31, borderRightWidth: 1, borderRightColor: '#e8e9ec'}}>
            <Text style={{color: '#00adf5', fontSize: 30, fontWeight: '100', lineHeight: 30}}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => props.onChange(props.value + 1)}
                            style={{flex: 0.5, alignItems: 'center', justifyContent: 'center', height: 31}}>
            <Text style={{color: '#00adf5', fontSize: 30, fontWeight: '100', lineHeight: 30}}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>;
  }
};

QuantityLine.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  maxQuantity: PropTypes.number
};