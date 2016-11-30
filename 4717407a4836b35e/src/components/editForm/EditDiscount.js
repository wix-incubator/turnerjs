import React, {Component, PropTypes} from 'react';
import {
  Text,
  View,
  ListView,
  Image,
  TextInput,
  Dimensions,
  Platform
} from 'react-native';
import _ from 'lodash/fp';

import { symbolize } from 'currency-symbol.js';

import * as CONSTANTS from '../../utils/constants';
import styles from '../../styles/ProductViewStyles';

import { InputBox } from '../dumb/InputBox';

import editFormStyles from '../../styles/EditStyles';

EditDiscount = props => (
  <View style={editFormStyles('ds')}>
    <View style={[
                editFormStyles('viewWrapper.flexRow'),
                editFormStyles('ds.align')
            ]}>
      <View style={editFormStyles('ds.block', 1)}>
        <Text style={editFormStyles('ds.orPrice')}>
          {`Original Price (${symbolize(props.symbol)})`}
        </Text>
        <View style={editFormStyles('ds.separator')}>
          <Text style={editFormStyles('ds.price')}>{props.originalPrice}</Text>
        </View>
      </View>
      <View style={editFormStyles('ds.block', 0)}>
        <InputBox
          label={`Sale Price (${symbolize(props.symbol)})`}
          name="price"
          onChange={(field, text, isValid) => {
              text !== '' && props.discountMode !== 'AMOUNT' && props.onChange && props.onChange('discount.mode', 'AMOUNT');
              props.onChange &&
              props.onChange('discount.value',
                !isValid ?
                  Infinity :
                    text !== ''
                    ? Math.round( (props.originalPrice - (+text))*100 )/100
                    : 0,
              isValid);
          }}
          errorMessage="Invalid Sale Price"
          textColor={'#60bc57'}
          errorTextColor={'#f00'}
          onValidate={value => (value === '' || (+value > 0 && +value < props.originalPrice))}
          validateOnChange={true}
          keyboardType="numeric"
          value={'' + props.salePrice}
        />
      </View>
    </View>
  </View>
);

export default EditDiscount;

EditDiscount.propTypes = {
  symbol: PropTypes.string,
  originalPrice: PropTypes.number,
  discountMode: PropTypes.string,
  salePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onFocusInput: PropTypes.func
};