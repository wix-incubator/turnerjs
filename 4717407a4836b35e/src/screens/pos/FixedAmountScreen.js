import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import {Header} from '../../components/pos/Header';
import {DigitsKeyboard} from '../../components/pos/DigitsKeyboard';
import { symbolize } from 'currency-symbol.js';

import * as CONSTANTS from '../../utils/constants';

import { connect } from 'react-redux';
import * as stateReader from '../../reducers/stateReader';

import * as posAction from '../../actions/posActions';

class FixedAmountScreen extends Component {
  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.props.navigator.setButtons({
      leftButtons: [{
        title: 'Cancel',
        id: 'cancel'
      }],
      rightButtons: [this.props.cartExists ? {
        title: 'Add',
        id: 'add'
      } : {
        title: 'Pay',
        id: 'pay'
      }]
    });
    this.state = {
      price: 0
    }
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'add':
        if (!this.state.price) return;
        this.props.dispatch(posAction.setAdditionalPrice(this.state.price / 100));
        return this.props.navigator.pop();
      case 'pay':
        if (!this.state.price) return;
        return !this.props.cartUpdating && !this.props.orderCreating && this.props.dispatch(posAction.createOrderWithAdditionalPrice(this.state.price / 100));
        //return this.nextScreen();
      case 'cancel':
        return this.props.navigator.pop();
    }
  }

  componentWillReceiveProps(nextProps) {
    !nextProps.orderCreating && (nextProps.orderCreating !== this.props.orderCreating) && this.nextScreen();
  }

  nextScreen() {
    this.props.navigator.push({
      title: 'Order Preview',
      screen: "wix.merchant.pos.PaymentMethodScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
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
      <Header>
        {this.state.price
          ? (<Text style={{color: '#00adf5', fontSize: 49, fontWeight: '100', paddingHorizontal: 24}}>{`${symbolize(this.props.settings.currency)}${(this.state.price / 100).toFixed(2)}`}</Text>)
          : (<Text style={{color: '#aab7c5', fontSize: 27, fontWeight: '300', paddingHorizontal: 24}}>{'Enter your fixed amount'}</Text>)
        }
      </Header>
      <DigitsKeyboard onPress={this.increase.bind(this)} onBackspacePress={this.decrease.bind(this)} />
      {(this.props.cartUpdating || this.props.orderCreating) && <View style={{position: 'absolute', backgroundColor: 'rgba(255,255,255,0.5)', left: 0, top: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large"/>
      </View>}
    </View>;
  }
}

function mapStateToProps(state) {
  return {
    settings: stateReader.getSettings(state),
    cartUpdating: state.pos.cartUpdating,
    orderCreating: state.pos.orderCreating
  };
}

export default connect(mapStateToProps)(FixedAmountScreen);