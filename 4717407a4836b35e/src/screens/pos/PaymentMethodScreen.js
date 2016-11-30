import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions, Platform
} from 'react-native';
import {Header} from '../../components/pos/Header';
import {Button} from '../../components/pos/Button';

import { cartTransform } from '../../selectors/posSelectors';
import * as posAction from '../../actions/posActions';
import { connect } from 'react-redux';

import * as CONSTANTS from '../../utils/constants';

export class PaymentMethodScreen extends Component {
  constructor(props) {
    super(props);
    
  }

  openCreditCardPayment() {
    this.props.navigator.push({
      title: 'Point of Sale',
      screen: "wix.merchant.pos.PaymentSquareScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }

  openCashPayment() {
    this.props.navigator.push({
      title: 'Cash',
      screen: "wix.merchant.pos.PaymentCashScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }
  
  openCheckPayment() {
    this.props.navigator.push({
      title: 'Check',
      screen: "wix.merchant.pos.PaymentGiftCardScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }
  
  openGiftCardPayment() {
    this.props.navigator.push({
      title: 'Gift Card',
      screen: "wix.merchant.pos.PaymentGiftCardScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }

  render() {
    return <View style={{flex: 1, backgroundColor: '#ffffff'}}>
      <Header height={103}>
        {this.props.cart ? <View>
          <Text style={{fontSize: 27, fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined, fontWeight: '300', color: '#2d4150', marginBottom: 6, paddingHorizontal: 25}}>{CONSTANTS.ORDER_SUMMARY_TOTAL}: {`${this.props.cart.totals.formattedTotal}`}</Text>
          <Text style={{fontSize: 17, fontWeight: '300', color: '#2d4150', paddingHorizontal: 25}}>{this.props.cart.itemsQuantity} item(s)</Text>
        </View> : null}
      </Header>
      <Button
        type="small"
        image={{
            source: require('../../assets/pos/cash.png'),
            width: 38,
            height: 20
          }}
        title="Cash"
        onPress={this.openCashPayment.bind(this)}
      />
      <Button
        type="small"
        image={{
            source: require('../../assets/pos/creditCard.png'),
            width: 30,
            height: 25
          }}
        title="Credit Card"
        onPress={this.openCreditCardPayment.bind(this)}
      />
      <Button
        type="small"
        image={{
            source: require('../../assets/pos/check.png'),
            width: 38,
            height: 20
          }}
        title="Check"
        onPress={this.openCheckPayment.bind(this)}
      />
      <Button
        type="small"
        image={{
            source: require('../../assets/pos/giftCard.png'),
            width: 30,
            height: 25
          }}
        title="Gift card"
        onPress={this.openGiftCardPayment.bind(this)}
      />
    </View>;
  }
}

function mapStateToProps(state) {
  return {
    cart: cartTransform(state.pos.cart)
  };
}

export default connect(mapStateToProps)(PaymentMethodScreen);