import React, {Component} from 'react';
import {View, Text, Platform, TextInput, TouchableOpacity, Image} from 'react-native';

import * as CONSTANTS from '../../utils/constants';

import {Header} from '../../components/pos/Header';
import {InputBox} from '../../components/dumb/InputBox';
import { cartTransform } from '../../selectors/posSelectors';
import * as stateReader from '../../reducers/stateReader';
import { connect } from 'react-redux';
import { symbolize } from 'currency-symbol.js';

class PaymentCashScreen extends Component {
  static navigatorButtons = {
    rightButtons: [{
      title: 'Charge',
      id: 'charge'
    }]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      price: 0
    }
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'charge':
        this.nextScreen();
    }
  }

  nextScreen() {
    this.props.navigator.push({
      title: 'Thanks!',
      screen: "wix.merchant.pos.ThankYouScreen",
      passProps: {
        params: `{"transaction_id": "Cash Payment"}`
      },
      backButtonHidden: true
    });
  }

  increase(num) {
    this.setState({
      price: this.state.price * 10 + num
    });
  }

  decrease() {
    this.setState({
      price: Math.floor(this.state.price / 10)
    });
  }

  render() {
    return <View style={{flex: 1}}>
      <Header height={109}>
        <Text style={{fontSize: 27, fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined, fontWeight: '300', color: '#2d4150', marginBottom: 6, paddingHorizontal: 25}}>{CONSTANTS.ORDER_SUMMARY_TOTAL}: {`${this.props.cart.totals.formattedTotal}`}</Text>
        <Text style={{fontSize: 17, fontWeight: '300', color: '#2d4150', paddingHorizontal: 25}}>{this.props.cart.itemsQuantity} item(s)</Text>
      </Header>
      <View style={{marginTop: 40, paddingHorizontal: 22}}>
        <Text style={{marginBottom: 22, color: '#b6c1cd', fontSize: 14}}>Cash received</Text>
        <View style={{borderBottomColor: '#e8e9ec', borderBottomWidth: 1}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{color: '#43515c', fontSize: 27, fontWeight: '300'}}>{`${symbolize(this.props.settings.currency)}${(this.state.price / 100).toFixed(2)}`}</Text>
            <TextInput
              style={{flex: 1, color: '#fff', fontSize: 27}}
              keyboardType="numeric"
              autoFocus={true}
              onChangeText={(val) => this.increase(parseInt(val))}
              onKeyPress={(key) => key.nativeEvent.key === 'Backspace' ? this.decrease() : {}}
              value=""
            />
            <TouchableOpacity onPress={() => {this.setState({price: 0})}}>
              <Image
                style={{flex: 1, height: 16, width: 16}}
                resizeMode="contain"
                source={require('../../assets/pos/grayCross.png')}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {
        this.props.cart && this.state.price / 100 - this.props.cart.totals.total > 0
          ? <View style={{marginTop: 20, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Text style={{color: '#aab7c5', fontSize: 17, fontWeight: '600'}}>{`${symbolize(this.props.settings.currency)}${(this.state.price / 100 - this.props.cart.totals.total).toFixed(2)}`}</Text>
            <Text style={{color: '#aab7c5', fontSize: 17, fontWeight: '300'}}> Change due</Text>
            </View>
          : null
      }
    </View>;
  }
}

function mapStateToProps(state) {
  return {
    settings: stateReader.getSettings(state),
    cart: cartTransform(state.pos.cart)
  };
}

export default connect(mapStateToProps)(PaymentCashScreen);