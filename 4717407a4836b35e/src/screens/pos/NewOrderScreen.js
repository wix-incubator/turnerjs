import React, {Component} from 'react';
import {
  View, Text
} from 'react-native';
import {Header} from '../../components/pos/Header';
import {Button} from '../../components/pos/Button';

import * as CONSTANTS from '../../utils/constants';

export default class NewOrderScreen extends Component {
  static navigatorButtons = {
    leftButtons: [{
      title: 'Cancel',
      id: 'cancel'
    }]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'cancel':
        return this.closePosScreens();
    }
  }

  closePosScreens() {
    this.props.navigator.pop();
  }

  openAmountScreen() {
    this.props.navigator.push({
      title: 'Fixed Amount',
      screen: "wix.merchant.pos.FixedAmountScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }

  openSelectProductList() {
    this.props.navigator.push({
      title: 'New Order',
      screen: "wix.merchant.pos.SelectProductsScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }

  render() {
    return <View style={{flex: 1}}>
      <Header>
        <Text style={{color: '#aab7c5', fontSize: 27, fontWeight: '300', paddingHorizontal: 20}}>{'How would you like\nto complete your sale?'}</Text>
      </Header>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        paddingVertical: 10
      }}>
        <Button
          type="big"
          style={{flex:0.5}}
          image={{
            source: require('../../assets/pos/selectProduct.png'),
            width: 48,
            height: 45
          }}
          title="Select Products"
          onPress={this.openSelectProductList.bind(this)}
        />
        <Button
          type="big"
          style={{flex:0.5}}
          image={{
            source: require('../../assets/pos/amount.png'),
            width: 39,
            height: 40
          }}
          title="Enter a fixed amount"
          onPress={this.openAmountScreen.bind(this)}
        />
      </View>
    </View>;
  }
}


